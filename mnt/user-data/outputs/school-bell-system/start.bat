@echo off
REM School Bell System - Startup Script

echo ======================================
echo School Bell Management System
echo ======================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Initialize database if not exists
if not exist "database\school_bell.db" (
    echo Initializing database...
    python database.py
)

REM Start application
echo.
echo Starting School Bell System...
echo Access the application at: http://localhost:5000
echo.
python app.py

pause
