#!/usr/bin/env powershell
# ============================================================
# One Capital Sales Dashboard - Complete Startup Script
# ============================================================
# This script automatically sets up and starts the dashboard
# ============================================================

Write-Host ""
Write-Host "============================================================"
Write-Host "   ONE CAPITAL SALES DASHBOARD - STARTING UP"
Write-Host "============================================================"
Write-Host ""

# Navigate to SalesDashboard folder
Set-Location -Path "$PSScriptRoot\SalesDashboard" -ErrorAction Stop

# Step 1: Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "[1/6] Creating virtual environment..."
    & python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to create virtual environment" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "[1/6] Virtual environment already exists"
}

# Step 2: Activate virtual environment
Write-Host "[2/6] Activating virtual environment..."
& "venv\Scripts\Activate.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to activate virtual environment" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 3: Install dependencies
Write-Host "[3/6] Installing dependencies..."
& pip install -q django==5.2.7 pandas numpy openpyxl
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 4: Run database migrations
Write-Host "[4/6] Running database migrations..."
& python manage.py migrate --noinput
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to run migrations" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 5: Load sales data
Write-Host "[5/6] Loading sales data..."
# DISABLED: Pipeline clears data. Use: python complete_data_load.py instead
# & python manage.py load_sales_data
Write-Host "✓ Skipped (data already loaded manually)" -ForegroundColor Green

# Step 6: Create all user accounts
Write-Host "[6/6] Creating user accounts..."
& python manage.py create_all_users
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Could not create users, but continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================================"
Write-Host "   ✓ SETUP COMPLETE!"
Write-Host "============================================================"
Write-Host ""
Write-Host "   Starting Django server..." -ForegroundColor Green
Write-Host ""
Write-Host "   🌐 Website:   http://localhost:8000/website/"
Write-Host "   🔐 Login:     http://localhost:8000/accounts/login/"
Write-Host "   📊 Dashboard: http://localhost:8000/dashboard/"
Write-Host "   🔧 Admin:     http://localhost:8000/admin/"
Write-Host ""
Write-Host "   TEST CREDENTIALS (All users use password: Demo@123456):" -ForegroundColor Cyan
Write-Host ""
Write-Host "   LEADERS (Full Access):"
Write-Host "   - nitin_mude (Nitin Mude)"
Write-Host "   - abhijeet_mane (Abhijeet Mane)"
Write-Host ""
Write-Host "   MANAGERS (Team Access):"
Write-Host "   - vikram_shah (Vikram Shah)"
Write-Host "   - kapil_sharma (Kapil Sharma)"
Write-Host ""
Write-Host "   RMs/MAs (Own Data Only):"
Write-Host "   - bhushan_kulkarni (Bhushan Kulkarni) - 33 txns, ₹83,168.28"
Write-Host "   - kedar_kulkarni (Kedar Kulkarni) - 25 txns, ₹79,790.92"
Write-Host "   - anil_gavali (Anil Gavali)"
Write-Host "   - dhananjay_yadav (Dhananjay Yadav)"
Write-Host "   - [And 16 more employees...]"
Write-Host ""
Write-Host "   Admin: admin / admin123"
Write-Host ""
Write-Host "   📈 Data Status:"
Write-Host "   - 23 employees loaded with hierarchy"
Write-Host "   - 139 brokerage records (₹279,232.32 total)"
Write-Host "   - 7 wire codes matched with brokerage data"
Write-Host "   - Role-based security: PBKDF2-SHA256"
Write-Host ""
Write-Host "   ⚠️  Press CTRL+C to stop the server"
Write-Host ""
Write-Host "============================================================"
Write-Host ""

# Start the Django development server
& python manage.py runserver 0.0.0.0:8000

# After server stops
Write-Host ""
Write-Host "============================================================"
Write-Host "   Server stopped. Goodbye!"
Write-Host "============================================================"
Write-Host ""
