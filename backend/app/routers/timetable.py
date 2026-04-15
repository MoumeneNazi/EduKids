"""Timetable API."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ScheduleEvent, User, Course
from app.schemas import ScheduleEventCreate, ScheduleEventResponse
from app.deps import require_approved

router = APIRouter(prefix="/timetable", tags=["timetable"])

@router.get("", response_model=list[ScheduleEventResponse])
def get_timetable(
    course_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved)
):
    q = db.query(ScheduleEvent)
    if course_id is not None:
        q = q.filter(ScheduleEvent.course_id == course_id)
    return q.all()


@router.post("", response_model=ScheduleEventResponse)
def create_timetable_event(
    data: ScheduleEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can manage the timetable")

    course = db.query(Course).filter(Course.id == data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    event = ScheduleEvent(
        course_id=data.course_id,
        day_of_week=data.day_of_week,
        start_time=data.start_time,
        end_time=data.end_time,
        room=data.room,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}")
def delete_timetable_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete timetable events")

    event = db.query(ScheduleEvent).filter(ScheduleEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    db.delete(event)
    db.commit()
    return {"ok": True}
