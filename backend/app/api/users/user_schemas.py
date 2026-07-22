from pydantic import BaseModel, Field
from datetime import datetime
import uuid

class UserSchema(BaseModel):
    user_id: uuid.UUID
    username: str = Field(min_length=8, max_length=20)
    email: str
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True


class UserCreateSchema(BaseModel):
    username: str = Field(min_length=8, max_length=20)
    email: str
    password: str

