# Tapestry & Banner System

A complete medieval wall decoration system for the King's Field dungeon crawler.

## Overview

The Tapestry Decorator system adds heraldic wall hangings, banners, and tapestries to dungeon walls with procedural placement and realistic cloth simulation.

## Assets Downloaded

### 1. War Banner Model
- **Source**: OpenGameArt.org
- **Path**: `/public/assets/tapestries/models/WarBanner.blend`
- **Format**: Blender (.blend)
- **Status**: ⚠️ Needs conversion to GLB
- **Notes**: Contains animated banner model with cloth simulation

### 2. Heraldic Designs (6 total)
All procedurally created SVG heraldic crests:

| ID | Design | Theme | Colors | Path |
|----|--------|-------|--------|------|
| `dragon_crest` | Red dragon on shield | Royal | Red, Gold | `textures/dragon_crest.svg` |
| `royal_lion` | Crowned lion rampant | Royal | Gold, Blue | `textures/royal_lion.svg` |
| `eagle_emblem` | Eagle with spread wings | Military | Black, Gold | `textures/eagle_emblem.svg` |
| `crown_royal` | Royal crown with jewels | Royal | Gold, Red, Blue | `textures/crown_royal.svg` |
| `sword_cross` | Crossed swords | Military | Silver, Brown | `textures/sword_cross.svg` |
| `castle_fortress` | Fortress castle | Noble | Grey, Brown | `textures/castle_fortress.svg` |

### 3. Fabric Textures (4 total)
Procedural fabric patterns for tapestry backgrounds:

| ID | Material | Color | Quality | Path |
|----|----------|-------|---------|------|
| `red_velvet` | Velvet | Crimson | Royal | `fabrics/red_velvet.svg` |
| `blue_silk` | Silk | Navy | Noble | `fabrics/blue_silk.svg` |
| `green_linen` | Linen | Forest | Common | `fabrics/green_linen.svg` |
| `gold_brocade` | Brocade | Gold/Brown | Royal | `fabrics/gold_brocade.svg` |

## Directory Structure

```
public/assets/tapestries/
├── models/
│   └── WarBanner.blend         (needs GLB conversion)
├── textures/                   (6 heraldic SVG designs)
│   ├── dragon_crest.svg
│   ├── royal_lion.svg
│   ├── eagle_emblem.svg
│   ├── crown_royal.svg
│   ├── sword_cross.svg
│   └── castle_fortress.svg
├── fabrics/                    (4 fabric texture SVGs)
│   ├── red_velvet.svg
│   ├── blue_silk.svg
│   ├── green_linen.svg
│   └── gold_brocade.svg
└── manifest.json               (asset catalog)
```

## Usage

### Basic Setup

```javascript
import { TapestryDecorator } from './TapestryDecorator.js';

// Initialize
const tapestryDecorator = new TapestryDecorator(scene);

// Load assets
await tapestryDecorator.loadAssets();

// Decorate dungeon after generation
tapestryDecorator.decorateWalls(dungeonData);

// In animation loop (for cloth swaying)
tapestryDecorator.animate(deltaTime);
```

### Manual Placement

```javascript
// Create custom tapestry
const tapestry = tapestryDecorator.createTapestry(
  'dragon_crest',    // Heraldic design
  'red_velvet',      // Fabric texture
  [2, 3]             // Size [width, height]
);

// Place on wall
const position = new THREE.Vector3(5, 1.5, 10);
const wallNormal = new THREE.Vector3(0, 0, 1);
tapestryDecorator.placeOnWall(
  position,
  wallNormal,
  [2, 3],
  'dragon_crest',
  'red_velvet'
);
```

## Tapestry Types

Defined in `manifest.json` with automatic room-based selection:

| Type | Size | Locations | Rarity |
|------|------|-----------|--------|
| Vertical Banner | 1×3 | Hallways, Corridors | 30% |
| Small Banner | 1×2 | Small Rooms, Chambers | 25% |
| Medium Tapestry | 2×2 | Rooms, Halls | 20% |
| Large Tapestry | 4×3 | Throne Rooms, Great Halls | 15% |

## Placement Rules

From `manifest.json`:

- **Wall Coverage**: 15-25% of suitable walls
- **Min Wall Width**: 2 units
- **Min Wall Height**: 2 units
- **Wall Offset**: 0.02 units (prevents z-fighting)
- **Prefer Interior**: Only interior walls
- **Avoid Corners**: No corner placement

## Features

### Procedural Generation
- Combines fabric base with heraldic overlay
- Automatic design selection based on room type/importance
- Fabric quality matches room importance

### Realism Effects
- Cloth deformation (gentle waves and sagging)
- Wear and tear (stains, fading, edge fraying)
- Gentle swaying animation (optional)
- Proper lighting with shadows

### Smart Placement
- Room-aware (royal rooms get royal heraldics)
- Theme matching (military rooms get military designs)
- Importance-based fabric selection
- Avoids unsuitable walls (corners, short walls)

## API Reference

### TapestryDecorator Class

#### Constructor
```javascript
new TapestryDecorator(scene)
```

#### Methods

**loadAssets()**
- Returns: `Promise<boolean>`
- Loads manifest and all assets
- Must be called before decoration

**createTapestry(heraldic, fabric, size)**
- `heraldic`: String - Heraldic design ID
- `fabric`: String - Fabric texture ID
- `size`: Array - [width, height] in units
- Returns: `THREE.Mesh`

