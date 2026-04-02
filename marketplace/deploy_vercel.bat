@echo off
echo =======================================
echo    LuxeBrands Vercel Deployer
echo =======================================

echo.
echo [1/3] Building the Frontend locally...
call npm run build

echo.
echo [2/3] Preparing static and API files for Vercel...
if exist public rmdir /s /q public
mkdir public
xcopy frontend\dist\* public\ /E /H /C /I >nul
copy backend\.env .env /Y >nul

echo.
echo [3/3] Uploading to Vercel... This might take 1-3 minutes.
call npx vercel --prod --yes

echo.
echo Deployment Finished!
pause
