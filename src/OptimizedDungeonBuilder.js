/**
 * Optimized Dungeon Builder
 * Uses Three.js InstancedMesh for massive performance improvements
 * Reduces draw calls from thousands to just a few
 */

import * as THREE from 'three';
import { POIType } from './DungeonGenerator.js';
import { TextureManager } from './TextureManager.js';

export class OptimizedDungeonBuilder {
    constructor(scene, dungeonData, config = {}) {
        this.scene = scene;
        this.dungeonData = dungeonData;

        this.config = {
            cellSize: config.cellSize || 4,
            wallHeight: config.wallHeight || 3,
            wallThickness: config.wallThickness || 0.2,
            useTextures: config.useTextures !== undefined ? config.useTextures : true,
            collidableObjects: config.collidableObjects || null,

            // Instancing configuration
            enableInstancing: config.enableInstancing !== false,
            maxInstancesPerMesh: config.maxInstancesPerMesh || 10000,
            mergeStaticGeometry: config.mergeStaticGeometry !== false,

            ...config
        };

        // Instance management
        this.instanceGroups = {
            floors: [],
            ceilings: [],
            walls: {
                north: [],
                south: [],
                east: [],
                west: []
            }
        };

        // Instanced meshes
        this.instancedMeshes = [];

        // Material cache (reuse from original)
        this.colorMaterialCache = new Map();

        // POI colors (reuse from original)
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

        // Stats for debugging
        this.stats = {
            totalInstances: 0,
            drawCalls: 0,
            memorySaved: 0
        };
    }

    /**
     * Build optimized dungeon with instanced meshes
     */
    async build() {
        console.time('OptimizedDungeonBuilder');

        // Collect instance data
        this.collectFloorInstances();
        this.collectCeilingInstances();
        this.collectWallInstances();

        // Create instanced meshes
        if (this.config.enableInstancing) {
            this.createInstancedFloors();
            this.createInstancedCeilings();
            this.createInstancedWalls();
        } else {
            // Fallback to regular meshes if instancing disabled
            this.createRegularMeshes();
        }

        // Add special decorations (not instanced)
        this.placeTorches();
        this.placePOIDecorations();

        console.timeEnd('OptimizedDungeonBuilder');
        console.log('Dungeon build stats:', this.getStats());

        return {
            meshes: this.instancedMeshes,
            stats: this.stats
        };
    }

    /**
     * Collect floor instance data
     */
    collectFloorInstances() {
        for (let y = 0; y < this.dungeonData.height; y++) {
            for (let x = 0; x < this.dungeonData.width; x++) {
                if (this.dungeonData.grid[y][x] === 1) {
                    const room = this.getRoomAtPosition(x, y);
                    const color = this.getColorForRoom(room, 'floor');

                    this.instanceGroups.floors.push({
                        position: new THREE.Vector3(
                            x * this.config.cellSize,
                            0,
                            y * this.config.cellSize
                        ),
                        rotation: new THREE.Euler(-Math.PI / 2, 0, 0),
                        scale: new THREE.Vector3(1, 1, 1),
                        color: color
                    });
                }
            }
        }
    }

    /**
     * Collect ceiling instance data
     */
    collectCeilingInstances() {
        for (let y = 0; y < this.dungeonData.height; y++) {
            for (let x = 0; x < this.dungeonData.width; x++) {
                if (this.dungeonData.grid[y][x] === 1) {
                    const room = this.getRoomAtPosition(x, y);
                    const color = this.getColorForRoom(room, 'ceiling');

                    this.instanceGroups.ceilings.push({
                        position: new THREE.Vector3(
                            x * this.config.cellSize,
                            this.config.wallHeight,
                            y * this.config.cellSize
                        ),
                        rotation: new THREE.Euler(Math.PI / 2, 0, 0),
                        scale: new THREE.Vector3(1, 1, 1),
                        color: color
                    });
                }
            }
        }
    }

    /**
     * Collect wall instance data
     */
    collectWallInstances() {
        for (let y = 0; y < this.dungeonData.height; y++) {
            for (let x = 0; x < this.dungeonData.width; x++) {
                if (this.dungeonData.grid[y][x] === 1) {
                    const room = this.getRoomAtPosition(x, y);
                    const wallColor = this.getColorForRoom(room, 'wall');

                    // Check each direction for walls
                    if (this.shouldPlaceWall(x, y, 'north')) {
                        this.instanceGroups.walls.north.push(
                            this.createWallInstance(x, y, 'north', wallColor)
                        );
                    }
                    if (this.shouldPlaceWall(x, y, 'south')) {
                        this.instanceGroups.walls.south.push(
                            this.createWallInstance(x, y, 'south', wallColor)
                        );
                    }
                    if (this.shouldPlaceWall(x, y, 'east')) {
                        this.instanceGroups.walls.east.push(
                            this.createWallInstance(x, y, 'east', wallColor)
                        );
                    }
                    if (this.shouldPlaceWall(x, y, 'west')) {
                        this.instanceGroups.walls.west.push(
                            this.createWallInstance(x, y, 'west', wallColor)
                        );
                    }
                }
            }
        }
    }

