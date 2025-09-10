from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
from datetime import datetime
from app.core.database import get_db
from app.core.auth import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.prescription import Prescription, HealthRecord
from app.models.patient import Patient
from app.schemas.prescription import (
    PrescriptionCreate,
    PrescriptionResponse,
    HealthRecordCreate,
    HealthRecordResponse
)
from app.services.ai_medicine_service import AIMedicineService

router = APIRouter()

@router.post("/create", response_model=PrescriptionResponse)
async def create_prescription(
    prescription_data: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == prescription_data.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Create prescription
    prescription = Prescription(
        patient_id=prescription_data.patient_id,
        doctor_id=current_user.id if current_user.role in [UserRole.DOCTOR, UserRole.ASHA] else None,
        symptoms=json.dumps(prescription_data.symptoms),
        diagnosis=prescription_data.diagnosis,
        medicines=json.dumps([med.dict() for med in prescription_data.medicines]),
        duration_days=prescription_data.duration_days,
        notes=prescription_data.notes,
        is_ai_generated=current_user.role not in [UserRole.DOCTOR]
    )
    
    db.add(prescription)
    db.commit()
    db.refresh(prescription)
    
    return PrescriptionResponse.from_orm(prescription)

@router.get("/patient/{patient_id}", response_model=List[PrescriptionResponse])
async def get_patient_prescriptions(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user can access this patient's data
    if current_user.role == UserRole.PATIENT:
        patient = db.query(Patient).filter(
            Patient.id == patient_id,
            Patient.user_id == current_user.id
        ).first()
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    prescriptions = db.query(Prescription).filter(
        Prescription.patient_id == patient_id
    ).order_by(Prescription.created_at.desc()).all()
    
    return [PrescriptionResponse.from_orm(p) for p in prescriptions]

@router.get("/{prescription_id}", response_model=PrescriptionResponse)
async def get_prescription_details(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found"
        )
    
    return PrescriptionResponse.from_orm(prescription)

@router.post("/health-record", response_model=HealthRecordResponse)
async def create_health_record(
    record_data: HealthRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Create health record
    health_record = HealthRecord(
        patient_id=record_data.patient_id,
        recorded_by=current_user.id,
        symptoms=json.dumps(record_data.symptoms),
        vital_signs=json.dumps(record_data.vital_signs) if record_data.vital_signs else None,
        voice_analysis=json.dumps(record_data.voice_analysis) if record_data.voice_analysis else None,
        notes=record_data.notes
    )
    
    # Add AI assessment if symptoms provided
    if record_data.symptoms:
        ai_service = AIMedicineService(db)
        from app.schemas.medicine import MedicineRecommendationRequest
        
        ai_request = MedicineRecommendationRequest(symptoms=record_data.symptoms)
        analysis = ai_service.analyze_symptoms(ai_request)
        
        health_record.ai_assessment = json.dumps(analysis)
        health_record.severity_level = analysis["severity"]
        health_record.follow_up_required = analysis["severity"] >= 3 or analysis["emergency"]
    
    db.add(health_record)
    db.commit()
    db.refresh(health_record)
    
    return HealthRecordResponse.from_orm(health_record)

@router.get("/health-records/patient/{patient_id}", response_model=List[HealthRecordResponse])
async def get_patient_health_records(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    records = db.query(HealthRecord).filter(
        HealthRecord.patient_id == patient_id
    ).order_by(HealthRecord.created_at.desc()).all()
    
    return [HealthRecordResponse.from_orm(record) for record in records]
