# Furniture and Structural Elements System

## Overview

The Furniture System adds comprehensive medieval dungeon furniture and structural elements to the King's Field game, including doors, gates, tables, chairs, beds, storage, equipment displays, and various decorative items.

## System Architecture

### Core Components

1. **FurnitureManager.js** - Main furniture creation and interaction system
2. **FurnitureDecorator.js** - Automatic room decoration based on POI types
3. **Integration in main.js** - Player interaction and initialization

## Furniture Categories

### Doors (5 variants with open/close functionality)
- **Wooden Door** - Standard wooden door with cross beams and metal handle
- **Iron Door** - Heavy reinforced metal door with rivets
- **Ornate Door** - Decorative twin-panel door with gold trim and ornaments
- **Reinforced Door** - Heavy wooden door with metal bands and corner reinforcements
- **Broken Door** - Damaged door pieces at odd angles

### Gates (3 variants with raise/lower or swing mechanics)
- **Portcullis** - Classic castle gate with vertical bars and spikes, raises/lowers
- **Large Gate** - Massive twin-panel gate for main entrances, swings open
- **Dungeon Gate** - Heavy iron grid gate, swings open

### Tables (4 variants)
- **Dining Table** - Standard rectangular table with four legs
- **Work Table** - Rugged table with lower shelf for workshops
- **Round Table** - Circular table with central pedestal
- **Banquet Table** - Extra-long table with six legs for large gatherings

### Chairs and Seating (4 variants)
- **Wooden Chair** - Simple chair with backrest
- **Throne** - Ornate high-backed chair with armrests and crown decoration
- **Bench** - Long seating for multiple people
- **Stool** - Simple three-legged stool

### Beds (3 variants)
- **Straw Bed** - Simple wooden frame with straw mattress
- **Wooden Bed** - Bed with posts, mattress, and headboard
- **Canopy Bed** - Luxurious four-poster bed with canopy

### Storage (5 variants)
- **Shelf** - Simple wall shelf with three levels
- **Bookcase** - Tall bookcase with books on shelves
- **Cabinet** - Storage cabinet with doors and handles
- **Wardrobe** - Large clothing storage with double doors
- **Chest** - Treasure chest with metal bands and lock

### Equipment Storage (3 variants)
- **Weapon Rack** - Wall-mounted rack displaying swords
- **Armor Stand** - Mannequin displaying armor and helmet
- **Shield Rack** - Wall display with multiple shields

### Miscellaneous Items (17+ variants)
- **Desk** - Writing desk with drawer
- **Crate** (Small/Medium/Large) - Wooden storage crates
- **Barrel** (Small/Large) - Wooden barrels with metal bands
- **Box** - Small storage box
- **Debris Pile** - Random scattered debris
- **Broken Furniture** - Damaged table/chair parts
- **Chandelier** - Hanging ceiling light with multiple candles
- **Candelabra** - Standing candle holder with three arms
- **Lectern** - Book reading stand with open book
- **Anvil** - Blacksmith anvil
- **Forge** - Working forge with glowing coals and chimney
- **Coffin** - Simple wooden coffin
- **Sarcophagus** - Ornate stone sarcophagus with carved figure

## Furniture Conditions

All furniture can be created in different states of wear:

- **PRISTINE** - Perfect condition, bright colors
- **GOOD** - Well-maintained, minimal wear
- **WORN** - Noticeable wear, darker colors (default)
- **DAMAGED** - Heavily worn, significant damage
- **BROKEN** - Completely broken or unusable

## Room Decoration Themes

The FurnitureDecorator automatically populates rooms based on their POI type:

### Entrance Room
- Benches for resting
- Weapon rack
- Supply crates and barrels

### Exit Room
- Ornate doors
- Dramatic lighting with candelabras

### Treasure Room
- Multiple chests (interactable)
- Weapon racks with treasures
- Armor stands
- Supply crates and barrels

