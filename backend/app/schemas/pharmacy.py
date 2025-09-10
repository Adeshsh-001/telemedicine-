from pydantic import BaseModel, validator
from typing import List, Optional, Dict, Any
from datetime import datetime

class PharmacyBase(BaseModel):
    name: str
    owner_name: Optional[str] = None
    phone: str
    email: Optional[str] = None
    address: str
    village: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    operating_hours: Optional[str] = None
    delivery_available: bool = False
    delivery_radius_km: float = 5.0

class PharmacyCreate(PharmacyBase):
    pass

class PharmacyUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    operating_hours: Optional[str] = None
    delivery_available: Optional[bool] = None
    delivery_radius_km: Optional[float] = None

class PharmacyResponse(PharmacyBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class PharmacyWithDistance(PharmacyResponse):
    distance_km: Optional[float] = None
    estimated_delivery_time: Optional[str] = None

class InventoryBase(BaseModel):
    pharmacy_id: int
    medicine_id: int
    stock_quantity: int
    price: float
    expiry_date: Optional[datetime] = None

class InventoryCreate(InventoryBase):
    pass

class InventoryUpdate(BaseModel):
    stock_quantity: Optional[int] = None
    price: Optional[float] = None
    expiry_date: Optional[datetime] = None

class InventoryResponse(InventoryBase):
    id: int
    last_updated: datetime
    
    class Config:
        from_attributes = True

class MedicineAvailability(BaseModel):
    medicine_id: int
    medicine_name: str
    generic_name: str
    available_pharmacies: List[Dict[str, Any]]
    lowest_price: Optional[float] = None
    highest_price: Optional[float] = None
    average_price: Optional[float] = None
    total_stock: int

class PharmacyInventoryResponse(BaseModel):
    pharmacy: PharmacyResponse
    medicines: List[Dict[str, Any]]
    total_medicines: int
    low_stock_count: int
    out_of_stock_count: int

class LocationRequest(BaseModel):
    latitude: float
    longitude: float
    radius_km: float = 10.0

class PriceComparisonRequest(BaseModel):
    medicine_ids: List[int]
    user_latitude: Optional[float] = None
    user_longitude: Optional[float] = None
