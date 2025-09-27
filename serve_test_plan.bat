@echo off
echo 🚀 Starting Test Plan Download Server...
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.6+ and try again
    pause
    exit /b 1
)

REM Check if required files exist
if not exist "test_plan.csv" (
    echo ❌ test_plan.csv not found
    pause
    exit /b 1
)

if not exist "TEST_PLAN.md" (
    echo ❌ TEST_PLAN.md not found
    pause
    exit /b 1
)

if not exist "test_plan_download.html" (
    echo ❌ test_plan_download.html not found
    pause
    exit /b 1
)

echo ✅ All required files found
echo.

REM Start the server
python serve_test_plan.py

pause