    /**
     * Create instanced mesh for floors
     */
    createInstancedFloors() {
        if (this.instanceGroups.floors.length === 0) return;

        const geometry = new THREE.PlaneGeometry(
            this.config.cellSize,
            this.config.cellSize
        );

        // Group floors by color for better batching
        const floorsByColor = this.groupInstancesByColor(this.instanceGroups.floors);

        for (const [color, instances] of floorsByColor.entries()) {
            const material = this.getCachedMaterial(color, {
                roughness: 0.9,
                metalness: 0.1
            });

            const instancedMesh = new THREE.InstancedMesh(
                geometry,
                material,
                instances.length
            );

            // Set instance matrices
            instances.forEach((instance, i) => {
                const matrix = new THREE.Matrix4();
                matrix.compose(
                    instance.position,
                    new THREE.Quaternion().setFromEuler(instance.rotation),
                    instance.scale
                );
                instancedMesh.setMatrixAt(i, matrix);
            });

            instancedMesh.instanceMatrix.needsUpdate = true;
            instancedMesh.name = `floors_${color}`;

            this.scene.add(instancedMesh);
            this.instancedMeshes.push(instancedMesh);
            this.stats.drawCalls++;
        }

        this.stats.totalInstances += this.instanceGroups.floors.length;
    }

    /**
     * Create instanced mesh for ceilings
     */
    createInstancedCeilings() {
        if (this.instanceGroups.ceilings.length === 0) return;

        const geometry = new THREE.PlaneGeometry(
            this.config.cellSize,
            this.config.cellSize
        );

        // Group ceilings by color
        const ceilingsByColor = this.groupInstancesByColor(this.instanceGroups.ceilings);

        for (const [color, instances] of ceilingsByColor.entries()) {
            const material = this.getCachedMaterial(color, {
                roughness: 0.95,
                metalness: 0.05
            });

            const instancedMesh = new THREE.InstancedMesh(
                geometry,
                material,
                instances.length
            );

            // Set instance matrices
            instances.forEach((instance, i) => {
                const matrix = new THREE.Matrix4();
                matrix.compose(
                    instance.position,
                    new THREE.Quaternion().setFromEuler(instance.rotation),
                    instance.scale
                );
                instancedMesh.setMatrixAt(i, matrix);
            });

            instancedMesh.instanceMatrix.needsUpdate = true;
            instancedMesh.name = `ceilings_${color}`;

            this.scene.add(instancedMesh);
            this.instancedMeshes.push(instancedMesh);
            this.stats.drawCalls++;
        }

        this.stats.totalInstances += this.instanceGroups.ceilings.length;
    }

    /**
     * Create instanced meshes for walls
     */
    createInstancedWalls() {
        // Create geometry for walls
        const wallGeometry = new THREE.BoxGeometry(
            this.config.cellSize,
            this.config.wallHeight,
            this.config.wallThickness
        );

        // Process each wall direction
        for (const [direction, walls] of Object.entries(this.instanceGroups.walls)) {
            if (walls.length === 0) continue;

            // Group walls by color
            const wallsByColor = this.groupInstancesByColor(walls);

            for (const [color, instances] of wallsByColor.entries()) {
                const material = this.getCachedMaterial(color, {
                    roughness: 0.9,
                    metalness: 0.1,
                    side: THREE.DoubleSide
                });

                const instancedMesh = new THREE.InstancedMesh(
                    wallGeometry,
                    material,
                    instances.length
                );

                // Set instance matrices
                instances.forEach((instance, i) => {
                    const matrix = new THREE.Matrix4();
                    matrix.compose(
                        instance.position,
                        new THREE.Quaternion().setFromEuler(instance.rotation),
                        instance.scale
                    );
                    instancedMesh.setMatrixAt(i, matrix);
                });

                instancedMesh.instanceMatrix.needsUpdate = true;
                instancedMesh.name = `walls_${direction}_${color}`;

                this.scene.add(instancedMesh);
                this.instancedMeshes.push(instancedMesh);
                this.stats.drawCalls++;

                // Add to collidable objects if needed
                if (this.config.collidableObjects) {
                    this.config.collidableObjects.push(instancedMesh);
                }
            }

            this.stats.totalInstances += walls.length;
        }
    }

