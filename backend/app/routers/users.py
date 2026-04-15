"""Users CRUD (admin)."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse
from app.auth import get_password_hash
from app.deps import get_current_user, require_role, require_approved

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserResponse])
def list_users(
    pending: bool = Query(False, description="Only users pending approval (teachers/parents)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved),
):
    q = db.query(User)
    if pending:
        q = q.filter(User.approved == False, User.role.in_(["teacher", "parent"]))
    return q.order_by(User.created_at.desc()).all()


@router.post("/{user_id}/approve", response_model=UserResponse)
def approve_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role not in ("teacher", "parent"):
        raise HTTPException(status_code=400, detail="Only teachers and parents require approval")
    user.approved = True
    db.commit()
    db.refresh(user)
    return user


@router.post("", response_model=UserResponse)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    email = (data.email or "").strip().lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=email,
        name=data.name,
        role=data.role,
        avatar=data.avatar,
        hashed_password=get_password_hash(data.password),
        approved=True,  # admin-created users are pre-approved
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
