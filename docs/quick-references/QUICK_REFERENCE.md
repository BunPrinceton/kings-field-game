# Quick Reference - Kings Field Codebase

## File Summary

| File | Purpose | Key Classes/Functions | Key Numbers |
|------|---------|----------------------|-------------|
| **main.js** | Game entry, loop, player/enemy | Player, Enemy, Health | HP:100, Damage:25, Range:2.5 |
| **DungeonGenerator.js** | Procedural dungeon layout | DungeonGenerator | 25x25 grid, 3-8 room size, 12 max rooms |
| **DungeonBuilder.js** | 3D geometry creation | DungeonBuilder | cellSize:4, wallHeight:3.5, torches:1-4 per room |
| **AtmosphericLighting.js** | Lights & fog system | AtmosphericLighting | Ambient:0.6, Fog:5-30 units |

## Architecture at a Glance

```
User Input (WASD/Q/E/Space)
    ↓
Input Handler → Movement/Rotation/Combat
    ↓
Game Loop (60fps)
    ├─ Update Movement (0.3s interpolation)
    ├─ Update Combat (player attack, enemy health)
    ├─ Update Lighting (torch flicker, player light)
    └─ Render Scene (camera follows player)
```

## Material Colors

| Surface | Color | Hex | Roughness | Metalness |
|---------|-------|-----|-----------|-----------|
| Floor | Dark Gray | #2a2a2a | 0.9 | 0.1 |
| Ceiling | Very Dark | #1a1a1a | 0.8 | 0.1 |
| Walls | Medium Dark | #3a3a3a | 0.85 | 0.15 |
| Torches | Brown | #4a3020 | - | - |
| Flames | Orange | #ff6600 | - | 1.0 (emissive) |

## Lighting Setup

```javascript
Ambient: #404040, 0.6 intensity
Player Light: #ffffdd, 2.5 intensity, 20 unit range, follows camera
Directional: #ffffff, 1.2 intensity, from (10,20,10)
Torches: #ff6600, 2.0 intensity, 12 unit range per torch
Fog: #111111, 5-30 units distance
```

## Key Constants

| Constant | Value | Location | Purpose |
|----------|-------|----------|---------|
| gridSize | 1 | main.js | Movement grid size |
| cellSize | 4 | main.js | 3D units per grid cell |
| wallHeight | 3.5 | main.js | Vertical size of rooms |
| movementDuration | 0.3s | main.js | Time to move one cell |
| rotationDuration | 0.3s | main.js | Time to rotate 90 degrees |
| attackCooldown | 500ms | main.js | Time between attacks |
| playerHP | 100 | main.js | Player health max |
| playerDamage | 25 | main.js | Damage per attack |
| attackRange | 2.5 | main.js | Max distance to hit |

## Dungeon Data Structure

```javascript
{
  grid: [            // 2D array: 0=wall, 1=floor
    [0,0,1,1,0,...],
    [0,1,1,1,0,...],
    ...
  ],
  rooms: [           // Array of room objects
    { x, y, width, height, centerX, centerY },
    ...
  ],
  corridors: [       // Array of corridor segments
    { type:'horizontal'/'vertical', x1, x2, y1, y2, x, y },
    ...
  ],
  width: 25,         // Grid width
  height: 25         // Grid height
}
```

## Enemy Spawn Positions

Currently hardcoded 5 spawn points:
```javascript
{ x: 3, y: 0.5, z: 0 }      // Near spawn
{ x: -3, y: 0.5, z: -2 }    // East
{ x: 0, y: 0.5, z: -5 }     // South
{ x: 5, y: 0.5, z: -3 }     // SE
{ x: -4, y: 0.5, z: 2 }     // NW
```

## Input Key Mapping

| Key | Action | Corresponding Function |
|-----|--------|------------------------|
| W / Up Arrow | Move Forward | move('forward') |
| S / Down Arrow | Move Backward | move('backward') |
| A / Left Arrow | Strafe Left | move('left') |
| D / Right Arrow | Strafe Right | move('right') |
| Q | Rotate Left | rotate(-1) |
| E | Rotate Right | rotate(1) |
| Space | Attack | attack() |

