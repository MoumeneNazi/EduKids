"""Students API (parent/teacher links)."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Student, User
from app.schemas import AddChildRequest
from app.auth import get_password_hash
from app.deps import get_current_user, require_role, require_approved

router = APIRouter(prefix="/students", tags=["students"])


@router.post("/register-child")
def register_child(
    data: AddChildRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved),
):
    """Parent creates a child account; child is linked to parent and can log in immediately."""
    email = (data.email or "").strip().lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    child_user = User(
        email=email,
        name=(data.name or "").strip(),
        role="student",
        hashed_password=get_password_hash(data.password),
        approved=True,
    )
    db.add(child_user)
    db.flush()
    student_row = Student(
        user_id=child_user.id,
        parent_id=current_user.id,
        teacher_id=None,
        class_level=(data.class_level or "CM1").strip(),
        xp_points=0,
        badges="[]",
    )
    db.add(student_row)
    db.commit()
    db.refresh(child_user)
    return {
        "ok": True,
        "message": f"Account created for {child_user.name}. They can log in with their email and password.",
        "user_id": child_user.id,
    }


@router.get("")
def list_students(
    parent_id: int | None = Query(None),
    teacher_id: int | None = Query(None),
    class_level: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved),
):
    q = db.query(Student)
    if current_user.role == "parent":
        q = q.filter(Student.parent_id == current_user.id)
    elif current_user.role == "teacher":
        q = q.filter(Student.teacher_id == current_user.id)
    if parent_id is not None:
        q = q.filter(Student.parent_id == parent_id)
    if teacher_id is not None:
        q = q.filter(Student.teacher_id == teacher_id)
    if class_level:
        q = q.filter(Student.class_level == class_level)
    rows = q.all()
    return [
        {
            "id": s.id,
            "user_id": s.user_id,
            "parent_id": s.parent_id,
            "teacher_id": s.teacher_id,
            "teacher_name": s.teacher.name if s.teacher else "Not Assigned",
            "class_level": s.class_level,
            "xp_points": s.xp_points,
            "badges": s.badges,
            "name": s.user.name if s.user else None,
        }
        for s in rows
    ]
