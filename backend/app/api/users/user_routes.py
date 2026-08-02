from datetime import datetime, timedelta

from app.api.dependencies import AccessTokenBearer, RefreshTokenBearer
from app.core.config import settings
from app.core.security import decode_url_safe_token, generate_jwt_token, verify_pswd
from app.db.session import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from .user_schemas import (
    PasswordResetEmailSchema,
    PasswordResetSchema,
    UserCreateSchema,
    UserLoginSchema,
)
from .user_service import user_service

user_router = APIRouter(tags=["user-routes"])
access_token = AccessTokenBearer()
refresh_token = RefreshTokenBearer()


@user_router.post("/signup")
async def new_user(user_details: UserCreateSchema, db: AsyncSession = Depends(get_db)):
    new_user = await user_service.create_user(db, user_details)
    return new_user


@user_router.post("/login")
async def login(user_data: UserLoginSchema, db: AsyncSession = Depends(get_db)):
    username = user_data.username
    password = user_data.password

    login_user = await user_service.login_user(db, username)

    return login_user

@user_router.get("/refresh-token")
def get_new_access_token(token_data: dict = Depends(refresh_token)):
    expiry_timestamp = token_data["exp"]

    if datetime.fromtimestamp(expiry_timestamp) > datetime.now():
        new_access_token = generate_jwt_token(
            user_data=token_data["user"], refresh=False
        )
        return JSONResponse(
            content={"access_token": new_access_token}, status_code=status.HTTP_200_OK
        )

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token"
    )

@user_router.post("/password-reset-request")
async def send_reset_email(
    reset_email: PasswordResetEmailSchema, db: AsyncSession = Depends(get_db)
):
    user_email = reset_email.email
    request_reset = await user_service.reset_password_request(db, user_email)

    return request_reset

@user_router.post("/password-reset-confirm/{token}")
async def reset_password(
    token: str, password_fiels: PasswordResetSchema, db: AsyncSession = Depends(get_db)
):
    new_pswd, confirm_new_pswd = (
        password_fiels.new_password,
        password_fiels.confirm_new_password,
    )
    if new_pswd != confirm_new_pswd:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords do not match"
        )
    token_data = decode_url_safe_token(token)
    user_email = token_data.get("email")

    reset_pswd = await user_service.reset_password(db, user_email, new_pswd)

    return reset_pswd