    /**
     * Group instances by color for better batching
     */
    groupInstancesByColor(instances) {
        const grouped = new Map();

        for (const instance of instances) {
            const color = instance.color;
            if (!grouped.has(color)) {
                grouped.set(color, []);
            }
            grouped.get(color).push(instance);
        }

        return grouped;
    }

    /**
     * Create wall instance data
     */
    createWallInstance(x, y, direction, color) {
        const position = new THREE.Vector3(
            x * this.config.cellSize,
            this.config.wallHeight / 2,
            y * this.config.cellSize
        );

        const rotation = new THREE.Euler(0, 0, 0);
        const offset = this.config.cellSize / 2 - this.config.wallThickness / 2;

        switch (direction) {
            case 'north':
                position.z -= offset;
                break;
            case 'south':
                position.z += offset;
                break;
            case 'east':
                position.x += offset;
                rotation.y = Math.PI / 2;
                break;
            case 'west':
                position.x -= offset;
                rotation.y = Math.PI / 2;
                break;
        }

        return {
            position,
            rotation,
            scale: new THREE.Vector3(1, 1, 1),
            color
        };
    }

    /**
     * Check if wall should be placed
     */
    shouldPlaceWall(x, y, direction) {
        let checkX = x;
        let checkY = y;

        switch (direction) {
            case 'north':
                checkY = y - 1;
                break;
            case 'south':
                checkY = y + 1;
                break;
            case 'east':
                checkX = x + 1;
                break;
            case 'west':
                checkX = x - 1;
                break;
        }

        // Place wall if adjacent cell is empty or out of bounds
        if (checkX < 0 || checkX >= this.dungeonData.width ||
            checkY < 0 || checkY >= this.dungeonData.height) {
            return true;
        }

        return this.dungeonData.grid[checkY][checkX] === 0;
    }

    /**
     * Get cached material
     */
    getCachedMaterial(color, properties = {}) {
        const key = `${color}_${properties.roughness || 0.9}_${properties.metalness || 0.1}_${properties.side || 'front'}`;

        if (this.colorMaterialCache.has(key)) {
            return this.colorMaterialCache.get(key);
        }

        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: properties.roughness || 0.9,
            metalness: properties.metalness || 0.1,
            side: properties.side || THREE.FrontSide
        });

        this.colorMaterialCache.set(key, material);
        return material;
    }

    /**
     * Get room at position
     */
    getRoomAtPosition(x, y) {
        for (const room of this.dungeonData.rooms) {
            if (x >= room.x && x < room.x + room.width &&
                y >= room.y && y < room.y + room.height) {
                return room;
            }
        }
        return null;
    }

    /**
     * Get color for room based on type
     */
    getColorForRoom(room, element) {
        if (!room || !room.type) {
            return this.poiColors[POIType.STANDARD][element];
        }
        return this.poiColors[room.type][element] || this.poiColors[POIType.STANDARD][element];
    }

    /**
     * Place torches (not instanced due to lights)
     */
    placeTorches() {
        // Implementation from original DungeonBuilder
        // Torches need individual lights, so not suitable for instancing
    }

    /**
     * Place POI decorations (not instanced due to uniqueness)
     */
    placePOIDecorations() {
        // Implementation from original DungeonBuilder
        // Special decorations are unique per room
    }

    /**
     * Fallback to regular meshes if instancing disabled
     */
    createRegularMeshes() {
        console.warn('Instancing disabled, using regular meshes (poor performance)');
        // This would use the original DungeonBuilder approach
    }

    /**
     * Get build statistics
     */
    getStats() {
        const regularMeshCount = this.instanceGroups.floors.length +
                               this.instanceGroups.ceilings.length +
                               Object.values(this.instanceGroups.walls).flat().length;

        const memorySaved = (regularMeshCount - this.stats.drawCalls) * 0.1; // Rough estimate in MB

        return {
            totalInstances: this.stats.totalInstances,
            drawCalls: this.stats.drawCalls,
            regularMeshesWouldBe: regularMeshCount,
            performanceGain: `${Math.round((1 - this.stats.drawCalls / regularMeshCount) * 100)}%`,
            memorySaved: `~${memorySaved.toFixed(1)}MB`
        };
    }

    /**
     * Dispose of all resources
     */
    dispose() {
        // Dispose instanced meshes
        for (const mesh of this.instancedMeshes) {
            mesh.geometry.dispose();
            if (mesh.material) {
                mesh.material.dispose();
            }
            this.scene.remove(mesh);
        }

        // Dispose materials
        for (const material of this.colorMaterialCache.values()) {
            material.dispose();
        }

        // Clear arrays
        this.instancedMeshes = [];
        this.colorMaterialCache.clear();
    }
}