@echo off
REM Windows batch script to start the full Diego Portfolio app

echo ============================================================
echo Starting Diego Portfolio App ^(Backend + Frontend^)
echo ============================================================

REM Start main backend in a new window
start "Main Backend Server" cmd /k "cd apps\backend && if exist venv\Scripts\python.exe (venv\Scripts\python.exe main.py) else (python main.py)"

REM Wait a moment for main backend to start
timeout /t 2 /nobreak >nul

REM Start chatbot backend in a new window
start "Chatbot Backend Server" cmd /k "cd .. && if exist apps\backend\venv\Scripts\python.exe (apps\backend\venv\Scripts\python.exe -m uvicorn backend.api_server:app --host 0.0.0.0 --port 8001 --reload) else (python -m uvicorn backend.api_server:app --host 0.0.0.0 --port 8001 --reload)"

REM Wait a moment for chatbot backend to start
timeout /t 2 /nobreak >nul

REM Start frontend in a new window
start "Frontend Server" cmd /k "cd apps\web && if not exist node_modules (pnpm install) && pnpm dev"

echo.
echo ============================================================
echo App servers are starting in separate windows
echo ============================================================
echo.
echo Main Backend:  http://127.0.0.1:8000
echo Chatbot Backend: http://127.0.0.1:8001
echo Frontend: http://localhost:5173
echo.
echo Close the server windows to stop them
echo ============================================================
echo.

pause
