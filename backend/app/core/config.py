import os
import json
import ssl
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Union

current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(os.path.dirname(current_dir))
env_path = os.path.join(os.path.dirname(current_dir), ".env")

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DB_URL: str
    REDIS_URL: str
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int
    MAIL_SERVER: str
    MAIL_STARTTLS: bool
    MAIL_SSL_TLS: bool
    JWT_SECRET: str
    JWT_ALGORITHM: str
    SALT: str
    FERNET_KEY: str
    GOOGLE_CLIENT_SECRETS_FILE: str = os.path.join(current_dir, "client_secret.json")
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/auth/google/callback"
    ACCESS_TOKEN_EXPIRY: int
    JTI_EXPIRY: int = 3600
    REFRESH_TOKEN_EXPIRY: int
    OPENAI_API_KEY: str
    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: Union[List[str], str] = ["http://localhost:5173", "http://localhost:5174"]
    model_config = SettingsConfigDict(
        env_file=env_path, extra="ignore"
    )

    @field_validator("ALLOWED_ORIGINS", mode="after")
    @classmethod
    def parse_origins(cls, v):
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return []
            if v.startswith("[") and v.endswith("]"):
                try:
                    decoded = json.loads(v)
                    if isinstance(decoded, list):
                        return [str(item).strip() for item in decoded if str(item).strip()]
                except Exception:
                    pass
            return [o.strip() for o in v.split(",") if o.strip()]
        return v

    @field_validator("DB_URL", mode="after")
    @classmethod
    def normalize_db_url(cls, v: str) -> str:
        if not v:
            return v
        if v.startswith("postgres://"):
            v = "postgresql+asyncpg://" + v[len("postgres://"):]
        elif v.startswith("postgresql://") and not v.startswith("postgresql+asyncpg://"):
            v = "postgresql+asyncpg://" + v[len("postgresql://"):]
        v = v.replace("sslmode=require", "ssl=require")
        v = v.replace("&channel_binding=require", "")
        v = v.replace("channel_binding=require&", "")
        v = v.replace("?channel_binding=require", "")
        return v

    @field_validator("REDIS_URL", mode="after")
    @classmethod
    def normalize_redis_url(cls, v: str) -> str:
        if not v:
            return v
        v = v.strip().strip("'").strip('"')
        if v.startswith("rediss://"):
            if "ssl_cert_reqs" not in v:
                separator = "&" if "?" in v else "?"
                v = f"{v}{separator}ssl_cert_reqs=none"
        return v

    @field_validator("GOOGLE_CLIENT_SECRETS_FILE", mode="after")
    @classmethod
    def resolve_secrets_path(cls, v: str) -> str:
        if os.path.isabs(v):
            return v
        p1 = os.path.join(backend_dir, v)
        if os.path.exists(p1):
            return p1
        p2 = os.path.join(current_dir, v)
        if os.path.exists(p2):
            return p2
        return v
    
settings = Settings()

broker_url = settings.REDIS_URL
result_backend = settings.REDIS_URL
broker_connection_retry_on_startup = True
if "rediss://" in settings.REDIS_URL:
    broker_use_ssl = {"ssl_cert_reqs": ssl.CERT_NONE}
    redis_backend_use_ssl = {"ssl_cert_reqs": ssl.CERT_NONE}