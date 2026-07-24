from app.db.base import Base
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from datetime import datetime
from typing import List

class UserModel(Base):
    __tablename__ = "users"
    user_id: Mapped[uuid.UUID] = mapped_column(primary_key= True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(20), nullable= False, unique=True)
    email: Mapped[str] = mapped_column(String, unique = True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    password_hash: Mapped[str] = mapped_column(String, nullable = False)
    
    connected_accounts : Mapped[List["ConnectedAccount"] | None] = relationship(back_populates="user")

class ConnectedAccount(Base):
    __tablename__ = "connected_accounts"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('users.user_id'))
    provider: Mapped[str] = mapped_column(String, default="google")
    access_token: Mapped[str] = mapped_column(String)
    refresh_token: Mapped[str] = mapped_column(String)
    token_expiry: Mapped[datetime] = mapped_column(DateTime)

    user: Mapped["UserModel"] = relationship(back_populates="connected_accounts")


