@echo off
REM One Capital Sales Dashboard - Quick Start Script
REM This script automates the setup process

echo.
echo ==========================================
echo One Capital Sales Dashboard - Setup
echo ==========================================
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo [1/5] Creating virtual environment...
    python -m venv venv
) else (
    echo [1/5] Virtual environment already exists
)

REM Activate virtual environment
echo [2/5] Activating virtual environment...
call venv\Scripts\activate.bat

REM Install/upgrade dependencies
echo [3/5] Installing dependencies...
pip install -q django==5.2.7 pandas numpy

REM Run migrations
echo [4/5] Running database migrations...
python manage.py migrate --noinput

REM Load data
echo [5/5] Loading sales data...
python manage.py load_sales_data

echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo To start the server, run:
echo   python manage.py runserver
echo.
echo Then access:
echo   Website:  http://localhost:8000/website/
echo   Login:    http://localhost:8000/accounts/login/
echo   Admin:    http://localhost:8000/admin/
echo.
echo Default Credentials:
echo   Admin User: admin / admin123
echo   RM User: anil_gavali / RM@123456
echo   MA User: rahul_khot / MA@123456
echo.
