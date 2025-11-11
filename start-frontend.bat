@echo off
REM Windows batch script to start the frontend server

echo ============================================================
echo Starting Diego Portfolio Frontend
echo ============================================================

cd apps\web

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    pnpm install
)

echo Starting frontend dev server...
pnpm dev

pause

