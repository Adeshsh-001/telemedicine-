from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    smart_card_id = Column(String, unique=True, index=True)
    age = Column(Integer)
    gender = Column(String)
    blood_group = Column(String)
    height = Column(Float)  # in cm
    weight = Column(Float)  # in kg
    allergies = Column(Text)
    chronic_conditions = Column(Text)
    emergency_contact = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="patient_profile")
    health_records = relationship("HealthRecord", back_populates="patient")
    prescriptions = relationship("Prescription", back_populates="patient")
