@echo off
REM Windows batch script to start the unified backend server

echo ============================================================
echo Starting Diego Portfolio Unified Backend
echo ============================================================

REM Start unified backend in a new window
REM Set PYTHONPATH to include apps directory so backend module can be found
REM Change to project root directory and set PYTHONPATH before running uvicorn
start "Unified Backend Server" cmd /k "cd /d %~dp0 && set PYTHONPATH=%~dp0apps;%PYTHONPATH% && if exist apps\backend\venv\Scripts\python.exe (apps\backend\venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload) else (python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload)"

echo.
echo ============================================================
echo Backend server is starting in a separate window
echo ============================================================
echo.
echo Unified Backend:  http://127.0.0.1:8000
echo API Docs: http://127.0.0.1:8000/docs
echo Chatbot API: http://127.0.0.1:8000/api/chat
echo.
echo Close the server window to stop it
echo ============================================================
echo.

pause

