import * as THREE from 'three';

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
    player: null,
    enemies: [],
    lastTime: 0,
    input: {
        attack: false
    }
};

// Initialize the game
function init() {
    // Scene setup
    game.scene = new THREE.Scene();
    game.scene.background = new THREE.Color(0x111111);
    game.scene.fog = new THREE.Fog(0x111111, 1, 20);

    // Initialize player
    game.player = new Player(game.scene);

    // Camera setup (first-person view)
    game.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    game.camera.position.set(
        game.player.position.x,
        game.player.position.y,
        game.player.position.z
    );

    // Renderer setup
    game.renderer = new THREE.WebGLRenderer({ antialias: true });
    game.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(game.renderer.domElement);
    game.renderer.domElement.id = 'game-canvas';

    // Basic lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    game.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 5);
    game.scene.add(directionalLight);

    // Create a simple floor
    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    game.scene.add(floor);

    // Spawn enemies
    spawnEnemies();

    // Setup input handlers
    setupInput();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

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

// Setup input handlers
function setupInput() {
    window.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            event.preventDefault();
            game.input.attack = true;
        }
    });

    window.addEventListener('keyup', (event) => {
        if (event.code === 'Space') {
            event.preventDefault();
            game.input.attack = false;
        }
    });
}

// Update UI display
function updateUI() {
    const healthPercent = game.player.health.getPercentage();
    const healthColor = healthPercent > 50 ? '#0f0' : healthPercent > 25 ? '#ff0' : '#f00';

    const uiHTML = `
        <div style="font-size: 16px;">
            <div style="margin-bottom: 10px;">Kings Field - Combat System</div>
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
                Press SPACE to attack
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

    // Calculate delta time
    const currentTime = performance.now();
    const deltaTime = currentTime - game.lastTime;
    game.lastTime = currentTime;

    // Update game logic
    update(deltaTime);

    // Render
    game.renderer.render(game.scene, game.camera);
}

// Start the game
init();
