from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime

class PatientBase(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    emergency_contact: Optional[str] = None

class PatientCreate(PatientBase):
    smart_card_id: Optional[str] = None

class PatientUpdate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id: int
    user_id: int
    smart_card_id: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
