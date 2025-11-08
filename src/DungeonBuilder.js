// DungeonBuilder.js - Creates 3D geometry from dungeon data
import * as THREE from 'three';
import { POIType } from './DungeonGenerator.js';

export class DungeonBuilder {
    constructor(scene, dungeonData, config = {}) {
        this.scene = scene;
        this.dungeonData = dungeonData;

        // Configuration
        this.config = {
            cellSize: config.cellSize || 4,
            wallHeight: config.wallHeight || 3,
            wallThickness: config.wallThickness || 0.2,
            ...config
        };

        this.meshes = [];
        this.torches = [];

        // POI-specific color themes
        this.poiColors = {
            [POIType.ENTRANCE]: { floor: 0x3a5a3a, wall: 0x4a6a4a, ceiling: 0x2a4a2a },
            [POIType.EXIT]: { floor: 0x5a3a3a, wall: 0x6a4a4a, ceiling: 0x4a2a2a },
            [POIType.TREASURE]: { floor: 0x4a4a2a, wall: 0x5a5a3a, ceiling: 0x3a3a1a },
            [POIType.BOSS]: { floor: 0x3a1a1a, wall: 0x4a2a2a, ceiling: 0x2a0a0a },
            [POIType.SAFE]: { floor: 0x2a3a4a, wall: 0x3a4a5a, ceiling: 0x1a2a3a },
            [POIType.PUZZLE]: { floor: 0x3a2a4a, wall: 0x4a3a5a, ceiling: 0x2a1a3a },
            [POIType.HUB]: { floor: 0x3a3a3a, wall: 0x4a4a4a, ceiling: 0x2a2a2a },
            [POIType.LANDMARK]: { floor: 0x4a3a2a, wall: 0x5a4a3a, ceiling: 0x3a2a1a },
            [POIType.STANDARD]: { floor: 0x2a2a2a, wall: 0x3a3a3a, ceiling: 0x1a1a1a }
        };
    }

    build() {
        this.createFloors();
        this.createCeilings();
        this.createWalls();
        this.placeTorches();
        this.placePOIDecorations();

        return {
            meshes: this.meshes,
            torches: this.torches
        };
    }

    getRoomAtPosition(x, y) {
        for (const room of this.dungeonData.rooms) {
            if (x >= room.x && x < room.x + room.width &&
                y >= room.y && y < room.y + room.height) {
                return room;
            }
        }
        return null;
    }

    getColorForRoom(room, type) {
        if (!room || !room.type) {
            return this.poiColors[POIType.STANDARD][type];
        }
        return this.poiColors[room.type][type] || this.poiColors[POIType.STANDARD][type];
    }

    createFloors() {
        for (let y = 0; y < this.dungeonData.height; y++) {
            for (let x = 0; x < this.dungeonData.width; x++) {
                if (this.dungeonData.grid[y][x] === 1) {
                    const room = this.getRoomAtPosition(x, y);
                    const floorColor = this.getColorForRoom(room, 'floor');

                    const floorMaterial = new THREE.MeshStandardMaterial({
                        color: floorColor,
                        roughness: 0.9,
                        metalness: 0.1
                    });

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
        for (let y = 0; y < this.dungeonData.height; y++) {
            for (let x = 0; x < this.dungeonData.width; x++) {
                if (this.dungeonData.grid[y][x] === 1) {
                    const room = this.getRoomAtPosition(x, y);
                    const ceilingColor = this.getColorForRoom(room, 'ceiling');

                    const ceilingMaterial = new THREE.MeshStandardMaterial({
                        color: ceilingColor,
                        roughness: 0.8,
                        metalness: 0.1,
                        side: THREE.DoubleSide
                    });

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
        for (let y = 0; y < this.dungeonData.height; y++) {
            for (let x = 0; x < this.dungeonData.width; x++) {
                if (this.dungeonData.grid[y][x] === 1) {
                    const room = this.getRoomAtPosition(x, y);
                    const wallColor = this.getColorForRoom(room, 'wall');

                    const wallMaterial = new THREE.MeshStandardMaterial({
                        color: wallColor,
                        roughness: 0.85,
                        metalness: 0.15
                    });

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

    placePOIDecorations() {
        for (const room of this.dungeonData.rooms) {
            if (!room.type) continue;

            switch (room.type) {
                case POIType.ENTRANCE:
                    this.decorateEntrance(room);
                    break;
                case POIType.EXIT:
                    this.decorateExit(room);
                    break;
                case POIType.TREASURE:
                    this.decorateTreasure(room);
                    break;
                case POIType.BOSS:
                    this.decorateBoss(room);
                    break;
                case POIType.SAFE:
                    this.decorateSafe(room);
                    break;
                case POIType.PUZZLE:
                    this.decoratePuzzle(room);
                    break;
                case POIType.HUB:
                    this.decorateHub(room);
                    break;
                case POIType.LANDMARK:
                    this.decorateLandmark(room);
                    break;
            }
        }
    }

    decorateEntrance(room) {
        // Add glowing entrance portal
        const portalGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 16);
        const portalMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.6
        });
        const portal = new THREE.Mesh(portalGeometry, portalMaterial);
        portal.position.set(
            room.centerX * this.config.cellSize,
            0.05,
            room.centerY * this.config.cellSize
        );
        this.scene.add(portal);
        this.meshes.push(portal);

        // Add green light
        const light = new THREE.PointLight(0x00ff00, 3, 15);
        light.position.set(
            room.centerX * this.config.cellSize,
            this.config.wallHeight * 0.5,
            room.centerY * this.config.cellSize
        );
        this.scene.add(light);
    }

    decorateExit(room) {
        // Add glowing exit portal
        const portalGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 16);
        const portalMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.6
        });
        const portal = new THREE.Mesh(portalGeometry, portalMaterial);
        portal.position.set(
            room.centerX * this.config.cellSize,
            0.05,
            room.centerY * this.config.cellSize
        );
        this.scene.add(portal);
        this.meshes.push(portal);

        // Add red light
        const light = new THREE.PointLight(0xff0000, 3, 15);
        light.position.set(
            room.centerX * this.config.cellSize,
            this.config.wallHeight * 0.5,
            room.centerY * this.config.cellSize
        );
        this.scene.add(light);
    }

    decorateTreasure(room) {
        // Add treasure chest
        const chestGeometry = new THREE.BoxGeometry(1, 0.8, 0.6);
        const chestMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.7,
            metalness: 0.3
        });
        const chest = new THREE.Mesh(chestGeometry, chestMaterial);
        chest.position.set(
            room.centerX * this.config.cellSize,
            0.4,
            room.centerY * this.config.cellSize
        );
        this.scene.add(chest);
        this.meshes.push(chest);

        // Add golden glow
        const light = new THREE.PointLight(0xffaa00, 2, 10);
        light.position.set(
            room.centerX * this.config.cellSize,
            1,
            room.centerY * this.config.cellSize
        );
        this.scene.add(light);
    }

    decorateBoss(room) {
        // Add ominous pillars around the arena
        const pillarCount = 4;
        const angleStep = (Math.PI * 2) / pillarCount;
        const radius = Math.min(room.width, room.height) * this.config.cellSize * 0.3;

        for (let i = 0; i < pillarCount; i++) {
            const angle = angleStep * i;
            const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.6, this.config.wallHeight, 8);
            const pillarMaterial = new THREE.MeshStandardMaterial({
                color: 0x1a0a0a,
                roughness: 0.9,
                metalness: 0.2
            });
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(
                room.centerX * this.config.cellSize + Math.cos(angle) * radius,
                this.config.wallHeight / 2,
                room.centerY * this.config.cellSize + Math.sin(angle) * radius
            );
            this.scene.add(pillar);
            this.meshes.push(pillar);

            // Add red torch on each pillar
            const torchLight = new THREE.PointLight(0xaa0000, 1.5, 8);
            torchLight.position.set(
                pillar.position.x,
                this.config.wallHeight * 0.8,
                pillar.position.z
            );
            this.scene.add(torchLight);
        }
    }

    decorateSafe(room) {
        // Add healing fountain in the center
        const fountainGeometry = new THREE.CylinderGeometry(0.8, 1, 0.5, 16);
        const fountainMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a6a8a,
            roughness: 0.3,
            metalness: 0.6
        });
        const fountain = new THREE.Mesh(fountainGeometry, fountainMaterial);
        fountain.position.set(
            room.centerX * this.config.cellSize,
            0.25,
            room.centerY * this.config.cellSize
        );
        this.scene.add(fountain);
        this.meshes.push(fountain);

