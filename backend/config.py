import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "DIVAD Clinical OT API"
    APP_VERSION: str = "1.0.0"
    
    # MySQL Database Credentials
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "layn")
    DB_HOST: str = os.getenv("DB_HOST", "127.0.0.1")
    DB_PORT: int = int(os.getenv("DB_PORT", "3307"))
    DB_NAME: str = os.getenv("DB_NAME", "divad_db")
    
    # JWT Settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "divad_simats_pediatric_secret_key_2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Server Host & Port
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
