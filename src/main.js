import * as THREE from 'three';

// Game state
const game = {
    scene: null,
    camera: null,
    renderer: null,
    player: {
        position: { x: 0, y: 1.6, z: 5 },
        rotation: { x: 0, y: 0 }
    }
};

// Initialize the game
function init() {
    // Scene setup
    game.scene = new THREE.Scene();
    game.scene.background = new THREE.Color(0x111111);
    game.scene.fog = new THREE.Fog(0x111111, 1, 20);

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

    // Add a test cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0.5, 0);
    game.scene.add(cube);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Update UI
    document.querySelector('#ui div').textContent = 'Kings Field Game - Ready';

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
    game.renderer.render(game.scene, game.camera);
}

// Start the game
init();
