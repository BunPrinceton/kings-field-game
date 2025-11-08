# Textures & Decorations Implementation Guide

## Overview

This document provides a detailed guide for implementing textures and decorations in the Kings Field game. The codebase is already well-structured for texture integration - you mainly need to add content and decoration logic.

---

## Current State Assessment

### What's Already Done
- MeshStandardMaterial setup (supports texture maps)
- Proper geometry creation (floors, walls, ceilings)
- Lighting system that works with textures
- Organized code structure ready for expansion
- No texture asset dependencies (fully optional)

### What Needs to Be Done
1. Create/acquire texture assets
2. Implement texture loader system
3. Add decoration spawn logic
4. Create decoration meshes
5. Apply variation to rooms

---

## Texture Integration

### Quick Integration Path

**Step 1: Set up TextureLoader**
```javascript
const textureLoader = new THREE.TextureLoader();

const floorTexture = textureLoader.load('path/to/floor.png');
const wallTexture = textureLoader.load('path/to/wall.png');
```

**Step 2: Update Material Creation**
In `DungeonBuilder.js`:

```javascript
// Instead of:
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x2a2a2a,
  roughness: 0.9,
  metalness: 0.1
});

// Use:
const floorTexture = textureLoader.load('path/to/floor.png');
const floorMaterial = new THREE.MeshStandardMaterial({
  map: floorTexture,
  roughness: 0.9,
  metalness: 0.1
});
```

**Step 3: Handle Texture Scale**
Textures need proper UV scaling to avoid stretching:
```javascript
floorTexture.repeat.set(4, 4);  // Tile every 4 units
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
```

### Texture Asset Sources

**Recommended Free Texture Resources:**
- **Poly Haven** (polyhaven.com) - CC0, high quality
- **Ambientcg.com** - PBR textures with normal/roughness maps
- **Textures Haven** - Free high-quality game textures
- **CC0 Textures** (cc0textures.com) - Various free assets
- **OpenGameArt.org** - Game-specific assets
- **Sketchfab** - 3D models with textures (can extract PBR maps)

**Recommended Textures for This Project:**
- Stone walls (multiple variations)
- Worn stone floors
- Dark wood/timber
- Brick patterns
- Moss/algae overlays
- Water/puddle textures
- Normal maps for depth detail
- Roughness maps for material variation

### Important Texture Considerations

**Resolution Management:**
- Use 1024x1024 or 512x512 for most textures
- Optimize with compression tools (TinyPNG, etc.)
- Consider WebP for better browser performance

**PBR Workflow:**
The game uses MeshStandardMaterial, so PBR textures are ideal:
- Albedo (color map) - `.map` property
- Normal map - `.normalMap` property (adds surface detail)
- Roughness map - `.roughnessMap` property (matte vs shiny)
- Metalness map - `.metalnessMap` property
- Ambient Occlusion map - `.aoMap` property (shadows in crevices)

**Example Complete Material:**
```javascript
const stoneMaterial = new THREE.MeshStandardMaterial({
  // Color & texture
  map: textureLoader.load('stone-albedo.png'),
  
  // Surface detail
  normalMap: textureLoader.load('stone-normal.png'),
  normalScale: new THREE.Vector2(1, 1),
  
  // Material properties
  roughnessMap: textureLoader.load('stone-roughness.png'),
  metalness: 0.0,
  
  // Depth/shading
  aoMap: textureLoader.load('stone-ao.png'),
  aoMapIntensity: 0.8
});
```

---

## Decoration System Implementation

### Architecture

**Proposed DecorationsManager Class:**
```javascript
export class DecorationsManager {
  constructor(scene, dungeonData, config = {}) {
    this.scene = scene;
    this.dungeonData = dungeonData;
    this.decorations = [];
    this.config = {
      density: config.density || 'medium',
      seed: config.seed || Math.random(),
      ...config
    };
  }

  place() {
    for (const room of this.dungeonData.rooms) {
      this.decorateRoom(room);
    }
    
    for (const corridor of this.dungeonData.corridors) {
      this.decorateCorridor(corridor);
    }
  }

  decorateRoom(room) {
    // Classify room and place appropriate decorations
  }

  decorateCorridor(corridor) {
    // Add decorations to corridors
  }

  createDecoration(type, position) {
    // Factory method for creating decoration meshes
  }
}
```

