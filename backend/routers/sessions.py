from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Session as SessionModel, SessionAttempt
from backend.schemas import (
    ActivitySession, SessionCreateUpdateRequest,
    StepAttempt, AttemptLogRequest
)
from backend.auth_utils import decode_access_token

router = APIRouter(prefix="/api/sessions", tags=["Activity Sessions"])

def model_to_dto(session: SessionModel) -> ActivitySession:
    attempts_dto = [
        StepAttempt(
            id=a.id,
            activityId=a.activity_id,
            stepNumber=a.step_number,
            timestamp=a.timestamp,
            isCorrect=a.is_correct,
            assistanceLevel=a.assistance_level,
            sensorEventType=a.sensor_event_type,
            durationSeconds=a.duration_seconds or 0,
            feedbackGiven=a.feedback_given
        )
        for a in session.attempts
    ]

    return ActivitySession(
        id=session.id,
        childId=session.child_id,
        therapistId=session.therapist_id,
        language=session.language,
        startTime=session.start_time,
        endTime=session.end_time,
        status=session.status,
        selectedActivities=session.selected_activities or [],
        attempts=attempts_dto,
        totalStars=session.total_stars or 0,
        badgesEarned=session.badges_earned or [],
        notes=session.notes
    )

@router.get("", response_model=List[ActivitySession])
def get_sessions(
    childId: Optional[str] = None,
    therapist_id: Optional[str] = None,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db)
):
    target_uid = therapist_id
    if not target_uid and authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            target_uid = payload["sub"]

    query = db.query(SessionModel)
    if childId:
        query = query.filter(SessionModel.child_id == childId)
    if target_uid:
        query = query.filter(SessionModel.therapist_id == target_uid)
    else:
        query = query.filter(SessionModel.therapist_id == "th_demo_mitchell")

    sessions = query.order_by(SessionModel.start_time.desc()).all()
    return [model_to_dto(s) for s in sessions]

@router.post("", response_model=ActivitySession)
def create_or_save_session(req: SessionCreateUpdateRequest, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == req.id).first()
    if session:
        session.child_id = req.childId
        session.therapist_id = req.therapistId
        session.language = req.language
        session.end_time = req.endTime
        session.status = req.status
        session.selected_activities = req.selectedActivities
        session.total_stars = req.totalStars
        session.badges_earned = req.badgesEarned or []
        session.notes = req.notes
    else:
        session = SessionModel(
            id=req.id,
            child_id=req.childId,
            therapist_id=req.therapistId,
            language=req.language,
            start_time=req.startTime,
            end_time=req.endTime,
            status=req.status,
            selected_activities=req.selectedActivities,
            total_stars=req.totalStars or 0,
            badges_earned=req.badgesEarned or [],
            notes=req.notes
        )
        db.add(session)

    # Sync attempts if provided
    if req.attempts is not None and len(req.attempts) > 0:
        existing_attempt_keys = {(a.activity_id, a.step_number, a.timestamp) for a in session.attempts}
        for att in req.attempts:
            key = (att.activityId, att.stepNumber, att.timestamp)
            if key not in existing_attempt_keys:
                new_att = SessionAttempt(
                    session_id=session.id,
                    activity_id=att.activityId,
                    step_number=att.stepNumber,
                    timestamp=att.timestamp,
                    is_correct=att.isCorrect,
                    assistance_level=att.assistanceLevel,
                    sensor_event_type=att.sensorEventType,
                    duration_seconds=att.durationSeconds or 0,
                    feedback_given=att.feedbackGiven
                )
                db.add(new_att)

    db.commit()
    db.refresh(session)
    return model_to_dto(session)

@router.post("/attempt", response_model=StepAttempt)
def log_attempt(req: AttemptLogRequest, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == req.sessionId).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    attempt = SessionAttempt(
        session_id=req.sessionId,
        activity_id=req.activityId,
        step_number=req.stepNumber,
        timestamp=req.timestamp,
        is_correct=req.isCorrect,
        assistance_level=req.assistanceLevel,
        sensor_event_type=req.sensorEventType,
        duration_seconds=req.durationSeconds or 0,
        feedback_given=req.feedbackGiven
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return StepAttempt(
        id=attempt.id,
        activityId=attempt.activity_id,
        stepNumber=attempt.step_number,
        timestamp=attempt.timestamp,
        isCorrect=attempt.is_correct,
        assistanceLevel=attempt.assistance_level,
        sensorEventType=attempt.sensor_event_type,
        durationSeconds=attempt.duration_seconds,
        feedbackGiven=attempt.feedback_given
    )

@router.get("/{session_id}", response_model=ActivitySession)
def get_session_by_id(session_id: str, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return model_to_dto(session)

@router.delete("/{session_id}")
def delete_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    db.delete(session)
    db.commit()
    return {"message": f"Session {session_id} deleted successfully", "success": True}
