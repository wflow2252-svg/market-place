@echo off
echo =======================================
echo Fixing Backend Missing Files (package.json)
echo =======================================

echo 1. Renaming current incomplete backend...
ren backend backend_new

echo 2. Restoring the original full backend...
ren backend_old backend

echo 3. Applying the new secure files over the old ones...
xcopy /s /e /y "backend_new\*" "backend\"

echo =======================================
echo Fix Complete! 
echo The package.json and node_modules are back.
echo =======================================
pause
