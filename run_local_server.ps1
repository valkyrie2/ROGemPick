# PowerShell script to run a local server for ROGemPick Calculator

Write-Host "Starting local server for ROGemPick Calculator..." -ForegroundColor Green
Write-Host ""
Write-Host "Once the server starts, open your browser and navigate to:" -ForegroundColor Yellow
Write-Host "http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server when done." -ForegroundColor Yellow
Write-Host ""

# Try to find Python
$pythonFound = $false

# Check for Python 3
try {
    $pythonVersion = python --version 2>&1
    if ($pythonVersion -match "Python 3") {
        Write-Host "Using Python 3 to start server..." -ForegroundColor Green
        python -m http.server 8000
        $pythonFound = $true
        exit
    }
} catch {
    # Python command not found
}

# Check for Python 2
if (-not $pythonFound) {
    try {
        $pythonVersion = python2 --version 2>&1
        if ($pythonVersion -match "Python 2") {
            Write-Host "Using Python 2 to start server..." -ForegroundColor Green
            python2 -m SimpleHTTPServer 8000
            $pythonFound = $true
            exit
        }
    } catch {
        # Python2 command not found
    }
}

# Check for py launcher
if (-not $pythonFound) {
    try {
        $pythonVersion = py --version 2>&1
        if ($pythonVersion -match "Python") {
            Write-Host "Using Python launcher to start server..." -ForegroundColor Green
            py -m http.server 8000
            $pythonFound = $true
            exit
        }
    } catch {
        # py launcher not found
    }
}

if (-not $pythonFound) {
    Write-Host "Python not found. Please install Python or use another web server." -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
