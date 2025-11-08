// DungeonBuilder.js - Creates 3D geometry from dungeon data
import * as THREE from 'three';
import { TextureManager } from './TextureManager.js';

export class DungeonBuilder {
    constructor(scene, dungeonData, config = {}) {
        this.scene = scene;
        this.dungeonData = dungeonData;

        // Configuration
        this.config = {
            cellSize: config.cellSize || 4,
            wallHeight: config.wallHeight || 3,
            wallThickness: config.wallThickness || 0.2,
            useTextures: config.useTextures !== undefined ? config.useTextures : true,
            ...config
        };

        this.meshes = [];
        this.torches = [];

        // Texture management
        this.textureManager = config.textureManager || new TextureManager();
        this.materialsReady = false;
        this.materials = {
            wall: null,
            floor: null,
            ceiling: null
        };
    }

    async build() {
        // Load materials if using textures
        if (this.config.useTextures) {
            await this.loadMaterials();
        }

        this.createFloors();
        this.createCeilings();
        this.createWalls();
        this.placeTorches();

        return {
            meshes: this.meshes,
            torches: this.torches
        };
    }

    async loadMaterials() {
        console.log('Loading dungeon materials...');
        try {
            this.materials.wall = await this.textureManager.createWallMaterial();
            this.materials.floor = await this.textureManager.createFloorMaterial();
            this.materials.ceiling = await this.textureManager.createCeilingMaterial();
            this.materialsReady = true;
            console.log('Materials loaded successfully');
        } catch (error) {
            console.error('Failed to load materials:', error);
            this.materialsReady = false;
        }
    }

    createFloors() {
        // Use textured material if available, otherwise fallback to solid color
        const floorMaterial = this.materialsReady && this.materials.floor
            ? this.materials.floor
            : new THREE.MeshStandardMaterial({
                color: 0x2a2a2a,
                roughness: 0.9,
                metalness: 0.1
            });

        for (let y = 0; y < this.dungeonData.height; y++) {
            for (let x = 0; x < this.dungeonData.width; x++) {
                if (this.dungeonData.grid[y][x] === 1) {
                    const floorGeometry = new THREE.PlaneGeometry(
                        this.config.cellSize,
                        this.config.cellSize
                    );
                    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
                    floor.rotation.x = -Math.PI / 2;
                    floor.position.set(
                        x * this.config.cellSize,
                        0,
                        y * this.config.cellSize
                    );
                    floor.receiveShadow = true;

                    this.scene.add(floor);
                    this.meshes.push(floor);
                }
            }
        }
    }

