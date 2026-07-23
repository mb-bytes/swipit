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
    model_config = SettingsConfigDict(
        env_file = env_path, extra = "ignore"
    )
    
settings = Settings()