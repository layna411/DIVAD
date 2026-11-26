import time
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Child
from backend.schemas import ChildProfile, ChildCreateUpdateRequest

router = APIRouter(prefix="/api/children", tags=["Children Profiles"])

def model_to_dto(child: Child) -> ChildProfile:
    return ChildProfile(
        id=child.id,
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

@router.get("", response_model=List[ChildProfile])
def get_children(db: Session = Depends(get_db)):
    children = db.query(Child).order_by(Child.created_at.desc()).all()
    return [model_to_dto(c) for c in children]

@router.post("", response_model=ChildProfile)
def create_or_save_child(req: ChildCreateUpdateRequest, db: Session = Depends(get_db)):
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
        child.updated_at = now
    else:
        # Create new
        child = Child(
            id=child_id,
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
