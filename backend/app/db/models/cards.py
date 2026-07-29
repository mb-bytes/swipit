from app.db.base import Base
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column
import uuid

class CardModel(Base):
    __tablename__ = "cards"
    card_id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID]= mapped_column(ForeignKey('users.user_id'))
    card_name: Mapped[str] = mapped_column(String, nullable=False)
    card_last4: Mapped[str | None] = mapped_column(nullable=True)
    card_network: Mapped[str]

class Transaction(Base):
    __tablename__ = "transactions"
    transaction_id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default= uuid.uuid4)
    card_id: Mapped[int] = mapped_column(ForeignKey("cards.card_id"))
    merchant: Mapped[str]
    amount: Mapped[float] = mapped_column(Numeric(10, 2))
    category: Mapped[str | None]
    transaction_date: Mapped[date]
    raw_email_id: Mapped[str]  # Gmail's message id — used to avoid re-parsing the same email twice



