from pydantic import BaseModel, Field, EmailStr, field_validator
from datetime import datetime
from typing import List
import uuid
import re

class UserSchema(BaseModel):
    user_id: uuid.UUID
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True

class UserCreateSchema(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("Password must contain at least one letter and one number")
        return v

class UserLoginSchema(BaseModel):
    username: str
    password: str
    
class EmailSchema(BaseModel):
    addresses: List[EmailStr]

class PasswordResetEmailSchema(BaseModel):
    email: EmailStr

class PasswordResetSchema(BaseModel):
    password: str = Field(min_length=8)
    confirm_new_password: str = Field(min_length=8)

    @field_validator("password", "confirm_new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("Password must contain at least one letter and one number")
        return v

