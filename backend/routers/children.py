import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Child
from backend.schemas import ChildProfile, ChildCreateUpdateRequest
from backend.auth_utils import decode_access_token

router = APIRouter(prefix="/api/children", tags=["Children Profiles"])

def model_to_dto(child: Child) -> ChildProfile:
    return ChildProfile(
        id=child.id,
        therapistId=child.therapist_id,
        name=child.name,
        age=child.age,
        gender=child.gender,
        baselineAssistanceLevel=child.baseline_assistance_level,
        preferredLanguage=child.preferred_language,
        clinicalNotes=child.clinical_notes or "",
        colorTag=child.color_tag or "#EAB308",
        active=child.active,
        createdAt=child.created_at,
        updatedAt=child.updated_at
    )

def extract_therapist_uid(authorization: Optional[str]) -> Optional[str]:
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            return payload["sub"]
    return None

@router.get("", response_model=List[ChildProfile])
def get_children(
    therapist_id: Optional[str] = None,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db)
):
    target_uid = therapist_id or extract_therapist_uid(authorization)

    query = db.query(Child)
    if target_uid:
        # Strict isolation: Only show children assigned to this specific therapist
        query = query.filter(Child.therapist_id == target_uid)
    else:
        # If unauthenticated, show only demo children
        query = query.filter(Child.therapist_id == "th_demo_mitchell")

    children = query.order_by(Child.created_at.desc()).all()
    return [model_to_dto(c) for c in children]

@router.post("", response_model=ChildProfile)
def create_or_save_child(
    req: ChildCreateUpdateRequest,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db)
):
    target_uid = req.therapistId or extract_therapist_uid(authorization) or "th_demo_mitchell"
    now = int(time.time() * 1000)
    child_id = req.id if req.id else f"child_{now}"

    child = db.query(Child).filter(Child.id == child_id).first()
    if child:
        # Update existing
        child.name = req.name.strip()
        child.age = req.age
        child.gender = req.gender
        child.baseline_assistance_level = req.baselineAssistanceLevel
        child.preferred_language = req.preferredLanguage
        child.clinical_notes = req.clinicalNotes
        child.color_tag = req.colorTag or "#EAB308"
        child.active = req.active if req.active is not None else True
        if not child.therapist_id:
            child.therapist_id = target_uid
        child.updated_at = now
    else:
        # Create new
        child = Child(
            id=child_id,
            therapist_id=target_uid,
            name=req.name.strip(),
            age=req.age,
            gender=req.gender,
            baseline_assistance_level=req.baselineAssistanceLevel,
            preferred_language=req.preferredLanguage,
            clinical_notes=req.clinicalNotes,
            color_tag=req.colorTag or "#EAB308",
            active=req.active if req.active is not None else True,
            created_at=now,
            updated_at=now
        )
        db.add(child)

    db.commit()
    db.refresh(child)
    return model_to_dto(child)

@router.get("/{child_id}", response_model=ChildProfile)
def get_child_by_id(child_id: str, db: Session = Depends(get_db)):
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found")
    return model_to_dto(child)

@router.put("/{child_id}", response_model=ChildProfile)
def update_child(child_id: str, req: ChildCreateUpdateRequest, db: Session = Depends(get_db)):
    req.id = child_id
    return create_or_save_child(req, db)

@router.delete("/{child_id}")
def delete_child(child_id: str, db: Session = Depends(get_db)):
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found")
    db.delete(child)
    db.commit()
    return {"message": f"Child {child_id} deleted successfully", "success": True}
