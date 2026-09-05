from google_auth_oauthlib.flow import Flow
from app.core.config import settings
from app.core.security import encrypt_token, decrypt_token
from app.db.models.user import ConnectedAccount
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2.credentials import Credentials
from sqlalchemy import select
import asyncio
import os
import uuid

#This will allow http requests
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/gmail.readonly",
]

class GoogleService:
    def build_flow(self, state: str | None = None, scopes: list[str] | None = None) -> Flow:
        flow = Flow.from_client_secrets_file(
            settings.GOOGLE_CLIENT_SECRETS_FILE,
            scopes=scopes or SCOPES,
            state=state,
        )
        flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
        return flow

    async def upsert_connected_account(self, db: AsyncSession, *, user_id: uuid.UUID | str, email: str,
                                    encrypted_access_token: str, encrypted_refresh_token: str,
                                    token_expiry, scopes: str) -> ConnectedAccount:
        if isinstance(user_id, str):
            user_id = uuid.UUID(user_id)

        result = await db.execute(
            select(ConnectedAccount).where(
                ConnectedAccount.user_id == user_id,
                ConnectedAccount.provider == "google",
            )
        )
        account = result.scalar_one_or_none()
    
        if account is None:
            account = ConnectedAccount(user_id=user_id, provider="google")
            db.add(account)
    
        account.email = email
        account.encrypted_access_token = encrypted_access_token
        # keep the old refresh token if Google didn't send a new one
        if encrypted_refresh_token:
            account.encrypted_refresh_token = encrypted_refresh_token
        account.token_expiry = token_expiry
        account.scopes = scopes
    
        await db.commit()
        await db.refresh(account)
        return account

    async def get_connected_account(self, db: AsyncSession, user_id: uuid.UUID | str) -> ConnectedAccount | None:
        if isinstance(user_id, str):
            user_id = uuid.UUID(user_id)
        result = await db.execute(
            select(ConnectedAccount).where(
                ConnectedAccount.user_id == user_id,
                ConnectedAccount.provider == "google",
            )
        )
        return result.scalar_one_or_none()

    async def delete_connected_account(self, db: AsyncSession, user_id: uuid.UUID | str) -> bool:
        account = await self.get_connected_account(db, user_id)
        if account:
            await db.delete(account)
            await db.commit()
            return True
        return False

    async def get_valid_credentials(self, db: AsyncSession, user_id: uuid.UUID | str) -> Credentials:
        if isinstance(user_id, str):
            user_id = uuid.UUID(user_id)

        result = await db.execute(
            select(ConnectedAccount).where(
                ConnectedAccount.user_id == user_id,
                ConnectedAccount.provider == "google",
            )
        )
        account = result.scalar_one_or_none()
        if account is None:
            raise ValueError("No connected Google account for this user")
    
        creds = Credentials(
            token=decrypt_token(account.encrypted_access_token),
            refresh_token=decrypt_token(account.encrypted_refresh_token),
            token_uri="https://oauth2.googleapis.com/token",
            client_id=self._client_id(),
            client_secret=self._client_secret(),
            scopes=account.scopes.split(" "),
        )
    
        now = datetime.now(timezone.utc)
        if account.token_expiry <= now or creds.expired:
            await asyncio.to_thread(creds.refresh, GoogleRequest())

            account.encrypted_access_token = encrypt_token(creds.token)
            if creds.expiry:
                account.token_expiry = creds.expiry.replace(tzinfo=timezone.utc)
            await db.commit()
    
        return creds
 
 
    def _client_id(self) -> str:
        import json
        with open(settings.GOOGLE_CLIENT_SECRETS_FILE) as f:
            return json.load(f)["web"]["client_id"]
    
    
    def _client_secret(self) -> str:
        import json
        with open(settings.GOOGLE_CLIENT_SECRETS_FILE) as f:
            return json.load(f)["web"]["client_secret"]


google_service = GoogleService()