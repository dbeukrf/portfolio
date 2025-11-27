@echo off
REM Windows batch script to run document ingestion

echo ============================================================
echo Diego Portfolio - Document Ingestion
echo ============================================================
echo.

REM Change to backend directory
cd /d %~dp0

REM Check if virtual environment exists
if exist venv\Scripts\python.exe (
    echo Using virtual environment...
    venv\Scripts\python.exe ingest_documents.py
) else (
    echo Using system Python...
    python ingest_documents.py
)

echo.
echo ============================================================
echo Ingestion complete
echo ============================================================
pause


