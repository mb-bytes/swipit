import uuid
from pydantic import BaseModel

class CreateCardRequest(BaseModel):
    card_last4: str | None = None
    product_id: uuid.UUID