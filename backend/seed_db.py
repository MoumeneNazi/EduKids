"""Seed EduKids database. Run from project root: python backend/seed_db.py"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.database import SessionLocal, engine, Base
from app.seed_data import run_seed

Base.metadata.create_all(bind=engine)
db = SessionLocal()

if __name__ == "__main__":
    try:
        run_seed(db)
        print("EduKids database seeded. Login: admin@edukids.com / admin123")
    finally:
        db.close()
