@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo   Elite Marketplace SUBDIRECTORY MASTER REPAIR 🏰💎
echo ============================================================
echo.

:: 1. FIX THE MESSY DIRECTORY FIRST
echo [1/5] Correcting folder names...
if exist "marketplace\{api,backend" (
    xcopy "marketplace\{api,backend\src\*" "marketplace\backend\src\" /E /H /C /I /Y >nul
    rmdir /s /q "marketplace\{api,backend"
)

:: 2. SYNC FRONTEND BUILD
echo [2/5] Building Frontend inside marketplace...
cd marketplace\frontend
call npm install
call npm run build
cd ..

:: Sync Assets to marketplace root
echo [OK] Syncing build assets...
if exist "frontend\dist" (
    xcopy "frontend\dist\*" "." /E /H /C /I /Y >nul
)

:: 3. REGENERATE PRISMA
echo [3/5] Regenerating Prisma locally...
call npx prisma generate --schema=backend/prisma/schema.prisma

:: 4. DEPLOY FROM SUBDIRECTORY (The Magic Move)
echo [4/5] FINAL DEPLOY FROM MARKETPLACE ROOT...
:: We use --prod to bypass any local project.json conflicts
call npx vercel --prod --yes

:: 5. PROJECT ROOT SYNC (For Backup)
cd ..
echo [5/5] Backing up to main Git...
git add .
git commit -m "fix: subdirectory master restoration and routing fix"
git push origin main

echo.
echo ============================================================
echo   REPAIR FINISHED! 🚀
echo   Your Elite Marketplace should be live at: https://mplace.vercel.app
echo   (Wait 30 seconds for Vercel to update)
echo ============================================================
echo.
pause
