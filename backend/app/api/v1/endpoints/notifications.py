from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.auth import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.notification import Notification, NotificationStatus, NotificationType
from app.schemas.notification import (
    NotificationCreate,
    NotificationResponse,
    BulkNotificationRequest,
    EmergencyAlertRequest,
    NotificationStatsResponse
)
from app.services.sms_service import SMSService
from app.tasks.notification_tasks import send_sms_task

router = APIRouter()

@router.post("/create", response_model=NotificationResponse)
async def create_notification(
    notification_data: NotificationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Create notification
    notification = Notification(**notification_data.dict())
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    # Queue for sending if not scheduled
    if not notification.scheduled_at:
        background_tasks.add_task(send_sms_task.delay, notification.id)
    
    return NotificationResponse.from_orm(notification)

@router.post("/bulk-send")
async def send_bulk_notifications(
    request: BulkNotificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.DOCTOR]))
):
    notification_ids = []
    
    for user_id in request.user_ids:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            notification = Notification(
                user_id=user_id,
                type=request.type,
                title=request.title,
                message=request.message,
                phone_number=user.phone,
                priority=request.priority,
                scheduled_at=request.scheduled_at
            )
            
            db.add(notification)
            db.commit()
            db.refresh(notification)
            notification_ids.append(notification.id)
            
            # Queue for sending if not scheduled
            if not request.scheduled_at:
                background_tasks.add_task(send_sms_task.delay, notification.id)
    
    return {
        "message": f"Created {len(notification_ids)} notifications",
        "notification_ids": notification_ids
    }

@router.post("/emergency-alert")
async def send_emergency_alert(
    request: EmergencyAlertRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.DOCTOR]))
):
    # Build user query
    query = db.query(User).filter(User.is_active == True)
    
    if not request.include_all_users:
        if request.village:
            query = query.filter(User.village == request.village)
        if request.user_role:
            query = query.filter(User.role == request.user_role)
    
    target_users = query.all()
    
    sms_service = SMSService(db)
    notification_ids = sms_service.create_emergency_alert(
        request.title,
        request.message,
        [user.id for user in target_users]
    )
    
    # Queue all notifications for immediate sending
    for notification_id in notification_ids:
        background_tasks.add_task(send_sms_task.delay, notification_id)
    
    return {
        "message": f"Emergency alert sent to {len(target_users)} users",
        "notification_ids": notification_ids,
        "target_count": len(target_users)
    }

@router.get("/my-notifications", response_model=List[NotificationResponse])
async def get_my_notifications(
    limit: int = Query(20, le=100),
    status: Optional[NotificationStatus] = Query(None),
    type: Optional[NotificationType] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    if status:
        query = query.filter(Notification.status == status)
    
    if type:
        query = query.filter(Notification.type == type)
    
    notifications = query.order_by(Notification.created_at.desc()).limit(limit).all()
    return [NotificationResponse.from_orm(n) for n in notifications]

@router.get("/stats")
async def get_notification_stats(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.DOCTOR]))
):
    sms_service = SMSService(db)
    stats = sms_service.get_notification_stats(days)
    
    # Get recent notifications
    recent_notifications = db.query(Notification).order_by(
        Notification.created_at.desc()
    ).limit(10).all()
    
    stats["recent_notifications"] = [
        NotificationResponse.from_orm(n) for n in recent_notifications
    ]
    
    return stats

@router.post("/health-alert/{user_id}")
async def create_health_alert(
    user_id: int,
    symptoms: List[str],
    severity: int,
    ai_assessment: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sms_service = SMSService(db)
    notification_id = sms_service.create_health_alert(user_id, symptoms, severity, ai_assessment)
    
    if notification_id:
        # Queue for immediate sending
        background_tasks.add_task(send_sms_task.delay, notification_id)
        
        return {
            "message": "Health alert created and queued for sending",
            "notification_id": notification_id
        }
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found"
    )

@router.post("/medicine-reminder/{user_id}")
async def create_medicine_reminder(
    user_id: int,
    medicine_name: str,
    dosage: str,
    next_dose_time: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sms_service = SMSService(db)
    notification_id = sms_service.create_medicine_reminder(user_id, medicine_name, dosage, next_dose_time)
    
    if notification_id:
        background_tasks.add_task(send_sms_task.delay, notification_id)
        
        return {
            "message": "Medicine reminder created",
            "notification_id": notification_id
        }
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found"
    )

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN] and notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied"
        )
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted successfully"}
