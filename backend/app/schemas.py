"""Pydantic schemas for request/response."""
from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str
    avatar: str = "👤"


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    approved: bool = False
    id_card_url: str | None = None
    family_book_url: str | None = None
    contract_url: str | None = None
    verification_notes: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str  # student | teacher | parent (no admin)


class AddChildRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    class_level: str = "CM1"


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# Minimal schemas for nested/lists
class CourseBase(BaseModel):
    title: str
    subject: str
    description: str = ""
    class_level: str
    video_url: str = ""
    material_url: str = ""
    material_type: str = ""


class CourseCreate(CourseBase):
    teacher_id: int


class CourseResponse(CourseBase):
    id: int
    teacher_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class AssignmentBase(BaseModel):
    title: str
    description: str = ""
    due_date: datetime
    type: str
    max_score: float = 20.0
    questions_data: str = "[]"


class AssignmentCreate(AssignmentBase):
    course_id: int


class AssignmentResponse(AssignmentBase):
    id: int
    course_id: int

    class Config:
        from_attributes = True


class GradeBase(BaseModel):
    student_id: int
    assignment_id: int
    course_id: int
    score: float
    max_score: float
    feedback: str = ""


class GradeCreate(GradeBase):
    pass


class GradeResponse(GradeBase):
    id: int
    graded_at: datetime

    class Config:
        from_attributes = True


class GradePivotRow(BaseModel):
    student_id: int
    student_name: str
    grades: dict[int, float]  # assignment_id -> score


class GradePivotResponse(BaseModel):
    assignments: list[AssignmentResponse]
    rows: list[GradePivotRow]


class MessageBase(BaseModel):
    receiver_id: int
    content: str


class MessageCreate(MessageBase):
    pass


class MessageResponse(MessageBase):
    id: int
    sender_id: int
    sender_role: str
    read: bool
    sent_at: datetime

    class Config:
        from_attributes = True


class AttendanceBase(BaseModel):
    student_id: int
    date: datetime
    status: str
    marked_by: int


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceResponse(AttendanceBase):
    id: int

    class Config:
        from_attributes = True


class AnnouncementBase(BaseModel):
    title: str
    content: str
    target_role: str = "all"


class AnnouncementCreate(AnnouncementBase):
    pass


class AnnouncementResponse(AnnouncementBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ScheduleEventBase(BaseModel):
    course_id: int
    day_of_week: str
    start_time: str
    end_time: str
    room: str


class ScheduleEventCreate(ScheduleEventBase):
    pass


class ScheduleEventResponse(ScheduleEventBase):
    id: int
    course: CourseResponse

    class Config:
        from_attributes = True


class SubmissionBase(BaseModel):
    assignment_id: int
    file_url: str | None = None
    text_content: str | None = None


class SubmissionCreate(SubmissionBase):
    pass


class SubmissionResponse(SubmissionBase):
    id: int
    student_id: int
    submitted_at: datetime
    student: UserResponse | None = None
    
    class Config:
        from_attributes = True

