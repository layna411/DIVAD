@echo off
title DIVAD Pediatric OT System
echo ========================================================
echo   DIVAD - Dressing Independence Visual & Auditory Device
echo   Database: MySQL (divad_db) - User: root
echo   Hardware: ESP32 BLE Supported
echo ========================================================
echo.
echo [1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000 ...
start "DIVAD Python Backend" cmd /k "python backend/run_server.py"

echo [2/2] Starting React Vite Frontend on http://localhost:3000 ...
start "DIVAD Web App" cmd /k "npm run dev"

echo.
echo Both servers are running!
echo - Frontend: http://localhost:3000
echo - Backend API Docs: http://127.0.0.1:8000/docs
echo.
pause
