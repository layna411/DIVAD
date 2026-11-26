from typing import List, Optional
from pydantic import BaseModel, Field

# ----------------- THERAPIST AUTH SCHEMAS -----------------
class TherapistUser(BaseModel):
    uid: str
    email: str
    displayName: str = Field(validation_alias="display_name")
    role: str = "therapist"
    organization: str = "SIMATS Pediatric Occupational Therapy Center"

    class Config:
        populate_by_name = True
        from_attributes = True

class TherapistRegisterRequest(BaseModel):
    email: str
    password: str
    displayName: str
    organization: Optional[str] = "SIMATS Pediatric Occupational Therapy Center"

class TherapistLoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    user: TherapistUser
    token: str
    message: str = "Authentication successful"

# ----------------- CHILD PROFILE SCHEMAS -----------------
class ChildProfile(BaseModel):
    id: str
    therapistId: Optional[str] = Field(default=None, validation_alias="therapist_id")
    name: str
    age: int
    gender: str = "male"
    baselineAssistanceLevel: int = Field(default=2, validation_alias="baseline_assistance_level")
    preferredLanguage: str = Field(default="en", validation_alias="preferred_language")
    clinicalNotes: Optional[str] = Field(default="", validation_alias="clinical_notes")
    colorTag: Optional[str] = Field(default="#EAB308", validation_alias="color_tag")
    active: bool = True
    createdAt: int = Field(validation_alias="created_at")
    updatedAt: int = Field(validation_alias="updated_at")

    class Config:
        populate_by_name = True
        from_attributes = True

class ChildCreateUpdateRequest(BaseModel):
    id: Optional[str] = None
    therapistId: Optional[str] = None
    name: str
    age: int = 6
    gender: str = "male"
    baselineAssistanceLevel: int = 2
    preferredLanguage: str = "en"
    clinicalNotes: Optional[str] = ""
    colorTag: Optional[str] = "#EAB308"
    active: Optional[bool] = True

# ----------------- SESSION SCHEMAS -----------------
class StepAttempt(BaseModel):
    id: Optional[int] = None
    activityId: str = Field(validation_alias="activity_id")
    stepNumber: int = Field(validation_alias="step_number")
    timestamp: int
    isCorrect: bool = Field(validation_alias="is_correct")
    assistanceLevel: int = Field(validation_alias="assistance_level")
    sensorEventType: Optional[str] = Field(default=None, validation_alias="sensor_event_type")
    durationSeconds: Optional[int] = Field(default=0, validation_alias="duration_seconds")
    feedbackGiven: Optional[str] = Field(default=None, validation_alias="feedback_given")

    class Config:
        populate_by_name = True
        from_attributes = True

class ActivitySession(BaseModel):
    id: str
    childId: str = Field(validation_alias="child_id")
    therapistId: Optional[str] = Field(default=None, validation_alias="therapist_id")
    language: str = "en"
    startTime: int = Field(validation_alias="start_time")
    endTime: Optional[int] = Field(default=None, validation_alias="end_time")
    status: str = "in-progress"
    selectedActivities: List[str] = Field(validation_alias="selected_activities")
    attempts: List[StepAttempt] = []
    totalStars: int = Field(default=0, validation_alias="total_stars")
    badgesEarned: List[str] = Field(default_factory=list, validation_alias="badges_earned")
    notes: Optional[str] = None

    class Config:
        populate_by_name = True
        from_attributes = True

class SessionCreateUpdateRequest(BaseModel):
    id: str
    childId: str
    therapistId: Optional[str] = None
    language: str = "en"
    startTime: int
    endTime: Optional[int] = None
    status: str = "in-progress"
    selectedActivities: List[str]
    attempts: Optional[List[StepAttempt]] = []
    totalStars: Optional[int] = 0
    badgesEarned: Optional[List[str]] = []
    notes: Optional[str] = None

class AttemptLogRequest(BaseModel):
    sessionId: str
    activityId: str
    stepNumber: int
    timestamp: int
    isCorrect: bool
    assistanceLevel: int
    sensorEventType: Optional[str] = None
    durationSeconds: Optional[int] = 0
    feedbackGiven: Optional[str] = None

# ----------------- HARDWARE & SENSOR LOG SCHEMAS -----------------
class SensorLogCreate(BaseModel):
    sessionId: Optional[str] = None
    eventType: str
    source: str = "ble"
    deviceId: Optional[str] = None
    opcode: Optional[int] = None
    rawData: Optional[str] = None
    timestamp: Optional[int] = None
