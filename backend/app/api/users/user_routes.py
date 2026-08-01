from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from .user_schemas import UserCreateSchema, UserLoginSchema, PasswordResetEmailSchema, PasswordResetSchema
from .user_service import user_service
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.config import settings
from app.core.mail import mail, create_message
from app.core.security import verify_pswd, generate_jwt_token, decode_url_safe_token
from app.api.dependencies import AccessTokenBearer, RefreshTokenBearer
from datetime import datetime, timedelta

user_router = APIRouter(tags=["user-routes"])
access_token = AccessTokenBearer()
refresh_token = RefreshTokenBearer()

@user_router.post("/signup")
async def new_user(user_details: UserCreateSchema, db: AsyncSession = Depends(get_db)):
    new_user = await user_service.create_user(db, user_details)

    if new_user:
        user_email = new_user.email

        html_msg = """ 
        <h2> Hey! Welcome to SwipIt </h2>
        <p> You have successfully created an account on SwipIt </p>
        """

        message = create_message(recipients=[user_email], subject="Welcome to SwipIt", body=html_msg)
        await mail.send_message(message)

        return JSONResponse(content={"message": "New Account created successfully"}, status_code= status.HTTP_200_OK)

    return JSONResponse(content={"message": "Error occured while creating an account!"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@user_router.post("/login")
async def login(user_data: UserLoginSchema, db: AsyncSession = Depends(get_db)):
    username = user_data.username
    password = user_data.password

    user = await user_service.get_user_by_username(db, username)

    if user is not None:
        password_valid = verify_pswd(password, user.password_hash)

        if password_valid:
            access_token = generate_jwt_token(user_data={"username":user.username, "user_uid":str(user.user_id)})
            refresh_token = generate_jwt_token(user_data={"username":user.username, "user_uid":str(user.user_id)}, expiry=timedelta(days=settings.REFRESH_TOKEN_EXPIRY), refresh= True)

            return JSONResponse(content=
                {"message": "Welcome!", 
                "access_token": access_token, 
                "refresh_token": refresh_token, 
                "user": {"username": user.username, "user_uid": str(user.user_id)}
                })

        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid username or password")

@user_router.get("/refresh-token")
def get_new_access_token(token_data: dict = Depends(refresh_token)):
    expiry_timestamp = token_data['exp']

    if datetime.fromtimestamp(expiry_timestamp) > datetime.now():
        new_access_token = generate_jwt_token(user_data=token_data['user'], refresh=False)
        return JSONResponse(content={"access_token": new_access_token}, status_code=status.HTTP_200_OK)

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

@user_router.post("/password-reset-request")
async def send_reset_email(reset_email: PasswordResetEmailSchema, db: AsyncSession = Depends(get_db)):
    user_email = reset_email.email
    request_reset = await user_service.reset_password_request(db, user_email)
    
    return request_reset

@user_router.post("/password-reset-confirm/{token}")
async def reset_password(token: str, password_fiels: PasswordResetSchema, db: AsyncSession = Depends(get_db)):
    new_pswd, confirm_new_pswd = password_fiels.new_password, password_fiels.confirm_new_password
    if new_pswd!=confirm_new_pswd:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords do not match")
    token_data = decode_url_safe_token(token)
    user_email = token_data.get("email")
    
    reset_pswd = await user_service.reset_password(db, user_email, new_pswd)

    return reset_pswd

