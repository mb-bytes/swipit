from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models.cards import CardModel, Transaction, CardProduct
from app.api.merchants.categorize_service import categorize_service
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
import uuid
from datetime import date as date_type


class CardService:
    async def get_card_by_last4(
        self, db: AsyncSession, user_id: uuid.UUID, card_last4: str
    ) -> CardModel | None:
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

    async def remove_card(self, db: AsyncSession, card_id: uuid.UUID, user_id: uuid.UUID):
        card_result = await db.execute(
            select(CardModel).where(
                CardModel.card_id == card_id,
                CardModel.user_id == user_id,
            )
        )
        card = card_result.scalars().first()
        if card is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Card not found or does not belong to this user"
            )
        
        await db.delete(card)
        await db.commit()
        return True

    async def update_card(self, db: AsyncSession, card_id, user_id: uuid.UUID, new_detail: dict):
        card_result = await db.execute(
            select(CardModel).where(
                CardModel.card_id == card_id, 
                CardModel.user_id == user_id
            )
        )
        card = card_result.scalars().first()
        if card is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Card not found or does not belong to this user"
            )
        protected_fields = {"card_id", "user_id"}
        for key, value in new_detail.items():
            if key not in protected_fields and hasattr(card, key):
                setattr(card, key, value)
        await db.commit()
        await db.refresh(card)
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

    async def create_manual_transaction(
        self,
        db: AsyncSession,
        card_id: uuid.UUID,
        merchant: str,
        amount: float,
        category: str | None = None,
        transaction_date: date_type | None = None,
    ) -> Transaction:
        if transaction_date is None:
            transaction_date = date_type.today()

        resolved_category = category or await categorize_service.categorize_transaction(db, merchant)

        txn = Transaction(
            card_id=card_id,
            merchant=merchant,
            amount=amount,
            category=resolved_category,
            transaction_date=transaction_date,
            transaction_time=None,
            raw_email_id=f"manual-{uuid.uuid4()}",
        )
        db.add(txn)
        await db.commit()
        await db.refresh(txn)
        return txn

    async def delete_transaction(self, db: AsyncSession, transaction_id: uuid.UUID, user_id: uuid.UUID):
        stmt = (
            select(Transaction)
            .join(CardModel, Transaction.card_id == CardModel.card_id)
            .where(
                Transaction.transaction_id == transaction_id,
                CardModel.user_id == user_id,
            )
        )
        result = await db.execute(stmt)
        transaction = result.scalars().first()
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found or does not belong to this user",
            )
        await db.delete(transaction)
        await db.commit()
        return True


card_service = CardService()