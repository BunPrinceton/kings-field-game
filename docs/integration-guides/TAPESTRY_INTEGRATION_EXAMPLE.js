// Example: Integrating TapestryDecorator into main.js
// Add this code after dungeon generation

import { TapestryDecorator } from './TapestryDecorator.js';

// ============================================================================
// INITIALIZATION (in main setup, with other decorators)
// ============================================================================

let tapestryDecorator;

async function initTapestries() {
  tapestryDecorator = new TapestryDecorator(scene);

  try {
    const loaded = await tapestryDecorator.loadAssets();
    if (loaded) {
      console.log('Tapestry assets loaded successfully');
      console.log(`- ${tapestryDecorator.heraldicsLoaded.size} heraldic designs`);
      console.log(`- ${tapestryDecorator.fabricsLoaded.size} fabric textures`);
    } else {
      console.warn('Failed to load tapestry assets');
    }
  } catch (error) {
    console.error('Error loading tapestries:', error);
  }

  return tapestryDecorator;
}

// ============================================================================
// DUNGEON DECORATION (after dungeon is built)
// ============================================================================

async function generateDungeon() {
  // ... existing dungeon generation code ...

  // Build dungeon
  const dungeonData = dungeonGenerator.generate();
  dungeonBuilder.build(dungeonData);

  // Existing decorations
  // furnitureDecorator.decorate(dungeonData);
  // paintingGallery.populate(dungeonData);
  // etc...

  // NEW: Add tapestries
  if (tapestryDecorator) {
    // Prepare dungeon data with wall information
    const enhancedDungeonData = prepareDungeonDataForTapestries(dungeonData);

    const count = tapestryDecorator.decorateWalls(enhancedDungeonData);
    console.log(`Decorated dungeon with ${count} tapestries`);
  }
}

// ============================================================================
// HELPER: Prepare dungeon data with wall information
// ============================================================================

function prepareDungeonDataForTapestries(dungeonData) {
  // If your dungeon data already includes wall info, return as-is
  if (dungeonData.rooms && dungeonData.rooms[0]?.walls) {
    return dungeonData;
  }

  // Otherwise, extract wall data from dungeon geometry
  const enhancedData = {
    rooms: []
  };

  // Extract rooms from dungeon data
  for (const room of dungeonData.rooms || []) {
    const roomData = {
      type: room.type || 'room',
      importance: calculateRoomImportance(room),
      x: room.x,
      z: room.z,
      width: room.width,
      height: room.height || 3,
      walls: extractWallsFromRoom(room)
    };

    enhancedData.rooms.push(roomData);
  }

  return enhancedData;
}

// ============================================================================
// HELPER: Extract wall segments from room
// ============================================================================

function extractWallsFromRoom(room) {
  const walls = [];
  const height = room.height || 3;

  // North wall (top edge)
  if (!room.doors?.north) {
    walls.push({
      position: new THREE.Vector3(
        room.x + room.width / 2,
        height / 2,
        room.z
      ),
      normal: new THREE.Vector3(0, 0, -1),
      width: room.width,
      height: height,
      isInterior: true,
      isCorner: false
    });
  }

  // South wall (bottom edge)
  if (!room.doors?.south) {
    walls.push({
      position: new THREE.Vector3(
        room.x + room.width / 2,
        height / 2,
        room.z + room.depth
      ),
      normal: new THREE.Vector3(0, 0, 1),
      width: room.width,
      height: height,
      isInterior: true,
      isCorner: false
    });
  }

  // East wall (right edge)
  if (!room.doors?.east) {
    walls.push({
      position: new THREE.Vector3(
        room.x + room.width,
        height / 2,
        room.z + room.depth / 2
      ),
      normal: new THREE.Vector3(1, 0, 0),
      width: room.depth,
      height: height,
      isInterior: true,
      isCorner: false
    });
  }

  // West wall (left edge)
  if (!room.doors?.west) {
    walls.push({
      position: new THREE.Vector3(
        room.x,
        height / 2,
        room.z + room.depth / 2
      ),
      normal: new THREE.Vector3(-1, 0, 0),
      width: room.depth,
      height: height,
      isInterior: true,
      isCorner: false
    });
  }

  return walls;
}

// ============================================================================
// HELPER: Calculate room importance (0-1)
// ============================================================================

