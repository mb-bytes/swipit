from .user_schemas import UserCreateSchema, UserSchema
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models.user import UserModel
from fastapi.exceptions import HTTPException
from google_auth_oauthlib.flow import Flow
from fastapi import status
from app.core.security import gen_pswd_hash
import logging

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

class UserService:
    async def create_user(self, db: AsyncSession, user_details: UserCreateSchema) -> UserModel:
        try:
            user_data = user_details.model_dump()
            password = user_data.pop("password")
            hashed_password = gen_pswd_hash(password)
            new_user = UserModel(**user_data, password_hash=hashed_password)
            db.add(new_user)
            await db.commit()
            await db.refresh(new_user)
            return new_user
        except Exception as e:
            logging.exception(e)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Oops! Something went wrong..")

    async def get_user_by_username(self, db: AsyncSession, username: str):
            user = await db.scalar(select(UserModel).where(UserModel.username == username))
            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"message": "User not found"})
            return user

    def build_flow(state: str | None = None) -> Flow:
        flow = Flow.from_client_secrets_file(
        settings.google_client_secrets_file,
        scopes=SCOPES,
        state=state,
        )
    flow.redirect_uri = settings.google_redirect_uri
    return flow

    

                


