from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from .user_schemas import UserCreateSchema, UserSchema, EmailSchema
from .user_service import UserService
from app.db.models.user import UserModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.mail import mail, create_message
import uuid

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
    

@user_router.post("/mail")
async def send_mail(emails: EmailSchema):
    email = emails.addresses
    html = "<h1>Hey! Welcome to SwipIt"

    message = create_message(recipients= email, subject="Welcome to SwipIt", body=html)

    await mail.send_message(message)

    return {"message": "Mail sent successfully"}



