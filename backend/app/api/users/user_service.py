from .user_schemas import UserCreateSchema, PasswordResetEmailSchema
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.redis.redis import redis
from app.db.models.user import UserModel
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse
from fastapi import status, Response
from app.core.config import settings
from app.core.security import gen_pswd_hash, generate_jwt_token, verify_pswd, create_url_safe_token
from app.celery_task import send_mail
from datetime import timedelta
import logging
import secrets
import re
import uuid

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

                access_token, refresh_token = self.create_session_tokens(new_user)

                response = JSONResponse(
                    content={
                        "message": "New Account created successfully",
                        "access_token": access_token,
                        "refresh_token": refresh_token,
                        "user": {"username": new_user.username, "email": new_user.email, "user_id": str(new_user.user_id), "name": new_user.name}
                    },
                    status_code=status.HTTP_201_CREATED
                )
                response.set_cookie(
                    key="refresh_token",
                    value=refresh_token,
                    httponly=True,
                    secure=False,
                    samesite="lax",
                    max_age=settings.REFRESH_TOKEN_EXPIRY * 86400,
                    path="/",
                )
                return response
        except Exception as e:
            logging.exception(e)
            return JSONResponse(content={"message": "Error occurred while creating an account!"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create_session_tokens(self, user: UserModel) -> tuple[str, str]:
        access_token = generate_jwt_token(
            user_data={"username": user.username, "user_uid": str(user.user_id), "name": user.name}
        )
        refresh_token = generate_jwt_token(
            user_data={"username": user.username, "user_uid": str(user.user_id), "name": user.name},
            expiry=timedelta(days=settings.REFRESH_TOKEN_EXPIRY),
            refresh=True,
        )
        return access_token, refresh_token

    async def get_or_create_google_user(self, db: AsyncSession, email: str, name: str | None = None) -> UserModel:
        existing_user = await self.get_user_by_email(db, email)
        if existing_user:
            return existing_user

        base_username = email.split("@")[0].lower()
        base_username = re.sub(r"[^a-zA-Z0-9_]", "", base_username)[:14]
        if not base_username or len(base_username) < 3:
            base_username = f"user_{secrets.token_hex(3)}"

        unique_username = base_username
        counter = 1
        while await self.get_user_by_username(db, unique_username):
            suffix = f"_{counter}"
            unique_username = f"{base_username[:20 - len(suffix)]}{suffix}"
            counter += 1

        random_password = secrets.token_urlsafe(32)
        hashed_password = gen_pswd_hash(random_password)

        new_user = UserModel(
            name=name,
            username=unique_username,
            email=email,
            password_hash=hashed_password,
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        html_msg = """ 
        <h2> Hey! Welcome to SwipIt </h2>
        <p> You have successfully signed in with Google to SwipIt </p>
        """
        send_mail.delay(email, "Welcome to SwipIt", html_msg)

        return new_user

    async def login_user(self, db: AsyncSession, identifier: str, password: str):
        target = identifier.strip()
        user = None
        if "@" in target:
            user = await self.get_user_by_email(db, target.lower())
            if not user:
                user = await self.get_user_by_username(db, target)
        else:
            user = await self.get_user_by_username(db, target)
            if not user:
                user = await self.get_user_by_email(db, target.lower())

        if user is not None:
            password_valid = verify_pswd(password, user.password_hash)

            if password_valid:
                access_token = generate_jwt_token(
                    user_data={"username": user.username, "user_uid": str(user.user_id), "name": user.name}
                )
                refresh_token = generate_jwt_token(
                    user_data={"username": user.username, "user_uid": str(user.user_id), "name": user.name},
                    expiry=timedelta(days=settings.REFRESH_TOKEN_EXPIRY),
                    refresh=True,
                )

                response = JSONResponse(
                    content={
                        "message": "Welcome!",
                        "access_token": access_token,
                        "refresh_token": refresh_token,
                        "user": {"username": user.username, "user_uid": str(user.user_id), "name": user.name},
                    }
                )
                response.set_cookie(
                    key="refresh_token",
                    value=refresh_token,
                    httponly=True,
                    secure=False,        
                    samesite="lax",     
                    max_age=settings.REFRESH_TOKEN_EXPIRY * 86400,
                    path="/",   
                )

                return response

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid username, email, or password",
        ) 

    async def get_user_by_username(self, db: AsyncSession, username: str):
            user = await db.scalar(select(UserModel).where(UserModel.username == username))
            return user  

    async def get_user_by_email(self, db: AsyncSession, email: str):
            user = await db.scalar(select(UserModel).where(UserModel.email == email))
            return user  

    async def reset_password_request(self, db: AsyncSession, user_input):
        target = ""
        if hasattr(user_input, "identifier") and user_input.identifier:
            target = user_input.identifier.strip()
        elif hasattr(user_input, "email") and user_input.email:
            target = user_input.email.strip()
        elif hasattr(user_input, "username") and user_input.username:
            target = user_input.username.strip()
        else:
            target = str(user_input).strip()

        user = None
        if "@" in target:
            user = await self.get_user_by_email(db, target.lower())
            if not user:
                user = await self.get_user_by_username(db, target)
        else:
            user = await self.get_user_by_username(db, target)
            if not user:
                user = await self.get_user_by_email(db, target.lower())

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found with that email or username",
            )

        email = user.email
        token = create_url_safe_token({"email": email})
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
        link = f"{frontend_url}/reset-password?token={token}"
        html_msg = f""" 
        <h2> Request for password reset </h2>
        <p> To reset your password <a href="{link}">click here</a></p> 
        """
        try:
            send_mail.delay(email, "SwipIt Password Reset", html_msg)
        except Exception as e:
            logging.warning(f"Could not dispatch reset email: {e}")

        masked_email = email
        if "@" in email:
            parts = email.split("@")
            u_part = parts[0]
            domain = parts[1]
            masked_email = f"{u_part[:2]}***@{domain}" if len(u_part) > 2 else f"{u_part[:1]}***@{domain}"

        return JSONResponse(
            content={
                "message": "Please check your email for password reset instructions",
                "email": email,
                "masked_email": masked_email,
                "username": user.username,
                "reset_token": token,
                "reset_link": link,
            },
            status_code=status.HTTP_200_OK,
        )

    async def reset_password(self, db:AsyncSession, email: str, new_pswd: str):
        user = await self.get_user_by_email(db, email)
        if not user:
            return JSONResponse(content={"message": "User not found or invalid reset token"}, status_code=status.HTTP_404_NOT_FOUND)
        new_pswd_hash = gen_pswd_hash(new_pswd)
        reset_password = await self.update_user(db, {"password_hash": new_pswd_hash}, user.username)
        if reset_password:
            return JSONResponse(content={"message": "Password has been reset successfully"}, status_code=status.HTTP_200_OK)
        return JSONResponse(content={"message": "Error while trying to reset the password!. Please try again"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    async def new_bank_request(self, bank_name: str, requestor: str, email: str = "atique.sh2@gmail.com"):
        html_msg = f""" 
        <h2> Request for new bank parser </h2>
        <p> New request for {bank_name} from {requestor} </p> 
        """
        try:
            send_mail.delay(email, "New bank request from SwipIt", html_msg)
            return JSONResponse(content={"message": "Request for new bank sent successfully"}, status_code=status.HTTP_200_OK)
        except Exception as e:
            logging.exception(e)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An error occurred while sending the request")

     
    async def update_user(self, db: AsyncSession, new_detail: dict, username: str):
        user = await self.get_user_by_username(db, username)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="User not found"
            )
        protected_fields = {"user_id", "created_at"}
        for key, value in new_detail.items():
            if key not in protected_fields and hasattr(user, key):
                setattr(user, key, value)
        await db.commit()
        await db.refresh(user)
        return user


    async def delete_user(self, db: AsyncSession, user_id: uuid.UUID | str) -> bool:
        if isinstance(user_id, str):
            user_id = uuid.UUID(user_id)
        result = await db.execute(select(UserModel).where(UserModel.user_id == user_id))
        user = result.scalar_one_or_none()
        if user:
            await db.delete(user)
            await db.commit()
            return True
        return False

    async def add_jti_to_blocklist(self, jti: str):
        try:
            await redis.set(name=jti, value="", ex=settings.JTI_EXPIRY)
        except Exception as e:
            logging.warning(f"Redis unavailable, could not blocklist JTI: {e}")

    async def token_in_blocklist(self, jti: str) -> bool:
        try:
            jti_val = await redis.get(jti)
            return jti_val is not None
        except Exception as e:
            logging.warning(f"Redis unavailable, assuming token is not in blocklist: {e}")
            return False

    

user_service = UserService()



    

                


