import time
from backend.database import SessionLocal, engine, Base
from backend.models import Therapist, Child
from backend.auth_utils import hash_password

def seed_database():
    # Create all tables in MySQL
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed demo therapist if not exists
        demo_email = "therapist@simats.edu"
        therapist = db.query(Therapist).filter(Therapist.email == demo_email).first()
        if not therapist:
            therapist = Therapist(
                uid="th_demo_mitchell",
                email=demo_email,
                password_hash=hash_password("divad123"),
                display_name="Dr. Sarah Mitchell, OTR/L",
                role="therapist",
                organization="SIMATS Pediatric Occupational Therapy Center"
            )
            db.add(therapist)
            print("[Seed] Created default therapist: therapist@simats.edu")

        # 2. Seed initial children profiles if empty
        child_count = db.query(Child).count()
        if child_count == 0:
            now = int(time.time() * 1000)
            initial_children = [
                Child(
                    id="child_aarav_01",
                    therapist_id="th_demo_mitchell",
                    name="Aarav Sharma",
                    age=6,
                    gender="male",
                    baseline_assistance_level=2,
                    preferred_language="en",
                    clinical_notes="Demonstrates good bilateral integration. Working on fine motor button grasping.",
                    color_tag="#EAB308",
                    active=True,
                    created_at=now,
                    updated_at=now
                ),
                Child(
                    id="child_priya_02",
                    therapist_id="th_demo_mitchell",
                    name="Priya Raman",
                    age=5,
                    gender="female",
                    baseline_assistance_level=3,
                    preferred_language="ta",
                    clinical_notes="Responsive to Tamil audio prompts. Needs visual cues for snap fastener alignment.",
                    color_tag="#DB2777",
                    active=True,
                    created_at=now - 86400000,
                    updated_at=now
                ),
                Child(
                    id="child_kavya_03",
                    therapist_id="th_demo_mitchell",
                    name="Kavya Sundaram",
                    age=7,
                    gender="female",
                    baseline_assistance_level=1,
                    preferred_language="en",
                    clinical_notes="Independent on zipper and velcro sections. Practicing belt buckle release.",
                    color_tag="#0284C7",
                    active=True,
                    created_at=now - 172800000,
                    updated_at=now
                )
            ]
            db.add_all(initial_children)
            print("[Seed] Seeded 3 clinical child profiles into MySQL.")

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[Seed] Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
