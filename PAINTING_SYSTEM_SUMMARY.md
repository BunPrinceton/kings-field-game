# Painting System Implementation Summary

## Overview

The painting rendering system allows you to place textured paintings with decorative frames on dungeon walls. The system supports multiple frame styles, automatic wall placement, gallery lighting, and intelligent variety management.

## Files Created

### 1. `/src/Painting.js` - Individual Painting Class

**Purpose**: Represents a single painting instance with texture, frame, and lighting.

**Key Features**:
- Loads painting textures from image files
- Creates plane geometry for the canvas
- Generates 3D frame meshes around the painting
- Supports 4 frame styles: ornate, simple, rustic, gothic
- Optional SpotLight for gallery lighting effect
- Wall placement with automatic rotation based on normal
- Fallback rendering for missing textures

**Frame Styles**:

1. **Simple Frame** - Basic wooden frame with rounded edges
   - Color: Dark wood (0x4a3020)
   - Thickness: 0.08 units
   - Depth: 0.05 units
   - Material: Wood with high roughness, no metalness

2. **Ornate Frame** - Extruded gold frame with bevels
   - Color: Gold (0xd4af37)
   - Thickness: 0.12 units
   - Depth: 0.08 units
   - Material: Metallic with emissive glow
   - Features: Beveled edges, extruded geometry

3. **Rustic Frame** - Dark weathered wood with slight irregularity
   - Color: Very dark wood (0x2a1a0a)
   - Thickness: 0.10 units
   - Depth: 0.06 units
   - Material: Very rough wood
   - Features: Slight random rotation for aged look

4. **Gothic Frame** - Black iron frame with pointed corners
   - Color: Black metal (0x1a1a1a)
   - Thickness: 0.06 units (slimmer)
   - Depth: 0.04 units
   - Material: Metallic iron
   - Features: Pointed cone decorations at corners

**Methods**:
- `async load()` - Load texture and create geometry
- `placeOnWall(position, normal, offsetFromWall)` - Position on wall
- `setFrameStyle(style)` - Change frame style
- `setSize(width, height)` - Resize painting
- `dispose()` - Clean up resources

### 2. `/src/PaintingGallery.js` - Gallery Management System

**Purpose**: Manages the collection of available paintings, tracks placement, ensures variety, and provides random selection.

**Key Features**:
- Loads paintings from manifest.json
- Organizes paintings by category (portrait, landscape, creature, abstract)
- Weighted random selection based on rarity and usage frequency
- Tracks recently placed paintings to ensure variety
- Prevents painting repetition within configurable distance
- Supports both image-based and procedurally generated paintings
- Automatic dimension calculation from image size
- Frame style selection based on category

**Configuration**:
- `minRepeatDistance`: 5 rooms (prevents same painting appearing too often)
- Rarity weights: common (10), uncommon (5), rare (2), legendary (1)
- Usage penalty: Recently used paintings are less likely to appear

**Methods**:
- `async loadManifest()` - Load painting manifest
- `getRandomPainting(category, ensureVariety)` - Get random painting
- `getPaintingById(id)` - Get specific painting
- `getAllPaintings()` - Get all available paintings
- `getPaintingsByCategory(category)` - Filter by category
- `async placePainting(paintingData, position, normal, frameStyle)` - Create and place
- `removePainting(position)` - Remove placed painting
- `getStats()` - Usage statistics
- `dispose()` - Clean up all paintings

### 3. `/src/PaintingSystemExample.js` - Usage Examples

**Purpose**: Demonstrates how to use the painting system in your game.

**Examples Included**:
- `initializePaintingSystem(scene)` - Basic setup
- `placePaintingsInDungeon(gallery, dungeonData, cellSize)` - Auto-placement
- `testFrameStyles(gallery, scene)` - Test all 4 frame styles
- `performanceTest(gallery, scene, count)` - Performance testing
- `printGalleryStats(gallery)` - Usage statistics

### 4. `/public/assets/paintings/manifest.json` - Painting Database

**Purpose**: JSON database of available paintings.

