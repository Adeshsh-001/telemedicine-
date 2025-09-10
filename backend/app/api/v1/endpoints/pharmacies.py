from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.auth import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.pharmacy import Pharmacy, PharmacyInventory
from app.models.medicine import Medicine
from app.schemas.pharmacy import (
    PharmacyCreate,
    PharmacyUpdate,
    PharmacyResponse,
    PharmacyWithDistance,
    InventoryCreate,
    InventoryUpdate,
    InventoryResponse,
    LocationRequest,
    PriceComparisonRequest,
    MedicineAvailability
)
from app.services.pharmacy_service import PharmacyService

router = APIRouter()

@router.get("/search", response_model=List[PharmacyResponse])
async def search_pharmacies(
    q: Optional[str] = Query(None, description="Search query"),
    village: Optional[str] = Query(None, description="Filter by village"),
    delivery_available: Optional[bool] = Query(None, description="Filter by delivery availability"),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Pharmacy).filter(Pharmacy.is_active == True)
    
    if q:
        query = query.filter(
            (Pharmacy.name.ilike(f"%{q}%")) |
            (Pharmacy.address.ilike(f"%{q}%"))
        )
    
    if village:
        query = query.filter(Pharmacy.village.ilike(f"%{village}%"))
    
    if delivery_available is not None:
        query = query.filter(Pharmacy.delivery_available == delivery_available)
    
    pharmacies = query.limit(limit).all()
    return [PharmacyResponse.from_orm(pharmacy) for pharmacy in pharmacies]

@router.post("/nearby", response_model=List[PharmacyWithDistance])
async def find_nearby_pharmacies(
    location: LocationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pharmacy_service = PharmacyService(db)
    nearby_pharmacies = pharmacy_service.find_nearby_pharmacies(location)
    return nearby_pharmacies

@router.get("/{pharmacy_id}", response_model=PharmacyResponse)
async def get_pharmacy_details(
    pharmacy_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pharmacy = db.query(Pharmacy).filter(Pharmacy.id == pharmacy_id).first()
    if not pharmacy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pharmacy not found"
        )
    
    return PharmacyResponse.from_orm(pharmacy)

@router.post("/create", response_model=PharmacyResponse)
async def create_pharmacy(
    pharmacy_data: PharmacyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    pharmacy = Pharmacy(**pharmacy_data.dict())
    db.add(pharmacy)
    db.commit()
    db.refresh(pharmacy)
    
    return PharmacyResponse.from_orm(pharmacy)

@router.get("/{pharmacy_id}/inventory", response_model=List[InventoryResponse])
async def get_pharmacy_inventory(
    pharmacy_id: int,
    in_stock_only: bool = Query(True, description="Show only medicines in stock"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(PharmacyInventory).filter(PharmacyInventory.pharmacy_id == pharmacy_id)
    
    if in_stock_only:
        query = query.filter(PharmacyInventory.stock_quantity > 0)
    
    inventory = query.all()
    return [InventoryResponse.from_orm(item) for item in inventory]

@router.post("/{pharmacy_id}/inventory", response_model=InventoryResponse)
async def add_medicine_to_inventory(
    pharmacy_id: int,
    inventory_data: InventoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    # Verify pharmacy exists
    pharmacy = db.query(Pharmacy).filter(Pharmacy.id == pharmacy_id).first()
    if not pharmacy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pharmacy not found"
        )
    
    # Verify medicine exists
    medicine = db.query(Medicine).filter(Medicine.id == inventory_data.medicine_id).first()
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found"
        )
    
    # Check if inventory record already exists
    existing_inventory = db.query(PharmacyInventory).filter(
        PharmacyInventory.pharmacy_id == pharmacy_id,
        PharmacyInventory.medicine_id == inventory_data.medicine_id
    ).first()
    
    if existing_inventory:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Medicine already exists in pharmacy inventory"
        )
    
    inventory = PharmacyInventory(**inventory_data.dict())
    db.add(inventory)
    db.commit()
    db.refresh(inventory)
    
    return InventoryResponse.from_orm(inventory)

@router.put("/{pharmacy_id}/inventory/{medicine_id}", response_model=InventoryResponse)
async def update_inventory(
    pharmacy_id: int,
    medicine_id: int,
    inventory_update: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    inventory = db.query(PharmacyInventory).filter(
        PharmacyInventory.pharmacy_id == pharmacy_id,
        PharmacyInventory.medicine_id == medicine_id
    ).first()
    
    if not inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory record not found"
        )
    
    update_data = inventory_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(inventory, field, value)
    
    db.commit()
    db.refresh(inventory)
    
    return InventoryResponse.from_orm(inventory)

@router.get("/medicine/{medicine_id}/availability")
async def check_medicine_availability(
    medicine_id: int,
    user_lat: Optional[float] = Query(None, description="User latitude"),
    user_lon: Optional[float] = Query(None, description="User longitude"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pharmacy_service = PharmacyService(db)
    
    user_location = None
    if user_lat and user_lon:
        user_location = (user_lat, user_lon)
    
    availability = pharmacy_service.check_medicine_availability(medicine_id, user_location)
    return availability

@router.post("/price-comparison")
async def compare_medicine_prices(
    request: PriceComparisonRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pharmacy_service = PharmacyService(db)
    
    user_location = None
    if request.user_latitude and request.user_longitude:
        user_location = (request.user_latitude, request.user_longitude)
    
    comparisons = pharmacy_service.get_price_comparison(request.medicine_ids, user_location)
    return {
        "comparisons": comparisons,
        "total_medicines": len(request.medicine_ids),
        "user_location_provided": user_location is not None
    }

@router.get("/{pharmacy_id}/low-stock-alerts")
async def get_low_stock_alerts(
    pharmacy_id: int,
    threshold: int = Query(10, description="Stock threshold for alerts"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    pharmacy_service = PharmacyService(db)
    alerts = pharmacy_service.get_low_stock_alerts(pharmacy_id, threshold)
    
    return {
        "pharmacy_id": pharmacy_id,
        "threshold": threshold,
        "low_stock_items": alerts,
        "total_alerts": len(alerts)
    }

@router.get("/villages/all")
async def get_all_villages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    villages = db.query(Pharmacy.village).distinct().all()
    return [village[0] for village in villages if village[0]]
