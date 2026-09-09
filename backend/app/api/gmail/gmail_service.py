import base64
import email
import logging
import traceback
import uuid
from email import policy
from sqlalchemy.ext.asyncio import AsyncSession
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from app.api.users.google_service import GoogleService
from app.api.cards.card_service import card_service
import asyncio

logger = logging.getLogger("ingestion")

class GmailService:
    async def get_gmail_client(self, db: AsyncSession, user_id):
        google_service = GoogleService()
        creds = await google_service.get_valid_credentials(db, user_id=user_id)
        return build("gmail", "v1", credentials=creds)

    def search_bank_emails(self, gmail_client, sender: str, after_date: str):
        query = f"from:{sender} after:{after_date}"
        messages = []
        page_token = None
        while True:
            kwargs = {"userId": "me", "q": query, "maxResults": 500}
            if page_token:
                kwargs["pageToken"] = page_token
            results = gmail_client.users().messages().list(**kwargs).execute()
            messages.extend(results.get("messages", []))
            page_token = results.get("nextPageToken")
            if not page_token:
                break
        return messages

    def fetch_raw_message(self, gmail_client, message_id: str) -> bytes:
        full_msg = gmail_client.users().messages().get(
            userId="me", id=message_id, format="raw"
        ).execute()
        return base64.urlsafe_b64decode(full_msg["raw"])

    async def fetch_raw_message_with_retry(self, gmail_client, message_id: str, max_retries: int = 4) -> bytes:
        for attempt in range(max_retries):
            try:
                data = await asyncio.to_thread(self.fetch_raw_message, gmail_client, message_id)
                await asyncio.sleep(0.3)
                return data
            except HttpError as e:
                if e.resp.status in (403, 429) and "rateLimitExceeded" in str(e):
                    if attempt < max_retries - 1:
                        await asyncio.sleep(4 * (attempt + 1))
                        continue
                raise

    def extract_plain_text_body(self, raw_bytes: bytes) -> str | None:
        msg = email.message_from_bytes(raw_bytes, policy=policy.default)
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                charset = part.get_content_charset() or "utf-8"
                return part.get_payload(decode=True).decode(charset, errors="replace")
        return None

    def extract_html_body(self, raw_bytes: bytes) -> str | None:
        msg = email.message_from_bytes(raw_bytes, policy=policy.default)
        for part in msg.walk():
            if part.get_content_type() == "text/html":
                charset = part.get_content_charset() or "utf-8"
                return part.get_payload(decode=True).decode(charset, errors="replace")
        return None

    def extract_best_body(self, raw_bytes: bytes) -> tuple[str | None, str]:
        plain = self.extract_plain_text_body(raw_bytes)
        if plain and len(plain) > 100 and "html format" not in plain.lower():
            return plain, "plain"
        html = self.extract_html_body(raw_bytes)
        if html:
            return html, "html"
        if plain:
            return plain, "plain"
        return None, "none"

    async def discover_cards(
        self,
        db: AsyncSession,
        user_id: str,
        gmail_client,
        parsers: dict,
        after_date: str,
    ) -> list[dict]:
        from sqlalchemy.future import select
        from app.db.models.cards import CardModel

        # Load already-known last4s
        existing_result = await db.execute(
            select(CardModel.card_last4).where(CardModel.user_id == uuid.UUID(user_id))
        )
        known_last4s: set[str] = {v for v in existing_result.scalars().all() if v is not None}

        seen: dict[tuple, dict] = {}  # (bank_name, card_last4) → entry

        for sender, parser in parsers.items():
            messages = await asyncio.to_thread(
                self.search_bank_emails, gmail_client, sender, after_date
            )
            for msg in messages:
                try:
                    raw_bytes = await self.fetch_raw_message_with_retry(
                        gmail_client, msg["id"]
                    )
                    body, _ = self.extract_best_body(raw_bytes)
                    parsed = parser(body)
                    if parsed is None:
                        continue

                    bank_name = parsed.get("bank_name")
                    card_last4 = parsed.get("card_last4")
                    key = (bank_name, card_last4)

                    if key not in seen and (card_last4 is None or card_last4 not in known_last4s):
                        seen[key] = {
                            "bank_name": bank_name,
                            "card_last4": card_last4,
                            "card_name": parsed.get("card_name"),
                        }

                except Exception:
                    logger.warning(
                        f"discover_cards: failed on message {msg['id']} from {sender}:\n"
                        f"{traceback.format_exc()}"
                    )

        return list(seen.values())

    async def parse_and_save(
        self,
        db: AsyncSession,
        user_id: str,
        gmail_client,
        parsers: dict,
        after_date: str,
    ) -> dict:
        from app.db.models.unmatched import UnmatchedTransaction
        from sqlalchemy.future import select as sa_select

        ingested, skipped, failed, queued = 0, 0, 0, 0

        for sender, parser in parsers.items():
            messages = await asyncio.to_thread(
                self.search_bank_emails, gmail_client, sender, after_date
            )
            for msg in messages:
                try:
                    raw_bytes = await self.fetch_raw_message_with_retry(
                        gmail_client, msg["id"]
                    )
                    body, body_type = self.extract_best_body(raw_bytes)
                    if body is None:
                        logger.warning(f"No body extracted from message {msg['id']} ({sender})")
                        skipped += 1
                        continue
                    parsed = parser(body)
                    if parsed is None:
                        skipped += 1
                        continue

                    if parsed.get("txn_type") == "credit":
                        skipped += 1
                        continue

                    card_last4 = parsed.get("card_last4")
                    card = await card_service.get_card_by_last4(db, user_id, card_last4)

                    if card is None:
                        existing = await db.execute(
                            sa_select(UnmatchedTransaction).where(
                                UnmatchedTransaction.raw_email_id == msg["id"]
                            )
                        )
                        if existing.scalars().first() is None:
                            unmatched = UnmatchedTransaction(
                                user_id=uuid.UUID(user_id),
                                raw_email_id=msg["id"],
                                bank_name=parsed.get("bank_name", "Unknown"),
                                merchant=parsed.get("merchant", "Unknown"),
                                amount=parsed.get("amount", 0),
                                currency=parsed.get("currency", "INR"),
                                transaction_date=parsed.get("transaction_date"),
                                transaction_time=parsed.get("transaction_time"),
                            )
                            db.add(unmatched)
                            await db.commit()
                            queued += 1
                        else:
                            skipped += 1
                        continue

                    result = await card_service.save_transaction(
                        db, card.card_id, msg["id"], parsed
                    )
                    if result is None:
                        skipped += 1
                    else:
                        ingested += 1
                        from app.celery_task import call_manage_transaction
                        call_manage_transaction.delay(str(result.transaction_id))

                except Exception:
                    await db.rollback()
                    logger.warning(
                        f"Failed to process message {msg['id']} from {sender}:\n"
                        f"{traceback.format_exc()}"
                    )
                    failed += 1

        return {
            "status": "done",
            "ingested": ingested,
            "skipped": skipped,
            "queued": queued,
            "failed": failed,
        }



gmail_service = GmailService()