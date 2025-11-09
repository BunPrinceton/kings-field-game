# Tapestry System - Quick Reference

## Quick Start

```javascript
import { TapestryDecorator } from './TapestryDecorator.js';

// 1. Initialize
const tapestryDecorator = new TapestryDecorator(scene);

// 2. Load assets
await tapestryDecorator.loadAssets();

// 3. Auto-decorate dungeon
tapestryDecorator.decorateWalls(dungeonData);

// 4. Animate (in game loop)
tapestryDecorator.animate(deltaTime);
```

## Assets Available

### Heraldic Designs (6)
- `dragon_crest` - Red dragon (royal)
- `royal_lion` - Gold lion with crown (royal)
- `eagle_emblem` - Black eagle (military)
- `crown_royal` - Royal crown (royal)
- `sword_cross` - Crossed swords (military)
- `castle_fortress` - Castle (noble)

### Fabric Textures (4)
- `red_velvet` - Crimson velvet (royal quality)
- `blue_silk` - Navy silk (noble quality)
- `green_linen` - Forest linen (common quality)
- `gold_brocade` - Gold brocade (royal quality)

## Manual Placement

```javascript
// Single tapestry
const position = new THREE.Vector3(10, 1.5, 5);
const wallNormal = new THREE.Vector3(1, 0, 0); // facing -X

tapestryDecorator.placeOnWall(
  position,
  wallNormal,
  [2, 3],           // 2 wide × 3 tall
  'dragon_crest',   // heraldic
  'red_velvet'      // fabric
);
```

## Tapestry Sizes

| Type | Size | Best For |
|------|------|----------|
| Vertical Banner | 1×3 | Hallways |
| Small Banner | 1×2 | Small rooms |
| Medium Tapestry | 2×2 | Normal rooms |
| Large Tapestry | 4×3 | Throne rooms |

## Room Type Mapping

| Room Type | Gets | Fabric Quality |
|-----------|------|----------------|
| `throne_room`, `royal` | Royal heraldics | Royal fabrics |
| `barracks`, `armory` | Military heraldics | Noble/common fabrics |
| Other | Random | Based on importance |

## Coverage Settings

Default: 15-25% of suitable walls
Adjust in `manifest.json`:

```json
"placement_rules": {
  "wall_coverage": [0.15, 0.25],  // [min, max]
  "min_wall_width": 2,
  "min_wall_height": 2
}
```

## Common Issues

**Not appearing?**
- Call `await loadAssets()` before `decorateWalls()`
- Check console for errors

**Z-fighting?**
- Increase `wall_offset` in manifest.json

**Too many/few?**
- Adjust `wall_coverage` range in manifest.json

## File Locations

```
/public/assets/tapestries/
├── manifest.json        (configuration)
├── models/              (3D models)
├── textures/            (heraldic designs)
└── fabrics/             (fabric patterns)
```

## Performance Tips

- Current: ~6 heraldics × 4 fabrics = 24 combinations
- Each tapestry: ~1-2MB texture memory
- Recommended: 50-100 tapestries per level
- Disable animation if needed: don't call `.animate()`

## Next Steps

**Optional conversions:**
1. Convert `WarBanner.blend` → GLB (see full docs)
2. Convert SVG → PNG for better performance

**Test it:**
```javascript
// Check loaded assets
console.log(tapestryDecorator.heraldicsLoaded.size); // Should be 6
console.log(tapestryDecorator.fabricsLoaded.size);   // Should be 4
```
