import * as THREE from 'three';
import { DungeonGenerator } from './DungeonGenerator.js';
import { DungeonBuilder } from './DungeonBuilder.js';
import { AtmosphericLighting } from './AtmosphericLighting.js';
import { WeaponSystem } from './WeaponSystem.js';
import { ArmorSystem } from './ArmorSystem.js';
import { HitEffects } from './HitEffects.js';
import { DecorationsManager } from './DecorationsManager.js';
import { AtmosphericDetails } from './AtmosphericDetails.js';
import { HomeDecorSystem } from './HomeDecorSystem.js';
import { AudioManager } from './AudioManager.js';
import { SOUND_CONFIG } from './SoundConfig.js';
import { MinimapRenderer } from './MinimapRenderer.js';
import { ViewmodelRenderer } from './ViewmodelRenderer.js';
import { ItemManager, Inventory } from './ItemManager.js';
import { Sword } from './Sword.js';
import { PaintingGallery } from './PaintingGallery.js';
import { PaintingInteraction } from './PaintingInteraction.js';
import { ChestManager } from './ChestManager.js';
import { TrapManager } from './TrapManager.js';
import { FurnitureDecorator } from './FurnitureDecorator.js';
import { LoadingScreen } from './LoadingScreen.js';
import { StairManager } from './StairManager.js';
import { InstanceManager } from './instances/InstanceManager.js';
import { PortalManager } from './instances/InstancePortal.js';

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

// Constants
const PLAYER_EYE_HEIGHT = 1.6;
const ATTACK_COOLDOWN_MS = 500;
const FOOTSTEP_SPRINT_INTERVAL = 300;
const FOOTSTEP_WALK_INTERVAL = 450;

