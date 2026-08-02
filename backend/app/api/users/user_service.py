from .user_schemas import UserCreateSchema, PasswordResetEmailSchema
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models.user import UserModel
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse
from fastapi import status
from app.core.config import settings
from app.core.security import gen_pswd_hash, generate_jwt_token, verify_pswd, create_url_safe_token
from app.celery_task import send_mail
from datetime import timedelta
import logging

class UserService:
    async def create_user(self, db: AsyncSession, user_details: UserCreateSchema) -> UserModel:
        try:
            user_data = user_details.model_dump()
            user_email = user_data.get("email")
            user_username = user_data.get("username")

            existing_user = await self.get_user_by_email(db, user_email)
            if existing_user:
                return JSONResponse(status_code=status.HTTP_409_CONFLICT, content={"message": "User with this email already exists, please try logging in."})

            existing_username = await self.get_user_by_username(db, user_username)
            if existing_username:
                return JSONResponse(status_code=status.HTTP_409_CONFLICT, content={"message": "Username already taken, please choose a different one."})


            password = user_data.pop("password")
            hashed_password = gen_pswd_hash(password)

            new_user = UserModel(**user_data, password_hash=hashed_password)
            db.add(new_user)
            await db.commit()
            await db.refresh(new_user)

            if new_user:
                user_email = new_user.email

                html_msg = """ 
                <h2> Hey! Welcome to SwipIt </h2>
                <p> You have successfully created an account on SwipIt </p>
                """

                send_mail.delay(user_email, "Welcome to SwipIt", html_msg)

                return JSONResponse(content={"message": "New Account created successfully"}, status_code= status.HTTP_200_OK)
        except Exception as e:
            logging.exception(e)
            return JSONResponse(content={"message": "Error occured while creating an account!"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    async def login_user(self, db: AsyncSession, username: str, password: str):
        user = await self.get_user_by_username(db, username)

        if user is not None:
            password_valid = verify_pswd(password, user.password_hash)

            if password_valid:
                access_token = generate_jwt_token(
                    user_data={"username": user.username, "user_uid": str(user.user_id)}
                )
                refresh_token = generate_jwt_token(
                    user_data={"username": user.username, "user_uid": str(user.user_id)},
                    expiry=timedelta(days=settings.REFRESH_TOKEN_EXPIRY),
                    refresh=True,
                )

                return JSONResponse(
                    content={
                        "message": "Welcome!",
                        "access_token": access_token,
                        "refresh_token": refresh_token,
                        "user": {"username": user.username, "user_uid": str(user.user_id)},
                    }
                )

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid username or password",
            ) 

    async def get_user_by_username(self, db: AsyncSession, username: str):
            user = await db.scalar(select(UserModel).where(UserModel.username == username))
            return user  

    async def get_user_by_email(self, db: AsyncSession, email: str):
            user = await db.scalar(select(UserModel).where(UserModel.email == email))
            return user  

    async def reset_password_request(self, db: AsyncSession, user_email: PasswordResetEmailSchema):
        email = user_email.email
        user = await self.get_user_by_email(db, email)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        token = create_url_safe_token({"email": email})
        link = f"http://localhost:8000/api/user/password-reset-confirm/{token}"
        html_msg = f""" 
        <h2> Request for password reset </h2>
        <p> To reset your password <a href={link}>click here </a> 
        """
        send_mail.delay(email, "SwipIt Password Reset", html_msg)
        
        return JSONResponse(content={"message": "Please check your email for password reset instructions"})

    async def reset_password(self, db:AsyncSession, email: str, new_pswd: str):
        user = await self.get_user_by_email(db, email)
        new_pswd_hash = gen_pswd_hash(new_pswd)
        reset_password = await self.update_user(db, {"password_hash": new_pswd_hash}, user.username)
        if reset_password:
            return JSONResponse(content={"message": "Password has been reset successfully"}, status_code=status.HTTP_200_OK)
        return JSONResponse(content={"message": "Error while trying to reset the password!. Please try again"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    async def update_user(self, db: AsyncSession,new_detail:dict, username: str):
        user = await self.get_user_by_username(db, username)
        for key, value in new_detail.items():
            setattr(user, key, value)
        await db.commit()
        return user

user_service = UserService()



    

                


