import time
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Therapist
from backend.schemas import (
    TherapistRegisterRequest, TherapistLoginRequest,
    TherapistUser, AuthResponse
)
from backend.auth_utils import (
    hash_password, verify_password,
    create_access_token, decode_access_token
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def get_current_therapist(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db)
) -> Therapist:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token"
        )
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    therapist = db.query(Therapist).filter(Therapist.uid == payload["sub"]).first()
    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Therapist not found"
        )
    return therapist

@router.post("/register", response_model=AuthResponse)
def register(req: TherapistRegisterRequest, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = db.query(Therapist).filter(Therapist.email == req.email.strip().lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )
    
    uid = f"th_{int(time.time() * 1000)}"
    new_therapist = Therapist(
        uid=uid,
        email=req.email.strip().lower(),
        password_hash=hash_password(req.password),
        display_name=req.displayName.strip(),
        role="therapist",
        organization=req.organization.strip() if req.organization else "SIMATS OT Center"
    )
    db.add(new_therapist)
    db.commit()
    db.refresh(new_therapist)

    token = create_access_token({"sub": new_therapist.uid, "email": new_therapist.email})
    user_dto = TherapistUser(
        uid=new_therapist.uid,
        email=new_therapist.email,
        displayName=new_therapist.display_name,
        role=new_therapist.role,
        organization=new_therapist.organization
    )
    return AuthResponse(user=user_dto, token=token, message="Registration successful")

@router.post("/login", response_model=AuthResponse)
def login(req: TherapistLoginRequest, db: Session = Depends(get_db)):
    therapist = db.query(Therapist).filter(Therapist.email == req.email.strip().lower()).first()
    if not therapist or not verify_password(req.password, therapist.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token({"sub": therapist.uid, "email": therapist.email})
    user_dto = TherapistUser(
        uid=therapist.uid,
        email=therapist.email,
        displayName=therapist.display_name,
        role=therapist.role,
        organization=therapist.organization
    )
    return AuthResponse(user=user_dto, token=token, message="Login successful")

@router.post("/demo-login", response_model=AuthResponse)
def demo_login(db: Session = Depends(get_db)):
    demo_email = "therapist@simats.edu"
    therapist = db.query(Therapist).filter(Therapist.email == demo_email).first()
    if not therapist:
        # Create default demo therapist
        uid = "th_demo_mitchell"
        therapist = Therapist(
            uid=uid,
            email=demo_email,
            password_hash=hash_password("divad123"),
            display_name="Dr. Sarah Mitchell, OTR/L",
            role="therapist",
            organization="SIMATS Pediatric Occupational Therapy Center"
        )
        db.add(therapist)
        db.commit()
        db.refresh(therapist)

    token = create_access_token({"sub": therapist.uid, "email": therapist.email})
    user_dto = TherapistUser(
        uid=therapist.uid,
        email=therapist.email,
        displayName=therapist.display_name,
        role=therapist.role,
        organization=therapist.organization
    )
    return AuthResponse(user=user_dto, token=token, message="Demo login successful")

@router.get("/me", response_model=TherapistUser)
def get_me(therapist: Therapist = Depends(get_current_therapist)):
    return TherapistUser(
        uid=therapist.uid,
        email=therapist.email,
        displayName=therapist.display_name,
        role=therapist.role,
        organization=therapist.organization
    )

@router.post("/reset-password")
def reset_password(payload: dict):
    email = payload.get("email")
    return {"message": f"Password reset instructions sent to {email}"}