**placeOnWall(position, normal, size, heraldic, fabric)**
- Places tapestry on wall with proper orientation
- Returns: `THREE.Mesh`

**decorateWalls(dungeonData)**
- Automatically decorates dungeon walls
- Returns: Number of tapestries placed

**animate(deltaTime)**
- Adds gentle cloth swaying
- Call in animation loop

**dispose()**
- Cleanup all tapestries and textures

## Conversion Steps Needed

### War Banner (Blender to GLB)

The downloaded War Banner is in Blender format and needs conversion:

1. **Option A: Use Blender**
   ```bash
   # Open in Blender
   blender WarBanner.blend

   # File > Export > glTF 2.0 (.glb)
   # Settings:
   #   - Format: GLB
   #   - Include: Selected Objects
   #   - Transform: +Y Up
   #   - Export animations if present
   ```

2. **Option B: Command Line (if Blender installed)**
   ```bash
   blender -b WarBanner.blend -o war_banner.glb \
     --python-expr "import bpy; bpy.ops.export_scene.gltf(filepath='war_banner.glb')"
   ```

3. **Option C: Online Converter**
   - Upload to: https://products.aspose.app/3d/conversion/blend-to-glb
   - Or use: https://www.creators3d.com/online-viewer

### SVG to PNG (Optional)

SVG files work in Three.js via TextureLoader, but PNG may perform better:

```bash
# Using ImageMagick (if installed)
for file in textures/*.svg; do
  convert "$file" -resize 1024x1024 "${file%.svg}.png"
done

for file in fabrics/*.svg; do
  convert "$file" -resize 1024x1024 "${file%.svg}.png"
done
```

**Note**: Current implementation supports SVG directly. PNG conversion is optional for performance optimization.

## Integration with Main Game

Add to `main.js` after dungeon generation:

```javascript
import { TapestryDecorator } from './TapestryDecorator.js';

// After DungeonBuilder initialization
const tapestryDecorator = new TapestryDecorator(scene);
await tapestryDecorator.loadAssets();

// After dungeon generation
const dungeonData = dungeonBuilder.getRoomData();
tapestryDecorator.decorateWalls(dungeonData);

// In animation loop
function animate() {
  const deltaTime = clock.getDelta();
  tapestryDecorator.animate(deltaTime);
  // ... rest of animation
}
```

## Customization

### Adding New Heraldic Designs

1. Create SVG file in `/public/assets/tapestries/textures/`
2. Add entry to `manifest.json`:
   ```json
   {
     "id": "new_design",
     "path": "textures/new_design.svg",
     "theme": "royal|military|noble",
     "colors": ["color1", "color2"],
     "description": "Description"
   }
   ```

### Adding New Fabrics

1. Create SVG pattern in `/public/assets/tapestries/fabrics/`
2. Add entry to `manifest.json`:
   ```json
   {
     "id": "new_fabric",
     "path": "fabrics/new_fabric.svg",
     "material": "fabric_type",
     "color": "color_name",
     "quality": "royal|noble|common",
     "description": "Description"
   }
   ```

## Performance Notes

- **SVG Loading**: Works but may be slower than PNG
- **Texture Memory**: Each unique combination uses ~1-4MB
- **Animation**: Cloth swaying is lightweight but can be disabled
- **Recommended**: 50-100 tapestries per large dungeon level

## Troubleshooting

### Tapestries not appearing
1. Check if `loadAssets()` completed successfully
2. Verify manifest.json is accessible
3. Check browser console for texture loading errors

### Z-fighting (flickering)
- Increase `wall_offset` in manifest.json (default: 0.02)

### Poor performance
- Convert SVG to PNG for faster loading
- Reduce tapestry count (lower wall_coverage in manifest)
- Disable cloth animation

### Textures not loading
- Verify paths in manifest.json match actual files
- Check browser console for 404 errors
- Ensure SVG files are valid XML

## Example Dungeon Data Format

The decorator expects dungeon data in this format:

```javascript
{
  rooms: [
    {
      type: 'throne_room',      // Room type for tapestry selection
      importance: 0.9,          // 0-1 scale for quality selection
      x: 0, z: 0,               // Room position
      width: 10, height: 3,     // Room dimensions
      walls: [                  // Wall segments
        {
          position: Vector3,    // Wall center position
          normal: Vector3,      // Wall normal (facing direction)
          width: 5,             // Wall width
          height: 3,            // Wall height
          isInterior: true,     // Interior vs exterior
          isCorner: false       // Corner wall flag
        }
      ]
    }
  ]
}
```

## Future Enhancements

- [ ] Convert WarBanner.blend to GLB
- [ ] Add torn/damaged tapestry variants
- [ ] Implement banner pole models for hanging
- [ ] Add tapestry collections (matching sets)
- [ ] Support for custom player-designed heraldics
- [ ] Animated torch-lit tapestry shadows
- [ ] Faction-based heraldic generation

## Credits

- **War Banner Model**: OpenGameArt.org (CC0/Public Domain)
- **Heraldic Designs**: Procedurally generated SVG
- **Fabric Textures**: Procedurally generated SVG patterns

## License

All procedurally generated assets (SVG heraldics and fabrics) are CC0/Public Domain.
War Banner model follows its original OpenGameArt license.
