from fastapi import APIRouter, Depends, HTTPException, status
from .user_schemas import UserCreateSchema, UserSchema, EmailSchema
from .user_service import UserService
from app.db.models.user import UserModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.mail import mail, create_message
import uuid

user_router = APIRouter(tags=["user_routes"])
user_service = UserService()

@user_router.post("/", response_model=UserSchema)
async def new_user(user_details: UserCreateSchema, db: AsyncSession = Depends(get_db)):
    new_user = await user_service.create_user(db, user_details)
    return new_user

@user_router.get("/", response_model=UserSchema)
async def get_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    user_detail = await db.get(UserModel, user_id)
    if not user_detail:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user_detail

@user_router.post("/mail")
async def send_mail(emails: EmailSchema):
    email = emails.addresses
    html = "<h1>Hey! Welcome to SwipIt"

    message = create_message(recipients= email, subject="Welcome to SwipIt", body=html)

    await mail.send_message(message)

    return {"message": "Mail sent successfully"}



