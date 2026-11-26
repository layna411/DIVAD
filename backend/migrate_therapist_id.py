import sys
from pathlib import Path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import pymysql
from backend.config import settings

def migrate():
    conn = pymysql.connect(
        host=settings.DB_HOST,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        port=settings.DB_PORT,
        database=settings.DB_NAME,
        charset="utf8mb4"
    )
    with conn.cursor() as cur:
        cur.execute("DESCRIBE children")
        cols = [r[0] for r in cur.fetchall()]
        print("Existing columns in children:", cols)
        
        if "therapist_id" not in cols:
            print("Adding therapist_id column to children table...")
            cur.execute("ALTER TABLE children ADD COLUMN therapist_id VARCHAR(64) NULL AFTER id, ADD INDEX idx_child_therapist (therapist_id)")
            conn.commit()
            print("Successfully added therapist_id column to children.")
        else:
            print("therapist_id column already exists.")

        # Assign existing seed children to the demo therapist only
        cur.execute("UPDATE children SET therapist_id = 'th_demo_mitchell' WHERE therapist_id IS NULL OR therapist_id = ''")
        conn.commit()
        print("Assigned demo children to 'th_demo_mitchell'.")

        # Check sessions table as well
        cur.execute("DESCRIBE sessions")
        session_cols = [r[0] for r in cur.fetchall()]
        if "therapist_id" in session_cols:
            cur.execute("UPDATE sessions SET therapist_id = 'th_demo_mitchell' WHERE therapist_id IS NULL OR therapist_id = ''")
            conn.commit()
            print("Assigned existing sessions to 'th_demo_mitchell'.")

    conn.close()
    print("Migration finished successfully.")

if __name__ == "__main__":
    migrate()