**Current Content**:
- 142 total paintings
- 82 portraits (classical artwork)
- 60 landscapes (medieval and PS1-style RPG backgrounds)
- All images are CC0 licensed (public domain)

**Manifest Format**:
```json
{
  "id": "portrait_king",
  "name": "The Forgotten King",
  "category": "portrait",
  "path": "portraits/forgotten_king.jpg",
  "dimensions": "200x200",
  "style": "classical",
  "license": "CC0"
}
```

**Auto-Generated Fields** (if missing):
- `width` - Calculated from dimensions (0.8-1.8m)
- `height` - Calculated from dimensions (0.8-1.4m)
- `rarity` - Defaults to "common"
- `frameStyle` - Auto-selected based on category
- `hasLight` - Defaults to true

## How Painting Placement Works

### Wall Placement Algorithm

1. **Position Calculation**:
   - Takes world position (x, y, z)
   - Takes wall normal vector (direction wall faces)
   - Offsets painting slightly from wall (default 0.02 units) to prevent z-fighting

2. **Rotation**:
   - Calculates angle from wall normal: `angle = Math.atan2(normal.x, normal.z)`
   - Rotates painting to face outward from wall
   - Ensures painting is always readable from the room

3. **Height**:
   - Default placement at eye level (1.5 units / ~5 feet)
   - Adjustable per-painting

4. **Collision Prevention**:
   - Small offset prevents texture flickering (z-fighting)
   - Paintings placed after walls are built

### Example Placement Code

```javascript
// Initialize gallery
const gallery = new PaintingGallery(scene);
await gallery.loadManifest();

// Get a random portrait
const paintingData = gallery.getRandomPainting('portrait');

// Place on north wall
const position = new THREE.Vector3(5, 1.5, 10);
const normal = new THREE.Vector3(0, 0, 1); // Facing south

const painting = await gallery.placePainting(paintingData, position, normal);
```

### Automatic Dungeon Placement

The example file includes `placePaintingsInDungeon()` which:
- Analyzes room size and type
- Selects appropriate painting categories
- Finds valid wall positions
- Avoids doorways
- Scales painting count based on room size

## Performance Considerations

### Optimizations Implemented

1. **Texture Management**:
   - Mipmaps enabled for all paintings
   - Linear filtering for smooth appearance at angles
   - Anisotropic filtering (4x) for better quality on walls
   - Texture compression supported (browser-dependent)

2. **Geometry**:
   - Simple plane geometry for canvas (2 triangles)
   - Minimal frame geometry (box primitives or simple extrusions)
   - Shared materials where possible
   - Proper disposal of unused resources

3. **Memory**:
   - Texture cache prevents duplicate loading
   - Material reuse for same frame styles
   - Proper cleanup with `dispose()` methods
   - Usage tracking to identify memory-heavy paintings

4. **Rendering**:
   - Paintings don't cast shadows (optional)
   - SpotLights have limited range (3 units)
   - Low-intensity lights (0.3) for subtle effect
   - No real-time updates needed after placement

### Performance Metrics

**Memory per Painting**:
- Texture: ~200KB - 1MB (depending on image size)
- Geometry: ~1KB
- Materials: ~0.5KB (shared)
- Lights: ~0.1KB
- **Total**: ~200KB - 1MB per unique painting

**Recommended Limits**:
- Small dungeon (10-20 rooms): 10-20 paintings
- Medium dungeon (30-50 rooms): 30-50 paintings
- Large dungeon (50+ rooms): 50-100 paintings

**LOD System** (Not yet implemented, future consideration):
- Could remove/hide paintings beyond certain distance
- Could reduce texture quality for distant paintings
- Could disable lights for far paintings

## Issues and Limitations

### Current Limitations

1. **No Dynamic LOD**:
   - All paintings render at full quality regardless of distance
   - Could impact performance with 100+ paintings
   - Mitigation: Limit painting count, use texture compression

2. **Static Placement**:
   - Paintings cannot be moved after placement
   - Requires removal and re-placement to change
   - Not an issue for static dungeons

