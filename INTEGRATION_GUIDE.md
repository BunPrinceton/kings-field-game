# Cleaning Props Integration Guide

Quick guide to integrate the cleaning props system with your existing DungeonBuilder.

## Option 1: Add to DungeonBuilder (Recommended)

### Step 1: Import the Decorator

Add to `/src/DungeonBuilder.js` at the top:

```javascript
import { CleaningPropsDecorator } from './CleaningPropsDecorator.js';
```

### Step 2: Initialize in Constructor

Add to the constructor:

```javascript
constructor(scene, dungeonData, config = {}) {
    // ... existing code ...

    this.cleaningPropsDecorator = null; // Initialize to null
}
```

### Step 3: Add to Build Method

Modify the `build()` method:

```javascript
async build() {
    // ... existing code ...

    // Load materials if using textures
    if (this.config.useTextures) {
        await this.loadMaterials();
    }

    this.createFloors();
    this.createCeilings();
    this.createWalls();
    this.placeTorches();
    this.placePOIDecorations();

    // Place paintings after walls are created
    if (this.paintingGallery) {
        await this.placePaintings();
    }

    // NEW: Add cleaning props decoration
    if (this.config.useCleaningProps !== false) {
        await this.decorateWithCleaningProps();
    }

    return {
        meshes: this.meshes,
        torches: this.torches,
        paintings: this.paintings,
        cleaningProps: this.cleaningPropsDecorator // NEW
    };
}
```

### Step 4: Add Decoration Method

Add this new method to DungeonBuilder class:

```javascript
/**
 * Decorate dungeon with cleaning props
 */
async decorateWithCleaningProps() {
    console.log('Adding cleaning props to dungeon...');

    this.cleaningPropsDecorator = new CleaningPropsDecorator(
        this.scene,
        this.dungeonData,
        {
            cellSize: this.config.cellSize,
            wallHeight: this.config.wallHeight,
            propDensity: this.config.cleaningPropDensity || 0.25,
            basePath: '/assets/props/cleaning/'
        }
    );

    // Load models (GLB or procedural fallbacks)
    await this.cleaningPropsDecorator.loadModels();

    // Decorate all rooms
    const props = this.cleaningPropsDecorator.decorateRooms();

    console.log(`Placed ${props.length} cleaning props`);

    return props;
}
```

### Step 5: Add Cleanup

If you have a `dispose()` method, add cleanup:

```javascript
dispose() {
    // ... existing cleanup code ...

    // Clean up cleaning props
    if (this.cleaningPropsDecorator) {
        this.cleaningPropsDecorator.dispose();
        this.cleaningPropsDecorator = null;
    }
}
```

### Step 6: Done!

The cleaning props will now automatically decorate your dungeons. Control density with config:

```javascript
const builder = new DungeonBuilder(scene, dungeonData, {
    cellSize: 4,
    wallHeight: 3,
    cleaningPropDensity: 0.25,  // 0-1, default 0.25
    useCleaningProps: true      // Set to false to disable
});

await builder.build();
```

---

## Option 2: Separate Decorator (More Control)

If you want to keep it separate from DungeonBuilder:

### In your main.js or game initialization:

```javascript
import { DungeonBuilder } from './DungeonBuilder.js';
import { CleaningPropsDecorator } from './CleaningPropsDecorator.js';

// Build dungeon first
const builder = new DungeonBuilder(scene, dungeonData, config);
await builder.build();

// Then decorate with props
const cleaningDecorator = new CleaningPropsDecorator(scene, dungeonData, {
    cellSize: 4,
    wallHeight: 3,
    propDensity: 0.25
});

await cleaningDecorator.loadModels();
cleaningDecorator.decorateRooms();

// Store for cleanup
this.cleaningDecorator = cleaningDecorator;
```

---

## Option 3: Integrate with FurnitureDecorator

If you're already using FurnitureDecorator, run both:

```javascript
import { FurnitureDecorator } from './FurnitureDecorator.js';
import { CleaningPropsDecorator } from './CleaningPropsDecorator.js';

// Furniture first (larger items)
const furnitureDecorator = new FurnitureDecorator(scene, dungeonData, config);
furnitureDecorator.decorateRooms();

// Then cleaning props (smaller atmospheric items)
const cleaningDecorator = new CleaningPropsDecorator(scene, dungeonData, config);
await cleaningDecorator.loadModels();
cleaningDecorator.decorateRooms();
```

They work together without conflicts. Cleaning props are smaller and placed in different locations.

---

## Configuration Options

```javascript
{
    cellSize: 4,              // Match dungeon grid size
    wallHeight: 3,            // Match dungeon wall height
    propDensity: 0.25,        // 0-1, how many rooms get props
    basePath: '/assets/props/cleaning/',  // Asset path
    useGLTF: true            // Try to load GLB models (with procedural fallback)
}
```

### Prop Density Guide

