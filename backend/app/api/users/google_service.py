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

import json
import base64

if os.getenv("ENVIRONMENT") != "production":
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/gmail.readonly",
]

class GoogleService:
    def _get_client_config(self) -> dict:
        config = self._parse_client_secrets(settings.GOOGLE_CLIENT_SECRETS_FILE)
        if config:
            return config

        config = self._parse_client_secrets(os.getenv("GOOGLE_CLIENT_SECRETS_B64"))
        if config:
            return config

        config = self._parse_client_secrets(os.getenv("GOOGLE_CLIENT_SECRETS_JSON"))
        if config:
            return config

        raise ValueError(
            "Google client secrets could not be loaded. Please ensure GOOGLE_CLIENT_SECRETS_FILE, "
            "GOOGLE_CLIENT_SECRETS_B64, or GOOGLE_CLIENT_SECRETS_JSON is set to a valid file path, "
            "base64 string, or JSON string."
        )

    @staticmethod
    def _parse_client_secrets(val: str | None) -> dict | None:
        if not val or not isinstance(val, str) or not val.strip():
            return None
        val = val.strip()

        if os.path.exists(val) and os.path.isfile(val) and os.path.getsize(val) > 0:
            try:
                with open(val, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                    if content:
                        return json.loads(content)
            except Exception:
                pass

        if val.startswith("{") and val.endswith("}"):
            try:
                return json.loads(val)
            except Exception:
                pass

        try:
            decoded = base64.b64decode(val).decode("utf-8")
            if decoded.strip().startswith("{") and decoded.strip().endswith("}"):
                return json.loads(decoded)
        except Exception:
            pass

        return None



    def build_flow(self, state: str | None = None, scopes: list[str] | None = None) -> Flow:
        config = self._get_client_config()
        flow = Flow.from_client_config(config, scopes=scopes or SCOPES, state=state)
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
        config = self._get_client_config()
        section = config.get("web") or config.get("installed") or {}
        return section["client_id"]
    
    
    def _client_secret(self) -> str:
        config = self._get_client_config()
        section = config.get("web") or config.get("installed") or {}
        return section["client_secret"]



google_service = GoogleService()