from celery import Celery
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.services.sms_service import SMSService
from app.models.notification import Notification, NotificationStatus
from datetime import datetime, timedelta

# Initialize Celery
celery_app = Celery(
    "healthcare_notifications",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

@celery_app.task(bind=True, max_retries=3)
def send_sms_task(self, notification_id: int):
    """Background task to send SMS"""
    db = SessionLocal()
    try:
        sms_service = SMSService(db)
        success = sms_service.send_sms(notification_id)
        
        if not success:
            # Retry if failed and retries available
            notification = db.query(Notification).filter(Notification.id == notification_id).first()
            if notification and notification.retry_count < notification.max_retries:
                # Retry with exponential backoff
                countdown = 2 ** notification.retry_count * 60  # 1min, 2min, 4min
                raise self.retry(countdown=countdown)
        
        return success
        
    except Exception as exc:
        # Log error and retry
        print(f"SMS task failed: {exc}")
        raise self.retry(exc=exc, countdown=60)
    
    finally:
        db.close()

@celery_app.task
def process_scheduled_notifications():
    """Process notifications scheduled for sending"""
    db = SessionLocal()
    try:
        # Get notifications scheduled for now or earlier
        now = datetime.now()
        scheduled_notifications = db.query(Notification).filter(
            Notification.status == NotificationStatus.PENDING,
            Notification.scheduled_at <= now
        ).all()
        
        for notification in scheduled_notifications:
            # Queue for immediate sending
            send_sms_task.delay(notification.id)
        
        return len(scheduled_notifications)
        
    finally:
        db.close()

@celery_app.task
def send_daily_health_reminders():
    """Send daily health reminders to users"""
    db = SessionLocal()
    try:
        sms_service = SMSService(db)
        
        # Logic to send daily reminders
        # This could include medication reminders, health tips, etc.
        
        return "Daily reminders sent"
        
    finally:
        db.close()

@celery_app.task
def cleanup_old_notifications():
    """Clean up old notification logs"""
    db = SessionLocal()
    try:
        # Delete notifications older than 90 days
        cutoff_date = datetime.now() - timedelta(days=90)
        
        deleted_count = db.query(Notification).filter(
            Notification.created_at < cutoff_date
        ).delete()
        
        db.commit()
        return f"Cleaned up {deleted_count} old notifications"
        
    finally:
        db.close()

# Schedule periodic tasks
celery_app.conf.beat_schedule = {
    'process-scheduled-notifications': {
        'task': 'app.tasks.notification_tasks.process_scheduled_notifications',
        'schedule': 60.0,  # Every minute
    },
    'daily-health-reminders': {
        'task': 'app.tasks.notification_tasks.send_daily_health_reminders',
        'schedule': 86400.0,  # Daily
    },
    'cleanup-old-notifications': {
        'task': 'app.tasks.notification_tasks.cleanup_old_notifications',
        'schedule': 604800.0,  # Weekly
    },
}

celery_app.conf.timezone = 'UTC'
