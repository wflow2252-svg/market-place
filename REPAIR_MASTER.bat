@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo   Elite Marketplace MASTER REPAIR v3.0 (FORCE DEPLOY) 🏰💎
echo ============================================================
echo.

:: 1. SYNC MISSING PAGES (Fix Build Errors)
echo [1/6] Syncing missing files to marketplace...
if exist "frontend\src\pages\Admin.jsx" (
    xcopy "frontend\src\pages\Admin.jsx" "marketplace\frontend\src\pages\" /Y >nul
    xcopy "frontend\src\pages\Admin.css" "marketplace\frontend\src\pages\" /Y >nul
)
if exist "frontend\src\pages\BrandDashboard.jsx" (
    xcopy "frontend\src\pages\BrandDashboard.jsx" "marketplace\frontend\src\pages\" /Y >nul
)

:: 2. BUILD FRONTEND (Fresh Build)
echo [2/6] Building Frontend (marketplace/frontend)...
cd marketplace
cd frontend
call npm install
:: Clean dist
if exist "dist" rmdir /s /q "dist"
call npm run build
cd ..

:: Sync Assets to marketplace root
echo [3/6] Deploying build assets to marketplace root...
if exist "frontend\dist" (
    xcopy "frontend\dist\*" "." /E /H /C /I /Y >nul
)

:: 4. PRISMA SETUP
echo [4/6] Regenerating Prisma locally...
call npx prisma generate --schema=backend/prisma/schema.prisma

:: 5. FINAL FORCE DEPLOY
echo [5/6] Finalizing Vercel Upload (FORCED)...
call npx vercel --prod --yes --force

:: 6. BACK TO BASE AND GIT PUSH
cd ..
echo [6/6] Syncing back to Git...
git add .
git commit -m "fix: total elite restoration v3 - routing and build fixed"
git push origin main

echo.
echo ============================================================
echo   REPAIR FINISHED! 🌈
echo   All systems GO! Check: https://mplace.vercel.app
echo ============================================================
echo.
pause
