"""System Audit Log API."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Grade, Announcement, Submission, User
from app.deps import require_role

router = APIRouter(prefix="/audit", tags=["audit"])

@router.get("")
def get_activity_feed(db: Session = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    """Aggregates latest actions into a unified system feed."""
    feed = []
    
    grades = db.query(Grade).order_by(Grade.graded_at.desc()).limit(5).all()
    for g in grades:
        feed.append({
            "type": "📝 EVALUATION",
            "message": f"Grade evaluated: {g.score}/{g.max_score}",
            "timestamp": g.graded_at.isoformat() if g.graded_at else None
        })
        
    announcements = db.query(Announcement).order_by(Announcement.created_at.desc()).limit(5).all()
    for a in announcements:
        feed.append({
            "type": "📢 BROADCAST",
            "message": f"Network announcement deployed: {a.title}",
            "timestamp": a.created_at.isoformat() if a.created_at else None
        })
        
    submissions = db.query(Submission).order_by(Submission.submitted_at.desc()).limit(5).all()
    for s in submissions:
        feed.append({
            "type": "📤 UPLOAD",
            "message": f"Student identity {s.student_id} committed homework to Assignment {s.assignment_id}.",
            "timestamp": s.submitted_at.isoformat() if s.submitted_at else None
        })
        
    users = db.query(User).filter(User.role == "student").order_by(User.id.desc()).limit(5).all()
    for u in users:
        feed.append({
            "type": "👤 IDENTITY",
            "message": f"New local identity registered: {u.email}",
            "timestamp": u.created_at.isoformat() if u.created_at else None
        })

    # Sort effectively by timestamp string assuming ISO format
    feed_clean = [f for f in feed if f["timestamp"] is not None]
    feed_clean.sort(key=lambda x: x["timestamp"], reverse=True)
    return feed_clean[:10]
