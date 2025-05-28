@echo off
echo Starting local server for ROGemPick Calculator...
echo.
echo Once the server starts, open your browser and navigate to:
echo http://localhost:8000
echo.
echo Press Ctrl+C to stop the server when done.
echo.

REM Check if Python 3 is available
python --version 2>NUL
if %ERRORLEVEL% EQU 0 (
    echo Using Python to start server...
    python -m http.server 8000
    goto :eof
)

REM Check if Python 2 is available
python2 --version 2>NUL
if %ERRORLEVEL% EQU 0 (
    echo Using Python 2 to start server...
    python2 -m SimpleHTTPServer 8000
    goto :eof
)

REM Check if py launcher is available
py --version 2>NUL
if %ERRORLEVEL% EQU 0 (
    echo Using Python launcher to start server...
    py -m http.server 8000
    goto :eof
)

echo Python not found. Please install Python or use another web server.
echo Press any key to exit...
pause > NUL
