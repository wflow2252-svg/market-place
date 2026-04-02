@echo off
echo =======================================
echo Updating Marketplace Project Files
echo =======================================

echo 1. Backing up old backend...
ren backend backend_old

echo 2. Moving new API and Backend...
move "project\api" "api"
move "project\backend" "backend"

echo 3. Moving configuration files...
move "project\vercel.json" "vercel.json"
move "project\.env.example" ".env.example"

echo 4. Moving frontend files...
move "project\Login.jsx" "frontend\src\pages\Login.jsx"
move "project\Login.css" "frontend\src\pages\Login.css"
move "project\Signup.jsx" "frontend\src\pages\Signup.jsx"
move "project\Signup.css" "frontend\src\pages\Signup.css"
move "project\Navbar.jsx" "frontend\src\components\Navbar.jsx"

echo =======================================
echo Merge Complete!
echo You can now delete "fixed_project" and "project" folders if you want.
echo =======================================
pause
