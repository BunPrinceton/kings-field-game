import * as THREE from 'three';
import { DungeonGenerator } from './DungeonGenerator.js';
import { DungeonBuilder } from './DungeonBuilder.js';
import { AtmosphericLighting } from './AtmosphericLighting.js';

// Health system class
class Health {
    constructor(maxHealth) {
        this.max = maxHealth;
        this.current = maxHealth;
    }

    takeDamage(amount) {
        this.current = Math.max(0, this.current - amount);
        return this.current <= 0;
    }

    heal(amount) {
        this.current = Math.min(this.max, this.current + amount);
    }

    getPercentage() {
        return (this.current / this.max) * 100;
    }

    isDead() {
        return this.current <= 0;
    }
}

// Player class
class Player {
    constructor(scene) {
        this.scene = scene;
        this.health = new Health(100);
        this.position = { x: 0, y: 1.6, z: 5 };
        this.rotation = { x: 0, y: 0 };
        this.attackPower = 25;
        this.attackRange = 2.5;
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.attackCooldownMax = 500; // milliseconds
    }

    attack(enemies) {
        if (this.isAttacking || this.attackCooldown > 0) {
            return null;
        }

        this.isAttacking = true;
        this.attackCooldown = this.attackCooldownMax;

        // Find enemies in attack range
        const playerPos = new THREE.Vector3(this.position.x, this.position.y, this.position.z);
        let closestEnemy = null;
        let closestDistance = this.attackRange;

        for (const enemy of enemies) {
            if (enemy.isDead()) continue;

            const enemyPos = enemy.mesh.position;
            const distance = playerPos.distanceTo(enemyPos);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        }

        setTimeout(() => {
            this.isAttacking = false;
        }, 200);

        return closestEnemy;
    }

    update(deltaTime) {
        if (this.attackCooldown > 0) {
            this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
        }
    }
}

// Enemy class
class Enemy {
    constructor(scene, position) {
        this.scene = scene;
        this.health = new Health(50);
        this.attackPower = 10;

        // Create enemy mesh (red sphere)
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0x330000
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, position.y, position.z);
        this.scene.add(this.mesh);

        // Store original color for damage flash
        this.originalColor = 0xff0000;
        this.damageFlashDuration = 0;
    }

    takeDamage(amount) {
        const dead = this.health.takeDamage(amount);

        // Flash white when hit
        this.mesh.material.color.setHex(0xffffff);
        this.damageFlashDuration = 150;

        if (dead) {
            this.die();
        }

        return dead;
    }

    die() {
        // Animate death (fade out and shrink)
        const startScale = this.mesh.scale.clone();
        const startTime = Date.now();
        const duration = 500;

        const animateDeath = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            this.mesh.scale.lerp(new THREE.Vector3(0.1, 0.1, 0.1), progress);
            this.mesh.material.opacity = 1 - progress;
            this.mesh.material.transparent = true;

            if (progress < 1) {
                requestAnimationFrame(animateDeath);
            } else {
                this.scene.remove(this.mesh);
            }
        };

        animateDeath();
    }

    update(deltaTime) {
        if (this.damageFlashDuration > 0) {
            this.damageFlashDuration -= deltaTime;
            if (this.damageFlashDuration <= 0) {
                this.mesh.material.color.setHex(this.originalColor);
            }
        }
    }

    isDead() {
        return this.health.isDead();
    }
}

// Control configuration system
const controls = {
    // Keybindings (remappable)
    keys: {
        forward: ['w', 'arrowup'],
        backward: ['s', 'arrowdown'],
        strafeLeft: ['a', 'arrowleft'],
        strafeRight: ['d', 'arrowright'],
        rotateLeft: ['q'],
        rotateRight: ['e'],
        attack: ['space'],
        interact: ['f'],
        sprint: ['shift'],
        toggleMouseLook: ['m']
    },

    // Mouse look settings
    mouseLook: {
        enabled: false,
        sensitivity: 0.002,
        smoothing: 0.15,
        invertY: false,
        locked: false
    },

    // Movement settings
    movement: {
        normalDuration: 0.3,    // Normal movement speed (seconds)
        sprintDuration: 0.15,   // Sprint movement speed (faster)
        rotationDuration: 0.25, // Rotation speed
        cameraSmoothing: 0.2    // Camera rotation smoothing
    }
};

