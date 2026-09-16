from datetime import datetime, timedelta

from app.api.dependencies import AccessTokenBearer, RefreshTokenBearer, OptionalAccessTokenBearer, get_curr_user
from app.core.config import settings
from app.core.security import decode_url_safe_token, generate_jwt_token, verify_pswd, gen_pswd_hash
from app.db.session import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from .user_schemas import (
    BankRequestSchema,
    PasswordResetEmailSchema,
    PasswordResetSchema,
    UserCreateSchema,
    UserLoginSchema,
    UserSchema,
    UserUpdateSchema,
    ChangePasswordSchema,
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
    identifier = user_data.identifier or user_data.username or user_data.email
    if not identifier or not identifier.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email is required",
        )
    password = user_data.password

    login_user = await user_service.login_user(db, identifier.strip(), password)

    return login_user

@user_router.get("/me", response_model=UserSchema)
async def get_me(curr_user=Depends(get_curr_user)):
    return curr_user

@user_router.patch("/me", response_model=UserSchema)
async def update_me(
    update_data: UserUpdateSchema,
    curr_user=Depends(get_curr_user),
    db: AsyncSession = Depends(get_db)
):
    updates = update_data.model_dump(exclude_unset=True)
    updated_user = await user_service.update_user(db, updates, curr_user.username)
    return updated_user

@user_router.delete("/me")
async def delete_me(
    curr_user=Depends(get_curr_user),
    token_data = Depends(OptionalAccessTokenBearer()),
    db: AsyncSession = Depends(get_db)
):
    if token_data and isinstance(token_data, dict) and "jti" in token_data:
        await user_service.add_jti_to_blocklist(token_data['jti'])

    deleted = await user_service.delete_user(db, curr_user.user_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    response = JSONResponse(content={"message": "Account deleted successfully"})
    response.delete_cookie(key="refresh_token", path="/")
    return response

@user_router.post("/change-password")
async def change_password(
    data: ChangePasswordSchema,
    curr_user = Depends(get_curr_user),
    db: AsyncSession = Depends(get_db)
):
    if not verify_pswd(data.current_password, curr_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    if data.new_password != data.confirm_new_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New passwords do not match")
    
    new_hash = gen_pswd_hash(data.new_password)
    curr_user.password_hash = new_hash
    await db.commit()
    return {"message": "Password changed successfully"}

@user_router.get("/logout")
async def logout(token_data = Depends(OptionalAccessTokenBearer())):
    if token_data and isinstance(token_data, dict) and "jti" in token_data:
        await user_service.add_jti_to_blocklist(token_data['jti'])

    response = JSONResponse(content={"message": "Logged out successfully"})
    response.delete_cookie(key="refresh_token", path="/")
    return response
    
@user_router.get("/refresh-token")
def get_new_access_token(token_data: dict = Depends(refresh_token)):
    expiry_timestamp = token_data["exp"]

    if datetime.fromtimestamp(expiry_timestamp) > datetime.now():
        new_access_token = generate_jwt_token(
            user_data=token_data["user"], refresh=False
        )
        return JSONResponse(
            content={
                "access_token": new_access_token,
                "user": token_data.get("user")
            },
            status_code=status.HTTP_200_OK
        )

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token"
    )

@user_router.get("/check-account")
async def check_account(identifier: str, db: AsyncSession = Depends(get_db)):
    val = identifier.strip()
    if not val:
        return {"exists": False}
    user = None
    if "@" in val:
        user = await user_service.get_user_by_email(db, val.lower())
        if not user:
            user = await user_service.get_user_by_username(db, val)
    else:
        user = await user_service.get_user_by_username(db, val)
        if not user:
            user = await user_service.get_user_by_email(db, val.lower())
    if not user:
        return {"exists": False}
    email = user.email or ""
    masked = email
    if "@" in email:
        parts = email.split("@")
        u_part = parts[0]
        domain = parts[1]
        masked = f"{u_part[:2]}***@{domain}" if len(u_part) > 2 else f"{u_part[:1]}***@{domain}"
    return {
        "exists": True,
        "username": user.username,
        "masked_email": masked,
    }

@user_router.post("/password-reset-request")
async def send_reset_email(
    reset_email: PasswordResetEmailSchema, db: AsyncSession = Depends(get_db)
):
    target = reset_email.identifier or reset_email.email or reset_email.username
    if not target or not target.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide an email or username",
        )
    request_reset = await user_service.reset_password_request(db, target.strip())

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

@user_router.post("/bank-request")
async def new_bank_request(request_data: BankRequestSchema):
    new_request = await user_service.new_bank_request(
        bank_name=request_data.bank_name,
        requestor=request_data.email or "Anonymous"
    )
    return new_request

