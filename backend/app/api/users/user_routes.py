from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from .user_schemas import UserCreateSchema, UserSchema, EmailSchema
from .user_service import UserService
from app.db.models.user import UserModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.config import settings
from app.core.mail import mail, create_message
from app.core.security import verify_pswd, generate_jwt_token
import uuid
from datetime import datetime, timedelta

user_router = APIRouter(tags=["user_routes"])
user_service = UserService()

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
async def login(user_data: UserModel, db: session = Depends(get_db)):
    username = user_data.username
    password = user_data.password_hash

    user = user_service.get_user_by_username(username, db)

    if user is not None:
        password_valid = verify_pswd(password, user.password_hash)

        if password_valid:
            access_token = generate_jwt_token(user_data={"username":user.username, "user_uid":str(user.user_id)})
            refresh_token = generate_jwt_token(user_data={"username":user.username, "user_uid":str(user.user_id)}, expiry=timedelta(days=settings.REFRESH_TOKEN_EXPIRY), refresh= True)

            return JSONResponse(content=
                {"message": "Welcome!", 
                "access_token": access_token, 
                "refresh_token": refresh_token, 
                "user": {"username": user.username, "user_uid":user.user_id}
                })

        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid username or password")

@user_router.post("/mail")
async def send_mail(emails: EmailSchema):
    email = emails.addresses
    html = "<h1>Hey! Welcome to SwipIt"

    message = create_message(recipients= email, subject="Welcome to SwipIt", body=html)

    await mail.send_message(message)

    return {"message": "Mail sent successfully"}



