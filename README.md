# Kings Field Game

A King's Field-inspired first-person dungeon crawler built with Three.js.

## Features (Planned)

- First-person exploration
- Grid-based movement
- Atmospheric dungeon environments
- Combat system
- Inventory and items
- Magic system

## Development

```bash
npm install
npm run dev
```

## Recent Fixes

### WebGL Texture Unit Limit (Fixed: 2025-11-08)

**Issue**: Game rendered only UI, no 3D geometry visible. Console showed:
```
THREE.WebGLProgram: Shader Error - FRAGMENT shader texture image units count exceeds MAX_TEXTURE_IMAGE_UNITS(16)
```

**Root Cause**:
- Creating unique materials for every floor/wall/ceiling tile (thousands of materials)
- Shadow-casting lights consuming texture units for shadow maps
- Combined texture usage exceeded WebGL's 16 texture unit limit per shader

**Solution**:
- Implemented material caching in `DungeonBuilder` to reuse materials by color/properties
- Disabled shadow mapping globally to reduce texture unit consumption
- Added `getCachedMaterial()` method to prevent duplicate material creation
- Material count reduced from thousands to dozens

**Files Changed**: `src/DungeonBuilder.js`, `src/main.js`

## Parallel Development with Multiple Claude Instances

This project is set up for parallel development using git worktrees and multiple Claude Code instances!

### Launch 3 Claude Instances Side-by-Side

**Quick Start (Auto-launch):**
```bash
./launch-parallel-claude-auto.sh
```

This opens iTerm2 with 3 vertical panes, each running Claude Code in a different feature branch:
- **Pane 1**: Movement & Controls (`feature-movement`)
- **Pane 2**: Environment & Dungeons (`feature-environment`)
- **Pane 3**: Combat System (`feature-combat`)

### How It Works

Each Claude instance works independently on its own feature branch using git worktrees. This allows simultaneous development on multiple features without conflicts.

See [PARALLEL_DEVELOPMENT.md](PARALLEL_DEVELOPMENT.md) for detailed instructions.