## Performance Targets

| Metric | Current | Target |
|--------|---------|--------|
| Draw Calls | ~400-600 | <500 |
| Frame Rate | 60fps | 60fps |
| FOV Distance | 5-30 units | Configurable |
| Torch Count | 10-15 | <20 |

## Texture Integration Checklist

Quick copy-paste for texture addition:

```javascript
// 1. Create loader
const textureLoader = new THREE.TextureLoader();

// 2. Load textures
const floorTexture = textureLoader.load('textures/floor.png');
floorTexture.repeat.set(4, 4);
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;

// 3. Add to material
const material = new THREE.MeshStandardMaterial({
  map: floorTexture,
  normalMap: textureLoader.load('textures/floor-normal.png'),
  roughnessMap: textureLoader.load('textures/floor-rough.png'),
  // ... rest of properties
});
```

## Decoration Placement Guide

```javascript
// Room type determination:
Large (>6x6): treasure or combat arena
Small (<4x4): safe room
Medium: generic

// Suggested decoration count by room type:
Treasure: 3-5 decorations
Combat: 2-4 decorations
Safe: 1-2 decorations
Generic: 1-3 decorations
Corridors: 0-2 per corridor segment
```

## Debug Tips

```javascript
// Log dungeon data
console.log('Dungeon:', game.dungeon.data);

// Log player position
console.log('Player at:', game.player.position);

// Check FPS
console.log(`FPS: ${1 / game.clock.getDelta()}`);

// Inspect torch list
console.log('Torches:', game.dungeon.builder.torches);

// Check scene children
console.log('Scene objects:', game.scene.children.length);

// Verify collision
console.log('Colliding?:', checkCollision(x, z));

// Enemy health
console.log('Enemy health:', game.enemies[0].health.current);
```

## Common Modifications

### Change Player HP
File: main.js, line 35
```javascript
this.health = new Health(100);  // Change 100 to desired value
```

### Change Movement Speed
File: main.js, line 173
```javascript
duration: 0.3  // Smaller = faster (min ~0.1), larger = slower
```

### Change Dungeon Size
File: main.js, line 394
```javascript
const generator = new DungeonGenerator(25, 25, {...})  // Change dimensions
```

### Adjust Lighting Brightness
File: main.js, line 385-388
```javascript
ambientIntensity: 0.5,  // Increase for brighter (0.0-1.0)
fogNear: 5,              // Closer fog = more enclosed feeling
fogFar: 30               // Farther fog = more open feeling
```

### Change Attack Properties
File: main.js, Player class
```javascript
this.attackPower = 25;    // Damage per hit
this.attackRange = 2.5;   // Distance to hit
this.attackCooldownMax = 500;  // Milliseconds between attacks
```

## Branch Information

| Branch | Purpose | Agent |
|--------|---------|-------|
| main | Integration point | Core team |
| textures-decorations | CURRENT - Add content | Agent 3 |
| modernized-controls | Improved input | Agent 1 |
| level-design-pois | POI system | Agent 2 |
| player-weapons | First-person hands | Agent 4 |
| modern-ui | UI/UX redesign | Agent 5 |
| narrative-text | Story/lore | Agent 6 |
| sound-audio | Audio system | Agent 7 |

## File Modification Guide

### Safe to Modify
- Color values in materials
- Position/scale values for decorations
- Room generation parameters
- Lighting intensity values
- UI text and styling

### Handle with Care
- Grid-based collision system (affects all movement)
- Material creation (multiple places reuse)
- Geometry creation (performance sensitive)
- Game loop timing (affects all systems)

### Don't Touch Without Refactoring
- Global game object structure
- Player/enemy class hierarchy
- Scene graph organization
- Three.js renderer initialization

## Related Documentation Files

- `CODEBASE_OVERVIEW.md` - Detailed architecture
- `TEXTURES_DECORATIONS_GUIDE.md` - Implementation guide
- `AGENT_PROMPTS.md` - Instructions for all 7 agents
- `FUTURE_FEATURES.md` - Planned work
- `PARALLEL_DEVELOPMENT.md` - Git workflow

