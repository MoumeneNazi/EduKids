"""SQLAlchemy models for EduKids."""
from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    Table,
    CheckConstraint,
)
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(32), nullable=False)  # student | parent | teacher | admin
    avatar = Column(String(64), default="👤")
    # Verification Documents
    id_card_url = Column(String(512), nullable=True)
    family_book_url = Column(String(512), nullable=True)
    contract_url = Column(String(512), nullable=True)
    verification_notes = Column(Text, nullable=True)

    approved = Column(Boolean, default=False)  # Default to False for all now
    created_at = Column(DateTime, default=datetime.utcnow)


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # null until admin assigns
    class_level = Column(String(32), nullable=False)  # CM1, CE2, etc.
    xp_points = Column(Integer, default=0)
    badges = Column(Text, default="[]")  # JSON array of badge names

    user = relationship("User", foreign_keys=[user_id])
    parent = relationship("User", foreign_keys=[parent_id])
    teacher = relationship("User", foreign_keys=[teacher_id])


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    subject = Column(String(128), nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    description = Column(Text, default="")
    class_level = Column(String(32), nullable=False)
    video_url = Column(String(512), default="")
    material_url = Column(String(512), default="")  # PDF/Doc etc.
    material_type = Column(String(32), default="")  # pdf | sheet | link
    created_at = Column(DateTime, default=datetime.utcnow)

    teacher = relationship("User", foreign_keys=[teacher_id])


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    due_date = Column(DateTime, nullable=False)
    type = Column(String(32), nullable=False)  # homework | test | quiz
    max_score = Column(Float, default=20.0)
    questions_data = Column(Text, default="[]")  # JSON string of questions

    course = relationship("Course", backref="assignments")


class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    score = Column(Float, nullable=False)
    max_score = Column(Float, nullable=False)
    feedback = Column(Text, default="")
    
    __table_args__ = (
        CheckConstraint('score >= 0', name='check_score_positive'),
    )
    graded_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", foreign_keys=[student_id])
    assignment = relationship("Assignment")
    course = relationship("Course")


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    status = Column(String(32), nullable=False)  # present | absent | late
    marked_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    student = relationship("User", foreign_keys=[student_id])
    marker = relationship("User", foreign_keys=[marked_by])


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sender_role = Column(String(32), nullable=False)
    content = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    sent_at = Column(DateTime, default=datetime.utcnow)

    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    target_role = Column(String(32), default="all")  # all | student | parent | teacher
    created_at = Column(DateTime, default=datetime.utcnow)


class ScheduleEvent(Base):
    __tablename__ = "schedule_events"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    day_of_week = Column(String(16), nullable=False)  # Monday, Tuesday, etc.
    start_time = Column(String(8), nullable=False)  # e.g., "08:30"
    end_time = Column(String(8), nullable=False)    # e.g., "10:00"
    room = Column(String(64), nullable=False)       # e.g., "Room 101"

    course = relationship("Course")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_url = Column(String(512), nullable=True)
    text_content = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    assignment = relationship("Assignment")
    student = relationship("User")

