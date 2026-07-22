import os
from pydantic_settings import BaseSettings, SettingsConfigDict

current_dir = os.path.dirname(os.path.abspath(__file__))
# .env is located in backend/app/.env, which is one level up from backend/app/utils/config.py
env_path = os.path.join(os.path.dirname(current_dir), ".env")

class Settings(BaseSettings):
    DB_URL: str
    model_config = SettingsConfigDict(
        env_file = env_path, extra = "ignore"
    )
    
settings = Settings()