from pydantic import BaseModel
from datetime import date

class TransactionInput(BaseModel):
    amount: float
    category: str
    merchant_key: str
    card_network: str
    transaction_date: date

class RewardResult(BaseModel):
    reward_earned: float
    rule_applied: str
    rate_used: float
    is_excluded: bool