### Decoration Types

**Structural Decorations:**
1. **Columns**
   - Placement: Room corners or center
   - Model: CylinderGeometry (0.4 radius, variable height)
   - Material: Stone texture
   - Effect: Visual break-up of open spaces

2. **Pillars/Supports**
   - Placement: Supporting walls in large rooms
   - Model: BoxGeometry (thin walls)
   - Material: Stone with normal mapping

3. **Arches**
   - Placement: Corridor openings
   - Model: Torus geometry or custom mesh
   - Material: Matching walls

**Environmental Details:**
1. **Rubble Piles**
   - Placement: Random room corners
   - Model: Multiple box geometries stacked
   - Material: Broken stone texture
   - Collision: Should block pathfinding

2. **Crates/Boxes**
   - Placement: Storage areas, sparse distribution
   - Model: BoxGeometry
   - Material: Wood texture
   - Variety: Different sizes (small, medium, large)

3. **Barrels**
   - Placement: Alcoves, walls
   - Model: CylinderGeometry with cap
   - Material: Wooden material
   - Variation: Open/closed, broken

4. **Debris/Scattered Objects**
   - Placement: Corridors, room edges
   - Model: Various small geometry
   - Material: Rock, metal, wood
   - Collision: Non-blocking (walkable over)

**Atmospheric Details:**
1. **Cobwebs**
   - Placement: Corners, high areas
   - Model: Planes with alpha transparency
   - Material: Semi-transparent web texture
   - Animation: Slight sway

2. **Moss/Algae Growth**
   - Placement: Lower walls, water areas
   - Material: Blend using layer material or normal/color mixing
   - Variation: Darkness-based (more in shadowed areas)

3. **Water Puddles**
   - Placement: Floor depressions, low points
   - Model: Plane with transparency
   - Material: Water with normal map
   - Animation: Ripples (using vertex shader)

4. **Cracks/Damage**
   - Placement: All surfaces (varied intensity)
   - Material: Normal mapping overlay
   - Variation: By room type and depth

### Placement Algorithm

**By Room Type:**
```javascript
const roomTypes = {
  treasure: { columns: 4, statues: 2, loose_gold: true },
  combat: { rubble: 3, pillars: 2, arena_clear: true },
  safe: { torches: many, rubble: minimal, statues: 1 },
  corridor: { cobwebs: high, rubble: 1, vegetation: medium }
};
```

**Density Control:**
```javascript
// Prevents over-decoration
const density = {
  light: 0.3,    // 30% of possible placements
  medium: 0.6,   // 60% (recommended)
  heavy: 0.9     // 90% (very detailed)
};
```

**Seeded Randomness:**
```javascript
// For reproducible/consistent dungeons
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }
  
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}
```

---

## Room Variation System

### Enhancing DungeonGenerator

Add room classification to generated rooms:

```javascript
// In DungeonGenerator.js:
carveRoom(room) {
  // ... existing carving code ...
  
  // Add room type classification
  room.type = this.classifyRoom(room);
}

classifyRoom(room) {
  // Types: 'treasure', 'combat', 'safe', 'corridor', 'generic'
  if (room.width > 6 && room.height > 6) {
    return Math.random() < 0.3 ? 'treasure' : 'combat';
  } else if (room.width < 4 && room.height < 4) {
    return 'safe';
  }
  return 'generic';
}
```

### Room-Specific Textures

```javascript
const roomMaterials = {
  treasure: {
    floor: goldTexturedFloor,
    wall: richStoneWall,
    detail: decorativePatterns
  },
  combat: {
    floor: wornStoneFloor,
    wall: crackiedWall,
    detail: rubbleScattered
  },
  safe: {
    floor: cleanStoneFloor,
    wall: solidStoneWall,
    detail: minimal
  }
};
```

---

## Performance Optimization Tips

### Texture Memory Management
```javascript
// Dispose of unused textures to free memory
scene.traverse((child) => {
  if (child.material?.map) {
    child.material.map.dispose();
  }
});
```

