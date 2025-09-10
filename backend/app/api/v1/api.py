from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, medicines, prescriptions, pharmacies, notifications

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(medicines.router, prefix="/medicines", tags=["medicines"])
api_router.include_router(prescriptions.router, prefix="/prescriptions", tags=["prescriptions"])
api_router.include_router(pharmacies.router, prefix="/pharmacies", tags=["pharmacies"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
