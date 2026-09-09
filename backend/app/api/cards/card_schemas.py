import uuid
from pydantic import BaseModel
from datetime import date

class CreateCardRequest(BaseModel):
    card_last4: str | None = None
    product_id: uuid.UUID

class CreateManualTransactionRequest(BaseModel):
    card_id: uuid.UUID
    merchant: str
    amount: float
    category: str | None = None
    transaction_date: date | None = None