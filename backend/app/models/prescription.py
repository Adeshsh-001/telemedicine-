from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Prescription(Base):
    __tablename__ = "prescriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Can be AI-generated
    symptoms = Column(Text)  # JSON string of symptoms
    diagnosis = Column(Text)
    medicines = Column(Text)  # JSON string of prescribed medicines
    dosage_instructions = Column(Text)
    duration_days = Column(Integer)
    notes = Column(Text)
    is_ai_generated = Column(Boolean, default=False)
    confidence_score = Column(Float)  # AI confidence in prescription
    status = Column(String, default="active")  # active, completed, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="prescriptions")
    doctor = relationship("User")

class HealthRecord(Base):
    __tablename__ = "health_records"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    recorded_by = Column(Integer, ForeignKey("users.id"), nullable=False)  # ASHA/Doctor
    symptoms = Column(Text)  # JSON string
    vital_signs = Column(Text)  # JSON string (BP, temp, pulse, etc.)
    voice_analysis = Column(Text)  # JSON string from voice AI
    ai_assessment = Column(Text)  # AI analysis results
    severity_level = Column(Integer)  # 1-5 scale
    follow_up_required = Column(Boolean, default=False)
    follow_up_date = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="health_records")
    recorded_by_user = relationship("User")
