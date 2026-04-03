@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo   Elite Marketplace MASTER REPAIR ^& DEPLOY 🏰🔧
echo ============================================================
echo.

:: 1. Fix Messy Folder Naming in Marketplace
echo [1/5] Checking for directory naming errors...
if exist "marketplace\{api,backend" (
    echo [!] Found messy folder: marketplace\{api,backend
    echo [!] Restructuring to standard format...
    
    :: Move contents of the messy nested structure to root temporary locations
    if exist "marketplace\{api,backend\src" (
        xcopy "marketplace\{api,backend\src\*" "backend\src\" /E /H /C /I /Y >nul
    )
    
    :: Clean up the mess
    rmdir /s /q "marketplace\{api,backend"
    echo [OK] Messy folders resolved.
)

:: 2. Sync Elite Version to Root
echo [2/5] Synchronizing Elite features to project root...
if exist "marketplace" (
    xcopy "marketplace\backend\*" "backend\" /E /H /C /I /Y >nul
    xcopy "marketplace\frontend\*" "frontend\" /E /H /C /I /Y >nul
    copy "marketplace\vercel.json" "vercel.json" /Y >nul
    echo [OK] Synchronization complete.
)

:: 3. Prisma Generation
echo [3/5] Regenerating Database Client...
call npx prisma generate --schema=backend/prisma/schema.prisma

:: 4. Git Backup
echo [4/5] Backing up changes to Git...
git add .
git commit -m "fix: master restoration, fixed directory naming and 404 routing errors"
git push origin main

:: 5. Vercel Deployment
echo [5/5] Final Upload to Vercel (Elite Sync)...
call npx vercel --prod --yes

echo.
echo ============================================================
echo   MASTER REPAIR FINISHED! 🚀
echo   Your site should now be live at: https://mplace.vercel.app
echo ============================================================
pause
