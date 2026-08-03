from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models.cards import CardModel, Transaction
from app.api.merchants.categorize_service import categorize_service
import uuid

class CardService:
    async def get_or_create_card(self, db: AsyncSession, user_id: uuid.UUID, card_name: str, card_last4: str | None):
        if card_last4:
            result = await db.execute(select(CardModel).where(CardModel.user_id==user_id, CardModel.card_name==card_name, CardModel.card_last4==card_last4))
        else:
            result = await db.execute(select(CardModel).where(CardModel.user_id==user_id, CardModel.card_name==card_name))
        card = result.scalars().first()
        if card is None:
            card = CardModel(user_id=user_id, card_name=card_name, card_last4=card_last4, card_network="Unknown")
            db.add(card)
            await db.flush()
        return card

    async def save_transaction(self, db: AsyncSession, card_id: uuid.UUID, raw_email_id, parsed: dict):
        existing = await db.execute(select(Transaction).where(Transaction.raw_email_id==raw_email_id))
        if existing.scalars().first():
            return None

        category = await categorize_service.categorize_transaction(db, parsed['merchant'])

        txn = Transaction(
            card_id=card_id,
            merchant=parsed['merchant'],
            amount=parsed['amount'],
            category=category,
            transaction_date=parsed['transaction_date'],
            transaction_time=parsed.get("transaction_time"),
            raw_email_id=raw_email_id,
        )
        db.add(txn)
        await db.commit()
        return txn

card_service = CardService()