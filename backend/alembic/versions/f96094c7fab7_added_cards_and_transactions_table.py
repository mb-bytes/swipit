"""Added cards and transactions table

Revision ID: f96094c7fab7
Revises: 5e5289024050
Create Date: 2026-07-29 22:44:46.609927

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f96094c7fab7'
down_revision: Union[str, Sequence[str], None] = '5e5289024050'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "cards",
        sa.Column("card_id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("card_name", sa.String(), nullable=False),
        sa.Column("card_last4", sa.String(), nullable=True),
        sa.Column("card_network", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.user_id"]),
        sa.PrimaryKeyConstraint("card_id"),
    )
    op.create_table(
        "transactions",
        sa.Column("transaction_id", sa.UUID(), nullable=False),
        sa.Column("card_id", sa.UUID(), nullable=False),
        sa.Column("merchant", sa.String(), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("category", sa.String(), nullable=True),
        sa.Column("transaction_date", sa.Date(), nullable=False),
        sa.Column("transaction_time", sa.Time(), nullable=True),
        sa.Column("raw_email_id", sa.String(), nullable=False, unique=True),
        sa.ForeignKeyConstraint(["card_id"], ["cards.card_id"]),
        sa.PrimaryKeyConstraint("transaction_id"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("transactions")
    op.drop_table("cards")
