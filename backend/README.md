# EduKids Backend (FastAPI + SQLAlchemy + Uvicorn)

**Python version:** Use **Python 3.11 or 3.12**. Python 3.14 (and some 3.13) can require Rust to build `pydantic-core`; 3.11/3.12 have pre-built wheels.

## Setup

```bash
cd backend
# Use Python 3.11 or 3.12 (e.g. py -3.12 -m venv venv on Windows)
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

## Run

**Important:** Uvicorn must run with the **backend** folder as the current directory, or Python can't find the `app` module.

**Option A – from project root (recommended):**
```powershell
.\backend\run.ps1
```
Or double‑click `backend\run.bat`.

**Option B – from backend folder:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 0.0.0.0
```

API: http://localhost:8000  
Docs: http://localhost:8000/docs

## Seed database

```bash
# From project root (Memoire/)
python backend/seed_db.py
```

Or use the "Seed demo data" button on the login page (calls `POST /api/seed`).

Login after seeding: **admin@edukids.com** / **admin123**

## Environment

- `DATABASE_URL` – default `sqlite:///./edukids.db`
- `SECRET_KEY` – JWT secret (set in production)
- `ENV=production` – disables `POST /api/seed`