// Game state
const game = {
    scene: null,
    camera: null,
    renderer: null,
    player: null, // Will be Player class instance
    gridSize: 1, // Size of each grid cell
    movement: {
        isMoving: false,
        isRotating: false,
        startPos: { x: 0, z: 5 },
        targetPos: { x: 0, z: 5 },
        startRot: 0,
        targetRot: 0,
        progress: 0,
        duration: 0.3, // seconds (will vary based on sprint)
        isSprinting: false
    },
    camera: {
        rotation: { x: 0, y: 0 }, // Independent camera rotation
        targetRotation: { x: 0, y: 0 },
        smoothRotation: { x: 0, y: 0 }
    },
    collidableObjects: [], // Objects that block movement
    keys: {}, // Track key states
    mouse: {
        deltaX: 0,
        deltaY: 0
    },
    clock: null, // For delta time calculation
    dungeon: {
        generator: null,
        builder: null,
        data: null
    },
    lighting: null,
    time: 0,
    enemies: [],
    lastTime: 0,
    input: {
        attack: false,
        interact: false,
        sprint: false
    }
};

// Helper function to check if a key matches an action
function isKeyForAction(key, action) {
    const keyLower = key.toLowerCase();
    return controls.keys[action]?.includes(keyLower) || false;
}

// Input handling
function setupInput() {
    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();

        // Handle toggle mouse look
        if (isKeyForAction(key, 'toggleMouseLook')) {
            e.preventDefault();
            toggleMouseLook();
            return;
        }

        // Handle attack
        if (isKeyForAction(key, 'attack')) {
            e.preventDefault();
            game.input.attack = true;
        }

        // Handle interact
        if (isKeyForAction(key, 'interact')) {
            e.preventDefault();
            game.input.interact = true;
        }

        // Handle sprint
        if (isKeyForAction(key, 'sprint')) {
            e.preventDefault();
            game.input.sprint = true;
        }

        // Handle movement
        if (game.keys[key]) return; // Already pressed
        game.keys[key] = true;
        handleInput(key);
    });

    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();

        // Handle attack release
        if (isKeyForAction(key, 'attack')) {
            e.preventDefault();
            game.input.attack = false;
        }

        // Handle interact release
        if (isKeyForAction(key, 'interact')) {
            e.preventDefault();
            game.input.interact = false;
        }

        // Handle sprint release
        if (isKeyForAction(key, 'sprint')) {
            e.preventDefault();
            game.input.sprint = false;
        }

        // Handle movement release
        game.keys[key] = false;
    });

    // Mouse movement for mouse look
    window.addEventListener('mousemove', (e) => {
        if (!controls.mouseLook.enabled || !controls.mouseLook.locked) return;

        game.mouse.deltaX = e.movementX;
        game.mouse.deltaY = e.movementY;
    });

    // Pointer lock for mouse look
    document.addEventListener('click', () => {
        if (controls.mouseLook.enabled && !controls.mouseLook.locked) {
            game.renderer.domElement.requestPointerLock();
        }
    });

    document.addEventListener('pointerlockchange', () => {
        controls.mouseLook.locked = document.pointerLockElement === game.renderer.domElement;
    });
}

function handleInput(key) {
    // Check for actions
    let action = null;

    if (isKeyForAction(key, 'forward')) action = 'forward';
    else if (isKeyForAction(key, 'backward')) action = 'backward';
    else if (isKeyForAction(key, 'strafeLeft')) action = 'left';
    else if (isKeyForAction(key, 'strafeRight')) action = 'right';
    else if (isKeyForAction(key, 'rotateLeft')) action = 'rotateLeft';
    else if (isKeyForAction(key, 'rotateRight')) action = 'rotateRight';

    if (!action) return;

    // In mouse look mode, disable Q/E rotation (use mouse instead)
    if (controls.mouseLook.enabled && (action === 'rotateLeft' || action === 'rotateRight')) {
        return;
    }

    // Don't accept input if already moving or rotating
    if (game.movement.isMoving || game.movement.isRotating) return;

    if (action === 'rotateLeft' || action === 'rotateRight') {
        rotate(action === 'rotateLeft' ? -1 : 1);
    } else {
        move(action);
    }
}

