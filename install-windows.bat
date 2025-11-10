@echo off
REM ==========================================
REM School Bell System - Easy Windows Installer
REM ==========================================

echo ==========================================
echo School Bell System - Windows Installer
echo ==========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python tidak terinstall!
    echo.
    echo Download Python dari: https://www.python.org/downloads/
    echo Centang "Add Python to PATH" saat install!
    echo.
    pause
    exit /b 1
)

echo [OK] Python terdeteksi
python --version
echo.

REM Create virtual environment
if not exist "venv\" (
    echo [1/8] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Gagal membuat virtual environment
        pause
        exit /b 1
    )
    echo [OK] Virtual environment created
) else (
    echo [OK] Virtual environment already exists
)
echo.

REM Activate virtual environment
echo [2/8] Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Gagal aktivasi virtual environment
    pause
    exit /b 1
)
echo [OK] Virtual environment activated
echo.

REM Upgrade pip
echo [3/8] Upgrading pip...
python -m pip install --upgrade pip --quiet
echo [OK] pip upgraded
echo.

REM Install Flask
echo [4/8] Installing Flask...
python -m pip install Flask==3.0.0 --quiet
if errorlevel 1 (
    python -m pip install Flask --quiet
)
echo [OK] Flask installed
echo.

REM Install APScheduler
echo [5/8] Installing APScheduler...
python -m pip install APScheduler==3.10.4 --quiet
if errorlevel 1 (
    python -m pip install APScheduler --quiet
)
echo [OK] APScheduler installed
echo.

REM Install other dependencies
echo [6/8] Installing other dependencies...
python -m pip install Werkzeug python-dateutil mutagen --quiet
echo [OK] Dependencies installed
echo.

REM Install audio backend
echo [7/8] Installing audio backend (playsound)...
python -m pip install playsound --quiet
if errorlevel 1 (
    echo WARNING: playsound gagal install
    echo Mencoba install pygame...
    python -m pip install pygame --quiet
    if errorlevel 1 (
        echo WARNING: pygame juga gagal install
        echo Aplikasi tetap bisa jalan, tapi audio mungkin tidak berfungsi
        echo.
        echo Solusi:
        echo 1. Install Visual C++ Redistributable
        echo 2. Download pygame wheel file
        echo 3. Atau gunakan audio backend lain
        echo.
    )
)
echo [OK] Audio backend installed
echo.

REM Setup audio player
if exist "audio_player_alternative.py" (
    echo Setting up audio player...
    copy /Y audio_player_alternative.py audio_player.py >nul 2>&1
    echo [OK] Audio player configured
    echo.
)

REM Initialize database
echo [8/8] Initializing database...
python database.py
if errorlevel 1 (
    echo ERROR: Gagal initialize database
    pause
    exit /b 1
)
echo [OK] Database initialized
echo.

echo ==========================================
echo INSTALLATION COMPLETE!
echo ==========================================
echo.
echo Audio backend: 
python -c "try: import audio_player; print(audio_player.AUDIO_BACKEND); except: print('Not detected')" 2>nul
echo.
echo To start the application:
echo   1. venv\Scripts\activate
echo   2. python app.py
echo.
echo Or simply run: start-app.bat
echo.
echo Access the app at: http://localhost:5000
echo.

REM Create start-app.bat
echo @echo off > start-app.bat
echo call venv\Scripts\activate >> start-app.bat
echo python app.py >> start-app.bat
echo pause >> start-app.bat

echo [OK] Created start-app.bat for easy startup
echo.

pause
