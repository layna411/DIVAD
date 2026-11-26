import pymysql
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.config import settings

Base = declarative_base()

def get_active_mysql_port():
    """Detect whether MySQL is listening on 3307 or 3306"""
    ports_to_try = [settings.DB_PORT, 3307, 3306]
    for port in ports_to_try:
        try:
            conn = pymysql.connect(
                host=settings.DB_HOST,
                user=settings.DB_USER,
                password=settings.DB_PASSWORD,
                port=port,
                connect_timeout=2
            )
            conn.close()
            return port
        except Exception:
            continue
    return settings.DB_PORT

# Detect port & ensure database exists
active_port = get_active_mysql_port()

def ensure_database_exists():
    global active_port
    active_port = get_active_mysql_port()
    try:
        conn = pymysql.connect(
            host=settings.DB_HOST,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            port=active_port,
            charset="utf8mb4"
        )
        with conn.cursor() as cur:
            cur.execute(f"CREATE DATABASE IF NOT EXISTS `{settings.DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        conn.commit()
        conn.close()
        print(f"[MySQL] Database '{settings.DB_NAME}' ensured on port {active_port}")
    except Exception as e:
        print(f"[MySQL] Warning while ensuring database: {e}")

ensure_database_exists()

# SQLAlchemy Engine
DATABASE_URL = (
    f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}@"
    f"{settings.DB_HOST}:{active_port}/{settings.DB_NAME}?charset=utf8mb4"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
