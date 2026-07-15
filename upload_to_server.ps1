# PowerShell script to upload SalesDashboard project to server
# Usage: .\upload_to_server.ps1

# Configuration
$SERVER_IP = "72.61.141.247"
$SERVER_USER = "root"
$DESTINATION_PATH = "/root/SalesDashboard"  # Change this to your desired path
$PROJECT_PATH = Get-Location  # Current directory

# Colors for output
$SUCCESS = "Green"
$ERROR_COLOR = "Red"
$INFO = "Yellow"

Write-Host "Starting upload of SalesDashboard project..." -ForegroundColor $INFO
Write-Host "From: $PROJECT_PATH" -ForegroundColor $INFO
Write-Host "To: $SERVER_USER@$SERVER_IP:$DESTINATION_PATH" -ForegroundColor $INFO
Write-Host ""

# Check if SSH is available
try {
    $sshCheck = ssh.exe -V 2>&1
    Write-Host "SSH found: $sshCheck" -ForegroundColor $SUCCESS
} catch {
    Write-Host "ERROR: SSH is not available. Please install OpenSSH." -ForegroundColor $ERROR_COLOR
    exit 1
}

# Option 1: Using SCP to copy directory
Write-Host ""
Write-Host "Uploading project files via SCP..." -ForegroundColor $INFO

# SCP command to upload entire project
$scpCommand = "scp.exe -r `"$PROJECT_PATH`" `"$($SERVER_USER)@$($SERVER_IP):$DESTINATION_PATH`""

Write-Host "Command: $scpCommand" -ForegroundColor $INFO
Write-Host ""

try {
    Invoke-Expression $scpCommand
    Write-Host ""
    Write-Host "✓ Upload completed successfully!" -ForegroundColor $SUCCESS
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor $INFO
    Write-Host "1. SSH into your server: ssh $SERVER_USER@$SERVER_IP" -ForegroundColor $INFO
    Write-Host "2. Navigate to the project: cd $DESTINATION_PATH" -ForegroundColor $INFO
    Write-Host "3. Install dependencies: pip install -r requirements.txt" -ForegroundColor $INFO
    Write-Host "4. Run migrations: python manage.py migrate" -ForegroundColor $INFO
} catch {
    Write-Host "ERROR: Upload failed. $_" -ForegroundColor $ERROR_COLOR
    exit 1
}
