from pydantic import BaseModel, Field, EmailStr, field_validator, model_validator
from datetime import datetime
from typing import List, Any
import uuid
import re

class UserSchema(BaseModel):
    user_id: uuid.UUID
    name: str | None = None
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True

class UserCreateSchema(BaseModel):
    name: str
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
    username: str | None = None
    email: str | None = None
    identifier: str | None = None
    password: str
    
class EmailSchema(BaseModel):
    addresses: List[EmailStr]

class PasswordResetEmailSchema(BaseModel):
    email: str | None = None
    username: str | None = None
    identifier: str | None = None

class PasswordResetSchema(BaseModel):
    new_password: str = Field(min_length=8)
    confirm_new_password: str = Field(min_length=8)

    @field_validator("new_password", "confirm_new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("Password must contain at least one letter and one number")
        return v

class BankRequestSchema(BaseModel):
    bank_name: str
    email: str | None = None

class UserUpdateSchema(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)

class ChangePasswordSchema(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)
    confirm_new_password: str = Field(min_length=8)

    @field_validator("new_password", "confirm_new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("Password must contain at least one letter and one number")
        return v

class ContactSchema(BaseModel):
    name: str
    email: EmailStr
    content: str

    @model_validator(mode="before")
    @classmethod
    def handle_requestor_email(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "requestor_email" in data and "email" not in data:
                data["email"] = data["requestor_email"]
        return data


