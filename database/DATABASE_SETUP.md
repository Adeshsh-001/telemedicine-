# Rural Healthcare Database Setup Guide

## Overview
This system uses a **hybrid database architecture**:
- **Backend**: PostgreSQL with SQLAlchemy ORM
- **Frontend**: MongoDB Realm with offline sync capabilities

---

## PostgreSQL Backend Setup

### Prerequisites
- PostgreSQL 13+ installed
- Python 3.8+
- pip packages installed from `requirements.txt`

### Quick Start

#### Option 1: Docker (Recommended)
\`\`\`bash
cd backend/database
docker-compose up -d
\`\`\`

This creates:
- PostgreSQL container on port 5432
- pgAdmin web interface on port 5050

Access pgAdmin:
- URL: http://localhost:5050
- Email: admin@healthcare.com
- Password: admin123

#### Option 2: Manual Installation

1. Create database:
\`\`\`sql
CREATE DATABASE healthcare_db;
CREATE USER healthcare_user WITH PASSWORD 'secure_password_123';
GRANT ALL PRIVILEGES ON DATABASE healthcare_db TO healthcare_user;
\`\`\`

2. Update connection string in `backend/app/core/config.py`:
\`\`\`python
DATABASE_URL = "postgresql://healthcare_user:secure_password_123@localhost:5432/healthcare_db"
\`\`\`

### Initialize Database

\`\`\`bash
cd backend
python database/init_db.py
\`\`\`

This will:
- Create all database tables
- Seed initial medicines and symptoms
- Create admin user (email: admin@healthcarevilla.com)

---

## MongoDB Realm Setup

### Prerequisites
- MongoDB Atlas account
- Realm CLI installed: `npm install -g realm-cli`

### Configuration

1. Create `.env` file in project root:
\`\`\`
MONGO_REALM_APP_ID=your_app_id
MONGO_REALM_API_KEY=your_api_key
\`\`\`

2. Deploy Realm schema:
\`\`\`bash
realm-cli login
realm-cli push --remote-state mongodb-realm-schema.json
\`\`\`

### Key Features
- **Partition-based sync**: Data synced by `village_id`
- **Offline support**: Works without internet connection
- **Real-time sync**: Automatic bidirectional sync when online
- **Conflict resolution**: Custom logic for medical data integrity

---

## Database Tables

### Backend (PostgreSQL)

#### Users Table
- Roles: PATIENT, ASHA, DOCTOR, ADMIN
- Village-based filtering
- Language preferences
- Authentication tokens

#### Medicines Table
- Drug database with interactions
- AI recommendation scoring
- Price and availability
- Dosage guidelines

#### Pharmacies & Inventory
- Location tracking with coordinates
- Real-time stock management
- Delivery capabilities
- Operating hours

#### Health Records
- Voice analysis results
- Vital signs tracking
- AI assessments
- Prescription history

#### Notifications
- SMS/alert tracking
- Retry mechanism
- Multi-language support
- Delivery status logging

### Frontend (MongoDB Realm)

Collections automatically sync from backend:
- users
- patients
- medicines
- prescriptions
- pharmacies
- notifications

---

## Backup & Restore

### PostgreSQL Backup
\`\`\`bash
pg_dump -U healthcare_user -d healthcare_db > backup_$(date +%Y%m%d_%H%M%S).sql
\`\`\`

### PostgreSQL Restore
\`\`\`bash
psql -U healthcare_user -d healthcare_db < backup_file.sql
\`\`\`

### MongoDB Realm Backup
\`\`\`bash
realm-cli pull --remote-state
\`\`\`

---

## Performance Optimization

### Database Indexes
Created on:
- users.email, users.phone
- medicines.name, medicines.category
- pharmacies.village
- prescriptions.patient_id
- notifications.user_id

### Caching Strategy
- Redis for session caching
- Realm local storage for offline access
- 24-hour retention for analytics data

---

## Troubleshooting

### Connection Issues
\`\`\`bash
# Test PostgreSQL connection
psql -U healthcare_user -d healthcare_db -h localhost
\`\`\`

### Realm Sync Problems
- Check internet connection
- Verify village_id partition key
- Review Realm function logs in dashboard

### Data Inconsistency
- Run migration: `alembic upgrade head`
- Rebuild sync: `realm-cli push --force`
- Restore from backup if needed

---

## Development vs Production

### Development
- DATABASE_URL: `postgresql://localhost/healthcare_db`
- Debug mode: Enabled
- Seed data: Included
- Realm: Sandbox mode

### Production
- DATABASE_URL: Production PostgreSQL cluster
- Debug mode: Disabled
- Seed data: Not seeded
- Realm: Production with RLS enabled
