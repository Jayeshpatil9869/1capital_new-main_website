#!/usr/bin/env powershell
# ============================================================
# NGROK Tunnel Starter - Make Your Dashboard Public
# ============================================================
# Run this in a separate terminal while Django is running
# ============================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   NGROK TUNNEL STARTER" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if ngrok is installed
try {
    $null = ngrok --version
    Write-Host "[✓] ngrok found!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: ngrok is not installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install ngrok from: https://ngrok.com/download" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "After installation:" -ForegroundColor Yellow
    Write-Host "1. Extract ngrok.exe" -ForegroundColor Yellow
    Write-Host "2. Add to PATH or move to System32" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Make sure Django server is running on port 8000:" -ForegroundColor Yellow
Write-Host "  python manage.py runserver 0.0.0.0:8000" -ForegroundColor Gray
Write-Host ""

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   NGROK IS STARTING" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your dashboard will be accessible at:" -ForegroundColor Green
Write-Host "  https://YOUR_NGROK_URL/website/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test credentials (shown in Django terminal):" -ForegroundColor Yellow
Write-Host "  RM:      anil_gavali / RM@123456" -ForegroundColor Gray
Write-Host "  MA:      rahul_khot / MA@123456" -ForegroundColor Gray
Write-Host "  Manager: nm / Manager@123456" -ForegroundColor Gray
Write-Host "  Admin:   admin / admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Start ngrok
& ngrok http 8000

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   Tunnel closed" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