3. **No Interaction**:
   - Paintings are purely decorative
   - No hover tooltips or descriptions
   - No zoom/inspect functionality
   - Could be added later if needed

4. **Frame Complexity**:
   - Ornate frames use ExtrudeGeometry which is more expensive
   - Could simplify for mobile/low-end devices
   - Currently ~50-100 triangles per ornate frame

5. **Lighting Performance**:
   - Each painting can have a SpotLight
   - 50 paintings = 50 lights (can impact performance)
   - Mitigation: Disable lights on far paintings, or don't add lights

### Known Issues

1. **Z-Fighting Risk**:
   - Very small offset (0.02) might still show z-fighting on some GPUs
   - Increase offset if flickering occurs
   - Default offset is conservative to prevent paintings floating too far

2. **Aspect Ratio**:
   - Auto-sizing from dimensions might not be perfect for all images
   - Can override with manual width/height in manifest
   - Works well for square and standard aspect ratios

3. **Missing Textures**:
   - If image file doesn't exist, painting shows as dark gray rectangle
   - Frame still renders correctly
   - Console warning logged

4. **Procedural Fallback**:
   - Procedural generation is basic (abstract patterns)
   - Not as visually interesting as real images
   - Good for placeholder/testing

## Integration with Main Game

### In main.js or DungeonBuilder

```javascript
import { PaintingGallery } from './PaintingGallery.js';
import { placePaintingsInDungeon } from './PaintingSystemExample.js';

// After dungeon is built
async function setupPaintings() {
    const gallery = new PaintingGallery(game.scene);
    await gallery.loadManifest();

    // Place paintings automatically
    await placePaintingsInDungeon(gallery, game.dungeon.data, 4);

    // Store reference for cleanup
    game.paintingGallery = gallery;
}

// In cleanup/disposal
function cleanup() {
    if (game.paintingGallery) {
        game.paintingGallery.dispose();
    }
}
```

### Manual Placement Example

```javascript
// Place specific painting on specific wall
const paintingData = gallery.getPaintingById('portrait_king');
const position = new THREE.Vector3(10, 1.5, 5);
const normal = new THREE.Vector3(1, 0, 0); // East-facing wall

await gallery.placePainting(paintingData, position, normal, 'ornate');
```

## Testing

### Test All Frame Styles

```javascript
import { testFrameStyles } from './PaintingSystemExample.js';

const paintings = await testFrameStyles(gallery, scene);
// Creates 4 paintings in a row, each with different frame
```

### Performance Test

```javascript
import { performanceTest } from './PaintingSystemExample.js';

const paintings = await performanceTest(gallery, scene, 50);
// Places 50 paintings in a circle, measures load time
```

### Statistics

```javascript
import { printGalleryStats } from './PaintingSystemExample.js';

printGalleryStats(gallery);
// Logs: total paintings, placed count, categories, most used
```

## Future Enhancements

### Potential Additions

1. **Interactive Paintings**:
   - Hover to show title/description
   - Click to zoom/inspect
   - Hidden messages or clues in paintings

2. **Dynamic Effects**:
   - Flickering lights for atmosphere
   - Slight canvas movement (wind effect)
   - Dust particles in light beams

3. **Advanced Frames**:
   - Damaged/broken frame variants
   - Animated particles around magical paintings
   - Different materials (silver, bronze, carved stone)

4. **Gameplay Integration**:
   - Collectible paintings
   - Puzzle paintings (arrange in order)
   - Paintings as portals or secrets

5. **Performance**:
   - LOD system for distant paintings
   - Texture streaming
   - Instanced frames for identical styles

## Conclusion

The painting system is fully functional and ready to use. It provides:

- 142 pre-loaded paintings with real artwork
- 4 distinct frame styles with appropriate materials
- Intelligent variety management
- Easy wall placement with automatic rotation
- Good performance characteristics
- Clean resource management

The system integrates cleanly with the existing dungeon generation and can be easily extended with additional features as needed.
