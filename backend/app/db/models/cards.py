from app.db.base import Base
from sqlalchemy import ForeignKey, String, Time, Date, Numeric
from datetime import date, time
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid

class CardProduct(Base):
    __tablename__ = "card_products"
    product_id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    bank_name: Mapped[str] = mapped_column(String, nullable=False, index=True)
    product_name: Mapped[str] = mapped_column(String, nullable=False)
    card_network: Mapped[str | None] = mapped_column(String, nullable=True)
    reward_type: Mapped[str | None] = mapped_column(String, nullable=True)

    reward_cards: Mapped[list["RewardCard"]] = relationship(back_populates="card_product")
    user_cards: Mapped[list["CardModel"]] = relationship(back_populates="card_product")

class CardModel(Base):
    __tablename__ = "cards"
    card_id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"))
    product_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("card_products.product_id"), nullable=True)
    card_name: Mapped[str] = mapped_column(String, nullable=False)
    card_last4: Mapped[str | None] = mapped_column(nullable=True)

    card_product: Mapped["CardProduct | None"] = relationship(back_populates="user_cards")

class Transaction(Base):
    __tablename__ = "transactions"
    transaction_id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    card_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("cards.card_id", ondelete="CASCADE"))
    merchant: Mapped[str]
    amount: Mapped[float] = mapped_column(Numeric(10, 2))
    category: Mapped[str | None]
    transaction_date: Mapped[date] = mapped_column(Date)
    transaction_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    raw_email_id: Mapped[str] = mapped_column(String, unique=True)
