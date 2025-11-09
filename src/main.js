import * as THREE from 'three';
import { DungeonGenerator } from './DungeonGenerator.js';
import { DungeonBuilder } from './DungeonBuilder.js';
import { AtmosphericLighting } from './AtmosphericLighting.js';
import { WeaponSystem } from './WeaponSystem.js';
import { HitEffects } from './HitEffects.js';
import { DecorationsManager } from './DecorationsManager.js';
import { AtmosphericDetails } from './AtmosphericDetails.js';
import { AudioManager } from './AudioManager.js';
import { SOUND_CONFIG } from './SoundConfig.js';
import { MinimapRenderer } from './MinimapRenderer.js';
import { ViewmodelRenderer } from './ViewmodelRenderer.js';

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

    attack(enemies, weaponStats) {
        if (this.isAttacking || this.attackCooldown > 0) {
            return null;
        }

        // Use weapon stats if provided, otherwise use defaults
        const attackRange = weaponStats ? weaponStats.range : this.attackRange;
        const attackSpeed = weaponStats ? weaponStats.attackSpeed : this.attackCooldownMax;

        this.isAttacking = true;
        this.attackCooldown = attackSpeed;

        // Find enemies in attack range
        const playerPos = new THREE.Vector3(this.position.x, this.position.y, this.position.z);
        let closestEnemy = null;
        let closestDistance = attackRange;

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

// Game state
const game = {
    scene: null,
    camera: null,
    renderer: null,
    player: null, // Will be Player class instance
    weaponSystem: null, // Weapon system instance
    hitEffects: null, // Hit effects system
    gridSize: 1, // Size of each grid cell (kept for compatibility with dungeon system)
    // Real-time movement state
    movement: {
        velocity: { x: 0, y: 0, z: 0 }, // Current velocity
        speed: 3.5, // Units per second
        sprintMultiplier: 1.8,
        friction: 0.85, // Deceleration when no input
        isSprinting: false
    },
    // Mouse look state
    mouse: {
        sensitivity: 0.002,
        pitch: 0, // Up/down rotation (clamped)
        yaw: 0, // Left/right rotation
        pitchLimit: Math.PI / 3, // 60 degrees up/down
        isLocked: false
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
    audio: null, // AudioManager instance
    audioInitialized: false,
    time: 0,
    enemies: [],
    lastTime: 0,
    input: {
        attack: false
    },
    minimap: null, // MinimapRenderer instance
    viewmodel: null // ViewmodelRenderer instance
};

// Audio initialization
async function initAudio() {
    if (game.audioInitialized) return;

    console.log('Initializing audio system...');
    const success = await game.audio.init();

    if (!success) {
        console.warn('Audio initialization failed - user interaction required');
        return;
    }

    // Load sound files (gracefully handle missing files)
    await loadSounds();

    game.audioInitialized = true;
    console.log('Audio system ready');

    // Start ambient sounds
    startAmbience();

    // Update UI
    updateUI();
}

// Load all sound files
async function loadSounds() {
    const loadPromises = [];

    // Note: Many of these files may not exist yet
    // The AudioManager will log warnings for missing files

    // Load footstep variations
    const footstepConfig = SOUND_CONFIG.footsteps.stone;
    if (footstepConfig && footstepConfig.files.length > 0) {
        footstepConfig.files.forEach((file, index) => {
            loadPromises.push(
                game.audio.loadSound('footsteps', `stone_${index}`, file, false, false)
                    .catch(err => console.warn(`Could not load ${file}`))
            );
        });
    }

    // Load combat sounds
    const combatSounds = SOUND_CONFIG.combat;
    Object.entries(combatSounds).forEach(([soundName, config]) => {
        config.files.forEach((file, index) => {
            const name = config.files.length > 1 ? `${soundName}_${index}` : soundName;
            loadPromises.push(
                game.audio.loadSound('combat', name, file, false, config.positional)
                    .catch(err => console.warn(`Could not load ${file}`))
            );
        });
    });

    // Load ambient sounds
    const ambienceConfig = SOUND_CONFIG.ambience;
    Object.entries(ambienceConfig).forEach(([soundName, config]) => {
        config.files.forEach((file, index) => {
            loadPromises.push(
                game.audio.loadSound('ambience', soundName, file, config.loop, false)
                    .catch(err => console.warn(`Could not load ${file}`))
            );
        });
    });

    // Load UI sounds
    const uiConfig = SOUND_CONFIG.ui;
    Object.entries(uiConfig).forEach(([soundName, config]) => {
        config.files.forEach((file) => {
            loadPromises.push(
                game.audio.loadSound('ui', soundName, file, false, false)
                    .catch(err => console.warn(`Could not load ${file}`))
            );
        });
    });

    // Wait for all sounds to attempt loading
    await Promise.allSettled(loadPromises);
    console.log('Sound loading complete (some files may be missing)');
}

// Start ambient background sounds
function startAmbience() {
    if (!game.audioInitialized) return;

    // Fade in ambient sounds for smooth start
    setTimeout(() => game.audio.fadeIn('ambience', 'dungeon_base', 3000), 500);
    setTimeout(() => game.audio.fadeIn('ambience', 'water_drips', 4000), 2000);
    setTimeout(() => game.audio.fadeIn('ambience', 'wind_echo', 5000), 4000);
}

// Setup pointer lock for mouse look
function setupPointerLock() {
    const canvas = game.renderer.domElement;

    // Request pointer lock on click
    canvas.addEventListener('click', () => {
        if (!game.mouse.isLocked) {
            canvas.requestPointerLock();
        }
    });

    // Handle pointer lock changes
    document.addEventListener('pointerlockchange', () => {
        game.mouse.isLocked = document.pointerLockElement === canvas;
        if (game.mouse.isLocked) {
            console.log('Mouse look enabled');
        } else {
            console.log('Mouse look disabled');
        }
    });

    // Handle mouse movement for camera look
    document.addEventListener('mousemove', (e) => {
        if (!game.mouse.isLocked) return;

        // Update yaw (left/right)
        game.mouse.yaw -= e.movementX * game.mouse.sensitivity;

        // Update pitch (up/down) with clamping
        game.mouse.pitch -= e.movementY * game.mouse.sensitivity;
        game.mouse.pitch = Math.max(-game.mouse.pitchLimit, Math.min(game.mouse.pitchLimit, game.mouse.pitch));

        // Apply rotation to camera
        game.camera.rotation.order = 'YXZ'; // Prevents gimbal lock
        game.camera.rotation.y = game.mouse.yaw;
        game.camera.rotation.x = game.mouse.pitch;

        // Update player rotation (for collision and attack direction)
        game.player.rotation.y = game.mouse.yaw;
        game.player.rotation.x = game.mouse.pitch;
    });
}

// Input handling
function setupInput() {
    window.addEventListener('keydown', (e) => {
        // Initialize audio on first user interaction
        if (!game.audioInitialized && game.audio) {
            initAudio();
        }

        // Handle attack
        if (e.code === 'Space') {
            e.preventDefault();
            game.input.attack = true;
        }

        // Handle sprint (Shift)
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
            game.movement.isSprinting = true;
        }

        // Handle weapon switching (1-4 keys)
        if (game.weaponSystem) {
            const weaponMap = {
                '1': 'sword',
                '2': 'axe',
                '3': 'mace',
                '4': 'dagger'
            };

            if (weaponMap[e.key]) {
                game.weaponSystem.switchWeapon(weaponMap[e.key]);
                updateUI();
            }
        }

        // Track key states
        game.keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
        // Handle attack release
        if (e.code === 'Space') {
            e.preventDefault();
            game.input.attack = false;
        }

        // Handle sprint release
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
            game.movement.isSprinting = false;
        }

        // Track key states
        game.keys[e.key.toLowerCase()] = false;
    });

    // Setup pointer lock
    setupPointerLock();

    // Also try to init audio on click
    window.addEventListener('click', () => {
        if (!game.audioInitialized && game.audio) {
            initAudio();
        }
    }, { once: true });
}

