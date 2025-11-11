@echo off
REM Windows batch script to start the full Diego Portfolio app

echo ============================================================
echo Starting Diego Portfolio App ^(Backend + Frontend^)
echo ============================================================

REM Start backend in a new window
start "Backend Server" cmd /k "cd apps\backend && if exist venv\Scripts\python.exe (venv\Scripts\python.exe main.py) else (python main.py)"

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend in a new window
start "Frontend Server" cmd /k "cd apps\web && if not exist node_modules (pnpm install) && pnpm dev"

echo.
echo ============================================================
echo App servers are starting in separate windows
echo ============================================================
echo.
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
echo Close the server windows to stop them
echo ============================================================
echo.

pause
