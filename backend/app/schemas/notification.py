from pydantic import BaseModel, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.notification import NotificationType, NotificationStatus

class NotificationBase(BaseModel):
    user_id: int
    type: NotificationType
    title: str
    message: str
    phone_number: str
    priority: int = 1
    scheduled_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

class NotificationCreate(NotificationBase):
    @validator('priority')
    def validate_priority(cls, v):
        if v not in [1, 2, 3, 4]:
            raise ValueError('Priority must be between 1-4')
        return v

class NotificationResponse(NotificationBase):
    id: int
    status: NotificationStatus
    sent_at: Optional[datetime]
    delivered_at: Optional[datetime]
    retry_count: int
    error_message: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class SMSTemplateBase(BaseModel):
    name: str
    type: NotificationType
    template_text: str
    language: str = "en"

class SMSTemplateCreate(SMSTemplateBase):
    pass

class SMSTemplateResponse(SMSTemplateBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class BulkNotificationRequest(BaseModel):
    user_ids: List[int]
    type: NotificationType
    title: str
    message: str
    priority: int = 1
    scheduled_at: Optional[datetime] = None

class EmergencyAlertRequest(BaseModel):
    village: Optional[str] = None
    user_role: Optional[str] = None
    title: str
    message: str
    include_all_users: bool = False

class NotificationStatsResponse(BaseModel):
    total_sent: int
    total_delivered: int
    total_failed: int
    delivery_rate: float
    recent_notifications: List[NotificationResponse]
