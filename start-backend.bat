@echo off
REM Windows batch script to start the backend server

echo ============================================================
echo Starting Diego Portfolio Backend
echo ============================================================

cd apps\backend

REM Check if virtual environment exists
if exist venv\Scripts\python.exe (
    echo Using virtual environment...
    venv\Scripts\python.exe main.py
) else (
    echo Using system Python...
    python main.py
)

pause

