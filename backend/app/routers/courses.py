"""Courses API."""
from fastapi import APIRouter, Depends, Query, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
from datetime import datetime
from app.database import get_db
from app.models import Course, User
from app.schemas import CourseCreate, CourseResponse
from app.deps import get_current_user, require_role, require_approved

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=list[CourseResponse])
def list_courses(
    class_level: str | None = Query(None),
    teacher_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved),
):
    q = db.query(Course)
    if class_level:
        q = q.filter(Course.class_level == class_level)
    if teacher_id is not None:
        q = q.filter(Course.teacher_id == teacher_id)
    if current_user.role == "teacher":
        q = q.filter(Course.teacher_id == current_user.id)
    return q.all()


@router.post("", response_model=CourseResponse)
def create_course(
    data: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved),
):
    if current_user.role not in ("teacher", "admin"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    course = Course(
        title=data.title,
        subject=data.subject,
        description=data.description,
        class_level=data.class_level,
        video_url=data.video_url,
        material_url=data.material_url,
        material_type=data.material_type,
        teacher_id=data.teacher_id if current_user.role == "admin" else current_user.id,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.post("/upload-material")
async def upload_material(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role("teacher")),
):
    """Upload a course material file."""
    # Ensure uploads directory exists
    os.makedirs("backend/app/uploads/materials", exist_ok=True)
    
    file_ext = os.path.splitext(file.filename)[1]
    file_name = f"mat_{current_user.id}_{int(datetime.utcnow().timestamp())}{file_ext}"
    file_path = os.path.join("backend/app/uploads/materials", file_name)
    
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
        
    return {"url": f"/uploads/materials/{file_name}", "filename": file.filename}
