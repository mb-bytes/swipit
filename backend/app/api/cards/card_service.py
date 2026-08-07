from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models.cards import CardModel, Transaction, CardProduct
from app.api.merchants.categorize_service import categorize_service
import uuid


class CardService:
    async def get_card_by_last4(
        self, db: AsyncSession, user_id: uuid.UUID, card_last4: str
    ) -> CardModel | None:
        """Find an existing card for this user by last4 digits."""
        result = await db.execute(
            select(CardModel).where(
                CardModel.user_id == user_id,
                CardModel.card_last4 == card_last4,
            )
        )
        return result.scalars().first()

    async def get_or_create_card(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        card_name: str,
        card_last4: str | None,
    ) -> CardModel:
        if card_last4:
            result = await db.execute(
                select(CardModel).where(
                    CardModel.user_id == user_id,
                    CardModel.card_name == card_name,
                    CardModel.card_last4 == card_last4,
                )
            )
        else:
            result = await db.execute(
                select(CardModel).where(
                    CardModel.user_id == user_id,
                    CardModel.card_name == card_name,
                )
            )
        card = result.scalars().first()
        if card is None:
            card = CardModel(
                user_id=user_id,
                card_name=card_name,
                card_last4=card_last4,
            )
            db.add(card)
            await db.flush()
        return card

    async def create_card_from_product(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        product_id: uuid.UUID,
        card_last4: str | None,
    ) -> CardModel:
        product_result = await db.execute(
            select(CardProduct).where(CardProduct.product_id == product_id)
        )
        product = product_result.scalars().first()
        if product is None:
            raise ValueError("Card product not found in catalogue.")

        card = await self.get_or_create_card(
            db,
            user_id=user_id,
            card_name=product.product_name,
            card_last4=card_last4,
        )
        await db.commit()
        return card
        
    async def save_transaction(
        self, db: AsyncSession, card_id: uuid.UUID, raw_email_id: str, parsed: dict
    ) -> Transaction | None:
        """Save a transaction; returns None if raw_email_id already exists (dedup)."""
        existing = await db.execute(
            select(Transaction).where(Transaction.raw_email_id == raw_email_id)
        )
        if existing.scalars().first():
            return None

        category = await categorize_service.categorize_transaction(db, parsed["merchant"])

        txn = Transaction(
            card_id=card_id,
            merchant=parsed["merchant"],
            amount=parsed["amount"],
            category=category,
            transaction_date=parsed["transaction_date"],
            transaction_time=parsed.get("transaction_time"),
            raw_email_id=raw_email_id,
        )
        db.add(txn)
        await db.commit()
        return txn


card_service = CardService()