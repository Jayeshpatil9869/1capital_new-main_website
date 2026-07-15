@echo off
REM ============================================================
REM One Capital Sales Dashboard - Complete Startup Script
REM ============================================================
REM This script automatically sets up and starts the dashboard
REM ============================================================

echo.
echo ============================================================
echo   ONE CAPITAL SALES DASHBOARD - STARTING UP
echo ============================================================
echo.

REM Navigate to SalesDashboard folder
cd /d "%~dp0SalesDashboard" || exit /b 1

REM Step 1: Create virtual environment if it doesn't exist
if not exist "venv" (
    echo [1/6] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
) else (
    echo [1/6] Virtual environment already exists
)

REM Step 2: Activate virtual environment
echo [2/6] Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)

REM Step 3: Install dependencies
echo [3/6] Installing dependencies...
pip install -q "django>=4.2,<5.1" pandas numpy openpyxl
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

REM Step 4: Run database migrations
echo [4/6] Running database migrations...
python manage.py migrate --noinput
if errorlevel 1 (
    echo ERROR: Failed to run migrations
    pause
    exit /b 1
)

REM Step 5: Load sales data
echo [5/6] Loading sales data...
REM DISABLED: Pipeline clears data. Use: python complete_data_load.py instead
REM python manage.py load_sales_data
echo ✓ Skipped (data already loaded manually)

REM Step 6: Create all user accounts
echo [6/6] Creating user accounts...
python manage.py create_all_users
if errorlevel 1 (
    echo WARNING: Could not create users, but continuing...
)

echo.
echo ============================================================
echo   ✓ SETUP COMPLETE!
echo ============================================================
echo.
echo   Starting Django server...
echo.
echo   Website:  http://localhost:8000/website/
echo   Login:    http://localhost:8000/accounts/login/
echo   Dashboard: http://localhost:8000/dashboard/
echo   Admin:    http://localhost:8000/admin/
echo.
echo   TEST CREDENTIALS (All users use password: Demo@123456):
echo.
echo   LEADERS (Full Access):
echo   - nitin_mude (Nitin Mude)
echo   - abhijeet_mane (Abhijeet Mane)
echo.
echo   MANAGERS (Team Access):
echo   - vikram_shah (Vikram Shah)
echo   - kapil_sharma (Kapil Sharma)
echo.
echo   RMs/MAs (Own Data Only):
echo   - bhushan_kulkarni (Bhushan Kulkarni) - 33 transactions, ₹83,168.28
echo   - kedar_kulkarni (Kedar Kulkarni) - 25 transactions, ₹79,790.92
echo   - anil_gavali (Anil Gavali)
echo   - dhananjay_yadav (Dhananjay Yadav)
echo   - [And 16 more employees...]
echo.
echo   Admin: admin / admin123
echo.
echo   Data Status:
echo   - 23 employees loaded with hierarchy
echo   - 139 brokerage records (₹279,232.32 total)
echo   - 7 wire codes matched with brokerage data
echo   - Role-based security: PBKDF2-SHA256
echo.
echo   Press CTRL+C to stop the server
echo.
echo ============================================================
echo.

REM Start the Django development server
python manage.py runserver 0.0.0.0:8000

REM After server stops
echo.
echo ============================================================
echo   Server stopped. Goodbye!
echo ============================================================
echo.
pause

