@echo off
cd /d "%~dp0"
if exist "venv\Scripts\python.exe" (
    venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0
) else (
    python -m uvicorn app.main:app --reload --host 0.0.0.0
)
