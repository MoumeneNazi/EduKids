"""Submissions API."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Submission, User, Assignment
from app.schemas import SubmissionCreate, SubmissionResponse
from app.deps import require_approved

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.get("", response_model=list[SubmissionResponse])
def list_submissions(
    assignment_id: int | None = Query(None),
    student_id: int | None = Query(None),
    course_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved)
):
    q = db.query(Submission).join(Assignment, Submission.assignment_id == Assignment.id)
    
    if current_user.role == "student":
        # Students can only see their own submissions
        q = q.filter(Submission.student_id == current_user.id)
        if assignment_id:
           q = q.filter(Submission.assignment_id == assignment_id)
        if course_id:
           q = q.filter(Assignment.course_id == course_id)
    else:
        # Teachers / admins
        if assignment_id:
            q = q.filter(Submission.assignment_id == assignment_id)
        if student_id:
            q = q.filter(Submission.student_id == student_id)
        if course_id:
            q = q.filter(Assignment.course_id == course_id)
            
    return q.order_by(Submission.submitted_at.desc()).all()


@router.post("", response_model=SubmissionResponse)
def submit_assignment(
    data: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can submit assignments")
        
    # Check if assignment exists
    assignment = db.query(Assignment).filter(Assignment.id == data.assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Check if already submitted
    existing = db.query(Submission).filter(
        Submission.assignment_id == data.assignment_id,
        Submission.student_id == current_user.id
    ).first()
    if existing:
        # Overwrite content for simplicity
        existing.file_url = data.file_url
        existing.text_content = data.text_content
        db.commit()
        db.refresh(existing)
        return existing
        
    sub = Submission(
        assignment_id=data.assignment_id,
        student_id=current_user.id,
        file_url=data.file_url,
        text_content=data.text_content
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub
