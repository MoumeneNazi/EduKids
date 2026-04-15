"""Grades API."""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from app.database import get_db
from app.models import Grade, User, Course, Assignment
from app.schemas import GradeCreate, GradeResponse, GradePivotResponse, GradePivotRow, AssignmentResponse
from app.deps import get_current_user, require_role, require_approved
from app.models import Student

router = APIRouter(prefix="/grades", tags=["grades"])


@router.get("")
def list_grades(
    student_id: int | None = Query(None),
    course_id: int | None = Query(None),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved),
):
    q = (
        db.query(Grade)
        .options(joinedload(Grade.course), joinedload(Grade.assignment))
        .order_by(desc(Grade.graded_at))
    )
    if current_user.role == "student":
        q = q.filter(Grade.student_id == current_user.id)
    elif current_user.role == "parent":
        # Parent can only see their children
        child_ids = [s.user_id for s in db.query(Student).filter(Student.parent_id == current_user.id).all()]
        if student_id:
            if student_id not in child_ids:
                raise HTTPException(status_code=403, detail="Not your child")
            q = q.filter(Grade.student_id == student_id)
        else:
            q = q.filter(Grade.student_id.in_(child_ids))
    elif current_user.role == "teacher":
        # Teacher can only see their students
        student_ids = [s.user_id for s in db.query(Student).filter(Student.teacher_id == current_user.id).all()]
        if student_id:
            if student_id not in student_ids:
                raise HTTPException(status_code=403, detail="Not your student")
            q = q.filter(Grade.student_id == student_id)
        else:
            q = q.filter(Grade.student_id.in_(student_ids))
    elif student_id is not None:
        q = q.filter(Grade.student_id == student_id)
    if course_id is not None:
        q = q.filter(Grade.course_id == course_id)
    rows = q.limit(limit).all()
    return [
        {
            "id": g.id,
            "student_id": g.student_id,
            "assignment_id": g.assignment_id,
            "course_id": g.course_id,
            "score": g.score,
            "max_score": g.max_score,
            "feedback": g.feedback or "",
            "graded_at": g.graded_at.isoformat() if g.graded_at else None,
            "subject": g.course.subject if g.course else None,
            "assignment_title": g.assignment.title if g.assignment else None,
        }
        for g in rows
    ]


@router.post("", response_model=GradeResponse)
def create_grade(
    data: GradeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved),
):
    # Only teachers (and admin) can create grades
    if current_user.role not in ("teacher", "admin"):
         raise HTTPException(status_code=403, detail="Only teachers can grade")
    
    if data.score < 0:
        raise HTTPException(status_code=400, detail="Grade cannot be negative")
    
    # If teacher, verify student belongs to them
    if current_user.role == "teacher":
        student = db.query(Student).filter(Student.user_id == data.student_id, Student.teacher_id == current_user.id).first()
        if not student:
            raise HTTPException(status_code=403, detail="Not your student")
        course = db.query(Course).filter(Course.id == data.course_id, Course.teacher_id == current_user.id).first()
        if not course:
            raise HTTPException(status_code=403, detail="Not your course")
            
    grade = Grade(
        student_id=data.student_id,
        assignment_id=data.assignment_id,
        course_id=data.course_id,
        score=data.score,
        max_score=data.max_score,
        feedback=data.feedback,
    )
    db.add(grade)
    
    # Award XP dynamically based on performance
    student_record = db.query(Student).filter(Student.user_id == data.student_id).first()
    if student_record and data.max_score > 0:
        xp_earned = int((data.score / data.max_score) * 100)
        student_record.xp_points += xp_earned
        
    db.commit()
    db.refresh(grade)
    return grade


@router.get("/pivot/{course_id}", response_model=GradePivotResponse)
def get_grade_pivot(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved),
):
    """Returns a pivot-table view of grades for a course."""
    if current_user.role not in ("teacher", "admin"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
        
    # Get all assignments for this course
    assignments = db.query(Assignment).filter(Assignment.course_id == course_id).all()
    
    # Get all students enrolled/linked
    # For simplicity, we'll get students assigned to this teacher or all if admin
    students_query = db.query(User).join(Student, User.id == Student.user_id)
    if current_user.role == "teacher":
        students_query = students_query.filter(Student.teacher_id == current_user.id)
    
    students = students_query.all()
    
    # Get all grades for these students/course
    grades = db.query(Grade).filter(Grade.course_id == course_id).all()
    
    # Build pivot rows
    rows = []
    for student in students:
        student_grades = {g.assignment_id: g.score for g in grades if g.student_id == student.id}
        rows.append(GradePivotRow(
            student_id=student.id,
            student_name=student.name,
            grades=student_grades
        ))
        
    return GradePivotResponse(
        assignments=[AssignmentResponse.from_orm(a) for a in assignments],
        rows=rows
    )
