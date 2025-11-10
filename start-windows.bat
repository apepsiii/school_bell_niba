@echo off
REM School Bell System - Enhanced Startup Script for Windows

echo ======================================
echo School Bell Management System
echo ======================================
echo.

REM Check Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python tidak terinstall!
    echo.
    echo Silakan install Python dari:
    echo https://www.python.org/downloads/
    echo.
    echo Pastikan centang "Add Python to PATH" saat install
    pause
    exit /b 1
)

echo Python terdeteksi: 
python --version
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Gagal membuat virtual environment
        pause
        exit /b 1
    )
    echo Virtual environment created successfully!
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Gagal mengaktifkan virtual environment
    pause
    exit /b 1
)

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo Installing dependencies...
echo.

REM Check if requirements.txt exists
if not exist "requirements.txt" (
    echo ERROR: requirements.txt tidak ditemukan!
    pause
    exit /b 1
)

REM Install each package individually for better error handling
echo Installing Flask...
python -m pip install Flask==3.0.0
if errorlevel 1 (
    echo WARNING: Gagal install Flask dengan versi spesifik, mencoba tanpa versi...
    python -m pip install Flask
)

echo Installing APScheduler...
python -m pip install APScheduler==3.10.4
if errorlevel 1 (
    echo WARNING: Gagal install APScheduler dengan versi spesifik, mencoba tanpa versi...
    python -m pip install APScheduler
)

echo Installing pygame...
python -m pip install pygame==2.5.2
if errorlevel 1 (
    echo WARNING: Gagal install pygame dengan versi spesifik, mencoba tanpa versi...
    python -m pip install pygame
    if errorlevel 1 (
        echo ERROR: Pygame gagal terinstall
        echo.
        echo Solusi:
        echo 1. Install Visual C++ Redistributable dari:
        echo    https://aka.ms/vs/17/release/vc_redist.x64.exe
        echo 2. Atau download pygame wheel dari:
        echo    https://www.lfd.uci.edu/~gohlke/pythonlibs/#pygame
        echo.
        pause
    )
)

echo Installing Werkzeug...
python -m pip install Werkzeug==3.0.1
if errorlevel 1 (
    python -m pip install Werkzeug
)

echo Installing python-dateutil...
python -m pip install python-dateutil==2.8.2
if errorlevel 1 (
    python -m pip install python-dateutil
)

echo Installing mutagen...
python -m pip install mutagen==1.47.0
if errorlevel 1 (
    python -m pip install mutagen
)

echo.
echo Dependencies installed!
echo.

REM Initialize database if not exists
if not exist "database\school_bell.db" (
    echo Initializing database...
    python database.py
    if errorlevel 1 (
        echo ERROR: Gagal initialize database
        pause
        exit /b 1
    )
    echo Database initialized successfully!
    echo.
)

REM Start application
echo.
echo ======================================
echo Starting School Bell System...
echo ======================================
echo.
echo Access the application at:
echo http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

python app.py

REM If app exits, pause to see error messages
pause