        // Add blue healing light
        const light = new THREE.PointLight(0x4a9aff, 2, 12);
        light.position.set(
            room.centerX * this.config.cellSize,
            1,
            room.centerY * this.config.cellSize
        );
        this.scene.add(light);
    }

    decoratePuzzle(room) {
        // Add purple magical runes on the floor
        const runeCount = 4;
        const angleStep = (Math.PI * 2) / runeCount;
        const radius = 2;

        for (let i = 0; i < runeCount; i++) {
            const angle = angleStep * i;
            const runeGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 6);
            const runeMaterial = new THREE.MeshStandardMaterial({
                color: 0x8a4a9a,
                emissive: 0x8a4a9a,
                emissiveIntensity: 0.3
            });
            const rune = new THREE.Mesh(runeGeometry, runeMaterial);
            rune.position.set(
                room.centerX * this.config.cellSize + Math.cos(angle) * radius,
                0.05,
                room.centerY * this.config.cellSize + Math.sin(angle) * radius
            );
            this.scene.add(rune);
            this.meshes.push(rune);
        }

        // Add purple mystical light
        const light = new THREE.PointLight(0x8a4a9a, 2, 12);
        light.position.set(
            room.centerX * this.config.cellSize,
            this.config.wallHeight * 0.5,
            room.centerY * this.config.cellSize
        );
        this.scene.add(light);
    }

    decorateHub(room) {
        // Add central pillar with multiple torches
        const pillarGeometry = new THREE.CylinderGeometry(0.8, 1, this.config.wallHeight, 8);
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.8,
            metalness: 0.3
        });
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.set(
            room.centerX * this.config.cellSize,
            this.config.wallHeight / 2,
            room.centerY * this.config.cellSize
        );
        this.scene.add(pillar);
        this.meshes.push(pillar);

        // Add brighter ambient light for hub
        const light = new THREE.PointLight(0xffffaa, 3, 20);
        light.position.set(
            room.centerX * this.config.cellSize,
            this.config.wallHeight * 0.8,
            room.centerY * this.config.cellSize
        );
        this.scene.add(light);
    }

    decorateLandmark(room) {
        // Add distinctive statue or monument
        const monumentGeometry = new THREE.ConeGeometry(0.6, 2, 4);
        const monumentMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a5a4a,
            roughness: 0.9,
            metalness: 0.1
        });
        const monument = new THREE.Mesh(monumentGeometry, monumentMaterial);
        monument.position.set(
            room.centerX * this.config.cellSize,
            1,
            room.centerY * this.config.cellSize
        );
        this.scene.add(monument);
        this.meshes.push(monument);

        // Add orange landmark light
        const light = new THREE.PointLight(0xff8844, 2.5, 15);
        light.position.set(
            room.centerX * this.config.cellSize,
            2,
            room.centerY * this.config.cellSize
        );
        this.scene.add(light);
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
