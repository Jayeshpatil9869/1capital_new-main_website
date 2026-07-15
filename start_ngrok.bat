@echo off
REM ============================================================
REM NGROK Tunnel Starter - Make Your Dashboard Public
REM ============================================================
REM Run this in a separate terminal while Django is running
REM ============================================================

echo.
echo ============================================================
echo   NGROK TUNNEL STARTER
echo ============================================================
echo.

REM Check if ngrok is installed
where ngrok >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: ngrok is not installed or not in PATH
    echo.
    echo Please install ngrok from: https://ngrok.com/download
    echo.
    echo After installation:
    echo 1. Extract ngrok.exe
    echo 2. Add to PATH or move to System32
    echo.
    pause
    exit /b 1
)

echo [✓] ngrok found!
echo.

echo Make sure Django server is running on port 8000:
echo   python manage.py runserver 0.0.0.0:8000
echo.

REM Create a config file for ngrok
echo [1] Starting ngrok tunnel...
echo.

REM Start ngrok
echo ============================================================
echo   NGROK IS STARTING
echo ============================================================
echo.
echo Your dashboard will be accessible at:
echo   https://YOUR_NGROK_URL/website/
echo.
echo ============================================================
echo.

ngrok http 8000

echo.
echo ============================================================
echo   Tunnel closed
echo ============================================================
echo.
pause
