#!/bin/bash

echo "==================================="
echo "  KINGS FIELD - DUNGEON CRAWLER"
echo "==================================="
echo ""
echo "Starting game server..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check if Electron is installed
if ! npm list electron >/dev/null 2>&1; then
    echo "Installing Electron..."
    npm install --save-dev electron electron-builder
fi

# Build the game
echo "Building game assets..."
npm run build

# Launch with Electron for standalone app
if [ "$1" == "--electron" ]; then
    echo "Launching standalone app with Electron..."
    npm run electron
else
    # Launch in browser with Vite
    echo "Launching in browser..."
    echo "Game will open at http://localhost:5173"
    echo ""
    echo "Controls:"
    echo "  S/↓ - Move Forward"
    echo "  W/↑ - Move Backward"
    echo "  A/← - Move Left"
    echo "  D/→ - Move Right"
    echo "  SPACE - Jump"
    echo "  Q - Attack"
    echo "  F - Fire Spell"
    echo "  SHIFT - Toggle Sprint"
    echo "  ESC - Menu"
    echo ""
    npm run dev
fi