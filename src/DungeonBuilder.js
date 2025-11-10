// DungeonBuilder.js - Creates 3D geometry from dungeon data
import * as THREE from 'three';
import { POIType } from './DungeonGenerator.js';
import { TextureManager } from './TextureManager.js';
import { PaintingGallery } from './PaintingGallery.js';
import { Painting } from './Painting.js';

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
            collidableObjects: config.collidableObjects || null, // Array to add collidable walls to
            ...config
        };

        this.meshes = [];
        this.torches = [];
        this.paintings = []; // Store painting instances

        // Painting gallery
        this.paintingGallery = config.paintingGallery || null;

        // Texture management
        this.textureManager = config.textureManager || new TextureManager();
        this.materialsReady = false;
        this.materials = {
            wall: null,
            floor: null,
            ceiling: null
        };

        // Material cache for color-based materials (to avoid creating thousands of materials)
        this.colorMaterialCache = new Map();

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

    async build() {
        // Load materials if using textures
        if (this.config.useTextures) {
            await this.loadMaterials();
        }

        this.createFloors();
        this.createCeilings();
        this.createWalls();
        this.placeTorches();
        this.placePOIDecorations();

        // Place paintings after walls are created
        if (this.paintingGallery) {
            await this.placePaintings();
        }

        return {
            meshes: this.meshes,
            torches: this.torches,
            paintings: this.paintings
        };
    }

    /**
     * Get portal placement positions for POI rooms
     * Returns an array of {roomId, position, instanceId, metadata}
     */
    getInstancePortalPlacements() {
        const placements = [];

        for (const room of this.dungeonData.rooms) {
            // Determine which rooms should have instance portals
            const portalConfig = this.getPortalConfigForRoom(room);
            if (portalConfig) {
                const worldPos = this.gridToWorld(room.centerX, room.centerY);
                placements.push({
                    portalId: `portal_${room.id}`,
                    roomId: room.id,
                    position: new THREE.Vector3(worldPos.x, 0.1, worldPos.z),
                    instanceId: portalConfig.instanceId,
                    metadata: {
                        type: portalConfig.type,
                        name: portalConfig.name
                    }
                });
            }
        }

        return placements;
    }

    /**
     * Determine portal configuration for a room based on its type
     */
    getPortalConfigForRoom(room) {
        // Map POI types to instance IDs
        const poiToInstance = {
            [POIType.BOSS]: {
                instanceId: 'boss_arena_demon_lord',
                type: 'boss_arena',
                name: 'Boss Arena Portal'
            },
            [POIType.TREASURE]: {
                instanceId: 'treasure_vault',
                type: 'treasure_vault',
                name: 'Treasure Vault Portal'
            },
            [POIType.SAFE]: {
                instanceId: 'safe_haven',
                type: 'safe_haven',
                name: 'Safe Haven Portal'
            },
            [POIType.PUZZLE]: {
                instanceId: 'puzzle_chamber_runes',
                type: 'puzzle_chamber',
                name: 'Puzzle Chamber Portal'
            }
        };

        // Add some special instances for certain rooms
        if (room.type === POIType.HUB && room.id === 'center_hub') {
            // Center hub gets a library portal
            return {
                instanceId: 'grand_library',
                type: 'grand_library',
                name: 'Grand Library Portal'
            };
        }

        return poiToInstance[room.type] || null;
    }

    /**
     * Convert grid coordinates to world coordinates
     */
    gridToWorld(gridX, gridY) {
        return {
            x: gridX * this.config.cellSize,
            z: gridY * this.config.cellSize
        };
    }

    async loadMaterials() {
        console.log('Loading dungeon materials...');
        try {
            this.materials.wall = await this.textureManager.createWallMaterial();
            this.materials.floor = await this.textureManager.createFloorMaterial();
            this.materials.ceiling = await this.textureManager.createCeilingMaterial();
            this.materialsReady = true;
            console.log('✓ Materials loaded successfully');
        } catch (error) {
            console.warn('Failed to load textures, using fallback colors:', error);
            this.materialsReady = false;
        }
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

    /**
     * Get or create a cached material for a specific color and properties
     * This prevents creating thousands of duplicate materials
     */
    getCachedMaterial(color, properties = {}) {
        // Create a cache key from color and properties
        const key = `${color}_${properties.roughness || 0.9}_${properties.metalness || 0.1}_${properties.side || 'front'}_${properties.textureType || 'none'}`;

        if (this.colorMaterialCache.has(key)) {
            return this.colorMaterialCache.get(key);
        }

        let material;

        // Create textured materials for walls and floors
        if (properties.textureType === 'stone') {
            material = this.createStoneMaterial(color, properties);
        } else if (properties.textureType === 'brick') {
            material = this.createBrickMaterial(color, properties);
        } else {
            material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: properties.roughness || 0.9,
                metalness: properties.metalness || 0.1,
                side: properties.side || THREE.FrontSide
            });
        }

        this.colorMaterialCache.set(key, material);
        return material;
    }

    /**
     * Create a procedural stone texture material
     */
    createStoneMaterial(baseColor, properties = {}) {
        // Create a canvas for the stone texture
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Base color
        ctx.fillStyle = `#${baseColor.toString(16).padStart(6, '0')}`;
        ctx.fillRect(0, 0, 256, 256);

        // Add stone-like noise pattern
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = Math.random() * 10 + 2;
            const brightness = Math.random() * 40 - 20;

            ctx.globalAlpha = 0.1 + Math.random() * 0.2;
            ctx.fillStyle = brightness > 0 ? 'white' : 'black';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add cracks
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * 256, Math.random() * 256);
            ctx.quadraticCurveTo(
                Math.random() * 256, Math.random() * 256,
                Math.random() * 256, Math.random() * 256
            );
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);

        return new THREE.MeshStandardMaterial({
            map: texture,
            color: baseColor,
            roughness: properties.roughness || 0.85,
            metalness: properties.metalness || 0.15,
            side: properties.side || THREE.FrontSide,
            bumpScale: 0.02
        });
    }

    /**
     * Create a procedural brick texture material
     */
    createBrickMaterial(baseColor, properties = {}) {
        // Create a canvas for the brick texture
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Base color
        ctx.fillStyle = `#${baseColor.toString(16).padStart(6, '0')}`;
        ctx.fillRect(0, 0, 256, 256);

        // Draw brick pattern
        const brickWidth = 64;
        const brickHeight = 32;
        const mortarWidth = 4;

        ctx.fillStyle = '#444444';
        for (let row = 0; row < 8; row++) {
            const offset = row % 2 === 0 ? 0 : brickWidth / 2;
            for (let col = -1; col < 5; col++) {
                const x = col * brickWidth + offset;
                const y = row * brickHeight;

                // Horizontal mortar
                ctx.fillRect(0, y, 256, mortarWidth);
                // Vertical mortar
                ctx.fillRect(x - mortarWidth / 2, y, mortarWidth, brickHeight);
            }
        }

        // Add variation to bricks
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const brightness = Math.random() * 30 - 15;

            ctx.globalAlpha = 0.05;
            ctx.fillStyle = brightness > 0 ? 'white' : 'black';
            ctx.fillRect(x, y, Math.random() * 20 + 5, Math.random() * 10 + 2);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);

        return new THREE.MeshStandardMaterial({
            map: texture,
            color: baseColor,
            roughness: properties.roughness || 0.9,
            metalness: properties.metalness || 0.1,
            side: properties.side || THREE.FrontSide,
            bumpScale: 0.01
        });
    }

    createFloors() {
        for (let y = 0; y < this.dungeonData.height; y++) {
            for (let x = 0; x < this.dungeonData.width; x++) {
                if (this.dungeonData.grid[y][x] === 1) {
                    const room = this.getRoomAtPosition(x, y);
                    const floorColor = this.getColorForRoom(room, 'floor');

                    // Use cached material with stone texture for floors
                    const floorMaterial = this.getCachedMaterial(floorColor, {
                        roughness: 0.9,
                        metalness: 0.1,
                        textureType: 'stone'
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
                    // Shadows disabled to prevent WebGL texture limit errors
                    // floor.receiveShadow = true;

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

                    // Use cached material instead of creating a new one each time
                    const ceilingMaterial = this.getCachedMaterial(ceilingColor, {
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

                    // Use cached material with brick texture for walls
                    const wallMaterial = this.getCachedMaterial(wallColor, {
                        roughness: 0.85,
                        metalness: 0.15,
                        textureType: 'brick'
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
            // Shadows disabled to prevent WebGL texture limit errors
            // wall.castShadow = true;
            // wall.receiveShadow = true;

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

            // Store grid position for collision detection
            wall.userData.gridPos = { x, z: y };

            this.scene.add(wall);
            this.meshes.push(wall);

            // Add to collidable objects if array provided
            if (this.config.collidableObjects) {
                this.config.collidableObjects.push(wall);
            }
        }
    }

    placeTorches() {
        // Place torches in rooms (optimized to reduce total light count)
        for (const room of this.dungeonData.rooms) {
            // Place torches on walls of larger rooms
            if (room.width > 6 && room.height > 6) {
                // Very large rooms get 4 torches in corners
                this.createTorch(room.x + 1, room.y + 1);
                this.createTorch(room.x + room.width - 2, room.y + 1);
                this.createTorch(room.x + 1, room.y + room.height - 2);
                this.createTorch(room.x + room.width - 2, room.y + room.height - 2);
            } else if (room.width > 4 && room.height > 4) {
                // Medium rooms get 2 torches on opposite corners
                this.createTorch(room.x + 1, room.y + 1);
                this.createTorch(room.x + room.width - 2, room.y + room.height - 2);
            } else {
                // Small rooms get 1 torch in center
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

        // Add point light (shadows disabled to prevent exceeding texture unit limit)
        const light = new THREE.PointLight(0xff6600, 2, 12);
        light.position.copy(torch.position);
        light.castShadow = false; // Disabled: too many shadow-casting lights exceed WebGL texture limits
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
        // Realistic flicker effect for torches
        for (let i = 0; i < this.torches.length; i++) {
            const torch = this.torches[i];
            if (torch.light) {
                // Each torch flickers independently with multiple frequencies
                const offset = i * 1.3; // Phase offset per torch
                const flicker =
                    Math.sin((time + offset) * 8) * 0.15 +      // Main flicker
                    Math.sin((time + offset) * 13.7) * 0.08 +   // Fast shimmer
                    Math.sin((time + offset) * 3.2) * 0.12;     // Slow wave

                torch.light.intensity = 2.0 + flicker;

                if (torch.flame) {
                    // Flame scales with intensity but slightly exaggerated
                    const flameScale = 1 + flicker * 0.3;
                    torch.flame.scale.setScalar(flameScale);
                }
            }
        }
    }

    /**
     * Place paintings on suitable wall segments
     */
    async placePaintings() {
        console.log('Placing paintings on dungeon walls...');

        const suitableWalls = this.findSuitableWalls();
        console.log(`Found ${suitableWalls.length} suitable wall segments`);

        // Determine how many paintings to place (80-100% of suitable walls for rich decoration)
        const paintingCount = Math.floor(suitableWalls.length * (0.80 + Math.random() * 0.20));
        console.log(`Placing ${paintingCount} paintings`);

        // Shuffle walls for random placement
        const shuffledWalls = suitableWalls.sort(() => Math.random() - 0.5);

        for (let i = 0; i < paintingCount && i < shuffledWalls.length; i++) {
            const wallSegment = shuffledWalls[i];
            await this.placePainting(wallSegment);
        }

        console.log(`Placed ${this.paintings.length} paintings successfully`);
    }

    /**
     * Find suitable wall segments for painting placement
     */
    findSuitableWalls() {
        const walls = [];

        for (let y = 0; y < this.dungeonData.height; y++) {
            for (let x = 0; x < this.dungeonData.width; x++) {
                if (this.dungeonData.grid[y][x] === 1) {
                    // Check each direction for walls
                    this.checkWallForPainting(x, y, 'north', walls);
                    this.checkWallForPainting(x, y, 'south', walls);
                    this.checkWallForPainting(x, y, 'west', walls);
                    this.checkWallForPainting(x, y, 'east', walls);
                }
            }
        }

        return walls;
    }

    /**
     * Check if a wall segment is suitable for painting
     */
    checkWallForPainting(x, y, direction, walls) {
        let checkX = x;
        let checkY = y;

        // Get adjacent cell based on direction
        switch (direction) {
            case 'north': checkY--; break;
            case 'south': checkY++; break;
            case 'west': checkX--; break;
            case 'east': checkX++; break;
        }

        // Check if adjacent cell is a wall
        const isWall = checkY < 0 || checkY >= this.dungeonData.height ||
                       checkX < 0 || checkX >= this.dungeonData.width ||
                       this.dungeonData.grid[checkY][checkX] === 0;

        if (!isWall) return;

        // Check if wall is wide enough (at least 2 cells)
        if (!this.isWallWideEnough(x, y, direction)) return;

        // Check if not a corner
        if (this.isCorner(x, y)) return;

        // Check if interior wall (not exterior edge)
        if (!this.isInteriorWall(x, y)) return;

        walls.push({
            x,
            y,
            direction,
            position: this.getWallCenterPosition(x, y, direction),
            normal: this.getWallNormal(direction)
        });
    }

    /**
     * Check if wall segment is wide enough
     */
    isWallWideEnough(x, y, direction) {
        // For now, just check if there's space on either side
        // More sophisticated check would look for continuous wall segments
        return true; // Simplified for initial implementation
    }

    /**
     * Check if position is a corner
     */
    isCorner(x, y) {
        let wallCount = 0;

        // Count adjacent walls
        const directions = [
            { dx: 0, dy: -1 }, // north
            { dx: 0, dy: 1 },  // south
            { dx: -1, dy: 0 }, // west
            { dx: 1, dy: 0 }   // east
        ];

        for (const dir of directions) {
            const checkX = x + dir.dx;
            const checkY = y + dir.dy;

            const isWall = checkY < 0 || checkY >= this.dungeonData.height ||
                          checkX < 0 || checkX >= this.dungeonData.width ||
                          this.dungeonData.grid[checkY][checkX] === 0;

            if (isWall) wallCount++;
        }

        // Corner if 2 or more adjacent cells are walls
        return wallCount >= 2;
    }

    /**
     * Check if wall is interior (not on dungeon edge)
     */
    isInteriorWall(x, y) {
        const margin = 2;
        return x >= margin && x < this.dungeonData.width - margin &&
               y >= margin && y < this.dungeonData.height - margin;
    }

    /**
     * Get world position for wall center
     */
    getWallCenterPosition(x, y, direction) {
        let wallX = x * this.config.cellSize;
        let wallZ = y * this.config.cellSize;
        const wallY = 1.6; // Eye level height for paintings

        // Position paintings at the actual wall face, not just offset from grid center
        const wallOffset = (this.config.cellSize / 2) - 0.1; // Slightly inside the wall face

        switch (direction) {
            case 'north':
                wallZ -= wallOffset;
                break;
            case 'south':
                wallZ += wallOffset;
                break;
            case 'west':
                wallX -= wallOffset;
                break;
            case 'east':
                wallX += wallOffset;
                break;
        }

        return new THREE.Vector3(wallX, wallY, wallZ);
    }

    /**
     * Get wall normal vector
     */
    getWallNormal(direction) {
        switch (direction) {
            case 'north': return new THREE.Vector3(0, 0, 1);
            case 'south': return new THREE.Vector3(0, 0, -1);
            case 'west': return new THREE.Vector3(1, 0, 0);
            case 'east': return new THREE.Vector3(-1, 0, 0);
            default: return new THREE.Vector3(0, 0, 1);
        }
    }

    /**
     * Place a single painting on a wall
     */
    async placePainting(wallSegment) {
        // Choose painting category (60% portraits, 30% landscapes, 10% creatures)
        const rand = Math.random();
        let category;
        if (rand < 0.6) {
            category = 'portraits';
        } else if (rand < 0.9) {
            category = 'landscapes';
        } else {
            category = 'creatures';
        }

        // Choose frame style (40% simple, 30% rustic, 20% ornate, 10% gothic)
        const frameRand = Math.random();
        let frameStyle;
        if (frameRand < 0.4) {
            frameStyle = 'simple';
        } else if (frameRand < 0.7) {
            frameStyle = 'rustic';
        } else if (frameRand < 0.9) {
            frameStyle = 'ornate';
        } else {
            frameStyle = 'gothic';
        }

        // Get painting data from gallery
        const paintingData = this.paintingGallery.getRandomPainting(category);

        // Add size and procedural texture data
        const sizeVariation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        paintingData.width = 1.0 * sizeVariation;
        paintingData.height = 1.2 * sizeVariation;

        // Generate procedurally texture
        const texture = this.paintingGallery.generatePaintingTexture(paintingData, 256, 256);

        // Make sure texture is ready
        texture.needsUpdate = true;

        // Create painting instance with procedural texture
        const painting = new Painting(paintingData, frameStyle);

        // Set the texture BEFORE creating canvas
        painting.texture = texture;
        painting.texture.needsUpdate = true;

        // Create canvas and frame without loading from file
        painting.createCanvas();
        painting.createFrame(frameStyle);
        painting.isLoaded = true;

        // Place on wall with proper offset to attach it to the wall surface
        painting.placeOnWall(wallSegment.position, wallSegment.normal, 0.15);

        // Add to scene
        this.scene.add(painting.group);
        this.meshes.push(painting.group);
        this.paintings.push(painting);
    }
}
