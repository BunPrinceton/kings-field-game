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
import { DemoRoom } from './DemoRoom.js';

/**
 * Health system class - manages health for entities
 */
class Health {
    /**
     * Create a new Health instance
     * @param {number} maxHealth - Maximum health value
     */
    constructor(maxHealth) {
        this.max = maxHealth;
        this.current = maxHealth;
    }

    /**
     * Apply damage to the entity
     * @param {number} amount - Amount of damage to apply
     * @returns {boolean} True if entity is dead after damage
     */
    takeDamage(amount) {
        this.current = Math.max(0, this.current - amount);
        return this.current <= 0;
    }

    /**
     * Heal the entity
     * @param {number} amount - Amount of health to restore
     */
    heal(amount) {
        this.current = Math.min(this.max, this.current + amount);
    }

    /**
     * Get current health as a percentage
     * @returns {number} Health percentage (0-100)
     */
    getPercentage() {
        return (this.current / this.max) * 100;
    }

    /**
     * Check if entity is dead
     * @returns {boolean} True if current health is 0 or less
     */
    isDead() {
        return this.current <= 0;
    }
}

// Constants
const PLAYER_EYE_HEIGHT = 1.6;
const ATTACK_COOLDOWN_MS = 500;
const FOOTSTEP_SPRINT_INTERVAL = 300;
const FOOTSTEP_WALK_INTERVAL = 450;

/**
 * Player class - manages player state, combat, and armor
 */
class Player {
    /**
     * Create a new Player
     * @param {THREE.Scene} scene - The Three.js scene
     */
    constructor(scene) {
        this.scene = scene;
        this.health = new Health(100);
        this.mana = new Health(100);  // Add mana system
        this.position = { x: 0, y: PLAYER_EYE_HEIGHT, z: 5 };
        this.rotation = { x: 0, y: 0 };
        this.attackPower = 25;
        this.attackRange = 2.5;
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.attackCooldownMax = ATTACK_COOLDOWN_MS;

        // Jump mechanics
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.jumpPower = 8;
        this.gravity = -20;
        this.groundHeight = PLAYER_EYE_HEIGHT;

        // Armor system
        this.armorSystem = new ArmorSystem(scene);
    }

