from .reward_schemas import TransactionInput, RewardResult
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.card_rewards import SpendTracker
from app.db.models.cards import Transaction, CardModel, CardProduct
from app.db.models.card_rewards import RewardCard
from sqlalchemy.dialects.postgresql import insert as pg_insert
from .reward_utils import get_period_key
from sqlalchemy import select
from app.api.merchants.categorize_service import categorize_service
from decimal import Decimal
import uuid


class RewardService:
    def process_reward(self, config: dict, transaction: TransactionInput) -> RewardResult:
        exclusions = config.get('exclusions', {})
        excluded_merchants = exclusions['merchants']
        excluded_categories = exclusions['categories']

        if transaction.category in excluded_categories:
            return RewardResult(reward_earned=0.0, rule_applied="excluded", rate_used=0.0, is_excluded=True)

        if transaction.merchant_key in excluded_merchants:
            return RewardResult(reward_earned=0.0, rule_applied="excluded", rate_used=0.0, is_excluded=True)
        
        merchant_rates = config.get('merchant_rates', [])
        category_rates = config.get('category_rates', [])

        matched_merchant_rule = None
        matched_category_rule = None

        for rule in merchant_rates:
            if transaction.merchant_key in rule.get('merchants', []):
                matched_merchant_rule = rule
                break

        for rule in category_rates:
            if transaction.category in rule.get('categories', []):
                matched_category_rule = rule
                break

        base_rate = config.get('base_rate', {})
        
        if matched_merchant_rule:
            reward, rate = self.compute_raw_reward(transaction.amount, matched_merchant_rule)
            return RewardResult(reward_earned=reward, rule_applied="merchant_rate", rate_used=rate, is_excluded=False)
        
        if matched_category_rule:
            reward, rate = self.compute_raw_reward(transaction.amount, matched_category_rule)
            return RewardResult(reward_earned=reward, rule_applied="category_rate", rate_used=rate, is_excluded=False)
        
        # fallback to base rate
        reward, rate = self.compute_raw_reward(transaction.amount, base_rate)
        return RewardResult(reward_earned=reward, rule_applied="base_rate", rate_used=rate, is_excluded=False)

    def compute_raw_reward(self, amount: float, rule: dict) -> tuple:
        rate_type = rule.get('rate_type')

        if rate_type == 'percentage':
            rate = rule['rate']
            return amount*(rate/100), rate
        elif rate_type == 'points_per_amount':
            points = rule['points']
            per_amount = rule['per_spend_amount']
            return (amount // per_amount)*points, points
        elif rate_type == 'points_multiplier':
            base = rule['base_points']
            multiplier = rule['multiplier']
            per = rule['per_spend_amount']
            return (amount // per) * base * multiplier, multiplier

        return 0.0, 0.0

    async def get_current_spend(self, db: AsyncSession, user_id: uuid.UUID, card_id: uuid.UUID, category: str, period_key: str, merchant_key: str | None = None):
       filters = [SpendTracker.user_id==user_id, SpendTracker.card_id==card_id, SpendTracker.period_key==period_key, SpendTracker.category==category]
       if merchant_key:
        filters.append(SpendTracker.merchant==merchant_key)

       result = await db.execute(select(SpendTracker.spend_amount).where(*filters))
       return result.scalar_one_or_none() or 0.0

    async def upsert_spend_tracker(self, db: AsyncSession, user_id: uuid.UUID, card_id: uuid.UUID, reward_id: uuid.UUID,
    category: str, merchant: str, period_key: str,
    spend_amount: float, reward_earned: float
    ):
        stmt = pg_insert(SpendTracker).values(
        user_id=user_id,
        card_id=card_id,
        reward_id=reward_id,
        category=category,
        merchant=merchant,
        period_key=period_key,
        spend_amount=spend_amount,
        reward_earned=reward_earned,
        ).on_conflict_do_update(
            constraint="uq_spend_period",  
            set_={
            "spend_amount": SpendTracker.spend_amount + spend_amount,
            "reward_earned": SpendTracker.reward_earned + reward_earned,
            }
        )
        await db.execute(stmt)
        await db.commit()

    async def manage_transaction(self, db: AsyncSession, transaction_id: uuid.UUID):
        tx = (await db.execute(select(Transaction).where(Transaction.transaction_id==transaction_id))).scalar_one_or_none()
        if not tx:
            raise ValueError("Transaction not found")
        card = (await db.execute(select(CardModel).where(CardModel.card_id==tx.card_id))).scalar_one_or_none()
        if not card:
            raise ValueError(f"Card not found for transaction {transaction_id}")
        if not card.product_id:
            raise ValueError(f"Card {card.card_id} has no product linked — cannot calculate rewards")

        reward_card = (await db.execute(select(RewardCard).where(RewardCard.product_id==card.product_id))).scalar_one_or_none()
        if not reward_card:
            raise ValueError(f"No reward config found for product_id={card.product_id}")

        merchant_key = categorize_service.normalize_merchant(tx.merchant)
        tx_input = TransactionInput(amount=float(tx.amount), category=tx.category or "unknown", merchant_key=merchant_key, card_network=reward_card.network or "", transaction_date=tx.transaction_date)

        period_key = get_period_key(tx.transaction_date, "calendar_month")

        current_spend = await self.get_current_spend(db, card.user_id, card.card_id, tx_input.category, period_key, tx_input.merchant_key)

        result = self.process_reward(reward_card.config, tx_input)

        await self.upsert_spend_tracker(db,  
        user_id=card.user_id,
        card_id=card.card_id,
        reward_id=reward_card.id,
        category=tx_input.category,
        merchant=tx_input.merchant_key,
        period_key=period_key,
        spend_amount=tx.amount,
        reward_earned=result.reward_earned)

        return result

    async def calculate_best_reward(self, db: AsyncSession, transaction: TransactionInput):
        cards = (await db.execute(select(RewardCard).where(RewardCard.is_active == True))).scalars().all()

        best_card, best_reward = None, Decimal(0)
        
        for card in cards:
            result = self.process_reward(card.config, transaction)
            reward = Decimal(str(result.reward_earned))
            if card.reward_unit != "cashback" and card.point_value_inr:
                reward = reward * Decimal(str(card.point_value_inr))
            if reward > best_reward:
                best_card, best_reward = card, reward

        return best_card, best_reward


reward_service = RewardService()  