# Kings Field Game - Codebase Architecture Overview

## Project Summary

**Kings Field Game** is a King's Field-inspired first-person dungeon crawler built with Three.js. The project is structured for parallel development using git worktrees, allowing multiple developers/agents to work simultaneously on different features across feature branches.

Current Status: **Iteration 2** - Parallel development phase with 7 feature agents working on major improvements

---

## Current Architecture

### Core Directory Structure
```
/src
  ├── main.js                  # Game entry point, game loop, player/enemy classes
  ├── DungeonGenerator.js      # Procedural dungeon generation algorithm
  ├── DungeonBuilder.js        # Converts dungeon data to 3D geometry & meshes
  └── AtmosphericLighting.js   # Lighting system and atmospheric effects

/index.html                     # HTML entry point, UI container
/package.json                   # Dependencies (Three.js, Vite)
```

---

## System Architecture Breakdown

### 1. DUNGEON RENDERING SYSTEM

#### DungeonGenerator.js (Procedural Generation)
- **Purpose**: Creates 2D dungeon grid layout
- **Algorithm**: Binary space partitioning (BSP) with room placement
- **Output**: Grid data (0=wall, 1=floor), room list, corridor list

**Key Features:**
- Configurable room sizes (3-8 cells by default)
- Room overlap detection to prevent collisions
- Corridor connection system (horizontal-then-vertical or vertical-then-horizontal)
- Spawn position tracking (center of first room)

**Configuration Options:**
```javascript
{
  minRoomSize: 3,
  maxRoomSize: 8,
  maxRooms: 12,
  roomAttempts: 50
}
```

#### DungeonBuilder.js (3D Geometry Creation)
- **Purpose**: Converts 2D dungeon grid into 3D meshes
- **Scale**: cellSize=4 units per grid cell, wallHeight=3.5 units

**Three Components Built:**

