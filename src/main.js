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
    time: 0,
    enemies: [],
    lastTime: 0,
    input: {
        attack: false
    }
};

// Input handling
function setupInput() {
    window.addEventListener('keydown', (e) => {
        // Handle attack
        if (e.code === 'Space') {
            e.preventDefault();
            game.input.attack = true;
        }

        // Handle movement
        if (game.keys[e.key.toLowerCase()]) return; // Already pressed
        game.keys[e.key.toLowerCase()] = true;
        handleInput(e.key.toLowerCase());
    });

    window.addEventListener('keyup', (e) => {
        // Handle attack release
        if (e.code === 'Space') {
            e.preventDefault();
            game.input.attack = false;
        }

        // Handle movement release
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
        forward: { x: -Math.sin(angle), z: -Math.cos(angle) },
        backward: { x: Math.sin(angle), z: Math.cos(angle) },
        left: { x: -Math.sin(angle - Math.PI / 2), z: -Math.cos(angle - Math.PI / 2) },
        right: { x: -Math.sin(angle + Math.PI / 2), z: -Math.cos(angle + Math.PI / 2) }
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

    // Initialize player
    game.player = new Player(game.scene);

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

    // Setup atmospheric lighting (brighter so you can see!)
    game.lighting = new AtmosphericLighting(game.scene, {
        ambientIntensity: 0.5,
        fogNear: 5,
        fogFar: 30
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

    game.camera.position.set(
        game.player.position.x,
        game.player.position.y,
        game.player.position.z
    );

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

    const uiHTML = `
        <div style="font-size: 16px;">
            <div style="margin-bottom: 10px;">Kings Field - Ready</div>
            <div style="margin-bottom: 5px;">
                Health: <span style="color: ${healthColor}">${game.player.health.current}/${game.player.health.max}</span>
            </div>
            <div style="background: #333; width: 200px; height: 20px; border: 2px solid #fff; margin-bottom: 10px;">
                <div style="background: ${healthColor}; width: ${healthPercent}%; height: 100%; transition: width 0.3s;"></div>
            </div>
            <div style="font-size: 12px; opacity: 0.7;">
                Enemies: ${game.enemies.filter(e => !e.isDead()).length}/${game.enemies.length}
            </div>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">
                WASD: Move | Q/E: Rotate | SPACE: Attack
            </div>
        </div>
    `;

    document.querySelector('#ui').innerHTML = uiHTML;
}

function onWindowResize() {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
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

    // Update movement system
    updateMovement(deltaTimeSec);

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

    // Render
    game.renderer.render(game.scene, game.camera);
}

// Start the game
init();