### Mesh Instancing
For repeated decorations (same geometry, different position):
```javascript
const geometryInstance = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ /* ... */ });

// Instanced mesh = 1 draw call for 100 objects
const decorations = new THREE.InstancedMesh(geometryInstance, material, 100);
decorations.setMatrixAt(i, matrix);
scene.add(decorations);
```

### Level of Detail (LOD)
```javascript
const lod = new THREE.LOD();
lod.addLevel(highDetail, 0);
lod.addLevel(mediumDetail, 10);
lod.addLevel(lowDetail, 50);
scene.add(lod);
```

### Texture Atlasing
Combine multiple textures into single atlas to reduce texture switches:
- Reduces GPU state changes
- Improves rendering performance
- Requires UV layout planning

---

## Integration Checklist

### Phase 1: Basic Texture Support
- [ ] Create TextureLoader instance
- [ ] Add texture configuration object
- [ ] Update floor material with texture
- [ ] Update wall material with texture
- [ ] Update ceiling material with texture
- [ ] Test texture scaling/tiling
- [ ] Verify compatibility with existing lighting

### Phase 2: Decoration System
- [ ] Create DecorationsManager class
- [ ] Implement column placement
- [ ] Implement crate/barrel placement
- [ ] Implement rubble scattering
- [ ] Add cobweb meshes
- [ ] Test performance with decorations
- [ ] Add decoration collision detection (if needed)

### Phase 3: Room Variation
- [ ] Add room type classification to DungeonGenerator
- [ ] Create room-specific material sets
- [ ] Update DungeonBuilder to use room types
- [ ] Implement variation in decoration placement
- [ ] Add environmental storytelling (specific objects)

### Phase 4: Polish & Optimization
- [ ] Implement texture memory management
- [ ] Consider mesh instancing for repeated decorations
- [ ] Add LOD system for distant objects
- [ ] Optimize texture sizes
- [ ] Profile performance
- [ ] Add configuration presets (light/medium/heavy detail)

---

## Code Integration Points

### In main.js (Game Initialization)
```javascript
// After DungeonBuilder.build():
const decorations = new DecorationsManager(
  game.scene,
  game.dungeon.data,
  { density: 'medium', seed: Math.random() }
);
decorations.place();
```

### New File: DecorationsManager.js
```javascript
import * as THREE from 'three';

export class DecorationsManager {
  // Implementation (see architecture section above)
}
```

### New File: TextureManager.js (Optional)
```javascript
import * as THREE from 'three';

export class TextureManager {
  constructor() {
    this.loader = new THREE.TextureLoader();
    this.textures = new Map();
  }
  
  loadTexture(name, path) {
    const texture = this.loader.load(path);
    this.textures.set(name, texture);
    return texture;
  }
  
  getTexture(name) {
    return this.textures.get(name);
  }
}
```

---

## Testing & Validation

### Visual Testing Checklist
- [ ] Textures display correctly on all surfaces
- [ ] No obvious stretching or distortion
- [ ] Lighting interacts properly with textured surfaces
- [ ] Decorations don't clip through walls/floors
- [ ] Performance is acceptable (60fps on target device)
- [ ] UI is still visible and readable

### Performance Testing
```javascript
// Add FPS counter to monitor performance
let lastTime = performance.now();
let frameCount = 0;

function measureFPS() {
  const now = performance.now();
  if (now - lastTime >= 1000) {
    console.log(`FPS: ${frameCount}`);
    frameCount = 0;
    lastTime = now;
  }
  frameCount++;
}
```

---

## Recommended Implementation Order

1. Start with **floor texture** (biggest visual impact)
2. Add **wall textures** (maintains cohesion)
3. Implement **DecorationsManager** (basic structure)
4. Add **columns** (easy, high impact)
5. Add **crates/barrels** (varied sizes)
6. Add **rubble** (scattered, natural)
7. Enhance with **cobwebs and moss** (atmospheric)
8. Implement **water puddles** (special FX)
9. Add **room variation** (polish)
10. Optimize and tune

---

## Future Enhancements

- Animated decorations (swinging chandeliers, rotating mechanisms)
- Interactive decorations (destroyable objects, openable chests)
- Secret areas with unique textures (reveals player discovery)
- Procedural texture generation (reduce file sizes)
- Dynamic lighting reactions (torches light objects nearby)
- Decoration-based storytelling (arrangement suggests history)

