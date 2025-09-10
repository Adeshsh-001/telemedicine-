from sqlalchemy import Column, Integer, String, Float, Text, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class Medicine(Base):
    __tablename__ = "medicines"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    generic_name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # antibiotic, painkiller, etc.
    dosage_form = Column(String)  # tablet, syrup, injection
    strength = Column(String)  # 500mg, 10ml, etc.
    manufacturer = Column(String)
    description = Column(Text)
    indications = Column(Text)  # what it treats
    contraindications = Column(Text)  # when not to use
    side_effects = Column(Text)
    dosage_instructions = Column(Text)
    price_per_unit = Column(Float)
    is_prescription_required = Column(Boolean, default=True)
    is_available = Column(Boolean, default=True)

class Symptom(Base):
    __tablename__ = "symptoms"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    category = Column(String, nullable=False)  # respiratory, digestive, etc.
    severity_level = Column(Integer)  # 1-5 scale
    description = Column(Text)
    common_causes = Column(Text)
    
class SymptomMedicineMapping(Base):
    __tablename__ = "symptom_medicine_mappings"
    
    id = Column(Integer, primary_key=True, index=True)
    symptom_id = Column(Integer, ForeignKey("symptoms.id"))
    medicine_id = Column(Integer, ForeignKey("medicines.id"))
    effectiveness_score = Column(Float)  # 0-1 scale
    confidence_level = Column(Float)  # AI confidence in recommendation
