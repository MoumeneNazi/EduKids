"""Auth: login, signup, and current user."""
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
import os
import shutil
import uuid
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, Token, UserResponse
from app.auth import verify_password, get_password_hash, create_access_token
from app.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=UserResponse)
async def signup(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    role: str = Form(...),
    id_card: UploadFile | None = File(None),
    family_book: UploadFile | None = File(None),
    contract: UploadFile | None = File(None),
    db: Session = Depends(get_db)
):
    if role not in ("teacher", "parent"):
        raise HTTPException(status_code=400, detail="Invalid role")
    
    email = email.strip().lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    upload_dir = "backend/app/uploads"
    os.makedirs(upload_dir, exist_ok=True)

    def save_file(file: UploadFile | None):
        if not file: return None
        ext = os.path.splitext(file.filename)[1]
        fname = f"{uuid.uuid4()}{ext}"
        fpath = os.path.join(upload_dir, fname)
        with open(fpath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return fname

    user = User(
        email=email,
        name=name.strip(),
        role=role,
        hashed_password=get_password_hash(password),
        id_card_url=save_file(id_card),
        family_book_url=save_file(family_book),
        contract_url=save_file(contract),
        approved=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    email = (data.email or "").strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Wrong email or password")
    if not getattr(user, "approved", True):
        raise HTTPException(
            status_code=403,
            detail="Your account is pending approval by an administrator.",
        )
    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return Token(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
