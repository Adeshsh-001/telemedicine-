from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class NotificationType(str, enum.Enum):
    HEALTH_ALERT = "health_alert"
    EMERGENCY = "emergency"
    VACCINATION_REMINDER = "vaccination_reminder"
    PRESCRIPTION_REMINDER = "prescription_reminder"
    APPOINTMENT_REMINDER = "appointment_reminder"
    MEDICINE_AVAILABILITY = "medicine_availability"
    SYSTEM_ALERT = "system_alert"

class NotificationStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    RETRY = "retry"

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    phone_number = Column(String, nullable=False)
    status = Column(Enum(NotificationStatus), default=NotificationStatus.PENDING)
    priority = Column(Integer, default=1)  # 1=low, 2=medium, 3=high, 4=emergency
    scheduled_at = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    error_message = Column(Text, nullable=True)
    metadata = Column(Text, nullable=True)  # JSON string for additional data
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")

class SMSTemplate(Base):
    __tablename__ = "sms_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    template_text = Column(Text, nullable=False)
    language = Column(String, default="en")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class NotificationLog(Base):
    __tablename__ = "notification_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    notification_id = Column(Integer, ForeignKey("notifications.id"), nullable=False)
    action = Column(String, nullable=False)  # sent, delivered, failed, retry
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    notification = relationship("Notification")