// Player class
class Player {
    constructor(scene) {
        this.scene = scene;
        this.health = new Health(100);
        this.position = { x: 0, y: PLAYER_EYE_HEIGHT, z: 5 };
        this.rotation = { x: 0, y: 0 };
        this.attackPower = 25;
        this.attackRange = 2.5;
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.attackCooldownMax = ATTACK_COOLDOWN_MS;

        // Armor system
        this.armorSystem = new ArmorSystem(scene);
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

    takeDamage(amount, damageType = 'physical') {
        // Calculate damage after armor reduction
        const damageResult = this.armorSystem.calculateDamageReduction(amount, damageType);
        const finalDamage = damageResult.damage;

        // Apply damage to health
        const isDead = this.health.takeDamage(finalDamage);

        // Damage armor durability
        if (amount > 0) {
            this.armorSystem.damageArmor(Math.max(1, Math.floor(amount / 10)));
        }

        return {
            isDead,
            damageDealt: finalDamage,
            blocked: damageResult.blocked,
            damageReduced: amount - finalDamage
        };
    }

    getMovementSpeed() {
        // Get base movement speed modified by armor
        return this.armorSystem.speedModifier;
    }

    getStaminaModifier() {
        // Get stamina drain modifier from armor
        return this.armorSystem.staminaModifier;
    }

    update(deltaTime) {
        if (this.attackCooldown > 0) {
            this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
        }

        // Update armor system
        if (this.armorSystem) {
            this.armorSystem.update(deltaTime);
        }
    }
}

// Enemy class
class Enemy {
    constructor(scene, position) {
        this.scene = scene;
        this.health = new Health(50);
        this.attackPower = 10;
        this.attackRange = 2.0;
        this.attackCooldown = 0;
        this.attackCooldownMax = 2000; // milliseconds

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

    canAttack() {
        return this.attackCooldown <= 0 && !this.isDead();
    }

    tryAttackPlayer(player) {
        if (!this.canAttack()) return false;

        // Check if player is in range
        const playerPos = new THREE.Vector3(player.position.x, player.position.y, player.position.z);
        const enemyPos = this.mesh.position;
        const distance = playerPos.distanceTo(enemyPos);

        if (distance > this.attackRange) return false;

        // Attack the player
        this.attackCooldown = this.attackCooldownMax;
        return true;
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

        if (this.attackCooldown > 0) {
            this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
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
    armorSystem: null, // Reference to player's armor system
    hitEffects: null, // Hit effects system
    itemManager: null, // Item system manager
    inventory: null, // Player inventory
    gridSize: 1, // Size of each grid cell (kept for compatibility with dungeon system)
    // Real-time movement state
    movement: {
        velocity: { x: 0, y: 0, z: 0 }, // Current velocity
        speed: 3.5, // Units per second
        sprintMultiplier: 1.8,
        friction: 0.85, // Deceleration when no input
        isSprinting: false,
        isMoving: false, // Track if player is currently moving
        // Dash ability
        isDashing: false,
        dashSpeed: 12, // Much faster than sprint
        dashDuration: 0.25, // 250ms dash
        dashCooldown: 1.0, // 1 second cooldown
        dashTimer: 0,
        dashCooldownTimer: 0,
        lastShiftPress: 0 // For double-tap detection
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
        data: null,
        homeDecor: null,
        furniture: null // FurnitureDecorator instance
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
    viewmodel: null, // ViewmodelRenderer instance
    paintingGallery: null, // PaintingGallery instance
    paintingInteraction: null, // PaintingInteraction instance
    chestManager: null, // ChestManager instance
    trapManager: null, // TrapManager instance
    loadingScreen: null, // LoadingScreen instance
    stairManager: null, // StairManager instance
    currentLevel: 1, // Current dungeon level
    instanceManager: null, // InstanceManager instance
    portalManager: null // PortalManager instance
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

// Try to interact with nearby furniture
function tryInteractWithFurniture() {
    if (!game.dungeon.furniture) return;

    const furnitureManager = game.dungeon.furniture.getFurnitureManager();
    const playerPos = new THREE.Vector3(game.player.position.x, game.player.position.y, game.player.position.z);
    const interactionRange = 3.0;

    // Get camera direction to determine what player is looking at
    const direction = new THREE.Vector3();
    game.camera.getWorldDirection(direction);

    // Cast a ray from player position in camera direction
    const raycaster = new THREE.Raycaster(playerPos, direction, 0, interactionRange);

    // Get all interactable furniture
    const interactables = Array.from(furnitureManager.interactables.keys());

    if (interactables.length === 0) return;

    const intersects = raycaster.intersectObjects(interactables, true);

    if (intersects.length > 0) {
        // Find the root furniture object
        let furnitureObject = intersects[0].object;
        while (furnitureObject.parent && !furnitureManager.canInteract(furnitureObject)) {
            furnitureObject = furnitureObject.parent;
        }

        if (furnitureManager.canInteract(furnitureObject)) {
            const success = furnitureManager.interact(furnitureObject);
            if (success) {
                console.log(`Interacted with ${furnitureObject.userData.furnitureType}`);
                // Play interaction sound if audio is initialized
                if (game.audioInitialized) {
                    // You could add specific sounds for different furniture types
                }
            }
        }
    }
}

// Try to interact with nearby stairs
async function tryInteractWithStairs() {
    if (!game.stairManager) return;

    const nearestStair = game.stairManager.checkInteraction(game.player.position);

    if (nearestStair) {
        console.log(`Using stairs ${nearestStair.direction} to level ${nearestStair.targetLevel}`);
        await transitionToLevel(nearestStair.targetLevel, nearestStair.direction);
    }
}

// Try to interact with nearby instance portals
async function tryInteractWithPortal() {
    if (!game.portalManager || !game.instanceManager) return;

    // If in instance, check for exit
    if (game.instanceManager.isInInstance) {
        if (game.instanceManager.canExitInstance(game.player)) {
            console.log('Exiting instance...');
            await game.instanceManager.exitInstance(game.player);
            updateUI();
        }
        return;
    }

    // Find nearest portal in dungeon
    const nearestPortal = game.portalManager.findNearestPortal(game.player.position, 2.5);

    if (nearestPortal && nearestPortal.isActive) {
        console.log(`Entering instance: ${nearestPortal.instanceId}`);

        // Activate portal visual feedback
        nearestPortal.activate();

        // Get dungeon state to restore later
        const dungeonState = {
            scene: game.scene,
            camera: game.camera,
            enemies: game.enemies,
            collidableObjects: game.collidableObjects
        };

        // Enter instance
        const success = await game.instanceManager.enterInstance(
            nearestPortal.instanceId,
            dungeonState,
            game.player
        );

        if (success) {
            console.log('Successfully entered instance');
            updateUI();
        }
    }
}

// Transition to a new level
async function transitionToLevel(targetLevel, direction = 'down') {
    // Prevent multiple transitions
    if (game.loadingScreen.isActive) return;

    // Show loading screen
    const loadingText = direction === 'down' ? 'DESCENDING...' : 'ASCENDING...';
    await game.loadingScreen.show(loadingText);

    // Simulate loading with progress
    const loadingPromise = game.loadingScreen.simulateLoading(2000, 3000);

    // Generate new level while loading screen is visible
    setTimeout(async () => {
        // Clear old dungeon
        clearCurrentLevel();

        // Update level
        game.currentLevel = targetLevel;
        game.stairManager.setCurrentLevel(targetLevel);

        // Generate new dungeon
        await generateNewLevel();

        // Wait for loading to complete
        await loadingPromise;

        // Hide loading screen
        await game.loadingScreen.hide();

        console.log(`Transitioned to level ${targetLevel}`);
    }, 500);
}

// Register furniture objects for collision detection
function registerFurnitureCollision() {
    if (!game.dungeon.furniture) return;

    const furnitureManager = game.dungeon.furniture.getFurnitureManager();
    if (!furnitureManager || !furnitureManager.furniture) return;

    let addedCount = 0;

    for (const furnitureObj of furnitureManager.furniture) {
        // Add furniture meshes to collision system
        // Skip non-solid furniture (chandeliers, wall decorations, etc.)
        const nonSolidTypes = ['chandelier', 'candelabra', 'wall_torch', 'banner'];
        const furnitureType = furnitureObj.userData?.furnitureType;

        if (nonSolidTypes.includes(furnitureType)) {
            continue; // Skip non-solid objects
        }

        // Add to collidable objects
        if (!game.collidableObjects.includes(furnitureObj)) {
            // Set grid position for collision system
            const gridX = Math.round(furnitureObj.position.x / 4);
            const gridZ = Math.round(furnitureObj.position.z / 4);
            furnitureObj.userData.gridPos = { x: gridX, z: gridZ };

            // Add collision radius based on furniture type
            furnitureObj.userData.collisionRadius = 0.5; // Default radius

            game.collidableObjects.push(furnitureObj);
            addedCount++;
        }
    }

    console.log(`✓ Registered ${addedCount} furniture objects for collision`);
}

// Register chest and trap objects for collision
function registerChestAndTrapCollision() {
    let addedCount = 0;

    // Register chests
    if (game.chestManager && game.chestManager.chests) {
        for (const chest of game.chestManager.chests) {
            if (chest.mesh && !game.collidableObjects.includes(chest.mesh)) {
                const gridX = Math.round(chest.mesh.position.x / 4);
                const gridZ = Math.round(chest.mesh.position.z / 4);
                chest.mesh.userData.gridPos = { x: gridX, z: gridZ };
                chest.mesh.userData.collisionRadius = 0.4;

                game.collidableObjects.push(chest.mesh);
                addedCount++;
            }
        }
    }

    // Note: Traps should NOT have collision - player should walk over them
    // They trigger damage but don't block movement

    console.log(`✓ Registered ${addedCount} chests for collision`);
}

// Register decoration objects for collision (if solid)
function registerDecorationCollision() {
    if (!game.dungeon.homeDecor || !game.dungeon.homeDecor.decorations) return;

    let addedCount = 0;

    for (const decoration of game.dungeon.homeDecor.decorations) {
        // Only add solid decorations (not candles, flames, etc.)
        const solidTypes = ['bookshelf', 'throne', 'table', 'altar', 'chest', 'barrel', 'crate', 'pedestal'];
        const decorType = decoration.userData?.decorationType;

        if (solidTypes.some(type => decorType?.includes(type))) {
            if (!game.collidableObjects.includes(decoration)) {
                const gridX = Math.round(decoration.position.x / 4);
                const gridZ = Math.round(decoration.position.z / 4);
                decoration.userData.gridPos = { x: gridX, z: gridZ };
                decoration.userData.collisionRadius = 0.5;

                game.collidableObjects.push(decoration);
                addedCount++;
            }
        }
    }

    console.log(`✓ Registered ${addedCount} decorations for collision`);
}

// Clear current level
function clearCurrentLevel() {
    // Remove all dungeon meshes
    if (game.dungeon.builder && game.dungeon.builder.meshes) {
        for (const mesh of game.dungeon.builder.meshes) {
            if (mesh.parent) {
                mesh.parent.remove(mesh);
            }
        }
    }

    // Clear enemies
    for (const enemy of game.enemies) {
        if (enemy.mesh && enemy.mesh.parent) {
            enemy.mesh.parent.remove(enemy.mesh);
        }
    }
    game.enemies = [];

    // Clear stairs
    if (game.stairManager) {
        game.stairManager.clearStairs();
    }

    // Clear chests
    if (game.chestManager) {
        game.chestManager.clearChests();
    }

    // Clear traps
    if (game.trapManager) {
        game.trapManager.clearTraps();
    }

    // Clear furniture
    if (game.dungeon.furniture) {
        const furnitureManager = game.dungeon.furniture.getFurnitureManager();
        if (furnitureManager) {
            furnitureManager.clearAll();
        }
    }

    // Clear home decor
    if (game.dungeon.homeDecor) {
        game.dungeon.homeDecor.clearAll();
    }

    game.collidableObjects = [];
}

// Generate a new level
async function generateNewLevel() {
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

    console.log(`Level ${game.currentLevel} generated:`, {
        rooms: game.dungeon.data.rooms.length,
        pois: game.dungeon.data.pois.size
    });

    // Build dungeon geometry
    game.dungeon.builder = new DungeonBuilder(game.scene, game.dungeon.data, {
        cellSize: 4,
        wallHeight: 3.5,
        useTextures: false,
        collidableObjects: game.collidableObjects
    });
    await game.dungeon.builder.build();

    // Populate collidable objects
    game.collidableObjects = game.dungeon.builder.meshes.filter(mesh => {
        return mesh.geometry instanceof THREE.BoxGeometry && mesh.position.y > 0.5;
    });

    for (const obj of game.collidableObjects) {
        const gridX = Math.round(obj.position.x / 4);
        const gridZ = Math.round(obj.position.z / 4);
        obj.userData.gridPos = { x: gridX, z: gridZ };
    }

    // Place furniture
    game.dungeon.furniture = new FurnitureDecorator(
        game.scene,
        game.dungeon.data,
        {
            cellSize: 4,
            wallHeight: 3.5,
            furnitureDensity: 0.6
        }
    );
    game.dungeon.furniture.decorateRooms();
    game.dungeon.furniture.addDoorsToCorridors();

    // Initialize Home Decor System
    game.dungeon.homeDecor = new HomeDecorSystem(
        game.scene,
        game.dungeon.data,
        {
            cellSize: 4,
            wallHeight: 3.5,
            decorDensity: 0.7,
            enableLighting: true
        }
    );
    await game.dungeon.homeDecor.decorateAllRooms();

    // Place chests
    game.chestManager = new ChestManager(game.scene, game.dungeon.data, game.itemManager, game.audio);
    game.chestManager.placeChests();

    // Place traps
    game.trapManager = new TrapManager(game.scene, game.dungeon.data, game.audio);
    game.trapManager.placeTraps();

    // Place stairs
    game.stairManager.dungeonData = game.dungeon.data;
    game.stairManager.placeStairs();

    // Set player spawn position
    const spawnPos = game.dungeon.generator.getSpawnPosition();
    game.player.position.x = spawnPos.x * 4;
    game.player.position.z = spawnPos.z * 4;

    game.camera.position.set(
        game.player.position.x,
        game.player.position.y,
        game.player.position.z
    );

    // Spawn enemies
    spawnEnemies();

    // Update minimap with new dungeon
    if (game.minimap) {
        game.minimap.updateDungeon(game.dungeon.data);
    }

    updateUI();
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

        // Handle furniture interaction (E key)
        if (e.code === 'KeyE') {
            tryInteractWithFurniture();
            // Also check for stair interaction
            tryInteractWithStairs();
            // Also check for portal interaction
            tryInteractWithPortal();
        }

        // Handle sprint and dash (Shift double-tap to dash)
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
            const now = Date.now();
            const timeSinceLastPress = now - game.movement.lastShiftPress;

            // Double-tap detection (within 300ms)
            if (timeSinceLastPress < 300 && game.movement.dashCooldownTimer <= 0) {
                // Trigger dash!
                game.movement.isDashing = true;
                game.movement.dashTimer = game.movement.dashDuration;
                game.movement.dashCooldownTimer = game.movement.dashCooldown;
                console.log('Dash activated!');

                // Play dash sound if audio available
                if (game.audioInitialized && game.audio) {
                    game.audio.play('dash', 'sfx', game.player.position);
                }
            }

            game.movement.lastShiftPress = now;
            game.movement.isSprinting = true;
        }

        // Handle weapon switching (1-4 keys for default weapons, 5-9 for inventory swords)
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

            // Equip swords from inventory (5-9 keys)
            if (e.key >= '5' && e.key <= '9' && game.inventory) {
                const slotIndex = parseInt(e.key) - 5;
                const slot = game.inventory.getSlot(slotIndex);

                if (slot && slot.item instanceof Sword) {
                    const equipped = game.weaponSystem.equipSwordItem(slot.item);
                    if (equipped) {
                        console.log(`Equipped ${slot.item.name} from inventory slot ${slotIndex}`);
                        updateUI();
                    }
                } else if (slot) {
                    console.log(`Slot ${slotIndex} does not contain a sword`);
                } else {
                    console.log(`Inventory slot ${slotIndex} is empty`);
                }
            }
        }

        // Handle armor switching (F1-F4 for armor, F5-F8 for helmets, F9-F12 for shields)
        if (game.armorSystem) {
            // Armor sets (F1-F4)
            const armorMap = {
                'F1': 'none',
                'F2': 'leather',
                'F3': 'chainmail',
                'F4': 'plate'
            };

            // Helmets (F5-F8)
            const helmetMap = {
                'F5': 'none',
                'F6': 'leatherCap',
                'F7': 'ironHelmet',
                'F8': 'knightHelmet'
            };

            // Shields (F9-F12)
            const shieldMap = {
                'F9': 'none',
                'F10': 'woodenShield',
                'F11': 'ironShield',
                'F12': 'towerShield'
            };

            if (armorMap[e.key]) {
                game.armorSystem.equipArmor(armorMap[e.key]);
                updateUI();
                if (game.audioInitialized) {
                    console.log(`Equipped ${armorMap[e.key]} armor`);
                }
            }

            if (helmetMap[e.key]) {
                game.armorSystem.equipHelmet(helmetMap[e.key]);
                updateUI();
                console.log(`Equipped ${helmetMap[e.key]} helmet`);
            }

            if (shieldMap[e.key]) {
                game.armorSystem.equipShield(shieldMap[e.key]);
                updateUI();
                console.log(`Equipped ${shieldMap[e.key]} shield`);
            }
        }

        // Test armor - T key deals damage to player to test armor
        if (e.key.toLowerCase() === 't' && game.player) {
            const testDamage = 20;
            const damageResult = game.player.takeDamage(testDamage, 'physical');
            console.log(`TEST DAMAGE: ${testDamage} -> ${damageResult.damageDealt.toFixed(1)} (Reduced: ${damageResult.damageReduced.toFixed(1)}) ${damageResult.blocked ? '[BLOCKED]' : ''}`);
            updateUI();
        }

        // Heal player - H key
        if (e.key.toLowerCase() === 'h' && game.player) {
            game.player.health.heal(30);
            console.log('Healed 30 HP');
            updateUI();
        }

        // Repair armor - R key
        if (e.key.toLowerCase() === 'r' && game.armorSystem) {
            game.armorSystem.repairArmor('armor', 100);
            game.armorSystem.repairArmor('helmet', 100);
            game.armorSystem.repairArmor('shield', 100);
            console.log('Armor fully repaired');
            updateUI();
        }

        // Open chest - E key
        if (e.key.toLowerCase() === 'e' && game.chestManager) {
            const nearestChest = game.chestManager.checkInteraction(game.player.position, game.player);
            if (nearestChest) {
                const success = game.chestManager.interactWithChest(nearestChest, game.player);
                if (success) {
                    updateUI();
                }
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
function checkCollision(x, z, playerRadius = 0.3) {
    // Check against collidable objects
    for (const obj of game.collidableObjects) {
        const objGridPos = obj.userData.gridPos;
        if (!objGridPos) continue;

        // Use actual object position (more accurate than grid position)
        const objX = obj.position.x;
        const objZ = obj.position.z;

        // Get object-specific collision radius (or default)
        let objectRadius = obj.userData.collisionRadius || 1.5; // Default for walls

        // If it's a wall-type object (no specific radius), use larger radius
        if (!obj.userData.collisionRadius && obj.geometry instanceof THREE.BoxGeometry) {
            // Walls are typically BoxGeometry
            objectRadius = 1.5;
        }

        // Calculate distance between player and object
        const dx = x - objX;
        const dz = z - objZ;
        const distance = Math.sqrt(dx * dx + dz * dz);

        // Check collision with combined radii
        if (distance < playerRadius + objectRadius) {
            return true;
        }
    }
    return false;
}

// Process continuous movement based on key states
function updateMovement(deltaTime) {
    // Update dash timers
    if (game.movement.dashTimer > 0) {
        game.movement.dashTimer -= deltaTime;
        if (game.movement.dashTimer <= 0) {
            game.movement.isDashing = false;
        }
    }
    if (game.movement.dashCooldownTimer > 0) {
        game.movement.dashCooldownTimer -= deltaTime;
    }

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
        if (length > 0) { // Prevent division by zero
            moveX /= length;
            moveZ /= length;
        }
    }

    // Get camera direction (yaw only, no pitch for movement)
    const yaw = game.player.rotation.y;
    const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

    // Calculate desired velocity based on input (or dash)
    let speed;
    if (game.movement.isDashing) {
        // During dash, use dash speed
        speed = game.movement.dashSpeed;
    } else {
        // Normal movement
        speed = game.movement.speed * (game.movement.isSprinting ? game.movement.sprintMultiplier : 1);
    }

    const targetVelocity = new THREE.Vector3();
    targetVelocity.addScaledVector(forward, moveZ);
    targetVelocity.addScaledVector(right, moveX);
    targetVelocity.multiplyScalar(speed);

    // Apply acceleration/deceleration
    if (game.movement.isDashing) {
        // Instant velocity during dash
        game.movement.velocity.x = targetVelocity.x;
        game.movement.velocity.z = targetVelocity.z;
    } else if (moveX !== 0 || moveZ !== 0) {
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

    // Track and play footstep sounds when moving
    game.movement.isMoving = Math.abs(game.movement.velocity.x) > 0.1 || Math.abs(game.movement.velocity.z) > 0.1;
    if (game.movement.isMoving && game.audioInitialized) {
        // Play footstep at intervals based on speed
        if (!game.lastFootstepTime) game.lastFootstepTime = 0;
        const footstepInterval = game.movement.isSprinting ? FOOTSTEP_SPRINT_INTERVAL : FOOTSTEP_WALK_INTERVAL;

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

    // Initialize item system
    game.itemManager = new ItemManager();
    game.inventory = new Inventory(20);
    console.log('Item system initialized');

    // Initialize weapon system
    game.weaponSystem = new WeaponSystem(game.camera, game.scene, game.itemManager);

    // Initialize hit effects
    game.hitEffects = new HitEffects(game.scene);

    // Initialize audio system
    game.audio = new AudioManager(game.camera);
    console.log('Audio system created (will initialize on first user interaction)');

    // Initialize loading screen
    game.loadingScreen = new LoadingScreen();
    console.log('Loading screen initialized');

    // Create some starter swords and add to inventory
    const startingSword = game.itemManager.createItem('short_sword');
    if (startingSword) {
        game.inventory.addItem(startingSword);
        console.log('Added Short Sword to inventory');
    }

    // Create a few more swords for testing
    const longSword = game.itemManager.createItem('long_sword');
    const flameBlade = game.itemManager.createItem('flame_blade');
    const frostFang = game.itemManager.createItem('frost_fang');

    if (longSword) game.inventory.addItem(longSword);
    if (flameBlade) game.inventory.addItem(flameBlade);
    if (frostFang) game.inventory.addItem(frostFang);

    console.log('Added additional swords to inventory for testing');

    // Initialize painting gallery
    game.paintingGallery = new PaintingGallery();
    console.log('Painting gallery initialized');

    // Renderer setup
    game.renderer = new THREE.WebGLRenderer({ antialias: true });
    game.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(game.renderer.domElement);
    game.renderer.domElement.id = 'game-canvas';

    // Setup atmospheric lighting (brighter so you can see!)
    game.lighting = new AtmosphericLighting(game.scene, {
        ambientIntensity: 0.6,  // Slightly brighter for better visibility
        fogNear: 3,             // Fog starts closer for atmosphere
        fogFar: 25              // Extended view distance for exploration
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
        useTextures: false,  // Disabled to prevent WebGL texture limit errors
        collidableObjects: game.collidableObjects,  // Pass array for collision detection
        paintingGallery: game.paintingGallery  // Pass painting gallery for placement
    });
    const buildResult = await game.dungeon.builder.build();

    // Populate collidable objects for collision detection
    // Use wall meshes from the builder
    game.collidableObjects = game.dungeon.builder.meshes.filter(mesh => {
        // Filter out floors and ceilings, keep only walls and decorations
        return mesh.geometry instanceof THREE.BoxGeometry && mesh.position.y > 0.5;
    });

    // Store grid positions for walls based on dungeon data
    for (const obj of game.collidableObjects) {
        const gridX = Math.round(obj.position.x / 4);
        const gridZ = Math.round(obj.position.z / 4);
        obj.userData.gridPos = { x: gridX, z: gridZ };
    }

    console.log('Collision system initialized with', game.collidableObjects.length, 'objects');

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

    // Place furniture in rooms
    game.dungeon.furniture = new FurnitureDecorator(
        game.scene,
        game.dungeon.data,
        {
            cellSize: 4,
            wallHeight: 3.5,
            furnitureDensity: 0.6
        }
    );
    game.dungeon.furniture.decorateRooms();
    game.dungeon.furniture.addDoorsToCorridors();
    console.log('✓ Furniture placement complete');

    // Register furniture for collision detection
    registerFurnitureCollision();

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

    // Initialize Home Decor System - creates unique atmospheric rooms
    console.log('Initializing Home Decor System...');
    game.dungeon.homeDecor = new HomeDecorSystem(
        game.scene,
        game.dungeon.data,
        {
            cellSize: 4,
            wallHeight: 3.5,
            decorDensity: 0.7,
            enableLighting: true
        }
    );
    await game.dungeon.homeDecor.decorateAllRooms();
    console.log('Home Decor System initialized successfully');

    // Register decorations for collision
    registerDecorationCollision();

    // Initialize Chest Manager
    console.log('Initializing Chest Manager...');
    game.chestManager = new ChestManager(game.scene, game.dungeon.data, game.itemManager, game.audio);
    game.chestManager.placeChests();
    console.log('Chest Manager initialized:', game.chestManager.getStats());

    // Initialize Trap Manager
    console.log('Initializing Trap Manager...');
    game.trapManager = new TrapManager(game.scene, game.dungeon.data, game.audio);
    game.trapManager.placeTraps();
    console.log('Trap Manager initialized:', game.trapManager.getStats());

    // Register chests for collision (traps are walkable)
    registerChestAndTrapCollision();

    // Initialize Instance Manager
    console.log('Initializing Instance Manager...');
    game.instanceManager = new InstanceManager(game.renderer, game.audio);
    console.log('Instance Manager initialized');

    // Initialize Portal Manager and place portals
    console.log('Placing instance portals...');
    game.portalManager = new PortalManager(game.scene);
    const portalPlacements = game.dungeon.builder.getInstancePortalPlacements();
    for (const placement of portalPlacements) {
        game.portalManager.createPortal(
            placement.portalId,
            placement.position,
            placement.instanceId,
            placement.metadata
        );
    }
    console.log(`Placed ${portalPlacements.length} instance portals`);

    // Initialize Stair Manager
    console.log('Initializing Stair Manager...');
    game.stairManager = new StairManager(game.scene, game.dungeon.data, {
        cellSize: 4,
        wallHeight: 3.5,
        interactionRange: 3.0
    });
    game.stairManager.setCurrentLevel(game.currentLevel);
    game.stairManager.placeStairs();
    console.log('Stair Manager initialized:', game.stairManager.getStats());

    // Initialize player (now as Player class instance)
    game.player = new Player(game.scene);

    // Link armor system reference for easier access
    game.armorSystem = game.player.armorSystem;
    // Set player spawn position
    const spawnPos = game.dungeon.generator.getSpawnPosition();
    game.player.position.x = spawnPos.x * 4;
    game.player.position.z = spawnPos.z * 4;

    game.camera.position.set(
        game.player.position.x,
        game.player.position.y,
        game.player.position.z
    );

    // Initialize painting interaction system
    game.paintingInteraction = new PaintingInteraction(game.camera, buildResult.paintings || []);
    console.log(`Painting interaction system initialized with ${buildResult.paintings?.length || 0} paintings`);

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
        const currentItem = game.weaponSystem.getCurrentWeaponItem();

        let durabilityInfo = '';
        let extraInfo = '';

        if (currentItem instanceof Sword) {
            const durPercent = currentItem.getDurabilityPercent();
            const durColor = durPercent > 50 ? '#0f0' : durPercent > 25 ? '#ff0' : '#f00';
            durabilityInfo = `<span style="color: ${durColor}; margin-left: 5px;">[${currentItem.durability}/${currentItem.maxDurability}]</span>`;

            if (currentItem.elementalDamage) {
                extraInfo += ` | ${currentItem.elementalDamage.type}: ${currentItem.elementalDamage.amount}`;
            }
            if (currentItem.critChance > 0) {
                extraInfo += ` | Crit: ${(currentItem.critChance * 100).toFixed(0)}%`;
            }
        }

        weaponInfo = `
            <div style="font-size: 12px; margin-top: 10px; padding: 5px; background: rgba(0,0,0,0.5); border: 1px solid #666;">
                <div style="color: #ffa500; margin-bottom: 3px;">${stats.name}${durabilityInfo}</div>
                <div style="font-size: 11px;">Damage: ${stats.damage} | Range: ${stats.range.toFixed(1)} | Speed: ${(1000/stats.attackSpeed).toFixed(1)}/s${extraInfo}</div>
            </div>
        `;
    }

    // Get inventory info
    let inventoryInfo = '';
    if (game.inventory) {
        inventoryInfo = '<div style="font-size: 11px; margin-top: 10px; padding: 5px; background: rgba(0,0,0,0.5); border: 1px solid #666;">';
        inventoryInfo += '<div style="color: #aaffaa; margin-bottom: 3px;">INVENTORY (Press 5-9 to equip)</div>';

        for (let i = 0; i < 5; i++) {
            const slot = game.inventory.getSlot(i);
            if (slot && slot.item instanceof Sword) {
                const item = slot.item;
                const rarityColor = {
                    'common': '#aaa',
                    'uncommon': '#5f5',
                    'rare': '#55f',
                    'legendary': '#fa0'
                }[item.rarity] || '#fff';

                inventoryInfo += `<div style="font-size: 10px;">
                    [${i + 5}] <span style="color: ${rarityColor}">${item.name}</span> (Dmg: ${item.damage})
                </div>`;
            } else {
                inventoryInfo += `<div style="font-size: 10px; color: #555;">[${i + 5}] Empty</div>`;
            }
        }

        inventoryInfo += '</div>';
    }

    // Get armor stats if armor system is initialized
    let armorInfo = '';
    if (game.armorSystem) {
        const equipment = game.armorSystem.getEquipmentSummary();
        const durability = game.armorSystem.getDurabilityInfo();

        // Color code durability
        const armorDurColor = durability.armor.percentage > 50 ? '#0f0' : durability.armor.percentage > 25 ? '#ff0' : '#f00';
        const helmetDurColor = durability.helmet.percentage > 50 ? '#0f0' : durability.helmet.percentage > 25 ? '#ff0' : '#f00';
        const shieldDurColor = durability.shield.percentage > 50 ? '#0f0' : durability.shield.percentage > 25 ? '#ff0' : '#f00';

        armorInfo = `
            <div style="font-size: 12px; margin-top: 10px; padding: 5px; background: rgba(0,0,0,0.5); border: 1px solid #888;">
                <div style="color: #88aaff; margin-bottom: 5px; font-weight: bold;">ARMOR EQUIPMENT</div>

                <div style="font-size: 11px; margin-bottom: 3px;">
                    Body: <span style="color: #aaa;">${equipment.armor.stats.name}</span>
                    ${equipment.armor.stats.defense > 0 ? `<span style="color: ${armorDurColor}; margin-left: 5px;">[${Math.ceil(durability.armor.current)}/${durability.armor.max}]</span>` : ''}
                </div>

                <div style="font-size: 11px; margin-bottom: 3px;">
                    Head: <span style="color: #aaa;">${equipment.helmet.stats.name}</span>
                    ${equipment.helmet.stats.defense > 0 ? `<span style="color: ${helmetDurColor}; margin-left: 5px;">[${Math.ceil(durability.helmet.current)}/${durability.helmet.max}]</span>` : ''}
                </div>

                <div style="font-size: 11px; margin-bottom: 5px;">
                    Shield: <span style="color: #aaa;">${equipment.shield.stats.name}</span>
                    ${equipment.shield.stats.defense > 0 ? `<span style="color: ${shieldDurColor}; margin-left: 5px;">[${Math.ceil(durability.shield.current)}/${durability.shield.max}]</span>` : ''}
                </div>

                <div style="font-size: 11px; border-top: 1px solid #555; padding-top: 3px; margin-top: 3px;">
                    <div>Defense: <span style="color: #8f8;">${equipment.total.defense}</span> | Weight: <span style="color: ${equipment.total.weight > 10 ? '#f88' : '#aaa'}">${equipment.total.weight.toFixed(1)}</span></div>
                    <div>Speed: <span style="color: ${equipment.total.speedModifier < 1 ? '#f88' : '#8f8'}">${(equipment.total.speedModifier * 100).toFixed(0)}%</span> | Block: <span style="color: #88f">${(equipment.total.blockChance * 100).toFixed(0)}%</span></div>
                    <div style="font-size: 10px; margin-top: 2px;">
                        Resist:
                        Phys <span style="color: #aaa">${(equipment.total.resistances.physical * 100).toFixed(0)}%</span> |
                        Fire <span style="color: #f88">${(equipment.total.resistances.fire * 100).toFixed(0)}%</span> |
                        Ice <span style="color: #88f">${(equipment.total.resistances.ice * 100).toFixed(0)}%</span> |
                        Ltng <span style="color: #ff8">${(equipment.total.resistances.lightning * 100).toFixed(0)}%</span>
                    </div>
                </div>
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

    // Check for nearby chest
    let chestPrompt = '';
    if (game.chestManager) {
        const nearestChest = game.chestManager.getNearestChest(game.player.position);
        if (nearestChest && nearestChest.distance < 2.5) {
            const chest = nearestChest.chest;
            if (chest.locked) {
                chestPrompt = '<div style="font-size: 13px; color: #ff4400; margin-top: 10px; padding: 5px; background: rgba(0,0,0,0.6); border: 1px solid #ff4400;">Locked Chest (Need key)</div>';
            } else if (!chest.opened) {
                chestPrompt = '<div style="font-size: 13px; color: #ffaa00; margin-top: 10px; padding: 5px; background: rgba(0,0,0,0.6); border: 1px solid #ffaa00;">Press E to open chest</div>';
            }
        }
    }

    // Check for nearby stairs
    let stairPrompt = '';
    if (game.stairManager) {
        const nearestStair = game.stairManager.getNearestStair(game.player.position);
        if (nearestStair && nearestStair.distance < 3.0) {
            const stair = nearestStair.stair;
            const directionText = stair.direction === 'down' ? 'DOWN' : 'UP';
            const color = stair.direction === 'down' ? '#ff6666' : '#66ff66';
            const borderColor = stair.direction === 'down' ? '#ff6666' : '#66ff66';
            stairPrompt = `<div style="font-size: 13px; color: ${color}; margin-top: 10px; padding: 5px; background: rgba(0,0,0,0.6); border: 1px solid ${borderColor};">Press E - Stairs ${directionText} (Level ${stair.targetLevel})</div>`;
        }
    }

    // Check for nearby portals or instance exit
    let portalPrompt = '';
    if (game.instanceManager?.isInInstance) {
        // In instance - check for exit
        if (game.instanceManager.canExitInstance(game.player)) {
            portalPrompt = '<div style="font-size: 13px; color: #00ff88; margin-top: 10px; padding: 5px; background: rgba(0,0,0,0.6); border: 1px solid #00ff88;">Press E - Return to Dungeon</div>';
        } else if (game.instanceManager.currentInstance?.isLocked) {
            portalPrompt = '<div style="font-size: 13px; color: #ff4400; margin-top: 10px; padding: 5px; background: rgba(0,0,0,0.6); border: 1px solid #ff4400;">Exit Locked - Complete objectives</div>';
        }
    } else if (game.portalManager) {
        // In dungeon - check for portals
        const nearestPortal = game.portalManager.findNearestPortal(game.player.position, 2.5);
        if (nearestPortal) {
            const metadata = game.instanceManager?.getInstanceMetadata(nearestPortal.instanceId);
            const portalName = metadata?.name || 'Unknown Instance';
            const completedText = metadata?.isCompleted ? ' [COMPLETED]' : '';
            portalPrompt = `<div style="font-size: 13px; color: #88aaff; margin-top: 10px; padding: 5px; background: rgba(0,0,0,0.6); border: 1px solid #88aaff;">Press E - Enter ${portalName}${completedText}</div>`;
        }
    }

    // Get chest and trap stats
    let statsInfo = '';
    if (game.chestManager && game.trapManager && game.stairManager) {
        const chestStats = game.chestManager.getStats();
        const trapStats = game.trapManager.getStats();
        const stairStats = game.stairManager.getStats();
        statsInfo = `
            <div style="font-size: 11px; opacity: 0.5; margin-top: 5px;">
                Level: ${stairStats.currentLevel}/${stairStats.maxLevel} | Chests: ${chestStats.opened}/${chestStats.total} | Traps: ${trapStats.total}
            </div>
        `;
    }

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
            ${inventoryInfo}
            ${armorInfo}
            ${chestPrompt}
            ${stairPrompt}
            ${portalPrompt}
            <div style="font-size: 12px; opacity: 0.7; margin-top: 10px;">
                Enemies: ${game.enemies.filter(e => !e.isDead()).length}/${game.enemies.length}
            </div>
            ${statsInfo}
            <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">
                Mouse Look: ${mouseLockStatus}
            </div>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">
                WASD: Move | SHIFT: Sprint | SHIFT x2: Dash | SPACE: Attack | E: Interact
            </div>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">
                Dash: ${game.movement.dashCooldownTimer > 0 ?
                    `<span style="color: #ff0">${game.movement.dashCooldownTimer.toFixed(1)}s</span>` :
                    '<span style="color: #0f0">READY</span>'}
            </div>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">
                1-4: Weapons | 5-9: Swords | F1-F4: Armor | F5-F8: Helmets | F9-F12: Shields
            </div>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">
                T: Test Damage | H: Heal | R: Repair Armor
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

    // Update chest manager
    if (game.chestManager) {
        game.chestManager.update(deltaTime);
    }

    // Update trap manager
    if (game.trapManager) {
        game.trapManager.update(deltaTime);
    }

    // Update stair manager (animations)
    if (game.stairManager) {
        game.stairManager.update(deltaTime / 1000); // Convert to seconds
    }

    // Check for trap triggers
    if (game.trapManager) {
        const triggeredTraps = game.trapManager.checkTraps(game.player.position, game.player);
        if (triggeredTraps.length > 0) {
            // Visual feedback for trap damage
            if (game.hitEffects) {
                game.hitEffects.triggerScreenShake(0.2, 0.1);
            }
            updateUI();
        }
    }

    // Update enemies and handle enemy attacks
    for (const enemy of game.enemies) {
        if (!enemy.isDead()) {
            enemy.update(deltaTime);

            // Enemy AI: Try to attack player if in range
            if (enemy.tryAttackPlayer(game.player)) {
                // Enemy attacks player
                const damageResult = game.player.takeDamage(enemy.attackPower, 'physical');

                console.log(`Enemy attacked! Raw: ${enemy.attackPower} -> Final: ${damageResult.damageDealt.toFixed(1)} (Reduced: ${damageResult.damageReduced.toFixed(1)}) ${damageResult.blocked ? '[BLOCKED]' : ''}`);

                // Visual feedback for player damage
                if (game.hitEffects) {
                    game.hitEffects.triggerScreenShake(0.15, 0.08);
                }

                updateUI();

                if (damageResult.isDead) {
                    console.log('Player defeated!');
                }
            }
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

            // Reduce weapon durability if it's a sword item
            const currentItem = game.weaponSystem.getCurrentWeaponItem();
            if (currentItem instanceof Sword) {
                const broken = currentItem.reduceDurability(1);
                if (broken) {
                    console.log(`${currentItem.name} is broken! Switching to default sword.`);
                    game.weaponSystem.switchWeapon('sword');
                }
            }

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

    // Animate home decor flames
    if (game.dungeon.homeDecor) {
        game.dungeon.homeDecor.animateFlames(game.time);
    }

    // Update portals (only when in dungeon)
    if (game.portalManager && !game.instanceManager?.isInInstance) {
        game.portalManager.update(deltaTimeSec);
    }

    // Update instance (if in instance)
    if (game.instanceManager && game.instanceManager.isInInstance) {
        game.instanceManager.update(deltaTimeSec, game.player);
    }

    // Check if player is moving for viewmodel bob
    const playerIsMoving = Math.abs(game.movement.velocity.x) > 0.1 ||
                          Math.abs(game.movement.velocity.z) > 0.1;

    // Update viewmodel (hands + sword)
    if (game.viewmodel) {
        game.viewmodel.update(deltaTimeSec, playerIsMoving);
    }

    // Update painting interaction system
    if (game.paintingInteraction) {
        game.paintingInteraction.update();
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

    // Render correct scene (dungeon or instance)
    const currentScene = game.instanceManager?.getCurrentScene(game.scene) || game.scene;
    game.renderer.render(currentScene, game.camera);

    // Render viewmodel on top (separate render pass)
    if (game.viewmodel) {
        game.viewmodel.render();
    }
}

// Start the game
init();
