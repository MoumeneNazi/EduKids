"""EduKids FastAPI application. """
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import engine, Base, get_db
from app.routers import auth, users, courses, grades, assignments, messages, attendance, students, announcements, timetable, submissions, audit

# Table creation is handled by Base.metadata.create_all
Base.metadata.create_all(bind=engine)

app = FastAPI(title="EduKids API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
uploads_dir = "backend/app/uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(courses.router, prefix="/api")
app.include_router(grades.router, prefix="/api")
app.include_router(assignments.router, prefix="/api")
app.include_router(messages.router, prefix="/api")
app.include_router(attendance.router, prefix="/api")
app.include_router(students.router, prefix="/api")
app.include_router(announcements.router, prefix="/api")
app.include_router(timetable.router, prefix="/api")
app.include_router(submissions.router, prefix="/api")
app.include_router(audit.router, prefix="/api")


@app.get("/")
def root():
    return {"app": "EduKids API", "docs": "/docs"}


@app.post("/api/seed")
def seed_api():
    """Dev-only: seed database. Call once to create demo users."""
    import os
    from fastapi import HTTPException
    if os.getenv("ENV") == "production":
        raise HTTPException(status_code=404, detail="Not available")
    from app.database import SessionLocal
    from app.seed_data import run_seed
    db = SessionLocal()
    try:
        run_seed(db)
        return {"ok": True, "message": "Database seeded. Use admin@edukids.com / admin123"}
    except Exception as e:
        if "unique" in str(e).lower() or "duplicate" in str(e).lower():
            raise HTTPException(status_code=400, detail="Already seeded. Use admin@edukids.com / admin123")
        raise
    finally:
        db.close()


@app.post("/api/dev/reset-admin-password")
def reset_admin_password():
    """Dev-only: set admin@edukids.com password to admin123. Use if login fails."""
    import os
    from fastapi import HTTPException
    if os.getenv("ENV") == "production":
        raise HTTPException(status_code=404, detail="Not available")
    from app.database import SessionLocal
    from app.models import User
    from app.auth import get_password_hash
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "admin@edukids.com").first()
        if not user:
            raise HTTPException(status_code=404, detail="No admin user. Run Seed demo data first.")
        user.hashed_password = get_password_hash("admin123")
        db.commit()
        return {"ok": True, "message": "Admin password set to admin123. Try logging in."}
    finally:
        db.close()
