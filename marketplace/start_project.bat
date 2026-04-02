@echo off
echo =======================================
echo    LuxeBrands Marketplace
echo =======================================

echo.
echo [1/2] Installing all packages...
call npm run install:all

echo.
echo [2/2] Starting Frontend and Backend...
call npm run dev

pause
