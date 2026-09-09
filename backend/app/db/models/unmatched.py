from app.db.base import Base
from sqlalchemy import ForeignKey, String, Date, Time, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column
from datetime import date, time, datetime
import uuid


class UnmatchedTransaction(Base):
    __tablename__ = "unmatched_transactions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"), index=True)
    raw_email_id: Mapped[str] = mapped_column(String, unique=True)
    bank_name: Mapped[str] = mapped_column(String, nullable=False)
    merchant: Mapped[str] = mapped_column(String, nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String, nullable=False, default="INR")
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False)
    transaction_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=func.now())
