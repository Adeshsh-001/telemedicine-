from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class PrescriptionMedicine(BaseModel):
    medicine_id: int
    medicine_name: str
    dosage: str
    frequency: str
    duration_days: int
    instructions: Optional[str] = None

class PrescriptionCreate(BaseModel):
    patient_id: int
    symptoms: List[str]
    diagnosis: Optional[str] = None
    medicines: List[PrescriptionMedicine]
    notes: Optional[str] = None
    duration_days: int

class PrescriptionResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: Optional[int]
    symptoms: str  # JSON string
    diagnosis: Optional[str]
    medicines: str  # JSON string
    dosage_instructions: Optional[str]
    duration_days: Optional[int]
    notes: Optional[str]
    is_ai_generated: bool
    confidence_score: Optional[float]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class HealthRecordCreate(BaseModel):
    patient_id: int
    symptoms: List[str]
    vital_signs: Optional[Dict[str, Any]] = None
    voice_analysis: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

class HealthRecordResponse(BaseModel):
    id: int
    patient_id: int
    recorded_by: int
    symptoms: str
    vital_signs: Optional[str]
    voice_analysis: Optional[str]
    ai_assessment: Optional[str]
    severity_level: Optional[int]
    follow_up_required: bool
    follow_up_date: Optional[datetime]
    notes: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
