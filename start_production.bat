@echo off
title DIVAD Pediatric OT System (Production Mode)
echo ===================================================================
echo   DIVAD - Dressing Independence Visual & Auditory Device
echo   PRODUCTION LAUNCHER
echo   Database: MySQL (divad_db)
echo   Environment: Loaded from .env
echo ===================================================================
echo.

echo [1/3] Building optimized production bundles...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Production build failed! Check errors above.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Launching Python FastAPI Production API on port 8000...
start "DIVAD Production Backend" cmd /k "python backend/run_server.py"

echo.
echo [3/3] Launching Production Static Web Server on port 3000...
start "DIVAD Production Web" cmd /k "npm run preview"

echo.
echo ===================================================================
echo   DIVAD Production System is now running!
echo   * Web Application: http://localhost:3000
echo   * API Docs:        http://localhost:8000/docs
echo ===================================================================
echo.
pause
