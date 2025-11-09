# Painting System Quick Reference

## Quick Start

```javascript
import { PaintingGallery } from './PaintingGallery.js';

// 1. Create gallery
const gallery = new PaintingGallery(scene);

// 2. Load paintings
await gallery.loadManifest();

// 3. Place a painting
const painting = gallery.getRandomPainting('portrait');
await gallery.placePainting(
    painting,
    new THREE.Vector3(5, 1.5, 0),  // position
    new THREE.Vector3(0, 0, 1)      // wall normal
);
```

## Frame Styles

| Style | Description | Best For |
|-------|-------------|----------|
| `simple` | Dark wood frame | Common paintings, rustic rooms |
| `ornate` | Gold frame with bevels | Rare paintings, treasure rooms |
| `rustic` | Weathered dark wood | Abandoned areas, dungeons |
| `gothic` | Black iron with spikes | Dark paintings, gothic areas |

## Categories

- `portrait` - Character portraits (82 available)
- `landscape` - Scenery and backgrounds (60 available)
- `creature` - Monsters and beasts (use procedural fallback)
- `abstract` - Abstract art (use procedural fallback)

## Painting Sizes

Auto-calculated from image dimensions:

- **Portraits**: 0.8-1.2m wide, 1.0-1.4m tall
- **Landscapes**: 1.2-1.8m wide, 0.8-1.2m tall
- **Square**: 1.0m x 1.0m

Override in manifest or programmatically with `setSize(width, height)`.

## Wall Normal Vectors

```javascript
// North wall (facing south)
const north = new THREE.Vector3(0, 0, 1);

// South wall (facing north)
const south = new THREE.Vector3(0, 0, -1);

// East wall (facing west)
const east = new THREE.Vector3(-1, 0, 0);

// West wall (facing east)
const west = new THREE.Vector3(1, 0, 0);
```

## Common Patterns

### Random Painting by Category
```javascript
const painting = gallery.getRandomPainting('portrait');
```

### Specific Painting
```javascript
const painting = gallery.getPaintingById('landscape_painting-05');
```

### All Landscapes
```javascript
const landscapes = gallery.getPaintingsByCategory('landscape');
```

### Place with Custom Frame
```javascript
await gallery.placePainting(painting, position, normal, 'ornate');
```

### Remove Painting
```javascript
gallery.removePainting(position);
```

## Performance Tips

1. **Limit Paintings**: ~50 paintings for good performance
2. **Disable Lights**: Set `hasLight: false` for distant paintings
3. **Share Frames**: System automatically reuses frame materials
4. **Cleanup**: Call `gallery.dispose()` when done

## Statistics

```javascript
const stats = gallery.getStats();
console.log(stats.totalPaintings);  // 142
console.log(stats.totalPlaced);     // Number placed
console.log(stats.mostUsed);        // Most frequently used
```

## Files

- `/src/Painting.js` - Individual painting class
- `/src/PaintingGallery.js` - Gallery manager
- `/src/PaintingSystemExample.js` - Usage examples
- `/public/assets/paintings/manifest.json` - Painting database
- `/public/assets/paintings/portraits/` - Portrait images (82)
- `/public/assets/paintings/landscapes/` - Landscape images (60)

## Example: Auto-Place in Dungeon

```javascript
import { placePaintingsInDungeon } from './PaintingSystemExample.js';

// After dungeon is built
await placePaintingsInDungeon(gallery, dungeonData, cellSize);
```

This automatically:
- Analyzes room sizes
- Selects appropriate categories
- Finds valid wall positions
- Avoids doorways
- Ensures variety

## Troubleshooting

**Paintings appear gray**: Missing texture file, check path in manifest

**Z-fighting/flickering**: Increase offset in `placeOnWall()` third parameter

**Wrong orientation**: Check wall normal vector direction

**Low FPS**: Reduce painting count or disable lights (`hasLight: false`)

**No variety**: Reduce `minRepeatDistance` in PaintingGallery constructor
