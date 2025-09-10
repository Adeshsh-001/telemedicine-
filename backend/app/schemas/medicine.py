from pydantic import BaseModel, validator
from typing import List, Optional, Dict, Any
from datetime import datetime

class MedicineBase(BaseModel):
    name: str
    generic_name: str
    category: str
    dosage_form: str
    strength: str
    manufacturer: Optional[str] = None
    description: Optional[str] = None
    indications: Optional[str] = None
    contraindications: Optional[str] = None
    side_effects: Optional[str] = None
    dosage_instructions: Optional[str] = None
    price_per_unit: Optional[float] = None
    is_prescription_required: bool = True

class MedicineCreate(MedicineBase):
    pass

class MedicineResponse(MedicineBase):
    id: int
    is_available: bool
    
    class Config:
        from_attributes = True

class SymptomBase(BaseModel):
    name: str
    category: str
    severity_level: int
    description: Optional[str] = None
    common_causes: Optional[str] = None

class SymptomResponse(SymptomBase):
    id: int
    
    class Config:
        from_attributes = True

class MedicineRecommendationRequest(BaseModel):
    symptoms: List[str]
    patient_age: Optional[int] = None
    patient_weight: Optional[float] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None
    severity_level: int = 1  # 1-5 scale

class MedicineRecommendation(BaseModel):
    medicine: MedicineResponse
    confidence_score: float
    dosage_recommendation: str
    duration_days: int
    warnings: List[str]
    reasoning: str

class MedicineRecommendationResponse(BaseModel):
    recommendations: List[MedicineRecommendation]
    overall_assessment: str
    emergency_flag: bool
    follow_up_required: bool
    ai_confidence: float