// Check if a position has a collision (radius-based for smooth movement)
function checkCollision(x, z, radius = 0.3) {
    // Check against collidable objects
    for (const obj of game.collidableObjects) {
        const objGridPos = obj.userData.gridPos;
        if (objGridPos) {
            // Convert grid position to world position (assuming 4 units per cell)
            const objX = objGridPos.x * 4;
            const objZ = objGridPos.z * 4;

            // Simple distance check with object radius (walls are about 2 units wide)
            const dx = x - objX;
            const dz = z - objZ;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance < radius + 1.5) { // 1.5 is approx wall radius
                return true;
            }
        }
    }
    return false;
}

// Process continuous movement based on key states
function updateMovement(deltaTime) {
    // Calculate movement direction from key inputs
    let moveX = 0;
    let moveZ = 0;

    if (game.keys['w'] || game.keys['arrowup']) {
        moveZ -= 1;
    }
    if (game.keys['s'] || game.keys['arrowdown']) {
        moveZ += 1;
    }
    if (game.keys['a'] || game.keys['arrowleft']) {
        moveX -= 1;
    }
    if (game.keys['d'] || game.keys['arrowright']) {
        moveX += 1;
    }

    // Normalize diagonal movement
    if (moveX !== 0 || moveZ !== 0) {
        const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
        moveX /= length;
        moveZ /= length;
    }

    // Get camera direction (yaw only, no pitch for movement)
    const yaw = game.player.rotation.y;
    const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

    // Calculate desired velocity based on input
    const speed = game.movement.speed * (game.movement.isSprinting ? game.movement.sprintMultiplier : 1);
    const targetVelocity = new THREE.Vector3();
    targetVelocity.addScaledVector(forward, moveZ);
    targetVelocity.addScaledVector(right, moveX);
    targetVelocity.multiplyScalar(speed);

    // Apply acceleration/deceleration
    if (moveX !== 0 || moveZ !== 0) {
        // Accelerate towards target
        game.movement.velocity.x = THREE.MathUtils.lerp(game.movement.velocity.x, targetVelocity.x, 0.15);
        game.movement.velocity.z = THREE.MathUtils.lerp(game.movement.velocity.z, targetVelocity.z, 0.15);
    } else {
        // Apply friction when no input
        game.movement.velocity.x *= game.movement.friction;
        game.movement.velocity.z *= game.movement.friction;
    }

    // Calculate next position
    const nextX = game.player.position.x + game.movement.velocity.x * deltaTime;
    const nextZ = game.player.position.z + game.movement.velocity.z * deltaTime;

    // Collision detection and sliding
    let finalX = nextX;
    let finalZ = nextZ;

    // Try moving in both axes
    if (!checkCollision(nextX, nextZ)) {
        finalX = nextX;
        finalZ = nextZ;
    } else {
        // Try sliding along walls by testing each axis separately
        if (!checkCollision(nextX, game.player.position.z)) {
            finalX = nextX;
            finalZ = game.player.position.z;
            game.movement.velocity.z = 0; // Stop Z velocity on collision
        } else if (!checkCollision(game.player.position.x, nextZ)) {
            finalX = game.player.position.x;
            finalZ = nextZ;
            game.movement.velocity.x = 0; // Stop X velocity on collision
        } else {
            // Collision in both axes, stop completely
            game.movement.velocity.x = 0;
            game.movement.velocity.z = 0;
        }
    }

    // Update player position
    game.player.position.x = finalX;
    game.player.position.z = finalZ;

    // Update camera position
    game.camera.position.x = game.player.position.x;
    game.camera.position.z = game.player.position.z;

    // Play footstep sounds when moving
    const isMoving = Math.abs(game.movement.velocity.x) > 0.1 || Math.abs(game.movement.velocity.z) > 0.1;
    if (isMoving && game.audioInitialized) {
        // Play footstep at intervals based on speed
        if (!game.lastFootstepTime) game.lastFootstepTime = 0;
        const footstepInterval = game.movement.isSprinting ? 300 : 450; // milliseconds

        if (game.time * 1000 - game.lastFootstepTime > footstepInterval) {
            const numVariations = SOUND_CONFIG.footsteps.stone.files.length;
            game.audio.playRandomVariation('footsteps', 'stone', numVariations, 150);
            game.lastFootstepTime = game.time * 1000;
        }
    }
}

