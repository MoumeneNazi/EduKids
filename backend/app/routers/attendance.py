"""Attendance API."""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Attendance, User
from app.schemas import AttendanceCreate, AttendanceResponse
from app.deps import get_current_user, require_role, require_approved
from app.models import Student

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.get("", response_model=list[AttendanceResponse])
def list_attendance(
    student_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved),
):
    q = db.query(Attendance)
    if current_user.role == "student":
        q = q.filter(Attendance.student_id == current_user.id)
    elif current_user.role == "parent":
        child_ids = [s.user_id for s in db.query(Student).filter(Student.parent_id == current_user.id).all()]
        if student_id:
            if student_id not in child_ids:
                 raise HTTPException(status_code=403, detail="Not your child")
            q = q.filter(Attendance.student_id == student_id)
        else:
            q = q.filter(Attendance.student_id.in_(child_ids))
    elif current_user.role == "teacher":
        student_ids = [s.user_id for s in db.query(Student).filter(Student.teacher_id == current_user.id).all()]
        if student_id:
            if student_id not in student_ids:
                 raise HTTPException(status_code=403, detail="Not your student")
            q = q.filter(Attendance.student_id == student_id)
        else:
            q = q.filter(Attendance.student_id.in_(student_ids))
    elif student_id is not None:
        q = q.filter(Attendance.student_id == student_id)
    return q.order_by(Attendance.date.desc()).limit(100).all()


@router.post("", response_model=AttendanceResponse)
def create_attendance(
    data: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher", "admin")),
):
    if current_user.role == "teacher":
        student = db.query(Student).filter(Student.user_id == data.student_id, Student.teacher_id == current_user.id).first()
        if not student:
             raise HTTPException(status_code=403, detail="Not your student")
    att = Attendance(
        student_id=data.student_id,
        date=data.date,
        status=data.status,
        marked_by=current_user.id,
    )
    db.add(att)
    db.commit()
    db.refresh(att)
    return att
