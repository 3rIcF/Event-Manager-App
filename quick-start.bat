@echo off
echo ========================================
echo    Event Manager App - Quick Start
echo ========================================
echo.
echo This script will set up and start your Event Manager App
echo.
echo Prerequisites:
echo - Node.js 16+ must be installed
echo - npm must be available
echo.
echo Press any key to continue...
pause >nul

echo.
echo Step 1: Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo.
    echo Error: Failed to install dependencies
    echo Please check your Node.js installation
    pause
    exit /b 1
)

echo.
echo Step 2: Starting development server...
echo The app will open in your browser at http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
npm start

pause
