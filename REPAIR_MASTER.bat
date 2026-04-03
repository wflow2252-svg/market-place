@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo   Elite Marketplace FINAL MASTER REPAIR v4.0 🏰💎
echo ============================================================
echo.

:: 1. FULL SYNC BASE -> MARKETPLACE (Ensure NO missing files)
echo [1/6] Full synchronization of Backend/Frontend to marketplace...
if exist "backend\src" (
    echo [*] Syncing all Backend Controllers, Routes, and Utils...
    xcopy "backend\src\*" "marketplace\backend\src\" /E /H /C /I /Y >nul
)
if exist "frontend\src\pages" (
    echo [*] Syncing all Frontend Pages...
    xcopy "frontend\src\pages\*" "marketplace\frontend\src\pages\" /E /H /C /I /Y >nul
)

:: 2. FIX DIRECTORY STRUCTURE (Just in case)
echo [2/6] Fixing subdirectory structure...
if exist "marketplace\{api,backend" (
    xcopy "marketplace\{api,backend\src\*" "marketplace\backend\src\" /E /H /C /I /Y >nul
    rmdir /s /q "marketplace\{api,backend"
)

:: 3. BUILD FRONTEND (Vite Production)
echo [3/6] Building Frontend (marketplace/frontend)...
cd marketplace
cd frontend
call npm install
call npm run build
cd ..

:: Sync Assets
if exist "frontend\dist" (
    xcopy "frontend\dist\*" "." /E /H /C /I /Y >nul
)

:: 4. PRISMA SETUP
echo [4/6] Regenerating Prisma Database Client...
call npx prisma generate --schema=backend/prisma/schema.prisma

:: 5. FINAL FORCE DEPLOY
echo [5/6] Finalizing Vercel Upload (FORCED)...
call npx vercel --prod --yes --force

:: 6. BACK TO BASE AND GIT PUSH
cd ..
echo [6/6] Syncing back to Git...
git add .
git commit -m "fix: total elite restoration v4 - full modules sync and routing fix"
git push origin main

echo.
echo ============================================================
echo   REPAIR FINISHED! 🚀
echo   The Master Elite is back! Check: https://mplace.vercel.app
echo ============================================================
echo.
pause
