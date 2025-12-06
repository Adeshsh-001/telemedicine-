"""
Database initialization script for setting up PostgreSQL tables
and seeding initial data for the rural healthcare application.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
sys.path.insert(0, '..')

from app.core.config import settings
from app.core.database import Base
from app.models.user import User, UserRole
from app.models.medicine import Medicine, Symptom, SymptomMedicineMapping
from app.models.pharmacy import Pharmacy
import hashlib

def init_database():
    """Create all database tables"""
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully")
    return engine

def seed_initial_data(engine):
    """Seed initial data for the application"""
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    
    try:
        # Check if data already exists
        if session.query(User).count() > 0:
            print("✓ Database already seeded, skipping initial data")
            return
        
        # Create admin user
        admin_user = User(
            email="admin@healthcarevilla.com",
            phone="+919876543210",
            hashed_password=hashlib.sha256("admin123".encode()).hexdigest(),
            full_name="Admin User",
            role=UserRole.ADMIN,
            village="Central",
            preferred_language="en",
            is_active=True,
            is_verified=True
        )
        session.add(admin_user)
        
        # Create sample medicines
        medicines_data = [
            {
                "name": "Amoxicillin",
                "generic_name": "Amoxicillin",
                "category": "antibiotic",
                "dosage_form": "tablet",
                "strength": "500mg",
                "manufacturer": "Generic",
                "indications": "Bacterial infections",
                "price_per_unit": 2.5,
            },
            {
                "name": "Paracetamol",
                "generic_name": "Acetaminophen",
                "category": "painkiller",
                "dosage_form": "tablet",
                "strength": "500mg",
                "manufacturer": "Generic",
                "indications": "Pain and fever",
                "price_per_unit": 1.0,
            },
            {
                "name": "Ibuprofen",
                "generic_name": "Ibuprofen",
                "category": "anti-inflammatory",
                "dosage_form": "tablet",
                "strength": "400mg",
                "manufacturer": "Generic",
                "indications": "Pain, inflammation, fever",
                "price_per_unit": 1.5,
            },
        ]
        
        for med_data in medicines_data:
            medicine = Medicine(**med_data)
            session.add(medicine)
        
        # Create sample symptoms
        symptoms_data = [
            {"name": "Fever", "category": "systemic", "severity_level": 3},
            {"name": "Cough", "category": "respiratory", "severity_level": 2},
            {"name": "Headache", "category": "neurological", "severity_level": 2},
            {"name": "Body Pain", "category": "musculoskeletal", "severity_level": 2},
            {"name": "Fatigue", "category": "systemic", "severity_level": 1},
        ]
        
        for sym_data in symptoms_data:
            symptom = Symptom(**sym_data)
            session.add(symptom)
        
        session.commit()
        print("✓ Initial data seeded successfully")
        
    except Exception as e:
        session.rollback()
        print(f"✗ Error seeding data: {e}")
        raise
    finally:
        session.close()

def main():
    """Main initialization function"""
    print("Starting Rural Healthcare Database Initialization...")
    print(f"Database URL: {settings.DATABASE_URL}")
    
    try:
        engine = init_database()
        seed_initial_data(engine)
        print("\n✓ Database initialization completed successfully!")
    except Exception as e:
        print(f"\n✗ Database initialization failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