    createCeilings() {
        // Use textured material if available, otherwise fallback to solid color
        const ceilingMaterial = this.materialsReady && this.materials.ceiling
            ? this.materials.ceiling
            : new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                roughness: 0.8,
                metalness: 0.1,
                side: THREE.DoubleSide
            });

        for (let y = 0; y < this.dungeonData.height; y++) {
            for (let x = 0; x < this.dungeonData.width; x++) {
                if (this.dungeonData.grid[y][x] === 1) {
                    const ceilingGeometry = new THREE.PlaneGeometry(
                        this.config.cellSize,
                        this.config.cellSize
                    );
                    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
                    ceiling.rotation.x = Math.PI / 2;
                    ceiling.position.set(
                        x * this.config.cellSize,
                        this.config.wallHeight,
                        y * this.config.cellSize
                    );

                    this.scene.add(ceiling);
                    this.meshes.push(ceiling);
                }
            }
        }
    }

    createWalls() {
        // Use textured material if available, otherwise fallback to solid color
        const wallMaterial = this.materialsReady && this.materials.wall
            ? this.materials.wall
            : new THREE.MeshStandardMaterial({
                color: 0x3a3a3a,
                roughness: 0.85,
                metalness: 0.15
            });

        for (let y = 0; y < this.dungeonData.height; y++) {
            for (let x = 0; x < this.dungeonData.width; x++) {
                if (this.dungeonData.grid[y][x] === 1) {
                    // Check four directions for walls
                    this.checkAndCreateWall(x, y, x, y - 1, 'north', wallMaterial);
                    this.checkAndCreateWall(x, y, x, y + 1, 'south', wallMaterial);
                    this.checkAndCreateWall(x, y, x - 1, y, 'west', wallMaterial);
                    this.checkAndCreateWall(x, y, x + 1, y, 'east', wallMaterial);
                }
            }
        }
    }

    checkAndCreateWall(x, y, checkX, checkY, direction, material) {
        // Check if adjacent cell is a wall or out of bounds
        const isWall = checkY < 0 || checkY >= this.dungeonData.height ||
                       checkX < 0 || checkX >= this.dungeonData.width ||
                       this.dungeonData.grid[checkY][checkX] === 0;

        if (isWall) {
            const wallGeometry = new THREE.BoxGeometry(
                direction === 'north' || direction === 'south' ? this.config.cellSize : this.config.wallThickness,
                this.config.wallHeight,
                direction === 'east' || direction === 'west' ? this.config.cellSize : this.config.wallThickness
            );

            const wall = new THREE.Mesh(wallGeometry, material);
            wall.castShadow = true;
            wall.receiveShadow = true;

            // Position wall
            let wallX = x * this.config.cellSize;
            let wallZ = y * this.config.cellSize;

            switch (direction) {
                case 'north':
                    wallZ -= this.config.cellSize / 2;
                    break;
                case 'south':
                    wallZ += this.config.cellSize / 2;
                    break;
                case 'west':
                    wallX -= this.config.cellSize / 2;
                    break;
                case 'east':
                    wallX += this.config.cellSize / 2;
                    break;
            }

            wall.position.set(wallX, this.config.wallHeight / 2, wallZ);

            this.scene.add(wall);
            this.meshes.push(wall);
        }
    }

    placeTorches() {
        // Place torches in rooms
        for (const room of this.dungeonData.rooms) {
            // Place torches on walls of larger rooms
            if (room.width > 4 && room.height > 4) {
                // Place in corners
                this.createTorch(room.x + 1, room.y + 1);
                this.createTorch(room.x + room.width - 2, room.y + 1);
                this.createTorch(room.x + 1, room.y + room.height - 2);
                this.createTorch(room.x + room.width - 2, room.y + room.height - 2);
            } else {
                // Place in center of smaller rooms
                this.createTorch(room.centerX, room.centerY);
            }
        }
    }

    createTorch(gridX, gridY) {
        const torch = {
            position: new THREE.Vector3(
                gridX * this.config.cellSize,
                this.config.wallHeight * 0.7,
                gridY * this.config.cellSize
            ),
            light: null
        };

        // Create torch geometry (simple for now)
        const torchGroup = new THREE.Group();

        // Torch base
        const baseGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3020 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        torchGroup.add(base);

        // Flame
        const flameGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const flameMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6600,
            emissive: 0xff6600,
            emissiveIntensity: 1
        });
        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.position.y = 0.4;
        torchGroup.add(flame);

        torchGroup.position.copy(torch.position);
        this.scene.add(torchGroup);
        this.meshes.push(torchGroup);

        // Add point light
        const light = new THREE.PointLight(0xff6600, 2, 12);
        light.position.copy(torch.position);
        light.castShadow = true;
        light.shadow.bias = -0.001;
        this.scene.add(light);

        torch.light = light;
        torch.flame = flame;
        this.torches.push(torch);
    }

    animateTorches(time) {
        // Flicker effect for torches
        for (const torch of this.torches) {
            if (torch.light) {
                const flicker = Math.sin(time * 8) * 0.1 + Math.sin(time * 13) * 0.05;
                torch.light.intensity = 2 + flicker;

                if (torch.flame) {
                    torch.flame.scale.setScalar(1 + flicker * 0.2);
                }
            }
        }
    }
}
