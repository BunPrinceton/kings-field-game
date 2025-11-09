# Carpet System Quick Reference

## Files & Locations

### Code Files
- **Main System**: `/mnt/c/Users/benja/Documents/kings-field-game/src/CarpetDecorator.js`
- **Example**: `/mnt/c/Users/benja/Documents/kings-field-game/src/CarpetSystemExample.js`

### Assets
- **Base Path**: `/mnt/c/Users/benja/Documents/kings-field-game/public/assets/carpets/`
- **Manifest**: `public/assets/carpets/manifest.json`
- **Textures**: `public/assets/carpets/textures/`

## Quick Integration

```javascript
// 1. Import
import { CarpetDecorator } from './CarpetDecorator.js';

// 2. Create (after dungeon generation)
const carpetDecorator = new CarpetDecorator(scene, dungeonData);

// 3. Load assets (async - in loading screen)
await carpetDecorator.loadAssets();

// 4. Place carpets
carpetDecorator.decorateRooms();

// 5. (Optional) Get stats
const stats = carpetDecorator.getStats();
console.log(`Placed ${stats.total} carpets`);
```

## Carpet Types

| ID | Color | Style | Room Types | Size |
|----|-------|-------|------------|------|
| dirty_carpet | Brown | Worn | Standard, Storage | 1x1, 2x2 |
| carpet_011 | Yellow | Ornate | Boss, Throne, Landmark | 4x4 |
| carpet_012 | Blue | Plain | Hub, Library, Study | 3x3 |
| carpet_016 | Beige | Textured | Treasure, Safe, Medium | 2x2 |

## Configuration

```javascript
{
    cellSize: 4,              // Match your dungeon grid
    carpetDensity: 0.35,      // 35% of rooms get carpets
    basePath: '/assets/carpets/'
}
```

## Room Type → Carpet Mapping

- **Boss/Landmark** → Grand 4x4 Yellow (Carpet011)
- **Hub** → Large 3x3 Blue (Carpet012)
- **Treasure/Safe** → Medium 2x2 Beige (Carpet016)
- **Standard** → Small 1-2x1-2 Brown (Dirty)

## Size Requirements

- **4x4 Grand**: Room must be ≥6×6 units
- **3x3 Large**: Room must be ≥5×5 units
- **2x2 Medium**: Any room
- **1x1 Small**: Any room

## Common Commands

### Clear All Carpets
```javascript
carpetDecorator.clearCarpets();
```

### Get Statistics
```javascript
const stats = carpetDecorator.getStats();
// Returns: { total: 15, byType: { dirty_carpet: 8, carpet_011: 2, ... } }
```

### Change Density
```javascript
const carpetDecorator = new CarpetDecorator(scene, dungeonData, {
    carpetDensity: 0.5  // 50% of rooms
});
```

## Asset Info

### Total Size
119 MB (4 texture sets)

### Individual Sizes
- dirty_carpet: 15 MB
- carpet_011: 40 MB
- carpet_012: 35 MB
- carpet_016: 30 MB

### PBR Maps (each set)
- Diffuse/Color
- Normal (GL)
- Roughness
- Ambient Occlusion
- Displacement (ambientCG only)

## Troubleshooting

### Carpets Not Appearing
1. Check `await carpetDecorator.loadAssets()` completed
2. Verify asset path: `/assets/carpets/`
3. Check browser console for texture load errors
4. Ensure `decorateRooms()` called after `loadAssets()`

### Z-Fighting with Floor
- Carpets positioned at Y=0.01 (should be above floor)
- If issue persists, adjust in `createCarpet()` method

### Performance Issues
- Lower `carpetDensity` (e.g., 0.2 instead of 0.35)
- Reduce texture resolution (use 1K instead of 2K)
- Disable displacement maps in material

## License
All assets: CC0 Public Domain (free to use, modify, distribute)

## Credits
- Poly Haven (dirty_carpet)
- ambientCG (carpet_011, 012, 016)
