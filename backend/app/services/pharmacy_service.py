import math
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.pharmacy import Pharmacy, PharmacyInventory
from app.models.medicine import Medicine
from app.schemas.pharmacy import LocationRequest, PharmacyWithDistance

class PharmacyService:
    def __init__(self, db: Session):
        self.db = db
    
    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points using Haversine formula"""
        if not all([lat1, lon1, lat2, lon2]):
            return float('inf')
        
        # Convert latitude and longitude from degrees to radians
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Radius of earth in kilometers
        r = 6371
        return c * r
    
    def find_nearby_pharmacies(self, location: LocationRequest) -> List[PharmacyWithDistance]:
        """Find pharmacies within specified radius"""
        pharmacies = self.db.query(Pharmacy).filter(Pharmacy.is_active == True).all()
        
        nearby_pharmacies = []
        for pharmacy in pharmacies:
            if pharmacy.latitude and pharmacy.longitude:
                distance = self.calculate_distance(
                    location.latitude, location.longitude,
                    pharmacy.latitude, pharmacy.longitude
                )
                
                if distance <= location.radius_km:
                    pharmacy_with_distance = PharmacyWithDistance(
                        **pharmacy.__dict__,
                        distance_km=round(distance, 2),
                        estimated_delivery_time=self._estimate_delivery_time(distance, pharmacy.delivery_available)
                    )
                    nearby_pharmacies.append(pharmacy_with_distance)
        
        # Sort by distance
        nearby_pharmacies.sort(key=lambda x: x.distance_km or float('inf'))
        return nearby_pharmacies
    
    def _estimate_delivery_time(self, distance_km: float, delivery_available: bool) -> str:
        """Estimate delivery time based on distance"""
        if not delivery_available:
            return "Pickup only"
        
        if distance_km <= 2:
            return "30-45 minutes"
        elif distance_km <= 5:
            return "45-60 minutes"
        elif distance_km <= 10:
            return "1-2 hours"
        else:
            return "2+ hours"
    
    def check_medicine_availability(self, medicine_id: int, user_location: Optional[Tuple[float, float]] = None) -> Dict[str, Any]:
        """Check medicine availability across pharmacies"""
        
        # Get all inventory records for this medicine
        inventory_records = self.db.query(PharmacyInventory).join(Pharmacy).filter(
            and_(
                PharmacyInventory.medicine_id == medicine_id,
                PharmacyInventory.stock_quantity > 0,
                Pharmacy.is_active == True
            )
        ).all()
        
        if not inventory_records:
            return {
                "medicine_id": medicine_id,
                "available": False,
                "pharmacies": [],
                "message": "Medicine not available at any pharmacy"
            }
        
        # Get medicine details
        medicine = self.db.query(Medicine).filter(Medicine.id == medicine_id).first()
        
        available_pharmacies = []
        prices = []
        
        for record in inventory_records:
            pharmacy_data = {
                "pharmacy_id": record.pharmacy.id,
                "pharmacy_name": record.pharmacy.name,
                "address": record.pharmacy.address,
                "phone": record.pharmacy.phone,
                "stock_quantity": record.stock_quantity,
                "price": record.price,
                "last_updated": record.last_updated.isoformat()
            }
            
            # Add distance if user location provided
            if user_location and record.pharmacy.latitude and record.pharmacy.longitude:
                distance = self.calculate_distance(
                    user_location[0], user_location[1],
                    record.pharmacy.latitude, record.pharmacy.longitude
                )
                pharmacy_data["distance_km"] = round(distance, 2)
                pharmacy_data["estimated_delivery_time"] = self._estimate_delivery_time(
                    distance, record.pharmacy.delivery_available
                )
            
            available_pharmacies.append(pharmacy_data)
            prices.append(record.price)
        
        # Sort by distance if available, otherwise by price
        if user_location:
            available_pharmacies.sort(key=lambda x: x.get("distance_km", float('inf')))
        else:
            available_pharmacies.sort(key=lambda x: x["price"])
        
        return {
            "medicine_id": medicine_id,
            "medicine_name": medicine.name if medicine else "Unknown",
            "available": True,
            "total_pharmacies": len(available_pharmacies),
            "pharmacies": available_pharmacies,
            "price_range": {
                "lowest": min(prices),
                "highest": max(prices),
                "average": round(sum(prices) / len(prices), 2)
            },
            "total_stock": sum(record.stock_quantity for record in inventory_records)
        }
    
    def get_price_comparison(self, medicine_ids: List[int], user_location: Optional[Tuple[float, float]] = None) -> List[Dict[str, Any]]:
        """Compare prices across pharmacies for multiple medicines"""
        
        comparisons = []
        for medicine_id in medicine_ids:
            availability = self.check_medicine_availability(medicine_id, user_location)
            comparisons.append(availability)
        
        return comparisons
    
    def update_inventory_stock(self, pharmacy_id: int, medicine_id: int, new_stock: int) -> bool:
        """Update medicine stock at pharmacy"""
        
        inventory = self.db.query(PharmacyInventory).filter(
            and_(
                PharmacyInventory.pharmacy_id == pharmacy_id,
                PharmacyInventory.medicine_id == medicine_id
            )
        ).first()
        
        if inventory:
            inventory.stock_quantity = new_stock
            self.db.commit()
            return True
        
        return False
    
    def get_low_stock_alerts(self, pharmacy_id: int, threshold: int = 10) -> List[Dict[str, Any]]:
        """Get medicines with low stock at a pharmacy"""
        
        low_stock_items = self.db.query(PharmacyInventory).join(Medicine).filter(
            and_(
                PharmacyInventory.pharmacy_id == pharmacy_id,
                PharmacyInventory.stock_quantity <= threshold,
                PharmacyInventory.stock_quantity > 0
            )
        ).all()
        
        alerts = []
        for item in low_stock_items:
            alerts.append({
                "medicine_id": item.medicine_id,
                "medicine_name": item.medicine.name,
                "current_stock": item.stock_quantity,
                "threshold": threshold,
                "last_updated": item.last_updated.isoformat()
            })
        
        return alerts
