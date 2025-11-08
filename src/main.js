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
    dungeon: {
        generator: null,
        builder: null,
        data: null
    },
    lighting: null,
    time: 0
};

// Initialize the game
function init() {
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

    // Update UI
    document.querySelector('#ui div').textContent = 'Kings Field - Dungeon Generated';

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

    // Update game time
    game.time += 0.016;

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
