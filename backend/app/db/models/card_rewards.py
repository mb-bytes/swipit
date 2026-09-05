from app.db.base import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, ForeignKey, UniqueConstraint, Numeric
from sqlalchemy.dialects.postgresql import JSONB, UUID
import uuid

class RewardCard(Base):
    __tablename__= "reward_cards"

    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey('card_products.product_id'))
    bank_name: Mapped[str] = mapped_column(String)
    network: Mapped[str | None] = mapped_column(String, nullable=True)
    annual_fee: Mapped[float] = mapped_column(Numeric, default=0)
    reward_unit: Mapped[str] = mapped_column(String, nullable=False)
    point_value_inr: Mapped[float] = mapped_column(Numeric, nullable=True)
    config: Mapped[dict] = mapped_column(JSONB, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    card_product : Mapped["CardProduct"] = relationship(back_populates="reward_cards")

class SpendTracker(Base):
    __tablename__ = "spend_tracker"
    __table_args__ = (
    UniqueConstraint("user_id", "card_id", "category", "period_key", name="uq_spend_period"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    card_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("cards.card_id", ondelete="CASCADE"), nullable=False)
    reward_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("reward_cards.id"), nullable=False)
    merchant: Mapped[str] = mapped_column(String)
    category: Mapped[str] = mapped_column(String, nullable=False)
    period_key: Mapped[str] = mapped_column(String, nullable=False)  # "2026-08"
    spend_amount: Mapped[float] = mapped_column(Numeric, default=0)
    reward_earned: Mapped[float] = mapped_column(Numeric, default=0)

    user: Mapped["UserModel"] = relationship()
    card: Mapped["CardModel"] = relationship()
    reward_card: Mapped["RewardCard"] = relationship()