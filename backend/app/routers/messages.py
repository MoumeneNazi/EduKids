"""Messages API."""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Message, User
from app.schemas import MessageCreate, MessageResponse
from app.deps import get_current_user, require_approved

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("", response_model=list[MessageResponse])
def list_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved),
    limit: int = Query(50, le=100),
):
    q = db.query(Message).filter(
        (Message.sender_id == current_user.id) | (Message.receiver_id == current_user.id)
    )
    return q.order_by(Message.sent_at.desc()).limit(limit).all()


@router.post("", response_model=MessageResponse)
def send_message(
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved),
):
    msg = Message(
        sender_id=current_user.id,
        receiver_id=data.receiver_id,
        sender_role=current_user.role,
        content=data.content,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg
