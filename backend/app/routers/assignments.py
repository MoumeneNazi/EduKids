"""Assignments API."""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Assignment, User, Course
from app.schemas import AssignmentCreate, AssignmentResponse
from app.deps import get_current_user, require_role, require_approved

router = APIRouter(prefix="/assignments", tags=["assignments"])


@router.get("", response_model=list[AssignmentResponse])
def list_assignments(
    course_id: int | None = Query(None),
    type: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved),
):
    q = db.query(Assignment)
    if course_id is not None:
        q = q.filter(Assignment.course_id == course_id)
    if type:
        q = q.filter(Assignment.type == type)
    return q.order_by(Assignment.due_date.desc()).all()


@router.post("", response_model=AssignmentResponse)
def create_assignment(
    data: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved),
):
    if current_user.role not in ("teacher", "admin"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    if current_user.role == "teacher":
        course = db.query(Course).filter(Course.id == data.course_id, Course.teacher_id == current_user.id).first()
        if not course:
            raise HTTPException(status_code=403, detail="Not your course")
    assignment = Assignment(
        course_id=data.course_id,
        title=data.title,
        description=data.description,
        due_date=data.due_date,
        type=data.type,
        max_score=data.max_score,
        questions_data=data.questions_data,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment
