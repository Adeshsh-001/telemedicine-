from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime
from app.models.user import UserRole

class UserBase(BaseModel):
    email: EmailStr
    phone: str
    full_name: str
    village: Optional[str] = None
    preferred_language: str = "en"

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.PATIENT
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        # Basic phone validation
        if not v.replace('+', '').replace('-', '').replace(' ', '').isdigit():
            raise ValueError('Invalid phone number format')
        return v

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    village: Optional[str] = None
    preferred_language: Optional[str] = None
    phone: Optional[str] = None

class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None
