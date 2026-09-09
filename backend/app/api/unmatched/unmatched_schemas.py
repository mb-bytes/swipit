import uuid
from pydantic import BaseModel


class AssignCardRequest(BaseModel):
    card_id: uuid.UUID
