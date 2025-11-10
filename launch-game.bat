@echo off
echo ===================================
echo   KINGS FIELD - DUNGEON CRAWLER
echo ===================================
echo.
echo Starting game server...

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Check for Electron
npm list electron >nul 2>&1
if errorlevel 1 (
    echo Installing Electron...
    npm install --save-dev electron electron-builder
)

REM Build the game
echo Building game assets...
call npm run build

REM Launch based on parameter
if "%1"=="--electron" (
    echo Launching standalone app with Electron...
    npm run electron
) else (
    REM Launch in browser with Vite
    echo Launching in browser...
    echo Game will open at http://localhost:5173
    echo.
    echo Controls:
    echo   S/Down - Move Forward
    echo   W/Up - Move Backward
    echo   A/Left - Move Left
    echo   D/Right - Move Right
    echo   SPACE - Jump
    echo   Q - Attack
    echo   F - Fire Spell
    echo   SHIFT - Toggle Sprint
    echo   ESC - Menu
    echo.
    npm run dev
)

pause