1. **Floors**
   - Material: MeshStandardMaterial (dark gray #2a2a2a)
   - Geometry: PlaneGeometry per grid cell
   - Properties: Receives shadows, rotated -90° to lay flat
   - Roughness: 0.9, Metalness: 0.1

2. **Ceilings**
   - Material: MeshStandardMaterial (very dark #1a1a1a)
   - Geometry: PlaneGeometry per grid cell
   - Properties: DoubleSide rendering, rotated +90°
   - Positioned at wallHeight

3. **Walls**
   - Material: MeshStandardMaterial (dark gray #3a3a3a)
   - Geometry: BoxGeometry for each wall face
   - Detection: Only creates walls between floor cells and non-floor cells
   - Four directions checked: north, south, east, west
   - Properties: Cast and receive shadows

**Wall Placement Logic:**
```
For each floor cell:
  Check all 4 adjacent cells
  If adjacent cell is outside dungeon or is a wall (0):
    Create wall on that side
```

#### Torch System (Within DungeonBuilder)
- **Placement Strategy**:
  - Large rooms (>4x4): 4 torches in corners
  - Small rooms: 1 torch in center
  
- **Visual Components**:
  - Torch base: CylinderGeometry (0.08 radius, 0.6 height, brown #4a3020)
  - Flame: SphereGeometry (0.15 radius, orange #ff6600, emissive)
  
- **Lighting Component**:
  - PointLight: 2.0 intensity, 12 unit range, orange (#ff6600)
  - Cast shadow enabled

- **Animation**:
  - Flicker effect: Dual sine wave (sin(time*8) + sin(time*13))
  - Flame scale oscillates with intensity
  - Natural looking variation without performance hit

---

### 2. LIGHTING SYSTEM (AtmosphericLighting.js)

**Three Light Sources:**

1. **Ambient Light**
   - Color: #404040 (dark gray)
   - Default Intensity: 0.6 (bright enough to see, maintains atmosphere)
   - Purpose: Base illumination

2. **Player Light** (Follows Camera)
   - Type: PointLight
   - Color: #ffffdd (warm white)
   - Intensity: 2.5
   - Range: 20 units
   - Updates with camera position every frame
   - Subtle pulse effect: ±0.05 intensity oscillation

3. **Directional Light** (Skylight)
   - Position: (10, 20, 10) - from above-right
   - Color: #ffffff
   - Intensity: 1.2
   - Purpose: Overall visibility and depth cueing

**Fog System:**
- Type: Linear THREE.Fog
- Color: #111111 (very dark)
- Default Range: 5-30 units (dense atmosphere)
- Configurable for different areas/depths

**Shadow Rendering:**
- Type: PCFSoftShadowMap (hardware shadows)
- Smooth shadow edges
- Bias: -0.001 to avoid artifacts

**Future Extensibility:**
- `setTimeOfDay(timeValue)`: Modulates ambient intensity and fog far based on 0-1 value
- `createDynamicLight()`: Method to spawn temporary lights

---

### 3. TEXTURE SYSTEM (Current State)

**IMPORTANT: NO TEXTURES CURRENTLY INTEGRATED**

Current implementation uses **solid colors only**:
- Floors: `color: 0x2a2a2a` (dark gray)
- Ceilings: `color: 0x1a1a1a` (very dark gray)
- Walls: `color: 0x3a3a3a` (medium dark gray)
- Torches: `color: 0x4a3020` (brown)
- Flames: `color: 0xff6600` (orange)

All materials use `MeshStandardMaterial` (physically-based material):
- Supports texture maps (albedo, normal, roughness, metalness, etc.)
- **Ready for texture integration** with no code changes needed

**Texture Integration Points:**
```javascript
// To add textures to floors:
const floorMaterial = new THREE.MeshStandardMaterial({
  map: textureLoader.load('floor.png'),        // albedo/color
  normalMap: textureLoader.load('floor_normal.png'),
  roughnessMap: textureLoader.load('floor_rough.png'),
  // ... existing properties
});
```

---

### 4. PLAYER & MOVEMENT SYSTEM (main.js)

**Player Class:**
- Position: { x, y, z }
- Rotation: { x, y } (yaw only for grid-based movement)
- Health: Health class (100 max HP)
- Attack power: 25 damage
- Attack range: 2.5 units
- Attack cooldown: 500ms

**Grid-Based Movement:**
- GridSize: 1 unit
- CellSize: 4 units (used for 3D positioning)
- Movement animation duration: 0.3 seconds
- Easing: easeInOutCubic for smooth interpolation

**Rotation System:**
- 90° rotations (Q/E keys)
- Smooth interpolation over 0.3 seconds
- Affects forward/backward/strafe directions

**Collision System:**
- Checks collidableObjects array against target grid position
- Prevents movement into occupied cells
- Objects store userData.gridPos for collision checks

---

### 5. CAMERA & RENDERING

**Camera:**
- Type: PerspectiveCamera
- FOV: 75°
- First-person perspective (follows player position exactly)
- Position updated every frame with player position
- Rotation locked to player rotation.y (yaw only)

**Renderer:**
- WebGLRenderer with antialiasing enabled
- Renders to full window
- Responsive to window resize events

**Game Loop:**
- requestAnimationFrame at ~60fps
- THREE.Clock for delta time calculation
- Separate delta time for movement (seconds) and combat (milliseconds)

---

### 6. COMBAT SYSTEM (main.js)

**Player Attack Mechanics:**
- Triggered by Space bar
- Finds closest enemy within attackRange (2.5 units)
- Deals attackPower (25) damage
- 500ms cooldown between attacks
- Provides target enemy to damage system

**Enemy Class:**
- Model: Red sphere (0.5 radius)
- Health: Health class (50 max HP)
- Attack power: 10 damage
- Damage flash: White flash for 150ms when hit
- Death animation: 500ms fade-out and shrink-to-zero
- Emissive color: #330000 (dark red glow)

**Health System:**
- Tracks current/max HP
- Supports damage taking and healing
- isDead() boolean check
- getPercentage() for UI display

---

### 7. USER INTERFACE (index.html + main.js)

**Current UI Elements:**
- Health display: `Health: XX/100`
- Health bar: Colored based on percentage (green>50%, yellow>25%, red<=25%)
- Enemy counter: `Enemies: X/5`
- Control hints: "WASD: Move | Q/E: Rotate | SPACE: Attack"

**HTML Structure:**
```html
<div id="ui">
  <!-- Dynamically populated by updateUI() -->
</div>
```

**UI Update Frequency:**
- On player health change
- On enemy death
- Manual updates in game loop

---

## Data Flow Diagrams

### Dungeon Generation Flow
```
DungeonGenerator.generate()
  → createRooms() [BSP placement]
  → connectRooms() [corridor creation]
  → addCorridorFloors() [carve corridors into grid]
  → return { grid, rooms, corridors, width, height }

DungeonBuilder.build(dungeonData)
  → createFloors() [for each grid[y][x] === 1]
  → createCeilings() [for each floor]
  → createWalls() [check adjacencies]
  → placeTorches() [room-based placement]
  → return { meshes, torches }

Game.scene contains all THREE.Mesh objects
```

### Rendering Pipeline
```
animate() loop
  ├── updateMovement(deltaTime) [interpolate position/rotation]
  ├── update(deltaTime) [combat updates]
  ├── lighting.update(time) [torch flicker]
  ├── lighting.updatePlayerLight(camera.position) [player light follow]
  ├── dungeonBuilder.animateTorches(time) [flame animation]
  └── renderer.render(scene, camera)
```

### Collision Detection
```
Player tries to move:
  → getMovementVector(direction) [calculate grid offset]
  → checkCollision(targetGridX, targetGridZ)
    → for each collidableObject:
        if (obj.gridPos === target) return true
  → if collision: abort movement
  → else: animate movement with interpolation
```

---

## Key Variables & Constants

### Global Game Object
```javascript
game = {
  scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  player: Player instance,
  gridSize: 1,
  collidableObjects: [],
  clock: THREE.Clock,
  dungeon: {
    generator: DungeonGenerator,
    builder: DungeonBuilder,
    data: { grid, rooms, corridors }
  },
  lighting: AtmosphericLighting,
  time: 0,
  enemies: [],
  movement: {
    isMoving: boolean,
    isRotating: boolean,
    progress: 0-1,
    duration: 0.3
  }
}
```

### Material Definitions
```javascript
// Floors
color: 0x2a2a2a, roughness: 0.9, metalness: 0.1

// Ceilings
color: 0x1a1a1a, roughness: 0.8, metalness: 0.1, side: DoubleSide

// Walls
color: 0x3a3a3a, roughness: 0.85, metalness: 0.15

// Torches (base)
color: 0x4a3020

// Flames
color: 0xff6600, emissive: 0xff6600, emissiveIntensity: 1
```

---

## Performance Characteristics

### Mesh Count
- Floors: ~50-100 per dungeon (depends on generation)
- Ceilings: Same as floors
- Walls: ~200-400 (every exposed wall edge)
- Total geometry meshes: 300-600+
- Torches: ~10-15 (one per room)
- Light sources: Ambient + Directional + Player + Torches = ~15-25

### Optimization Already Implemented
- Single material per surface type (reused across many geometries)
- Shadow map enabled with proper bias
- Fog for view culling (objects beyond fog are invisible)
- Standard material roughness/metalness prevents over-reliance on lighting

### Known Performance Considerations
- No frustum culling (could optimize for large dungeons)
- No texture atlasing (ready for optimization when textures added)
- No LOD system
- All torches animate every frame (could batch updates)

---

## Extension Points & Architecture Readiness

### For Textures & Decorations (Current Branch Purpose)
1. **Material Enhancement**
   - MeshStandardMaterial already set up for texture maps
   - Add `.map`, `.normalMap`, `.roughnessMap`, `.metalnessMap`
   - Requires texture assets (CC0 sources recommended)

2. **Decoration System Needed**
   - New `DecorationManager` class
   - Place decorations based on room types
   - Track decorations separately from structural geometry
   - Support for: columns, statues, rubble, crates, barrels, cobwebs, etc.

3. **Environmental Details**
   - Water puddles (transparent planes with ripple shader)
   - Cracks (normal mapping primarily)
   - Moss (color variation + normal mapping)

4. **Room Variation**
   - Tag rooms by type in DungeonGenerator
   - Different textures for treasure rooms, boss arenas, etc.
   - Visual distinction for puzzle rooms vs combat arenas

### For Other Branches
- **Controls**: Input system extensible, new keys can map to actions
- **UI**: Modern UI branch can replace hardcoded HTML
- **Sound**: Audio manager needed (not yet created)
- **Player Weapons**: Visible hands/weapons need separate model system
- **Level Design POIs**: DungeonGenerator needs room type/purpose tagging
- **Narrative**: NPC system requires UI framework

---

## Current Limitations & Gaps

### Missing Systems
- No texture asset loading
- No decoration/prop system
- No NPC system
- No inventory system
- No sound system
- No animation system for player/enemies
- No input remapping
- No save/load system
- No procedural variation beyond room placement

### Known Issues
1. Torches place at grid coordinates without checking for walls
2. No object culling - all geometry rendered always
3. Collision system only checks player, not enemy-to-player hits
4. Enemy AI is non-existent (no movement, pathfinding)
5. Combat target finding can pick enemies outside actual range

### Code Quality Notes
- Global game object could be better encapsulated
- Lighting system could support more dynamic lights
- Torch animation tied to game.time (can desync if paused)
- No error handling for missing/failed resource loads

---

## Dependencies

### Runtime Dependencies
- **Three.js** (v0.160.0): 3D graphics library
- Browser with WebGL support

### Development Dependencies
- **Vite** (v5.0.0): Build tool and dev server
- **Node.js**: For package management

### No External Asset Dependencies
- Game works with procedurally generated content
- Ready for texture/asset integration

---

## File Sizes & Complexity

| File | LOC | Complexity | Purpose |
|------|-----|-----------|---------|
| main.js | 547 | Medium | Game loop, player, enemies, input |
| DungeonGenerator.js | 170 | Low-Medium | Dungeon generation algorithm |
| DungeonBuilder.js | 232 | Medium | 3D geometry creation |
| AtmosphericLighting.js | 104 | Low-Medium | Lighting and fog |

Total source code: **~1,053 lines** (relatively compact)

---

## Starting Point for Textures & Decorations

The codebase is **well-structured for texture integration**:

1. Materials already use `MeshStandardMaterial` (PBR-ready)
2. No major refactoring needed to add textures
3. Need to add:
   - Texture asset loader
   - Decoration spawn system
   - Room type classification
   - Variation configuration

The heavy lifting is done - just needs content and decoration logic.