- `0.1` - Minimal props (10% of rooms)
- `0.25` - Light decoration (25% of rooms, **default**)
- `0.5` - Medium decoration (50% of rooms)
- `0.75` - Heavy decoration (75% of rooms)
- `1.0` - Maximum props (all eligible rooms)

Storage rooms always get props regardless of density setting.

---

## Testing

Verify it's working:

1. Check browser console for:
   ```
   Loading cleaning prop models...
   Created procedural model: broom
   Created procedural model: bucket
   ...
   Decorating dungeon with cleaning props...
   Placed 47 cleaning props
   ```

2. Look for props in your dungeon:
   - Corners of rooms
   - Against walls
   - Storage rooms with clusters
   - Hallways with occasional buckets

3. Check performance (props are lightweight):
   - Each prop: ~100-500 triangles
   - 50 props: ~25,000 triangles total
   - Should have minimal performance impact

---

## Troubleshooting

### Props not appearing

**Check 1**: Is `loadModels()` being awaited?
```javascript
await cleaningDecorator.loadModels(); // Must await!
```

**Check 2**: Is `decorateRooms()` being called?
```javascript
cleaningDecorator.decorateRooms();
```

**Check 3**: Check console for errors

### Too many/few props

Adjust `propDensity`:
```javascript
propDensity: 0.1  // Fewer props
propDensity: 0.5  // More props
```

### Props in wrong locations

The decorator uses dungeon data. Verify:
- `dungeonData.rooms` exists and has room data
- `room.x`, `room.y`, `room.width`, `room.height` are defined
- `cellSize` matches your dungeon grid

### Want to disable temporarily

```javascript
const config = {
    useCleaningProps: false  // Disable
};
```

---

## Advanced Usage

### Manual Prop Placement

```javascript
const propsManager = cleaningDecorator.getPropsManager();

// Place specific props
propsManager.createProp(
    CleaningPropType.BROOM,
    { x: 10, y: 0, z: 5 },
    { rotation: Math.PI / 4 }
);
```

### Custom Prop Groups

```javascript
// Place a pre-configured group
cleaningDecorator.placeGroup(
    PropGroups.JANITOR_CORNER,
    x,
    z
);
```

### Room-Specific Decoration

```javascript
// Decorate only specific rooms
for (const room of dungeonData.rooms) {
    if (room.type === 'storage') {
        cleaningDecorator.decorateRoom(room);
    }
}
```

---

## Example: Full Integration

Complete example for `/src/main.js` or game initialization:

```javascript
import * as THREE from 'three';
import { DungeonGenerator } from './DungeonGenerator.js';
import { DungeonBuilder } from './DungeonBuilder.js';
import { FurnitureDecorator } from './FurnitureDecorator.js';
import { CleaningPropsDecorator } from './CleaningPropsDecorator.js';

async function createDungeon(scene) {
    // 1. Generate dungeon layout
    const generator = new DungeonGenerator({
        width: 40,
        height: 40,
        roomSizeMin: 3,
        roomSizeMax: 8
    });
    const dungeonData = generator.generate();

    // 2. Build dungeon geometry
    const builder = new DungeonBuilder(scene, dungeonData, {
        cellSize: 4,
        wallHeight: 3,
        useTextures: true
    });
    await builder.build();

    // 3. Add furniture (larger items)
    const furnitureDecorator = new FurnitureDecorator(scene, dungeonData, {
        cellSize: 4,
        wallHeight: 3,
        furnitureDensity: 0.6
    });
    furnitureDecorator.decorateRooms();

    // 4. Add cleaning props (atmospheric details)
    const cleaningDecorator = new CleaningPropsDecorator(scene, dungeonData, {
        cellSize: 4,
        wallHeight: 3,
        propDensity: 0.25
    });
    await cleaningDecorator.loadModels();
    cleaningDecorator.decorateRooms();

    return {
        builder,
        furnitureDecorator,
        cleaningDecorator
    };
}

// Cleanup
function cleanupDungeon(decorators) {
    decorators.furnitureDecorator?.dispose();
    decorators.cleaningDecorator?.dispose();
    decorators.builder?.dispose();
}
```

---

## Performance Benchmarks

Expected performance with procedural models:

| Props | Triangles | FPS Impact | Memory |
|-------|-----------|------------|--------|
| 25    | ~12,500   | Minimal    | ~25KB  |
| 50    | ~25,000   | <1%        | ~50KB  |
| 100   | ~50,000   | ~2%        | ~100KB |
| 200   | ~100,000  | ~5%        | ~200KB |

GLB models (if downloaded) may have higher triangle counts but still performant.

---

## Next Steps

1. Add to DungeonBuilder using Option 1
2. Test in your dungeon
3. Adjust `propDensity` to preference
4. (Optional) Download GLB models for higher quality
5. Enjoy atmospheric dungeon decoration!

See `/src/examples/CleaningPropsExample.js` for more detailed examples.
