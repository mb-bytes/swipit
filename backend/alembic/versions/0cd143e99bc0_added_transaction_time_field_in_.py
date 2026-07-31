"""Added transaction time field in Transaction Model

Revision ID: 0cd143e99bc0
Revises: b06da4aa1de4
Create Date: 2026-07-31 17:46:39.938809

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0cd143e99bc0'
down_revision: Union[str, Sequence[str], None] = 'b06da4aa1de4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # transaction_time is already created in f96094c7fab7 (cards/transactions table).
    # This revision is a no-op kept to preserve the migration chain.
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
