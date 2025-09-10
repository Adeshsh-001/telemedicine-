import json
from typing import Optional, Dict, Any, List
from twilio.rest import Client
from twilio.base.exceptions import TwilioException
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.notification import Notification, SMSTemplate, NotificationLog, NotificationStatus, NotificationType
from app.models.user import User

class SMSService:
    def __init__(self, db: Session):
        self.db = db
        self.client = None
        
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    
    def send_sms(self, notification_id: int) -> bool:
        """Send SMS notification"""
        notification = self.db.query(Notification).filter(Notification.id == notification_id).first()
        
        if not notification:
            return False
        
        try:
            if self.client and settings.TWILIO_PHONE_NUMBER:
                # Send actual SMS via Twilio
                message = self.client.messages.create(
                    body=notification.message,
                    from_=settings.TWILIO_PHONE_NUMBER,
                    to=notification.phone_number
                )
                
                # Update notification status
                notification.status = NotificationStatus.SENT
                notification.sent_at = func.now()
                
                # Log the action
                self._log_notification_action(notification_id, "sent", f"Twilio SID: {message.sid}")
                
            else:
                # Simulate SMS sending for development
                print(f"[SMS SIMULATION] To: {notification.phone_number}, Message: {notification.message}")
                notification.status = NotificationStatus.SENT
                notification.sent_at = func.now()
                
                self._log_notification_action(notification_id, "sent", "Simulated SMS")
            
            self.db.commit()
            return True
            
        except TwilioException as e:
            # Handle Twilio errors
            notification.status = NotificationStatus.FAILED
            notification.error_message = str(e)
            notification.retry_count += 1
            
            self._log_notification_action(notification_id, "failed", str(e))
            self.db.commit()
            return False
        
        except Exception as e:
            # Handle other errors
            notification.status = NotificationStatus.FAILED
            notification.error_message = str(e)
            notification.retry_count += 1
            
            self._log_notification_action(notification_id, "failed", str(e))
            self.db.commit()
            return False
    
    def _log_notification_action(self, notification_id: int, action: str, details: str):
        """Log notification action"""
        log_entry = NotificationLog(
            notification_id=notification_id,
            action=action,
            details=details
        )
        self.db.add(log_entry)
    
    def create_health_alert(self, user_id: int, symptoms: List[str], severity: int, ai_assessment: str) -> int:
        """Create health alert notification"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        # Determine priority based on severity
        priority = min(4, max(1, severity))
        
        # Create message based on severity
        if severity >= 4:
            title = "🚨 URGENT HEALTH ALERT"
            message = f"Emergency: {ai_assessment}. Seek immediate medical attention. Symptoms: {', '.join(symptoms[:3])}"
        elif severity >= 3:
            title = "⚠️ Health Alert"
            message = f"Important: {ai_assessment}. Please consult a doctor soon. Symptoms: {', '.join(symptoms[:3])}"
        else:
            title = "💊 Health Reminder"
            message = f"Health update: {ai_assessment}. Monitor symptoms: {', '.join(symptoms[:3])}"
        
        notification = Notification(
            user_id=user_id,
            type=NotificationType.HEALTH_ALERT,
            title=title,
            message=message,
            phone_number=user.phone,
            priority=priority,
            metadata=json.dumps({
                "symptoms": symptoms,
                "severity": severity,
                "ai_assessment": ai_assessment
            })
        )
        
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        
        return notification.id
    
    def create_emergency_alert(self, title: str, message: str, target_users: List[int]) -> List[int]:
        """Create emergency alerts for multiple users"""
        notification_ids = []
        
        for user_id in target_users:
            user = self.db.query(User).filter(User.id == user_id).first()
            if user:
                notification = Notification(
                    user_id=user_id,
                    type=NotificationType.EMERGENCY,
                    title=f"🚨 EMERGENCY: {title}",
                    message=message,
                    phone_number=user.phone,
                    priority=4  # Highest priority
                )
                
                self.db.add(notification)
                self.db.commit()
                self.db.refresh(notification)
                notification_ids.append(notification.id)
        
        return notification_ids
    
    def create_medicine_reminder(self, user_id: int, medicine_name: str, dosage: str, next_dose_time: str) -> int:
        """Create medicine reminder notification"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        message = f"💊 Medicine Reminder: Take {medicine_name} ({dosage}) at {next_dose_time}. Stay healthy!"
        
        notification = Notification(
            user_id=user_id,
            type=NotificationType.PRESCRIPTION_REMINDER,
            title="💊 Medicine Reminder",
            message=message,
            phone_number=user.phone,
            priority=2,
            metadata=json.dumps({
                "medicine_name": medicine_name,
                "dosage": dosage,
                "next_dose_time": next_dose_time
            })
        )
        
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        
        return notification.id
    
    def create_vaccination_reminder(self, user_id: int, vaccine_name: str, due_date: str) -> int:
        """Create vaccination reminder"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        message = f"💉 Vaccination Reminder: {vaccine_name} vaccination is due on {due_date}. Please visit your nearest health center."
        
        notification = Notification(
            user_id=user_id,
            type=NotificationType.VACCINATION_REMINDER,
            title="💉 Vaccination Due",
            message=message,
            phone_number=user.phone,
            priority=2,
            metadata=json.dumps({
                "vaccine_name": vaccine_name,
                "due_date": due_date
            })
        )
        
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        
        return notification.id
    
    def get_notification_stats(self, days: int = 30) -> Dict[str, Any]:
        """Get notification statistics"""
        from datetime import datetime, timedelta
        
        start_date = datetime.now() - timedelta(days=days)
        
        notifications = self.db.query(Notification).filter(
            Notification.created_at >= start_date
        ).all()
        
        total_sent = len([n for n in notifications if n.status == NotificationStatus.SENT])
        total_delivered = len([n for n in notifications if n.status == NotificationStatus.DELIVERED])
        total_failed = len([n for n in notifications if n.status == NotificationStatus.FAILED])
        
        delivery_rate = (total_delivered / len(notifications) * 100) if notifications else 0
        
        return {
            "total_notifications": len(notifications),
            "total_sent": total_sent,
            "total_delivered": total_delivered,
            "total_failed": total_failed,
            "delivery_rate": round(delivery_rate, 2),
            "period_days": days
        }