### Boss Room
- Throne for the boss
- Weapon racks (boss's collection)
- Armor stands
- Broken furniture from battles
- Debris piles

### Safe Room (Rest Area)
- Beds for resting
- Table and chairs
- Shelf with supplies
- Candelabra for light

### Puzzle Room
- Lecterns with clues
- Bookcases with ancient knowledge
- Movable crates

### Hub Room (Central Gathering)
- Large banquet table with chairs
- Chandelier lighting
- Weapon and armor storage
- Supply barrels

### Landmark Room
- Sarcophagus as centerpiece
- Surrounding candelabras
- Weapon racks as offerings
- Shield displays

### Standard Rooms (Randomly themed)

#### Barracks/Bedroom
- Multiple beds
- Storage chests
- Weapon rack
- Stools

#### Dining Area
- Dining table with chairs and benches
- Food storage barrels and crates

#### Storage Room
- Multiple crates and barrels
- Shelving units

#### Library/Study
- Bookcases filled with books
- Desk and chair
- Lecterns
- Reading candelabra

#### Armory
- Multiple weapon racks
- Armor stands in formation
- Shield displays
- Equipment crates

#### Workshop
- Anvil and forge
- Work table with stool
- Material crates and boxes

#### Abandoned/Ruined
- Broken furniture
- Debris piles
- Damaged chests
- Broken doors

## Interaction System

### Controls
- **E Key** - Interact with nearby furniture

### Interactable Furniture
- **Doors** - Press E to open/close (smooth swing animation)
- **Gates** - Press E to open/close (twin panels swing apart)
- **Portcullis** - Press E to raise/lower (vertical movement)
- **Chests** - Press E to open (future inventory/loot integration)

### Interaction Detection
- Uses raycasting from player camera
- 3.0 unit interaction range
- Must be looking at interactable object
- Visual feedback in console

## Technical Details

### Material System
- **Cached materials** to reduce memory usage
- Materials vary by condition (pristine to broken)
- Wood types: Standard, rich, dark
- Metal types: Iron, dark iron, gold
- Other materials: Stone, leather, cloth, velvet, straw

### Animation System
- Smooth easing functions (easeInOutQuad)
- Door swing: 500ms animation
- Portcullis raise/lower: 1000ms animation
- Gate swing: 800ms animation

### Performance Optimizations
- Material caching prevents duplicate materials
- Modular furniture creation
- Efficient geometry reuse
- Conditional rendering based on room type

## Integration with Game Systems

### Collision Detection
Furniture can be marked as collidable for:
- Blocking player movement
- Creating obstacles in combat
- Puzzle mechanics

### Lighting Integration
Several furniture types emit light:
- Chandelier (6 candles)
- Candelabra (3 candles)
- Forge (glowing coals)

### Room Classification
Works with existing POI system from DungeonGenerator:
- POIType.ENTRANCE
- POIType.EXIT
- POIType.TREASURE
- POIType.BOSS
- POIType.SAFE
- POIType.PUZZLE
- POIType.HUB
- POIType.LANDMARK
- POIType.STANDARD

## Usage Examples

### Creating Individual Furniture

```javascript
import { FurnitureManager, FurnitureType, FurnitureCondition } from './FurnitureManager.js';

const furnitureManager = new FurnitureManager(scene, {
    cellSize: 4,
    wallHeight: 3.5,
    enableInteraction: true
});

// Create a pristine throne
const throne = furnitureManager.createFurniture(
    FurnitureType.THRONE,
    { x: 10, y: 0, z: 10 },
    {
        rotation: Math.PI,
        condition: FurnitureCondition.PRISTINE,
        scale: 1,
        interactable: false
    }
);

// Create an interactable door
const door = furnitureManager.createFurniture(
    FurnitureType.WOODEN_DOOR,
    { x: 5, y: 0, z: 5 },
    {
        rotation: 0,
        condition: FurnitureCondition.GOOD,
        interactable: true,
        state: { isOpen: false }
    }
);
```

### Automatic Room Decoration

```javascript
import { FurnitureDecorator } from './FurnitureDecorator.js';

const decorator = new FurnitureDecorator(scene, dungeonData, {
    cellSize: 4,
    wallHeight: 3.5,
    furnitureDensity: 0.6
});

// Decorate all rooms automatically
decorator.decorateRooms();

// Add doors to corridors
decorator.addDoorsToCorridors();
```

### Manual Interaction

```javascript
// Get furniture manager from decorator
const furnitureManager = decorator.getFurnitureManager();

// Interact with furniture object
const success = furnitureManager.interact(furnitureObject);

// Check if furniture is interactable
if (furnitureManager.canInteract(furnitureObject)) {
    // Do something
}

// Manually toggle specific furniture
furnitureManager.toggleDoor(doorObject);
furnitureManager.togglePortcullis(portcullisObject);
furnitureManager.toggleGate(gateObject);
```

## File Locations

- `/src/FurnitureManager.js` - Core furniture system (2000+ lines)
- `/src/FurnitureDecorator.js` - Automatic decoration system (750+ lines)
- `/src/main.js` - Integration and player interaction

## Statistics

### Total Furniture Types: 39+

**Doors**: 5
**Gates**: 3
**Tables**: 4
**Chairs**: 4
**Beds**: 3
**Storage**: 5
**Equipment**: 3
**Miscellaneous**: 17+

### Interactable Furniture: 11+
- All doors (5 types)
- All gates (3 types)
- Chests (expandable for loot)

### Condition States: 5
- Pristine, Good, Worn, Damaged, Broken

### Room Themes: 14
- 8 POI-specific themes
- 6 standard room themes

## Future Enhancements

### Potential Additions
1. Loot system for chests and containers
2. Destructible furniture (physics)
3. Furniture crafting system
4. More furniture variants (tables, chairs, etc.)
5. Texture support for materials
6. Furniture durability and degradation
7. Sound effects for interactions
8. Particle effects (dust, smoke from forge)
9. Furniture combinations (set bonuses for room themes)
10. Dynamic furniture placement based on player actions

### Integration Opportunities
1. Quest system (interact with specific furniture)
2. Trap integration (mimics, trapped chests)
3. NPC interactions (sitting, using furniture)
4. Crafting stations (forge, anvil, work table)
5. Rest mechanics (beds restore health/mana)
6. Reading mechanics (books on lecterns)

## Notes

- All furniture uses procedural mesh generation (no external models)
- Material caching ensures efficient memory usage
- Smooth animations provide polished player experience
- Modular design allows easy addition of new furniture types
- Integrates seamlessly with existing dungeon generation
- Collision detection ready (not yet implemented in movement system)
