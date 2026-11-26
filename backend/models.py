import time
from sqlalchemy import (
    Column, Integer, String, Boolean, BigInteger, Text,
    ForeignKey, JSON, DateTime, func
)
from sqlalchemy.orm import relationship
from backend.database import Base

class Therapist(Base):
    __tablename__ = "therapists"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    uid = Column(String(64), unique=True, index=True, nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    display_name = Column(String(128), nullable=False, default="Therapist")
    role = Column(String(32), default="therapist")
    organization = Column(String(128), default="SIMATS Pediatric Occupational Therapy Center")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    sessions = relationship("Session", back_populates="therapist")


class Child(Base):
    __tablename__ = "children"

    id = Column(String(64), primary_key=True, index=True)
    therapist_id = Column(String(64), ForeignKey("therapists.uid", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(128), nullable=False, index=True)
    age = Column(Integer, nullable=False, default=6)
    gender = Column(String(16), nullable=False, default="male")
    baseline_assistance_level = Column(Integer, nullable=False, default=2)
    preferred_language = Column(String(8), nullable=False, default="en")
    clinical_notes = Column(Text, nullable=True)
    color_tag = Column(String(16), default="#EAB308")
    active = Column(Boolean, default=True)
    created_at = Column(BigInteger, nullable=False, default=lambda: int(time.time() * 1000))
    updated_at = Column(BigInteger, nullable=False, default=lambda: int(time.time() * 1000))

    sessions = relationship("Session", back_populates="child", cascade="all, delete-orphan")
    therapist = relationship("Therapist", backref="children")


class Session(Base):
    __tablename__ = "sessions"

    id = Column(String(64), primary_key=True, index=True)
    child_id = Column(String(64), ForeignKey("children.id", ondelete="CASCADE"), nullable=False, index=True)
    therapist_id = Column(String(64), ForeignKey("therapists.uid", ondelete="SET NULL"), nullable=True)
    language = Column(String(8), nullable=False, default="en")
    start_time = Column(BigInteger, nullable=False, index=True)
    end_time = Column(BigInteger, nullable=True)
    status = Column(String(32), nullable=False, default="in-progress")
    selected_activities = Column(JSON, nullable=False)
    total_stars = Column(Integer, default=0)
    badges_earned = Column(JSON, default=list)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    child = relationship("Child", back_populates="sessions")
    therapist = relationship("Therapist", back_populates="sessions")
    attempts = relationship("SessionAttempt", back_populates="session", cascade="all, delete-orphan")


class SessionAttempt(Base):
    __tablename__ = "session_attempts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String(64), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_id = Column(String(64), nullable=False)
    step_number = Column(Integer, nullable=False)
    timestamp = Column(BigInteger, nullable=False)
    is_correct = Column(Boolean, nullable=False, default=True)
    assistance_level = Column(Integer, nullable=False, default=2)
    sensor_event_type = Column(String(64), nullable=True)
    duration_seconds = Column(Integer, default=0)
    feedback_given = Column(String(255), nullable=True)

    session = relationship("Session", back_populates="attempts")


class SensorLog(Base):
    __tablename__ = "sensor_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String(64), nullable=True, index=True)
    event_type = Column(String(64), nullable=False, index=True)
    source = Column(String(32), nullable=False, default="ble")
    device_id = Column(String(64), nullable=True)
    opcode = Column(Integer, nullable=True)
    raw_data = Column(Text, nullable=True)
    timestamp = Column(BigInteger, nullable=False)
