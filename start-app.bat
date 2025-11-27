@echo off
REM Windows batch script to start the full Diego Portfolio app

echo ============================================================
echo Starting Diego Portfolio App ^(Backend + Frontend^)
echo ============================================================

REM Start unified backend in a new window
REM Set PYTHONPATH to include apps directory so backend module can be found
REM Change to project root directory and set PYTHONPATH before running uvicorn
start "Unified Backend Server" cmd /k "cd /d %~dp0 && set PYTHONPATH=%~dp0apps;%PYTHONPATH% && if exist apps\backend\venv\Scripts\python.exe (apps\backend\venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload) else (python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload)"

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend in a new window
start "Frontend Server" cmd /k "cd apps\web && if not exist node_modules (pnpm install) && pnpm dev"

echo.
echo ============================================================
echo App servers are starting in separate windows
echo ============================================================
echo.
echo Unified Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
echo Close the server windows to stop them
echo ============================================================
echo.

pause
