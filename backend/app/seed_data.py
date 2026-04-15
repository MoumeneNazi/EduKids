"""Seed logic for EduKids. Used by seed_db.py and /api/seed."""
from datetime import datetime, timedelta
from app.models import User, Student, Course, Assignment, Grade, Attendance, Message
from app.auth import get_password_hash


def run_seed(db):
    # Users
    admin = User(
        email="admin@edukids.com",
        hashed_password=get_password_hash("admin123"),
        name="School Admin",
        role="admin",
        avatar="🏫",
        approved=True,
    )
    db.add(admin)
    db.flush()

    t1 = User(
        email="teacher1@edukids.com",
        hashed_password=get_password_hash("teacher123"),
        name="Mr. Martin",
        role="teacher",
        avatar="👨‍🏫",
        approved=True,
    )
    db.add(t1)
    db.flush()

    t2 = User(
        email="teacher2@edukids.com",
        hashed_password=get_password_hash("teacher123"),
        name="Ms. Dupont",
        role="teacher",
        avatar="👩‍🏫",
        approved=True,
    )
    db.add(t2)
    db.flush()

    p1 = User(
        email="parent1@edukids.com",
        hashed_password=get_password_hash("parent123"),
        name="Parent One",
        role="parent",
        avatar="👨‍👩‍👧",
        approved=True,
    )
    db.add(p1)
    db.flush()

    p2 = User(
        email="parent2@edukids.com",
        hashed_password=get_password_hash("parent123"),
        name="Parent Two",
        role="parent",
        avatar="👨‍👩‍👧",
        approved=True,
    )
    db.add(p2)
    db.flush()

    s1 = User(
        email="student1@edukids.com",
        hashed_password=get_password_hash("student123"),
        name="Ahmed",
        role="student",
        avatar="🧒",
        approved=True,
    )
    db.add(s1)
    db.flush()

    s2 = User(
        email="student2@edukids.com",
        hashed_password=get_password_hash("student123"),
        name="Sara",
        role="student",
        avatar="👧",
        approved=True,
    )
    db.add(s2)
    db.flush()

    s3 = User(
        email="student3@edukids.com",
        hashed_password=get_password_hash("student123"),
        name="Léa",
        role="student",
        avatar="👧",
        approved=True,
    )
    db.add(s3)
    db.flush()

    s4 = User(
        email="student4@edukids.com",
        hashed_password=get_password_hash("student123"),
        name="Noah",
        role="student",
        avatar="🧒",
        approved=True,
    )
    db.add(s4)
    db.flush()

    for user, parent, teacher, level in [
        (s1, p1, t1, "CM1"),
        (s2, p1, t1, "CM1"),
        (s3, p2, t2, "CE2"),
        (s4, p2, t2, "CE2"),
    ]:
        db.add(
            Student(
                user_id=user.id,
                parent_id=parent.id,
                teacher_id=teacher.id,
                class_level=level,
                xp_points=240,
                badges='["Early Bird", "Math Star"]',
            )
        )

    math_course = Course(
        title="Fun Maths",
        subject="Mathematics",
        teacher_id=t1.id,
        description="Numbers, games and puzzles",
        class_level="CM1",
        video_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    )
    db.add(math_course)
    db.flush()

    french_course = Course(
        title="French Stories",
        subject="French",
        teacher_id=t2.id,
        description="Reading, writing and storytelling",
        class_level="CE2",
        video_url="",
    )
    db.add(french_course)
    db.flush()

    science_course = Course(
        title="Science Explorers",
        subject="Science",
        teacher_id=t1.id,
        description="Experiments and discoveries",
        class_level="CM1",
        video_url="",
    )
    db.add(science_course)
    db.flush()

    due = datetime.utcnow() + timedelta(days=7)
    hw1 = Assignment(
        course_id=math_course.id,
        title="Homework 1: Fractions",
        description="Practice adding and subtracting fractions.",
        due_date=due,
        type="homework",
        max_score=20,
    )
    db.add(hw1)
    db.flush()

    quiz1 = Assignment(
        course_id=math_course.id,
        title="Quiz 1: Multiplication",
        description="Short quiz on multiplication tables.",
        due_date=due,
        type="quiz",
        max_score=10,
    )
    db.add(quiz1)
    db.flush()

    hw2 = Assignment(
        course_id=french_course.id,
        title="Homework: Reading",
        description="Read a short story and answer questions.",
        due_date=due,
        type="homework",
        max_score=20,
    )
    db.add(hw2)
    db.flush()

    db.add(Grade(student_id=s1.id, assignment_id=hw1.id, course_id=math_course.id, score=18, max_score=20, feedback="Great work!"))
    db.add(Grade(student_id=s2.id, assignment_id=hw1.id, course_id=math_course.id, score=15, max_score=20, feedback="Good effort."))
    db.add(Grade(student_id=s1.id, assignment_id=quiz1.id, course_id=math_course.id, score=9, max_score=10, feedback="Excellent!"))
    db.add(Grade(student_id=s3.id, assignment_id=hw2.id, course_id=french_course.id, score=16, max_score=20, feedback="Nice reading."))

    today = datetime.utcnow().date()
    for i in range(5):
        d = datetime(today.year, today.month, today.day) - timedelta(days=i)
        for student in [s1, s2, s3, s4]:
            db.add(
                Attendance(
                    student_id=student.id,
                    date=d,
                    status="present" if i % 3 != 0 else "late",
                    marked_by=t1.id if student.id in (s1.id, s2.id) else t2.id,
                )
            )

    db.add(
        Message(
            sender_id=t1.id,
            receiver_id=p1.id,
            sender_role="teacher",
            content="Ahmed has been doing great in maths this week!",
            read=False,
        )
    )
    db.add(
        Message(
            sender_id=p1.id,
            receiver_id=t1.id,
            sender_role="parent",
            content="Thank you! We're very proud of him.",
            read=False,
        )
    )

    db.commit()
