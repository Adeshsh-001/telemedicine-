from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Pharmacy(Base):
    __tablename__ = "pharmacies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    owner_name = Column(String)
    phone = Column(String, nullable=False)
    email = Column(String)
    address = Column(String, nullable=False)
    village = Column(String, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    is_active = Column(Boolean, default=True)
    operating_hours = Column(String)  # JSON string
    delivery_available = Column(Boolean, default=False)
    delivery_radius_km = Column(Float, default=5.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PharmacyInventory(Base):
    __tablename__ = "pharmacy_inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    pharmacy_id = Column(Integer, ForeignKey("pharmacies.id"), nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    stock_quantity = Column(Integer, default=0)
    price = Column(Float, nullable=False)
    expiry_date = Column(DateTime)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    pharmacy = relationship("Pharmacy")
    medicine = relationship("Medicine")
