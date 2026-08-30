import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(os.path.dirname(current_dir))
env_path = os.path.join(os.path.dirname(current_dir), ".env")

class Settings(BaseSettings):
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
    SALT:str
    FERNET_KEY: str
    GOOGLE_CLIENT_SECRETS_FILE: str = os.path.join(current_dir, "client_secret.json")
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/auth/google/callback"
    ACCESS_TOKEN_EXPIRY: int
    JTI_EXPIRY: int = 3600
    REFRESH_TOKEN_EXPIRY: int
    OPENAI_API_KEY: str
    model_config = SettingsConfigDict(
        env_file = env_path, extra = "ignore"
    )

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