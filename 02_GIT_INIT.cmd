@echo off
cd /d "%~dp0"
echo Initializing git...
git init
git add .
git commit -m "final clean direct gas app"
echo.
echo Done. Now open GitHub Desktop, Add Local Repository, choose this folder, then Publish repository.
pause