// Toggle mouse look mode
function toggleMouseLook() {
    controls.mouseLook.enabled = !controls.mouseLook.enabled;

    if (controls.mouseLook.enabled) {
        // Request pointer lock
        game.renderer.domElement.requestPointerLock();
        console.log('Mouse look enabled - Click to lock cursor');
    } else {
        // Exit pointer lock
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
        // Sync camera rotation with player rotation when disabling
        game.camera.rotation.y = game.player.rotation.y;
        game.camera.targetRotation.y = game.player.rotation.y;
        console.log('Mouse look disabled - Using keyboard rotation');
    }

    updateUI();
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
    // Use camera rotation for movement direction when mouse look is enabled
    // This allows strafing while looking in a different direction
    const angle = controls.mouseLook.enabled ? game.camera.rotation.y : game.player.rotation.y;

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

    // Determine movement duration based on sprint
    const isSprinting = game.input.sprint;
    game.movement.duration = isSprinting ?
        controls.movement.sprintDuration :
        controls.movement.normalDuration;
    game.movement.isSprinting = isSprinting;

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
    game.movement.duration = controls.movement.rotationDuration;

    // When not in mouse look mode, sync camera rotation with player
    if (!controls.mouseLook.enabled) {
        game.camera.targetRotation.y = game.movement.targetRot;
    }
}

// Easing function for smooth movement
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Update camera rotation (mouse look and smoothing)
function updateCamera(deltaTime) {
    // Handle mouse look
    if (controls.mouseLook.enabled && controls.mouseLook.locked) {
        // Apply mouse movement to camera rotation
        game.camera.targetRotation.y -= game.mouse.deltaX * controls.mouseLook.sensitivity;
        game.camera.targetRotation.x -= game.mouse.deltaY * controls.mouseLook.sensitivity * (controls.mouseLook.invertY ? -1 : 1);

        // Clamp vertical rotation to prevent camera flipping
        game.camera.targetRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, game.camera.targetRotation.x));

        // Reset mouse delta
        game.mouse.deltaX = 0;
        game.mouse.deltaY = 0;
    }

    // Smooth camera rotation
    const smoothing = controls.movement.cameraSmoothing;
    game.camera.rotation.y = THREE.MathUtils.lerp(
        game.camera.rotation.y,
        game.camera.targetRotation.y,
        smoothing
    );
    game.camera.rotation.x = THREE.MathUtils.lerp(
        game.camera.rotation.x,
        game.camera.targetRotation.x,
        smoothing
    );

    // Update Three.js camera rotation
    game.camera.obj.rotation.x = game.camera.rotation.x;
    game.camera.obj.rotation.y = game.camera.rotation.y;
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

        // In keyboard mode, sync camera with player rotation
        if (!controls.mouseLook.enabled) {
            game.camera.rotation.y = game.player.rotation.y;
            game.camera.targetRotation.y = game.player.rotation.y;
        }
    }

    // Update camera position to follow player
    game.camera.obj.position.x = game.player.position.x;
    game.camera.obj.position.z = game.player.position.z;

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
    const threeCamera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    // Store Three.js camera object in game.camera.obj
    game.camera.obj = threeCamera;

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

    // Initialize player (now as Player class instance)
    game.player = new Player(game.scene);

    // Set player spawn position
    const spawnPos = game.dungeon.generator.getSpawnPosition();
    game.player.position.x = spawnPos.x * 4;
    game.player.position.z = spawnPos.z * 4;

    // Initialize camera position and rotation
    game.camera.obj.position.set(
        game.player.position.x,
        game.player.position.y,
        game.player.position.z
    );

    // Initialize camera rotation to match player
    game.camera.rotation.y = game.player.rotation.y;
    game.camera.targetRotation.y = game.player.rotation.y;
    game.camera.obj.rotation.y = game.player.rotation.y;

    // Spawn enemies in the dungeon
    spawnEnemies();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Setup input controls
    setupInput();

    // Update UI
    updateUI();

    // Start game loop
    game.lastTime = performance.now();
    animate();
}

