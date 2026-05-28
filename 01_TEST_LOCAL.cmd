@echo off
cd /d "%~dp0"
echo [1/3] Installing dependencies...
call npm.cmd install
if errorlevel 1 goto error

echo [2/3] Building project...
call npm.cmd run build
if errorlevel 1 goto error

echo [3/3] Starting local server...
echo Open http://localhost:5173
call npm.cmd run dev
goto end

:error
echo.
echo ERROR occurred. Take a screenshot and send it to ChatGPT.
pause
exit /b 1

:end
pause
