import * as THREE from 'three';
import { DungeonGenerator } from './DungeonGenerator.js';
import { DungeonBuilder } from './DungeonBuilder.js';
import { AtmosphericLighting } from './AtmosphericLighting.js';

// Game state
const game = {
    scene: null,
    camera: null,
    renderer: null,
    player: {
        position: { x: 0, y: 1.6, z: 5 },
        rotation: { x: 0, y: 0 }
    },
    gridSize: 1, // Size of each grid cell
    movement: {
        isMoving: false,
        isRotating: false,
        startPos: { x: 0, z: 5 },
        targetPos: { x: 0, z: 5 },
        startRot: 0,
        targetRot: 0,
        progress: 0,
        duration: 0.3 // seconds
    },
    collidableObjects: [], // Objects that block movement
    keys: {}, // Track key states
    clock: null, // For delta time calculation
    dungeon: {
        generator: null,
        builder: null,
        data: null
    },
    lighting: null,
    time: 0
};

// Input handling
function setupInput() {
    window.addEventListener('keydown', (e) => {
        if (game.keys[e.key.toLowerCase()]) return; // Already pressed
        game.keys[e.key.toLowerCase()] = true;

        // Handle movement and rotation
        handleInput(e.key.toLowerCase());
    });

    window.addEventListener('keyup', (e) => {
        game.keys[e.key.toLowerCase()] = false;
    });
}

function handleInput(key) {
    // Don't accept input if already moving or rotating
    if (game.movement.isMoving || game.movement.isRotating) return;

    const moveMap = {
        'w': 'forward',
        'arrowup': 'forward',
        's': 'backward',
        'arrowdown': 'backward',
        'a': 'left',
        'arrowleft': 'left',
        'd': 'right',
        'arrowright': 'right',
        'q': 'rotateLeft',
        'e': 'rotateRight'
    };

    const action = moveMap[key];
    if (!action) return;

    if (action === 'rotateLeft' || action === 'rotateRight') {
        rotate(action === 'rotateLeft' ? -1 : 1);
    } else {
        move(action);
    }
}

// Check if a grid position has a collision
function checkCollision(gridX, gridZ) {
    for (const obj of game.collidableObjects) {
        const objGridPos = obj.userData.gridPos;
        if (objGridPos && objGridPos.x === gridX && objGridPos.z === gridZ) {
            return true;
        }
    }
    return false;
}

// Calculate movement direction based on current rotation and move direction
function getMovementVector(direction) {
    const angle = game.player.rotation.y;
    const vectors = {
        forward: { x: Math.sin(angle), z: Math.cos(angle) },
        backward: { x: -Math.sin(angle), z: -Math.cos(angle) },
        left: { x: Math.sin(angle - Math.PI / 2), z: Math.cos(angle - Math.PI / 2) },
        right: { x: Math.sin(angle + Math.PI / 2), z: Math.cos(angle + Math.PI / 2) }
    };

    const vec = vectors[direction];
    return {
        x: Math.round(vec.x),
        z: Math.round(vec.z)
    };
}

// Initiate movement
function move(direction) {
    const moveVec = getMovementVector(direction);
    const currentGridX = Math.round(game.player.position.x / game.gridSize);
    const currentGridZ = Math.round(game.player.position.z / game.gridSize);

    const targetGridX = currentGridX + moveVec.x;
    const targetGridZ = currentGridZ + moveVec.z;

    // Check collision
    if (checkCollision(targetGridX, targetGridZ)) {
        console.log('Collision detected!');
        return;
    }

    // Start movement animation
    game.movement.isMoving = true;
    game.movement.progress = 0;
    game.movement.startPos.x = game.player.position.x;
    game.movement.startPos.z = game.player.position.z;
    game.movement.targetPos.x = targetGridX * game.gridSize;
    game.movement.targetPos.z = targetGridZ * game.gridSize;
}

// Initiate rotation
function rotate(direction) {
    game.movement.isRotating = true;
    game.movement.progress = 0;
    game.movement.startRot = game.player.rotation.y;
    game.movement.targetRot = game.player.rotation.y + (direction * Math.PI / 2);
}

// Easing function for smooth movement
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Update movement animation
function updateMovement(deltaTime) {
    if (!game.movement.isMoving && !game.movement.isRotating) return;

    game.movement.progress += deltaTime / game.movement.duration;

    if (game.movement.progress >= 1) {
        game.movement.progress = 1;
    }

    const easedProgress = easeInOutCubic(game.movement.progress);

    // Update position
    if (game.movement.isMoving) {
        game.player.position.x = THREE.MathUtils.lerp(
            game.movement.startPos.x,
            game.movement.targetPos.x,
            easedProgress
        );
        game.player.position.z = THREE.MathUtils.lerp(
            game.movement.startPos.z,
            game.movement.targetPos.z,
            easedProgress
        );
    }

    // Update rotation
    if (game.movement.isRotating) {
        game.player.rotation.y = THREE.MathUtils.lerp(
            game.movement.startRot,
            game.movement.targetRot,
            easedProgress
        );
    }

    // Update camera
    game.camera.position.x = game.player.position.x;
    game.camera.position.z = game.player.position.z;
    game.camera.rotation.y = game.player.rotation.y;

    // End movement when complete
    if (game.movement.progress >= 1) {
        game.movement.isMoving = false;
        game.movement.isRotating = false;
        game.movement.progress = 0;
    }
}

// Initialize the game
function init() {
    // Create clock for delta time
    game.clock = new THREE.Clock();

    // Scene setup
    game.scene = new THREE.Scene();

    // Camera setup (first-person view)
    game.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    // Renderer setup
    game.renderer = new THREE.WebGLRenderer({ antialias: true });
    game.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(game.renderer.domElement);
    game.renderer.domElement.id = 'game-canvas';

    // Setup atmospheric lighting
    game.lighting = new AtmosphericLighting(game.scene, {
        ambientIntensity: 0.12,
        fogNear: 0.5,
        fogFar: 18
    });
    game.lighting.setupFog();
    game.lighting.enableShadows(game.renderer);

    // Generate dungeon
    game.dungeon.generator = new DungeonGenerator(25, 25, {
        minRoomSize: 3,
        maxRoomSize: 8,
        maxRooms: 12
    });

    game.dungeon.data = game.dungeon.generator.generate();

    // Build dungeon geometry
    game.dungeon.builder = new DungeonBuilder(game.scene, game.dungeon.data, {
        cellSize: 4,
        wallHeight: 3.5
    });
    game.dungeon.builder.build();

    // Set player spawn position
    const spawnPos = game.dungeon.generator.getSpawnPosition();
    game.player.position.x = spawnPos.x * 4;
    game.player.position.z = spawnPos.z * 4;

    game.camera.position.set(
        game.player.position.x,
        game.player.position.y,
        game.player.position.z
    );

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Setup input controls
    setupInput();

    // Update UI
    document.querySelector('#ui div').textContent = 'Kings Field - Ready | WASD: Move | Q/E: Rotate';

    // Start game loop
    animate();
}

function onWindowResize() {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Update movement
    const deltaTime = game.clock.getDelta();
    updateMovement(deltaTime);

    // Update game time
    game.time += deltaTime;

    // Update atmospheric effects
    if (game.lighting) {
        game.lighting.update(game.time);
        game.lighting.updatePlayerLight(game.camera.position);
    }

    // Animate torches
    if (game.dungeon.builder) {
        game.dungeon.builder.animateTorches(game.time);
    }

    game.renderer.render(game.scene, game.camera);
}

// Start the game
init();
