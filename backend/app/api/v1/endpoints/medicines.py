from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.medicine import Medicine, Symptom
from app.schemas.medicine import (
    MedicineResponse, 
    SymptomResponse,
    MedicineRecommendationRequest,
    MedicineRecommendationResponse
)
from app.services.ai_medicine_service import AIMedicineService

router = APIRouter()

@router.get("/search", response_model=List[MedicineResponse])
async def search_medicines(
    q: str = Query(..., description="Search query for medicine name"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Medicine).filter(Medicine.is_available == True)
    
    # Search by name or generic name
    query = query.filter(
        (Medicine.name.ilike(f"%{q}%")) | 
        (Medicine.generic_name.ilike(f"%{q}%"))
    )
    
    # Filter by category if provided
    if category:
        query = query.filter(Medicine.category.ilike(f"%{category}%"))
    
    medicines = query.limit(limit).all()
    return [MedicineResponse.from_orm(medicine) for medicine in medicines]

@router.get("/categories")
async def get_medicine_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    categories = db.query(Medicine.category).distinct().all()
    return [category[0] for category in categories if category[0]]

@router.get("/{medicine_id}", response_model=MedicineResponse)
async def get_medicine_details(
    medicine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found"
        )
    
    return MedicineResponse.from_orm(medicine)

@router.get("/symptoms/all", response_model=List[SymptomResponse])
async def get_all_symptoms(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Symptom)
    
    if category:
        query = query.filter(Symptom.category.ilike(f"%{category}%"))
    
    symptoms = query.all()
    return [SymptomResponse.from_orm(symptom) for symptom in symptoms]

@router.post("/recommend", response_model=MedicineRecommendationResponse)
async def get_medicine_recommendations(
    request: MedicineRecommendationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ai_service = AIMedicineService(db)
    
    # Get AI analysis
    analysis = ai_service.analyze_symptoms(request)
    
    # Get medicine recommendations
    recommendations = ai_service.get_medicine_recommendations(request)
    
    if not recommendations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No medicine recommendations found for the given symptoms"
        )
    
    return MedicineRecommendationResponse(
        recommendations=recommendations,
        overall_assessment=analysis["assessment"],
        emergency_flag=analysis["emergency"],
        follow_up_required=analysis["severity"] >= 3,
        ai_confidence=analysis["confidence"]
    )

@router.post("/analyze-symptoms")
async def analyze_symptoms_only(
    request: MedicineRecommendationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ai_service = AIMedicineService(db)
    analysis = ai_service.analyze_symptoms(request)
    
    return {
        "analysis": analysis,
        "recommendations": {
            "seek_immediate_care": analysis["emergency"],
            "severity_level": analysis["severity"],
            "confidence": analysis["confidence"],
            "next_steps": [
                "Consult healthcare provider" if analysis["severity"] >= 3 else "Monitor symptoms",
                "Emergency care required" if analysis["emergency"] else "Regular consultation sufficient"
            ]
        }
    }
