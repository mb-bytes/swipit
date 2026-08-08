import base64
import email
import logging
import traceback
from email import policy
from sqlalchemy.ext.asyncio import AsyncSession
from googleapiclient.discovery import build
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
        results = gmail_client.users().messages().list(
            userId="me", q=query, maxResults=50
        ).execute()
        return results.get("messages", [])

    def fetch_raw_message(self, gmail_client, message_id: str) -> bytes:
        full_msg = gmail_client.users().messages().get(
            userId="me", id=message_id, format="raw"
        ).execute()
        return base64.urlsafe_b64decode(full_msg["raw"])

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

    def extract_best_body(self, raw_bytes: bytes) -> tuple[str, str]:
        plain = self.extract_plain_text_body(raw_bytes)
        if plain and len(plain) > 100 and "html format" not in plain.lower():
            return plain, "plain"
        html = self.extract_html_body(raw_bytes)
        return html, "html"

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
            select(CardModel.card_last4).where(CardModel.user_id == user_id)
        )
        known_last4s: set[str | None] = set(existing_result.scalars().all())

        seen: dict[tuple, dict] = {}  # (bank_name, card_last4) → entry

        for sender, parser in parsers.items():
            messages = await asyncio.to_thread(
                self.search_bank_emails, gmail_client, sender, after_date
            )
            for msg in messages:
                try:
                    raw_bytes = await asyncio.to_thread(
                        self.fetch_raw_message, gmail_client, msg["id"]
                    )
                    body, _ = self.extract_best_body(raw_bytes)
                    parsed = parser(body)
                    if parsed is None:
                        continue

                    bank_name = parsed.get("bank_name")
                    card_last4 = parsed.get("card_last4")
                    key = (bank_name, card_last4)

                    if key not in seen and card_last4 not in known_last4s:
                        seen[key] = {
                            "bank_name": bank_name,
                            "card_last4": card_last4,
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
        ingested, skipped, failed, unmatched = 0, 0, 0, 0

        for sender, parser in parsers.items():
            messages = await asyncio.to_thread(
                self.search_bank_emails, gmail_client, sender, after_date
            )
            for msg in messages:
                try:
                    raw_bytes = await asyncio.to_thread(
                        self.fetch_raw_message, gmail_client, msg["id"]
                    )
                    body, _ = self.extract_best_body(raw_bytes)
                    parsed = parser(body)
                    if parsed is None:
                        skipped += 1
                        continue

                    card_last4 = parsed.get("card_last4")
                    card = await card_service.get_card_by_last4(db, user_id, card_last4)

                    if card is None:
                        logger.warning(
                            f"No card found for last4={card_last4} (user={user_id}). "
                            f"Skipping message {msg['id']}. Add the card first via /api/cards/create."
                        )
                        unmatched += 1
                        continue

                    result = await card_service.save_transaction(
                        db, card.card_id, msg["id"], parsed
                    )
                    if result is None:
                        skipped += 1  # already saved (dedup)
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
            "unmatched": unmatched,
            "failed": failed,
        }


gmail_service = GmailService()