// Initialize the game
async function init() {
    // Create clock for delta time
    game.clock = new THREE.Clock();

    // Scene setup
    game.scene = new THREE.Scene();

    // Initialize player
    game.player = new Player(game.scene);

    // Camera setup (first-person view)
    game.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    // Initialize weapon system
    game.weaponSystem = new WeaponSystem(game.camera, game.scene);

    // Initialize hit effects
    game.hitEffects = new HitEffects(game.scene);

    // Initialize audio system
    game.audio = new AudioManager(game.camera);
    console.log('Audio system created (will initialize on first user interaction)');

    // Renderer setup
    game.renderer = new THREE.WebGLRenderer({ antialias: true });
    game.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(game.renderer.domElement);
    game.renderer.domElement.id = 'game-canvas';

    // Setup atmospheric lighting (brighter so you can see!)
    game.lighting = new AtmosphericLighting(game.scene, {
        ambientIntensity: 0.5,
        fogNear: 5,
        fogFar: 30
    });
    game.lighting.setupFog();
    // Shadows disabled to prevent WebGL texture unit limit errors
    // game.lighting.enableShadows(game.renderer);

    // Generate dungeon with POI system
    game.dungeon.generator = new DungeonGenerator(60, 60, {
        minRoomSize: 3,
        maxRoomSize: 7,
        maxRooms: 30,
        centerSymmetryRadius: 10,
        hubCount: 3,
        treasureRoomCount: 4,
        safeRoomCount: 2,
        puzzleRoomCount: 2,
        landmarkCount: 3,
        sideAreaChance: 0.3
    });

    game.dungeon.data = game.dungeon.generator.generate();

    // Log dungeon info for debugging
    console.log('Dungeon generated with POI system:');
    console.log('- Total rooms:', game.dungeon.data.rooms.length);
    console.log('- POIs:', game.dungeon.data.pois.size);
    console.log('- Critical path rooms:', game.dungeon.data.criticalPath.length);
    console.log('- Entrance:', game.dungeon.data.entrance?.id);
    console.log('- Exit:', game.dungeon.data.exit?.id);

    // Build dungeon geometry
    game.dungeon.builder = new DungeonBuilder(game.scene, game.dungeon.data, {
        cellSize: 4,
        wallHeight: 3.5,
        useTextures: false  // Disabled to prevent WebGL texture limit errors
    });
    await game.dungeon.builder.build();

    // Place decorations - DISABLED to prevent WebGL texture limit errors
    // TODO: Re-enable with texture-less materials or reduce decoration count
    /*
    game.dungeon.decorations = new DecorationsManager(
        game.scene,
        game.dungeon.data,
        game.dungeon.builder.textureManager,
        {
            cellSize: 4,
            wallHeight: 3.5,
            decorationDensity: 0.3
        }
    );
    await game.dungeon.decorations.placeDecorations();
    */

    // Add atmospheric details - DISABLED to prevent WebGL texture limit errors
    // TODO: Re-enable with simpler materials
    /*
    game.dungeon.atmosphericDetails = new AtmosphericDetails(
        game.scene,
        game.dungeon.data,
        {
            cellSize: 4,
            wallHeight: 3.5,
            detailDensity: 0.2
        }
    );
    game.dungeon.atmosphericDetails.addDetails();
    game.dungeon.atmosphericDetails.addDustParticles();
    */

    // Initialize player (now as Player class instance)
    game.player = new Player(game.scene);

    // Set player spawn position
    const spawnPos = game.dungeon.generator.getSpawnPosition();
    game.player.position.x = spawnPos.x * 4;
    game.player.position.z = spawnPos.z * 4;

    game.camera.position.set(
        game.player.position.x,
        game.player.position.y,
        game.player.position.z
    );

    // Spawn enemies in the dungeon
    spawnEnemies();

    // Initialize minimap
    game.minimap = new MinimapRenderer(game.dungeon.data, {
        size: 180,
        scale: 3,
        fogOfWar: true
    });

    // Add minimap to UI
    const minimapContainer = document.createElement('div');
    minimapContainer.className = 'minimap-container';
    minimapContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(10, 10, 10, 0.85);
        border: 2px solid rgba(255, 255, 255, 0.15);
        padding: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
        z-index: 1000;
    `;
    const minimapTitle = document.createElement('div');
    minimapTitle.textContent = 'MAP';
    minimapTitle.style.cssText = `
        font-size: 12px;
        color: rgba(184, 184, 184, 0.8);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 4px;
        text-align: center;
        font-family: 'Courier New', monospace;
    `;
    minimapContainer.appendChild(minimapTitle);
    minimapContainer.appendChild(game.minimap.getCanvas());
    document.body.appendChild(minimapContainer);

    // Initialize viewmodel renderer
    game.viewmodel = new ViewmodelRenderer(game.scene, game.camera, game.renderer);
    console.log('Viewmodel renderer initialized');

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

    // Get weapon stats if weapon system is initialized
    let weaponInfo = '';
    if (game.weaponSystem) {
        const stats = game.weaponSystem.getWeaponStats();
        weaponInfo = `
            <div style="font-size: 12px; margin-top: 10px; padding: 5px; background: rgba(0,0,0,0.5); border: 1px solid #666;">
                <div style="color: #ffa500; margin-bottom: 3px;">${stats.name}</div>
                <div style="font-size: 11px;">Damage: ${stats.damage} | Range: ${stats.range.toFixed(1)} | Speed: ${(1000/stats.attackSpeed).toFixed(1)}/s</div>
            </div>
        `;
    }

    const audioStatus = game.audioInitialized
        ? '<span style="color: #0f0;">ENABLED</span>'
        : '<span style="color: #ff0;">Click to enable</span>';

    const masterVolume = game.audio ? Math.round(game.audio.masterVolume * 100) : 100;

    const mouseLockStatus = game.mouse.isLocked
        ? '<span style="color: #0f0;">ACTIVE</span>'
        : '<span style="color: #ff0;">Click to activate</span>';

    const uiHTML = `
        <div style="font-size: 16px;">
            <div style="margin-bottom: 10px;">Kings Field - Real-time Controls</div>
            <div style="margin-bottom: 5px;">
                Health: <span style="color: ${healthColor}">${game.player.health.current}/${game.player.health.max}</span>
            </div>
            <div style="background: #333; width: 200px; height: 20px; border: 2px solid #fff; margin-bottom: 10px;">
                <div style="background: ${healthColor}; width: ${healthPercent}%; height: 100%; transition: width 0.3s;"></div>
            </div>
            ${weaponInfo}
            <div style="font-size: 12px; opacity: 0.7; margin-top: 10px;">
                Enemies: ${game.enemies.filter(e => !e.isDead()).length}/${game.enemies.length}
            </div>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">
                Mouse Look: ${mouseLockStatus}
            </div>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">
                WASD: Move | SHIFT: Sprint | SPACE: Attack | 1-4: Weapons
            </div>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">
                Audio: ${audioStatus}
            </div>
            ${game.audioInitialized ? `
            <div style="font-size: 11px; opacity: 0.6; margin-top: 5px;">
                <div style="margin-bottom: 3px;">
                    Master Volume: ${masterVolume}%
                    <button onclick="window.adjustMasterVolume(-0.1)" style="margin-left: 5px; padding: 2px 6px;">-</button>
                    <button onclick="window.adjustMasterVolume(0.1)" style="padding: 2px 6px;">+</button>
                </div>
                <div style="margin-bottom: 3px;">
                    <button onclick="window.toggleAudioCategory('ambience')" style="padding: 2px 6px; font-size: 10px;">Toggle Ambience</button>
                    <button onclick="window.toggleAudioCategory('combat')" style="padding: 2px 6px; font-size: 10px;">Toggle Combat</button>
                </div>
            </div>
            ` : ''}
            </div>
        </div>
    `;

    document.querySelector('#ui').innerHTML = uiHTML;
}

// Audio control functions (exposed globally for UI buttons)
window.adjustMasterVolume = function(delta) {
    if (!game.audio) return;
    const newVolume = Math.max(0, Math.min(1, game.audio.masterVolume + delta));
    game.audio.setMasterVolume(newVolume);
    updateUI();
};

window.toggleAudioCategory = function(category) {
    if (!game.audio) return;
    const currentVolume = game.audio.getCategoryVolume(category);
    game.audio.setCategoryVolume(category, currentVolume > 0 ? 0 : 0.4);
    updateUI();
};

function onWindowResize() {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);

    // Update viewmodel camera aspect ratio
    if (game.viewmodel) {
        game.viewmodel.onWindowResize();
    }
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
    if (game.input.attack && game.weaponSystem && !game.weaponSystem.isAttacking) {
        const weaponStats = game.weaponSystem.getWeaponStats();
        const targetEnemy = game.player.attack(game.enemies, weaponStats);

        // Play sword swing sound
        if (game.audioInitialized) {
            const swingVariations = SOUND_CONFIG.combat.sword_swing.files.length;
            game.audio.playRandomVariation('combat', 'sword_swing', swingVariations, 100);
        }

        if (targetEnemy) {
            // Store target for damage dealing during attack animation
            game.attackTarget = targetEnemy;
            game.weaponSystem.startAttack();
        } else {
            // Still play attack animation even if no target
            game.weaponSystem.startAttack();
        }

        // Trigger viewmodel attack animation
        if (game.viewmodel) {
            game.viewmodel.startAttack();
        }

        game.input.attack = false;
    }

    // Deal damage during weapon swing (at the right timing)
    if (game.weaponSystem && game.weaponSystem.isAttacking && game.attackTarget) {
        if (game.weaponSystem.getAttackHitTiming()) {
            const weaponStats = game.weaponSystem.getWeaponStats();
            const dead = game.attackTarget.takeDamage(weaponStats.damage);

            // Create hit effects
            if (game.hitEffects) {
                game.hitEffects.createHitParticles(game.attackTarget.mesh.position, 0xff6666);
                game.hitEffects.triggerScreenShake(0.08, 0.12);
            }

            // Play hit sound
            if (game.audioInitialized) {
                const hitVariations = SOUND_CONFIG.combat.sword_hit.files.length;
                game.audio.playRandomVariation('combat', 'sword_hit', hitVariations, 50);
            }

            updateUI();

            if (dead) {
                console.log('Enemy defeated!');
                // Play death sound
                if (game.audioInitialized) {
                    const deathVariations = SOUND_CONFIG.combat.enemy_death.files.length;
                    game.audio.playRandomVariation('combat', 'enemy_death', deathVariations, 100);
                }
            }

            // Clear target so we don't hit multiple times
            game.attackTarget = null;
        }
    }

    // Clear attack target when animation completes
    if (game.weaponSystem && game.weaponSystem.isAttackComplete()) {
        game.attackTarget = null;
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Calculate delta time (in seconds for movement, milliseconds for combat)
    const deltaTimeSec = game.clock.getDelta();
    const deltaTimeMs = deltaTimeSec * 1000;

    // Update movement system
    updateMovement(deltaTimeSec);

    // Update weapon system
    if (game.weaponSystem) {
        game.weaponSystem.update(deltaTimeSec, game.movement.isMoving);
    }

    // Update hit effects
    if (game.hitEffects) {
        game.hitEffects.update(deltaTimeSec, game.camera);

        // Apply screen shake to camera (add to current position set by updateMovement)
        const shakeOffset = game.hitEffects.getShakeOffset();
        game.camera.position.x += shakeOffset.x;
        game.camera.position.y = game.player.position.y + shakeOffset.y;
        game.camera.position.z += shakeOffset.z;
    }

    // Update combat system
    update(deltaTimeMs);

    // Update game time
    game.time += deltaTimeSec;

    // Update atmospheric effects
    if (game.lighting) {
        game.lighting.update(game.time);
        game.lighting.updatePlayerLight(game.camera.position);
    }

    // Animate torches
    if (game.dungeon.builder) {
        game.dungeon.builder.animateTorches(game.time);
    }

    // Animate atmospheric details
    if (game.dungeon.atmosphericDetails) {
        game.dungeon.atmosphericDetails.animateDust(game.time);
    }

    // Check if player is moving for viewmodel bob
    const playerIsMoving = Math.abs(game.movement.velocity.x) > 0.1 ||
                          Math.abs(game.movement.velocity.z) > 0.1;

    // Update viewmodel (hands + sword)
    if (game.viewmodel) {
        game.viewmodel.update(deltaTimeSec, playerIsMoving);
    }

    // Update minimap
    if (game.minimap) {
        game.minimap.render(
            {
                x: game.player.position.x,
                z: game.player.position.z
            },
            game.player.rotation.y,
            game.enemies
        );
    }

    // Render main scene
    game.renderer.render(game.scene, game.camera);

    // Render viewmodel on top (separate render pass)
    if (game.viewmodel) {
        game.viewmodel.render();
    }
}

// Start the game
init();
