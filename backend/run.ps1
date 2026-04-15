# Run from anywhere: starts the API from the backend folder so "app" is found.
Set-Location $PSScriptRoot
if (Test-Path .\venv\Scripts\python.exe) {
    & .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0
} else {
    python -m uvicorn app.main:app --reload --host 0.0.0.0
}