function calculateRoomImportance(room) {
  const type = room.type || 'room';

  // Throne rooms and boss rooms are most important
  if (type.includes('throne') || type.includes('boss')) {
    return 1.0;
  }

  // Royal/special rooms
  if (type.includes('royal') || type.includes('treasure')) {
    return 0.9;
  }

  // Large rooms
  if (type.includes('hall') || type.includes('grand')) {
    return 0.7;
  }

  // Military rooms
  if (type.includes('barracks') || type.includes('armory')) {
    return 0.6;
  }

  // Standard rooms
  if (room.width * room.depth > 50) {
    return 0.6; // Large rooms
  } else if (room.width * room.depth > 25) {
    return 0.5; // Medium rooms
  } else {
    return 0.3; // Small rooms
  }
}

// ============================================================================
// ANIMATION LOOP (add to main animation function)
// ============================================================================

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  // ... existing animation code ...

  // NEW: Animate tapestries (cloth swaying)
  if (tapestryDecorator) {
    tapestryDecorator.animate(deltaTime);
  }

  renderer.render(scene, camera);
}

// ============================================================================
// CLEANUP (on level change or game exit)
// ============================================================================

function cleanupLevel() {
  // ... existing cleanup ...

  // NEW: Cleanup tapestries
  if (tapestryDecorator) {
    tapestryDecorator.dispose();
  }
}

// ============================================================================
// INITIALIZATION SEQUENCE
// ============================================================================

async function init() {
  // ... existing Three.js setup ...

  // Initialize systems
  await initTapestries();

  // Generate first dungeon
  await generateDungeon();

  // Start animation loop
  animate();
}

// Start the game
init();

// ============================================================================
// EXAMPLE: Manual tapestry placement for specific locations
// ============================================================================

function placeThroneTapestries() {
  // Place large royal tapestry behind throne
  tapestryDecorator.placeOnWall(
    new THREE.Vector3(0, 1.5, 0),    // Behind throne position
    new THREE.Vector3(0, 0, 1),       // Facing forward
    [4, 3],                           // 4 wide × 3 tall
    'dragon_crest',                   // Royal dragon
    'red_velvet'                      // Crimson velvet
  );

  // Place matching banners on side walls
  tapestryDecorator.placeOnWall(
    new THREE.Vector3(-3, 1.5, 0),
    new THREE.Vector3(1, 0, 0),
    [1, 3],
    'royal_lion',
    'gold_brocade'
  );

  tapestryDecorator.placeOnWall(
    new THREE.Vector3(3, 1.5, 0),
    new THREE.Vector3(-1, 0, 0),
    [1, 3],
    'royal_lion',
    'gold_brocade'
  );
}

// ============================================================================
// EXAMPLE: Debug visualization
// ============================================================================

function debugTapestries() {
  console.log('=== Tapestry Debug Info ===');
  console.log('Heraldics loaded:', tapestryDecorator.heraldicsLoaded.size);
  console.log('Fabrics loaded:', tapestryDecorator.fabricsLoaded.size);
  console.log('Tapestries placed:', tapestryDecorator.tapestries.length);

  // List all placed tapestries
  tapestryDecorator.tapestries.forEach((tapestry, index) => {
    console.log(`Tapestry ${index}:`, {
      position: tapestry.position,
      size: tapestry.userData.size
    });
  });
}

// ============================================================================
// EXAMPLE: Custom room-specific decoration
// ============================================================================

function decorateSpecialRooms(dungeonData) {
  for (const room of dungeonData.rooms) {
    switch (room.type) {
      case 'throne_room':
        // Place elaborate royal tapestries
        placeThroneTapestries();
        break;

      case 'armory':
        // Place military-themed banners
        room.walls.forEach(wall => {
          if (Math.random() < 0.4) {
            tapestryDecorator.placeOnWall(
              wall.position,
              wall.normal,
              [1, 2],
              'sword_cross',
              'green_linen'
            );
          }
        });
        break;

      case 'hall':
        // Alternating heraldic designs
        room.walls.forEach((wall, index) => {
          if (index % 2 === 0 && wall.width >= 2) {
            const heraldic = index % 4 === 0 ? 'eagle_emblem' : 'castle_fortress';
            tapestryDecorator.placeOnWall(
              wall.position,
              wall.normal,
              [2, 2],
              heraldic,
              'blue_silk'
            );
          }
        });
        break;
    }
  }
}
