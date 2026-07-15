# One Capital Sales Dashboard - Quick Start Script (PowerShell)
# Run this in PowerShell to set up the environment

Write-Host ""
Write-Host "=========================================="
Write-Host "One Capital Sales Dashboard - Setup"
Write-Host "=========================================="
Write-Host ""

# Step 1: Create/check virtual environment
if (-not (Test-Path "venv")) {
    Write-Host "[1/5] Creating virtual environment..."
    python -m venv venv
} else {
    Write-Host "[1/5] Virtual environment already exists"
}

# Step 2: Activate virtual environment
Write-Host "[2/5] Activating virtual environment..."
& "venv\Scripts\Activate.ps1"

# Step 3: Install dependencies
Write-Host "[3/5] Installing dependencies..."
pip install -q django==5.2.7 pandas numpy

# Step 4: Run migrations
Write-Host "[4/5] Running database migrations..."
python manage.py migrate --noinput

# Step 5: Load sales data
Write-Host "[5/5] Loading sales data..."
python manage.py load_sales_data

Write-Host ""
Write-Host "=========================================="
Write-Host "Setup Complete!"
Write-Host "=========================================="
Write-Host ""
Write-Host "To start the server, run:"
Write-Host "  python manage.py runserver"
Write-Host ""
Write-Host "Then access:"
Write-Host "  Website:  http://localhost:8000/website/"
Write-Host "  Login:    http://localhost:8000/accounts/login/"
Write-Host "  Admin:    http://localhost:8000/admin/"
Write-Host ""
Write-Host "Default Credentials:"
Write-Host "  Admin User: admin / admin123"
Write-Host "  RM User: anil_gavali / RM@123456"
Write-Host "  MA User: rahul_khot / MA@123456"
Write-Host ""
