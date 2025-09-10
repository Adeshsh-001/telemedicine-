# Rural Healthcare API Backend

A comprehensive Python backend for the rural healthcare system with AI-powered medicine recommendations, pharmacy integration, and real-time notifications.

## Features

- **User Authentication & Management**: JWT-based auth with role-based access control
- **AI Medicine Recommendations**: Intelligent symptom analysis and medicine suggestions
- **Pharmacy Integration**: Real-time medicine availability and price comparison
- **Prescription Management**: Digital prescriptions with AI assistance
- **SMS Notifications**: Automated health alerts and reminders via Twilio
- **Real-time Updates**: Background task processing with Celery and Redis

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Background Tasks**: Celery with Redis broker
- **SMS Service**: Twilio integration
- **AI/ML**: Custom recommendation algorithms with scikit-learn

## Installation

1. **Install Dependencies**:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

2. **Environment Setup**:
   Create a `.env` file with:
   \`\`\`
   DATABASE_URL=postgresql://user:password@localhost/healthcare_db
   SECRET_KEY=your-secret-key-here
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   TWILIO_PHONE_NUMBER=your-twilio-number
   REDIS_URL=redis://localhost:6379
   \`\`\`

3. **Database Setup**:
   \`\`\`bash
   # Create database tables
   python -c "from app.main import *"
   \`\`\`

4. **Start Services**:
   \`\`\`bash
   # Start Redis
   redis-server
   
   # Start Celery worker
   celery -A app.tasks.notification_tasks worker --loglevel=info
   
   # Start Celery beat (scheduler)
   celery -A app.tasks.notification_tasks beat --loglevel=info
   
   # Start FastAPI server
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   \`\`\`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user

### Medicine & Prescriptions
- `GET /api/v1/medicines/search` - Search medicines
- `POST /api/v1/medicines/recommend` - Get AI recommendations
- `POST /api/v1/prescriptions/create` - Create prescription
- `GET /api/v1/prescriptions/patient/{id}` - Get patient prescriptions

### Pharmacy Integration
- `POST /api/v1/pharmacies/nearby` - Find nearby pharmacies
- `GET /api/v1/pharmacies/medicine/{id}/availability` - Check medicine availability
- `POST /api/v1/pharmacies/price-comparison` - Compare prices

### Notifications & SMS
- `POST /api/v1/notifications/create` - Create notification
- `POST /api/v1/notifications/emergency-alert` - Send emergency alert
- `POST /api/v1/notifications/health-alert/{user_id}` - Create health alert
- `GET /api/v1/notifications/stats` - Get notification statistics

## Database Models

- **Users**: Authentication and profile management
- **Patients**: Medical profiles and health records
- **Medicines**: Drug database with AI mappings
- **Pharmacies**: Location-based pharmacy network
- **Prescriptions**: Digital prescription management
- **Notifications**: SMS and alert system

## AI Features

- **Symptom Analysis**: Maps symptoms to possible conditions
- **Medicine Recommendations**: AI-powered drug suggestions
- **Risk Assessment**: Automatic severity scoring
- **Personalized Dosing**: Age and weight-based recommendations

## Deployment

The backend is designed for scalable deployment with:
- Docker containerization support
- Horizontal scaling with load balancers
- Database connection pooling
- Background task distribution
- Health monitoring endpoints

## Security

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation with Pydantic
- SQL injection prevention
- Rate limiting support
