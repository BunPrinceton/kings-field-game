# Kings Field Game Documentation

Welcome to the organized documentation for the Kings Field-inspired dungeon crawler game.

## Documentation Structure

### 📁 [Systems](./systems/)
Core game systems and feature implementations:
- Carpet System - Floor decoration and material optimization
- Tapestry System - Wall decorations and visual enhancements
- Cleaning Props - Environmental props and decorative objects

### 🐛 [Debug Reports](./debug-reports/)
Technical analysis and debugging information:
- Performance audits
- Lighting system analysis
- Controls and input handling reports
- Minimap and viewmodel audits

### 🔧 [Integration Guides](./integration-guides/)
How to integrate and use various systems:
- General integration guide
- Props UI integration
- Tapestry controls integration
- Code examples

### 📝 [Session Summaries](./session-summaries/)
Development logs and task tracking:
- Session summaries
- Tomorrow morning checklists
- Delivery summaries
- Implementation notes

### ⚡ [Quick References](./quick-references/)
Quick access guides for common tasks:
- Carpet system quick reference
- Tapestry system quick reference

## Key Systems Overview

### Movement System
- Grid-based movement with smooth transitions
- Door and portal transitions
- Planned improvements for mouse look and smoother controls

### Rendering Pipeline
- Three.js WebGL renderer
- Material caching to prevent texture unit overflow
- Shadow mapping (currently disabled for optimization)
- Dungeon procedural generation

### Assets
- Textures: High-resolution carpet and tapestry textures
- Models: Cleaning props, decorative objects
- Audio: Sound system integration (in development)

## Current Status

The game is functional with the following recent fixes:
- ✅ Material caching implemented to prevent WebGL crashes
- ✅ Shadow mapping optimization
- ✅ Documentation organized
- 🔄 Movement system improvements in progress
- 🔄 Performance optimization ongoing

## Quick Start

1. Run `npm install` to install dependencies
2. Run `npm run dev` to start the development server
3. Open browser to the provided localhost URL

## Next Steps

See [Tomorrow Morning Checklist](./session-summaries/TOMORROW_MORNING_CHECKLIST.md) for immediate tasks.