from fastapi import APIRouter, Depends
from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from .gmail_service import gmail_service, ingestion_failure
from app.api.cards.card_service import card_service
from app.api.dependencies import get_curr_user
from .parsers.parse_axis import parse_axis
from .parsers.parse_federal import parse_federal
import asyncio
import traceback
import logging

logger = logging.getLogger("ingestion")

gmail_router = APIRouter(tags=["gmail-routes"])

PARSERS = {
    "alerts@axis.bank.in": parse_axis,
    "fedmail@federal.bank.in": parse_federal
}

@gmail_router.post("/ingest")
async def ingest_gmail(db: AsyncSession = Depends(get_db), current_user=Depends(get_curr_user)):
    gmail_client = await gmail_service.get_gmail_client(db, user_id=current_user.user_id)


    user_id = current_user.user_id

    ingested, skipped, failed = 0, 0, 0

    for sender, parser in PARSERS.items():
        messages = await asyncio.to_thread(
            gmail_service.search_bank_emails, gmail_client, sender, after_date="2026/06/01"
        )
        for msg in messages:
            try:
                raw_bytes = await asyncio.to_thread(
                    gmail_service.fetch_raw_message, gmail_client, msg["id"]
                )
                body, body_type = gmail_service.extract_best_body(raw_bytes)
                parsed = parser(body)
                if parsed is None:
                    skipped += 1
                    continue
                card = await card_service.get_or_create_card(
                    db, user_id, parsed["card_name"], parsed.get("card_last4")
                )
                result = await card_service.save_transaction(
                    db, card.card_id, msg["id"], parsed
                )
                if result is None:
                    skipped += 1
                else:
                    ingested += 1
            except Exception as e:
                await db.rollback()
                logger.warning(
                    f"Failed to parse message {msg['id']} from {sender}:\n"
                    f"{traceback.format_exc()}"
                )
                failed += 1

    return {"status": "done", "ingested": ingested, "skipped": skipped, "failed": failed}
