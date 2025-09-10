from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/healthcare_db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Redis for caching
    REDIS_URL: str = "redis://localhost:6379"
    
    # SMS Service (Twilio)
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    
    # AI Services
    OPENAI_API_KEY: Optional[str] = None
    
    # App Settings
    PROJECT_NAME: str = "Rural Healthcare API"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()
