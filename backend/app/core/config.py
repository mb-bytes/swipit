import os
from pydantic_settings import BaseSettings, SettingsConfigDict

current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(os.path.dirname(current_dir), ".env")

class Settings(BaseSettings):
    DB_URL: str
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int
    MAIL_SERVER: str
    MAIL_STARTTLS: bool
    MAIL_SSL_TLS: bool
    JWT_SECRET: str
    JWT_ALGORITHM: str
    FERNET_KEY: str
    GOOGLE_CLIENT_SECRETS_FILE: str = "client_secret.json"
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/auth/google/callback"
    ACCESS_TOKEN_EXPIRY: int
    REFRESH_TOKEN_EXPIRY: int
    model_config = SettingsConfigDict(
        env_file = env_path, extra = "ignore"
    )
    
settings = Settings()