    /**
     * Attempt to attack enemies in range
     * @param {Array} enemies - Array of enemy objects
     * @param {Object} weaponStats - Weapon statistics object
     * @returns {Object|null} The closest enemy in range, or null
     */
    attack(enemies, weaponStats) {
        if (this.isAttacking || this.attackCooldown > 0) {
            return null;
        }

        // Validate enemies array
        if (!enemies || !Array.isArray(enemies) || enemies.length === 0) {
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

    /**
     * Apply damage to the player, accounting for armor
     * @param {number} amount - Amount of damage to apply
     * @param {string} damageType - Type of damage (physical, magical, etc.)
     * @returns {Object} Object with isDead, damageDealt, blocked, damageReduced
     */
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

    /**
     * Get current movement speed modified by armor
     * @returns {number} Movement speed modifier
     */
    getMovementSpeed() {
        // Get base movement speed modified by armor
        return this.armorSystem.speedModifier;
    }

    /**
     * Get stamina drain modifier from armor
     * @returns {number} Stamina modifier
     */
    getStaminaModifier() {
        // Get stamina drain modifier from armor
        return this.armorSystem.staminaModifier;
    }

    /**
     * Update player state
     * @param {number} deltaTime - Time elapsed since last update in milliseconds
     */
    update(deltaTime) {
        if (this.attackCooldown > 0) {
            this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
        }

        // Update armor system
        if (this.armorSystem) {
            this.armorSystem.update(deltaTime);
        }

        // Regenerate mana slowly
        if (this.mana.current < this.mana.max) {
            this.mana.heal(deltaTime * 0.005); // Regenerate 5 mana per second (deltaTime is in ms)
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
    menuOpen: false, // ESC menu state
    trapManager: null, // TrapManager instance
    loadingScreen: null, // LoadingScreen instance
    stairManager: null, // StairManager instance
    currentLevel: 1, // Current dungeon level
    instanceManager: null, // InstanceManager instance
    portalManager: null, // PortalManager instance
    demoRoom: null, // Demo room for inspecting objects
    demoRoomActive: false // Whether demo room is active
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
        if (!game.mouse.isLocked || game.menuOpen) return;

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

    // Set player spawn position with safety offset
    const spawnPos = game.dungeon.generator.getSpawnPosition();
    // Add a small offset to avoid spawning inside walls or objects
    game.player.position.x = spawnPos.x * 4 + 2;
    game.player.position.z = spawnPos.z * 4 + 2;

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

// Toggle demo room display
async function toggleDemoRoom() {
    if (!game.demoRoomActive) {
        // Create and activate demo room
        console.log('Creating demo room...');

        // Save current position
        game.savedPosition = {
            x: game.player.position.x,
            z: game.player.position.z
        };

        // Move player to demo room
        game.player.position.x = 100; // Far from main dungeon
        game.player.position.z = 100;
        game.camera.position.x = 100;
        game.camera.position.z = 100;

        // Create demo room
        game.demoRoom = new DemoRoom(game.scene, { x: 100, z: 100 });
        await game.demoRoom.build();

        game.demoRoomActive = true;
        console.log('Demo room activated! Press R to return to dungeon.');

        // Display painting gallery in new window
        displayPaintingGallery();
    } else {
        // Return to dungeon
        console.log('Returning to dungeon...');

        // Restore position
        if (game.savedPosition) {
            game.player.position.x = game.savedPosition.x;
            game.player.position.z = game.savedPosition.z;
            game.camera.position.x = game.savedPosition.x;
            game.camera.position.z = game.savedPosition.z;
        }

        // Clean up demo room
        if (game.demoRoom) {
            game.demoRoom.dispose();
            game.demoRoom = null;
        }

        game.demoRoomActive = false;
        console.log('Returned to dungeon.');

        // Close painting gallery window
        closePaintingGallery();
    }
}

// Display painting gallery in a new window
function displayPaintingGallery() {
    const galleryWindow = window.open('', 'paintingGallery', 'width=800,height=600');

    if (!galleryWindow) {
        console.warn('Could not open painting gallery window');
        return;
    }

    // Store reference
    game.paintingGalleryWindow = galleryWindow;

    // Generate HTML for painting display
    const paintings = game.paintingGallery.getStats();
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Painting Gallery Inspector</title>
            <style>
                body {
                    font-family: monospace;
                    background: #222;
                    color: #fff;
                    padding: 20px;
                    margin: 0;
                }
                h1 { color: #ffa500; }
                .category {
                    margin: 20px 0;
                    border: 1px solid #444;
                    padding: 10px;
                }
                .painting {
                    display: inline-block;
                    margin: 10px;
                    text-align: center;
                }
                canvas {
                    border: 2px solid #666;
                    display: block;
                    margin: 5px auto;
                }
                .title {
                    font-size: 12px;
                    color: #aaa;
                }
            </style>
        </head>
        <body>
            <h1>Painting Gallery Inspector</h1>
            <p>Total Paintings: ${paintings.totalPaintings}</p>
            <p>Categories: ${paintings.categories.join(', ')}</p>
            <div id="gallery"></div>
            <script>
                // Create canvases for each painting
                const categories = ${JSON.stringify(['portraits', 'landscapes', 'creatures'])};
                const galleryDiv = document.getElementById('gallery');

                categories.forEach((category, catIndex) => {
                    const categoryDiv = document.createElement('div');
                    categoryDiv.className = 'category';
                    categoryDiv.innerHTML = '<h2>' + category.toUpperCase() + '</h2>';

                    for (let i = 0; i < 3; i++) {
                        const paintingDiv = document.createElement('div');
                        paintingDiv.className = 'painting';

                        const canvas = document.createElement('canvas');
                        canvas.width = 128;
                        canvas.height = 128;
                        const ctx = canvas.getContext('2d');

                        // Draw procedural painting
                        const gradient = ctx.createLinearGradient(0, 0, 128, 128);
                        gradient.addColorStop(0, '#' + Math.floor(Math.random()*16777215).toString(16));
                        gradient.addColorStop(1, '#' + Math.floor(Math.random()*16777215).toString(16));
                        ctx.fillStyle = gradient;
                        ctx.fillRect(0, 0, 128, 128);

                        // Category-specific shapes
                        ctx.strokeStyle = '#fff';
                        ctx.lineWidth = 1;

                        if (category === 'portraits') {
                            ctx.beginPath();
                            ctx.arc(64, 50, 20, 0, Math.PI * 2);
                            ctx.stroke();
                            ctx.beginPath();
                            ctx.arc(55, 45, 3, 0, Math.PI * 2);
                            ctx.arc(73, 45, 3, 0, Math.PI * 2);
                            ctx.stroke();
                        } else if (category === 'landscapes') {
                            ctx.beginPath();
                            ctx.moveTo(0, 90);
                            ctx.lineTo(40, 60);
                            ctx.lineTo(64, 70);
                            ctx.lineTo(90, 50);
                            ctx.lineTo(128, 80);
                            ctx.stroke();
                        } else {
                            ctx.beginPath();
                            ctx.moveTo(64, 30);
                            for (let j = 0; j < 6; j++) {
                                const angle = (j / 6) * Math.PI * 2;
                                ctx.lineTo(
                                    64 + Math.cos(angle) * 30,
                                    64 + Math.sin(angle) * 30
                                );
                            }
                            ctx.closePath();
                            ctx.stroke();
                        }

                        // Label
                        ctx.fillStyle = '#fff';
                        ctx.font = '10px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(category + '_' + (i + 1), 64, 120);

                        paintingDiv.appendChild(canvas);

                        const title = document.createElement('div');
                        title.className = 'title';
                        title.textContent = category + '_painting_' + (i + 1);
                        paintingDiv.appendChild(title);

                        categoryDiv.appendChild(paintingDiv);
                    }

                    galleryDiv.appendChild(categoryDiv);
                });
            </script>
        </body>
        </html>
    `;

    galleryWindow.document.write(html);
    galleryWindow.document.close();
}

// Close painting gallery window
function closePaintingGallery() {
    if (game.paintingGalleryWindow && !game.paintingGalleryWindow.closed) {
        game.paintingGalleryWindow.close();
        game.paintingGalleryWindow = null;
    }
}

// Cast fire spell
function castFireSpell() {
    const manaCost = 20;

    // Check if player has enough mana
    if (game.player.mana.current < manaCost) {
        console.log('Not enough mana!');
        return;
    }

    // Consume mana
    game.player.mana.takeDamage(manaCost);

    // Create fireball
    const fireball = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 8),
        new THREE.MeshBasicMaterial({
            color: 0xff4400,
            emissive: 0xff4400,
            emissiveIntensity: 2
        })
    );

    // Position fireball in front of player
    const direction = new THREE.Vector3(
        -Math.sin(game.mouse.yaw),
        Math.sin(game.mouse.pitch),
        -Math.cos(game.mouse.yaw)
    );

    fireball.position.set(
        game.player.position.x + direction.x * 2,
        game.player.position.y + direction.y * 2,
        game.player.position.z + direction.z * 2
    );

    // Add to scene
    game.scene.add(fireball);

    // Animate fireball
    const speed = 15;
    const maxDistance = 20;
    let traveled = 0;

    const animateFireball = () => {
        if (traveled >= maxDistance) {
            // Remove fireball and create explosion effect
            game.scene.remove(fireball);
            return;
        }

        // Move fireball
        fireball.position.add(direction.clone().multiplyScalar(speed * 0.016));
        traveled += speed * 0.016;

        // Check collision with enemies
        for (const enemy of game.enemies) {
            if (!enemy.isDead()) {
                const distance = fireball.position.distanceTo(enemy.mesh.position);
                if (distance < 1) {
                    // Deal damage to enemy
                    enemy.takeDamage(50);
                    game.scene.remove(fireball);

                    // Create hit effect
                    if (game.hitEffects) {
                        game.hitEffects.createMagicHit(enemy.mesh.position);
                    }
                    return;
                }
            }
        }

        requestAnimationFrame(animateFireball);
    };

    animateFireball();
    console.log('Fire spell cast! Mana:', game.player.mana.current);
}

// Input handling
function setupInput() {
    window.addEventListener('keydown', (e) => {
        // Initialize audio on first user interaction
        if (!game.audioInitialized && game.audio) {
            initAudio();
        }

        // Handle ESC menu toggle
        if (e.code === 'Escape') {
            e.preventDefault();
            toggleMenu();
            return;
        }

        // Don't process game inputs if menu is open
        if (game.menuOpen) return;

        // Handle jump with spacebar
        if (e.code === 'Space') {
            e.preventDefault();
            if (!game.player.isJumping) {
                game.player.isJumping = true;
                game.player.jumpVelocity = game.player.jumpPower;
            }
        }

        // Handle attack with left click or Q
        if (e.code === 'KeyQ') {
            e.preventDefault();
            game.input.attack = true;
        }

        // Handle fire spell with F key
        if (e.code === 'KeyF') {
            e.preventDefault();
            castFireSpell();
        }

        // Handle furniture interaction (E key)
        if (e.code === 'KeyE') {
            tryInteractWithFurniture();
            // Also check for stair interaction
            tryInteractWithStairs();
            // Also check for portal interaction
            tryInteractWithPortal();
        }

        // Toggle demo room with R key
        if (e.code === 'KeyR') {
            e.preventDefault();
            toggleDemoRoom();
        }

        // Toggle sprint with Shift
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
            game.movement.isSprinting = !game.movement.isSprinting;
            console.log('Sprint:', game.movement.isSprinting ? 'ON' : 'OFF');
        }

        // Handle dash with double-tap W
        if (e.code === 'KeyW') {
            const now = Date.now();
            const timeSinceLastPress = now - game.movement.lastWPress;

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

            game.movement.lastWPress = now;
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
        if (e.code === 'KeyQ') {
            e.preventDefault();
            game.input.attack = false;
        }

        // Sprint is now toggle, don't release on key up

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
function checkCollision(x, z, playerRadius = 0.4) {
    // Check against collidable objects
    for (const obj of game.collidableObjects) {
        // Skip if object doesn't have position
        if (!obj.position) continue;

        // Use actual object position (more accurate than grid position)
        const objX = obj.position.x;
        const objZ = obj.position.z;

        // Get object-specific collision radius or calculate from geometry
        let objectRadius = obj.userData.collisionRadius;

        if (!objectRadius) {
            // Calculate radius based on object geometry
            if (obj.geometry) {
                obj.geometry.computeBoundingBox();
                const bbox = obj.geometry.boundingBox;
                if (bbox) {
                    const sizeX = Math.abs(bbox.max.x - bbox.min.x);
                    const sizeZ = Math.abs(bbox.max.z - bbox.min.z);
                    objectRadius = Math.max(sizeX, sizeZ) / 2;

                    // Scale by object's scale if it exists
                    if (obj.scale) {
                        objectRadius *= Math.max(obj.scale.x, obj.scale.z);
                    }
                }
            }

            // Default fallback radius
            if (!objectRadius) {
                objectRadius = 0.5;
            }

            // Cache the calculated radius
            obj.userData.collisionRadius = objectRadius;
        }

        // Calculate distance between player and object
        const dx = x - objX;
        const dz = z - objZ;
        const distance = Math.sqrt(dx * dx + dz * dz);

        // Check collision with combined radii (add small buffer for smoother collision)
        if (distance < playerRadius + objectRadius + 0.1) {
            return true;
        }
    }

    // Also check against dungeon walls more precisely
    const gridX = Math.round(x / 4);
    const gridZ = Math.round(z / 4);

    // Check if position is outside dungeon bounds
    if (gridX < 0 || gridX >= game.dungeon.data.width ||
        gridZ < 0 || gridZ >= game.dungeon.data.height) {
        return true;
    }

    // Check if position is in a wall cell
    if (game.dungeon.data.grid[gridZ][gridX] === 0) {
        return true;
    }

    return false;
}

// Process continuous movement based on key states
function updateMovement(deltaTime) {
    // Don't process movement if menu is open
    if (game.menuOpen) {
        game.movement.velocity.x *= 0.9;
        game.movement.velocity.z *= 0.9;
        return;
    }

    // Update jump physics
    if (game.player.isJumping) {
        game.player.jumpVelocity += game.player.gravity * deltaTime;
        game.player.position.y += game.player.jumpVelocity * deltaTime;

        // Check if landed
        if (game.player.position.y <= game.player.groundHeight) {
            game.player.position.y = game.player.groundHeight;
            game.player.isJumping = false;
            game.player.jumpVelocity = 0;
        }
    }

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
        moveZ += 1;  // W now moves backward
    }
    if (game.keys['s'] || game.keys['arrowdown']) {
        moveZ -= 1;  // S now moves forward
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
            const numVariations = SOUND_CONFIG?.footsteps?.stone?.files?.length || 1;
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

    // Player will be initialized after dungeon generation (line 1266)
    // so that spawn position is available

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

    // Initialize painting gallery with scene and load paintings
    game.paintingGallery = new PaintingGallery(game.scene);
    // Load manifest or create fallback paintings
    await game.paintingGallery.loadManifest();
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
        // Filter out floors, ceilings, and paintings
        // Paintings are THREE.Group objects, not meshes
        if (mesh instanceof THREE.Group) {
            return false; // Skip groups (paintings)
        }
        // Keep only walls (BoxGeometry above ground level)
        return mesh.geometry instanceof THREE.BoxGeometry && mesh.position.y > 0.5;
    });

    // Store grid positions for walls based on dungeon data
    for (const obj of game.collidableObjects) {
        const gridX = Math.round(obj.position.x / 4);
        const gridZ = Math.round(obj.position.z / 4);
        obj.userData.gridPos = { x: gridX, z: gridZ };
    }

    console.log('Collision system initialized with', game.collidableObjects.length, 'objects');

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
    // Set player spawn position with safety offset
    const spawnPos = game.dungeon.generator.getSpawnPosition();
    // Add a small offset to avoid spawning inside walls or objects
    game.player.position.x = spawnPos.x * 4 + 2;
    game.player.position.z = spawnPos.z * 4 + 2;

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

// Toggle ESC menu
function toggleMenu() {
    game.menuOpen = !game.menuOpen;

    const existingMenu = document.getElementById('game-menu');

    if (game.menuOpen) {
        // Pause game when menu opens
        if (game.mouse.isLocked && document.pointerLockElement) {
            document.exitPointerLock();
        }

        // Create menu HTML
        const menuHTML = `
            <div id="game-menu" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.85);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                color: white;
                font-family: 'Courier New', monospace;
            ">
                <div style="
                    background: rgba(20, 20, 20, 0.95);
                    border: 2px solid #444;
                    padding: 30px;
                    max-width: 600px;
                    max-height: 80vh;
                    overflow-y: auto;
                    border-radius: 5px;
                ">
                    <h2 style="text-align: center; color: #ffa500; margin-bottom: 20px;">KINGS FIELD - MENU</h2>

                    <div style="margin-bottom: 30px;">
                        <h3 style="color: #88aaff; margin-bottom: 10px;">CONTROLS</h3>
                        <div style="font-size: 14px; line-height: 1.8;">
                            <div><span style="color: #ffa500;">S/↓</span> - Move Forward</div>
                            <div><span style="color: #ffa500;">W/↑</span> - Move Backward</div>
                            <div><span style="color: #ffa500;">A/←</span> - Strafe Left</div>
                            <div><span style="color: #ffa500;">D/→</span> - Strafe Right</div>
                            <div><span style="color: #ffa500;">MOUSE</span> - Look Around</div>
                            <div><span style="color: #ffa500;">SHIFT</span> - Toggle Sprint</div>
                            <div><span style="color: #ffa500;">W x2</span> - Dash (Double Tap)</div>
                            <div><span style="color: #ffa500;">SPACE</span> - Jump</div>
                            <div><span style="color: #ffa500;">Q</span> - Attack</div>
                            <div><span style="color: #ffa500;">F</span> - Fire Spell (20 Mana)</div>
                            <div><span style="color: #ffa500;">E</span> - Interact</div>
                            <div><span style="color: #ffa500;">I</span> - Inventory (Coming Soon)</div>
                            <div><span style="color: #ffa500;">ESC</span> - Toggle This Menu</div>
                        </div>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h3 style="color: #88aaff; margin-bottom: 10px;">EQUIPMENT KEYS</h3>
                        <div style="font-size: 14px; line-height: 1.8;">
                            <div><span style="color: #ffa500;">1-4</span> - Switch Weapons</div>
                            <div><span style="color: #ffa500;">5-9</span> - Equip Inventory Swords</div>
                            <div><span style="color: #ffa500;">F1-F4</span> - Equip Armor</div>
                            <div><span style="color: #ffa500;">F5-F8</span> - Equip Helmets</div>
                            <div><span style="color: #ffa500;">F9-F12</span> - Equip Shields</div>
                        </div>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h3 style="color: #88aaff; margin-bottom: 10px;">DEBUG KEYS</h3>
                        <div style="font-size: 14px; line-height: 1.8;">
                            <div><span style="color: #ffa500;">T</span> - Test Damage</div>
                            <div><span style="color: #ffa500;">H</span> - Heal to Full</div>
                            <div><span style="color: #ffa500;">R</span> - Repair All Armor</div>
                        </div>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <button onclick="toggleMenu()" style="
                            padding: 10px 30px;
                            background: #444;
                            border: 2px solid #666;
                            color: white;
                            font-family: 'Courier New', monospace;
                            cursor: pointer;
                            font-size: 16px;
                        ">CLOSE (ESC)</button>
                    </div>
                </div>
            </div>
        `;

        // Add menu to page
        const menuContainer = document.createElement('div');
        menuContainer.innerHTML = menuHTML;
        document.body.appendChild(menuContainer.firstElementChild);
    } else {
        // Resume game when menu closes
        if (existingMenu) {
            existingMenu.remove();
        }
    }
}

// Make toggleMenu globally accessible for button
window.toggleMenu = toggleMenu;

// Update UI display
function updateUI() {
    const healthPercent = game.player.health.getPercentage();
    const healthColor = healthPercent > 50 ? '#4a9d6f' : healthPercent > 25 ? '#d4a574' : '#c75450';
    const manaPercent = game.player.mana.getPercentage();
    const manaColor = '#7a9cc6';

    // Simplified UI - inventory and equipment details moved to menu/inventory screen

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


    // Simplified UI with health, mana, and sprint indicator
    const sprintIcon = game.movement.isSprinting ? '🏃' : '🚶';

    const uiHTML = `
        <!-- Health Bar -->
        <div style="position: fixed; top: 20px; left: 20px; width: 200px;">
            <div style="color: white; font-size: 12px; margin-bottom: 2px;">Health</div>
            <div style="background: rgba(0,0,0,0.5); border: 1px solid #333; height: 16px;">
                <div style="background: ${healthColor}; width: ${healthPercent}%; height: 100%; transition: width 0.3s;"></div>
            </div>
        </div>

        <!-- Mana Bar -->
        <div style="position: fixed; top: 50px; left: 20px; width: 200px;">
            <div style="color: white; font-size: 12px; margin-bottom: 2px;">Mana</div>
            <div style="background: rgba(0,0,0,0.5); border: 1px solid #333; height: 16px;">
                <div style="background: ${manaColor}; width: ${manaPercent}%; height: 100%; transition: width 0.3s;"></div>
            </div>
        </div>

        <!-- Sprint Indicator -->
        <div style="position: fixed; bottom: 30px; left: 30px; font-size: 32px;">
            ${sprintIcon}
        </div>

        <!-- Interaction Prompts -->
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none;">
            ${chestPrompt}
            ${stairPrompt}
            ${portalPrompt}
        </div>

        <!-- Press ESC for Menu hint -->
        <div style="position: fixed; top: 20px; right: 20px; color: rgba(255,255,255,0.3); font-size: 12px;">
            ESC - Menu
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
            const swingVariations = SOUND_CONFIG?.combat?.sword_swing?.files?.length || 1;
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
                const hitVariations = SOUND_CONFIG?.combat?.sword_hit?.files?.length || 1;
                game.audio.playRandomVariation('combat', 'sword_hit', hitVariations, 50);
            }

            updateUI();

            if (dead) {
                console.log('Enemy defeated!');
                // Play death sound
                if (game.audioInitialized) {
                    const deathVariations = SOUND_CONFIG?.combat?.enemy_death?.files?.length || 1;
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

/**
 * Cleanup all game resources
 * Called on page unload or game reset
 */
function cleanup() {
    console.log('Cleaning up game resources...');

    // Dispose painting system
    if (game.paintingGallery) {
        game.paintingGallery.clearCache();
        game.paintingGallery.dispose();
    }

    // Dispose furniture
    if (game.dungeon?.furniture?.furnitureManager) {
        game.dungeon.furniture.furnitureManager.dispose();
    }

    // Dispose home decor
    if (game.dungeon?.homeDecor) {
        game.dungeon.homeDecor.dispose();
    }

    // Dispose trap manager
    if (game.trapManager) {
        game.trapManager.destroy();
    }

    // Dispose renderer
    if (game.renderer) {
        game.renderer.dispose();
    }

    console.log('Cleanup complete');
}

/**
 * Log current WebGL resource usage
 * Helpful for debugging memory/performance
 */
function logResourceStats() {
    if (!game.renderer) return;

    const info = game.renderer.info;
    console.log('=== Resource Stats ===');
    console.log('Geometries:', info.memory.geometries);
    console.log('Textures:', info.memory.textures);
    console.log('Draw Calls:', info.render.calls);
    console.log('Triangles:', info.render.triangles);
    console.log('Points:', info.render.points);
    console.log('Lines:', info.render.lines);
    console.log('=====================');
}

// Expose globally for debugging
window.logResourceStats = logResourceStats;

// Call cleanup on page unload
window.addEventListener('beforeunload', cleanup);

// Start the game
init();
