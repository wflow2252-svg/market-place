@echo off
echo =======================================
echo 1. Installing all required packages...
echo =======================================
call npm run install:all

echo.
echo =======================================
echo 2. Starting the project... (Frontend and Backend)
echo =======================================
call npm run dev

pause
