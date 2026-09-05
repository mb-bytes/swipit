from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a7c3e129bf4d'
down_revision: Union[str, Sequence[str], None] = '81cb69aedd98'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint('cards_user_id_fkey', 'cards', type_='foreignkey')
    op.create_foreign_key('cards_user_id_fkey', 'cards', 'users', ['user_id'], ['user_id'], ondelete='CASCADE')

    op.drop_constraint('transactions_card_id_fkey', 'transactions', type_='foreignkey')
    op.create_foreign_key('transactions_card_id_fkey', 'transactions', 'cards', ['card_id'], ['card_id'], ondelete='CASCADE')

    op.drop_constraint('spend_tracker_user_id_fkey', 'spend_tracker', type_='foreignkey')
    op.create_foreign_key('spend_tracker_user_id_fkey', 'spend_tracker', 'users', ['user_id'], ['user_id'], ondelete='CASCADE')

    op.drop_constraint('spend_tracker_card_id_fkey', 'spend_tracker', type_='foreignkey')
    op.create_foreign_key('spend_tracker_card_id_fkey', 'spend_tracker', 'cards', ['card_id'], ['card_id'], ondelete='CASCADE')


def downgrade() -> None:
    op.drop_constraint('spend_tracker_card_id_fkey', 'spend_tracker', type_='foreignkey')
    op.create_foreign_key('spend_tracker_card_id_fkey', 'spend_tracker', 'cards', ['card_id'], ['card_id'])

    op.drop_constraint('spend_tracker_user_id_fkey', 'spend_tracker', type_='foreignkey')
    op.create_foreign_key('spend_tracker_user_id_fkey', 'spend_tracker', 'users', ['user_id'], ['user_id'])

    op.drop_constraint('transactions_card_id_fkey', 'transactions', type_='foreignkey')
    op.create_foreign_key('transactions_card_id_fkey', 'transactions', 'cards', ['card_id'], ['card_id'])

    op.drop_constraint('cards_user_id_fkey', 'cards', type_='foreignkey')
    op.create_foreign_key('cards_user_id_fkey', 'cards', 'users', ['user_id'], ['user_id'])
