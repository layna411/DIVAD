from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import engine, Base
from backend.seed import seed_database
from backend.routers import auth, children, sessions, hardware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist and seed default records
    try:
        Base.metadata.create_all(bind=engine)
        seed_database()
        print("[Startup] DIVAD backend initialized with MySQL successfully.")
    except Exception as e:
        print(f"[Startup] Warning during startup: {e}")
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Python + MySQL Backend for DIVAD Pediatric Occupational Therapy & BLE Hardware",
    lifespan=lifespan
)

# Enable CORS for frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth.router)
app.include_router(children.router)
app.include_router(sessions.router)
app.include_router(hardware.router)

# Health Check
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "database": f"MySQL ({settings.DB_NAME} on port {settings.DB_PORT})",
        "bleHardware": "Ready"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
