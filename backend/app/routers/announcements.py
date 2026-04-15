"""Announcements API."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Announcement, User
from app.schemas import AnnouncementCreate, AnnouncementResponse
from app.deps import require_role, require_approved, get_current_user

router = APIRouter(prefix="/announcements", tags=["announcements"])

@router.get("", response_model=list[AnnouncementResponse])
def get_announcements(
    target_role: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved)
):
    # Admins can see all announcements
    q = db.query(Announcement)
    
    if current_user.role != "admin":
        # Other roles only see 'all' or their specific role
        q = q.filter(Announcement.target_role.in_(["all", current_user.role]))
    elif target_role:
        q = q.filter(Announcement.target_role == target_role)
        
    return q.order_by(Announcement.created_at.desc()).all()


@router.post("", response_model=AnnouncementResponse)
def create_announcement(
    data: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can broadcast announcements")

    announcement = Announcement(
        title=data.title,
        content=data.content,
        target_role=data.target_role,
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement


@router.delete("/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete announcements")

    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
        
    db.delete(announcement)
    db.commit()
    return {"ok": True}