// Spawn enemies in the dungeon
function spawnEnemies() {
    const enemyPositions = [
        { x: 3, y: 0.5, z: 0 },
        { x: -3, y: 0.5, z: -2 },
        { x: 0, y: 0.5, z: -5 },
        { x: 5, y: 0.5, z: -3 },
        { x: -4, y: 0.5, z: 2 }
    ];

    for (const pos of enemyPositions) {
        const enemy = new Enemy(game.scene, pos);
        game.enemies.push(enemy);
    }
}

// Update UI display
function updateUI() {
    const healthPercent = game.player.health.getPercentage();
    const healthColor = healthPercent > 50 ? '#0f0' : healthPercent > 25 ? '#ff0' : '#f00';

    // Control mode indicator
    const controlMode = controls.mouseLook.enabled ? 'Mouse Look' : 'Classic';
    const controlColor = controls.mouseLook.enabled ? '#0af' : '#0f0';

    const uiHTML = `
        <div style="font-size: 16px;">
            <div style="margin-bottom: 10px;">Kings Field - Modernized Controls</div>
            <div style="margin-bottom: 5px;">
                Health: <span style="color: ${healthColor}">${game.player.health.current}/${game.player.health.max}</span>
            </div>
            <div style="background: #333; width: 200px; height: 20px; border: 2px solid #fff; margin-bottom: 10px;">
                <div style="background: ${healthColor}; width: ${healthPercent}%; height: 100%; transition: width 0.3s;"></div>
            </div>
            <div style="font-size: 12px; opacity: 0.7;">
                Enemies: ${game.enemies.filter(e => !e.isDead()).length}/${game.enemies.length}
            </div>
            <div style="font-size: 12px; margin-top: 10px; padding: 5px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                <div style="color: ${controlColor}; margin-bottom: 5px; font-weight: bold;">
                    Mode: ${controlMode}
                </div>
                <div style="opacity: 0.9; line-height: 1.4;">
                    ${controls.mouseLook.enabled ? `
                        <div>Mouse: Look | WASD: Move (Camera-relative)</div>
                        <div>Shift: Sprint | F: Interact | Space: Attack</div>
                        <div>M: Toggle Mouse Look</div>
                        ${controls.mouseLook.locked ? '<div style="color: #0f0;">🔒 Cursor Locked</div>' : '<div style="color: #f80;">Click to lock cursor</div>'}
                    ` : `
                        <div>WASD: Move | Q/E: Rotate 90°</div>
                        <div>Shift: Sprint | F: Interact | Space: Attack</div>
                        <div>M: Enable Mouse Look</div>
                    `}
                </div>
            </div>
        </div>
    `;

    document.querySelector('#ui').innerHTML = uiHTML;
}

function onWindowResize() {
    game.camera.obj.aspect = window.innerWidth / window.innerHeight;
    game.camera.obj.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
}

function update(deltaTime) {
    // Update player
    game.player.update(deltaTime);

    // Update enemies
    for (const enemy of game.enemies) {
        if (!enemy.isDead()) {
            enemy.update(deltaTime);
        }
    }

    // Handle attack input
    if (game.input.attack) {
        const targetEnemy = game.player.attack(game.enemies);
        if (targetEnemy) {
            const dead = targetEnemy.takeDamage(game.player.attackPower);
            updateUI();

            if (dead) {
                console.log('Enemy defeated!');
            }
        }
        game.input.attack = false;
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Calculate delta time (in seconds for movement, milliseconds for combat)
    const deltaTimeSec = game.clock.getDelta();
    const deltaTimeMs = deltaTimeSec * 1000;

    // Update camera (mouse look and smoothing)
    updateCamera(deltaTimeSec);

    // Update movement system
    updateMovement(deltaTimeSec);

    // Update combat system
    update(deltaTimeMs);

    // Update game time
    game.time += deltaTimeSec;

    // Update atmospheric effects
    if (game.lighting) {
        game.lighting.update(game.time);
        game.lighting.updatePlayerLight(game.camera.obj.position);
    }

    // Animate torches
    if (game.dungeon.builder) {
        game.dungeon.builder.animateTorches(game.time);
    }

    // Update UI periodically (every 0.1 seconds) to show cursor lock status
    if (!game.lastUIUpdate || game.time - game.lastUIUpdate > 0.1) {
        updateUI();
        game.lastUIUpdate = game.time;
    }

    // Render
    game.renderer.render(game.scene, game.camera.obj);
}

// Start the game
init();
