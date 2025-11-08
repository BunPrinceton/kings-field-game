// DecorationsManager.js - Manages environmental decorations and props
import * as THREE from 'three';

export class DecorationsManager {
    constructor(scene, dungeonData, textureManager, config = {}) {
        this.scene = scene;
        this.dungeonData = dungeonData;
        this.textureManager = textureManager;

        this.config = {
            cellSize: config.cellSize || 4,
            wallHeight: config.wallHeight || 3,
            decorationDensity: config.decorationDensity || 0.3, // 0.0 to 1.0
            enableDetails: config.enableDetails !== undefined ? config.enableDetails : true,
            ...config
        };

        this.decorations = [];
        this.detailObjects = [];
    }

    /**
     * Place all decorations in the dungeon
     */
    async placeDecorations() {
        console.log('Placing decorations...');

        // Classify rooms by type/size
        const roomTypes = this.classifyRooms();

        // Place major decorations
        for (const room of this.dungeonData.rooms) {
            const roomType = roomTypes.get(room);
            await this.decorateRoom(room, roomType);
        }

        // Add corridor details
        this.decorateCorridors();

        console.log(`Placed ${this.decorations.length} decorations and ${this.detailObjects.length} details`);

        return {
            decorations: this.decorations,
            details: this.detailObjects
        };
    }

    /**
     * Classify rooms by size and position to determine theme
     */
    classifyRooms() {
        const roomTypes = new Map();

        for (const room of this.dungeonData.rooms) {
            const area = room.width * room.height;
            const isEdgeRoom = room.x === 0 || room.y === 0 ||
                              room.x + room.width >= this.dungeonData.width - 1 ||
                              room.y + room.height >= this.dungeonData.height - 1;

            let type = 'standard';

            if (area > 64) {
                type = 'hall'; // Large ceremonial hall
            } else if (area > 36) {
                type = 'chamber'; // Medium chamber
            } else if (area < 16) {
                type = 'alcove'; // Small alcove/cell
            } else if (isEdgeRoom) {
                type = 'perimeter'; // Edge rooms
            }

            roomTypes.set(room, type);
        }

        return roomTypes;
    }

    /**
     * Decorate a single room based on its type
     */
    async decorateRoom(room, roomType) {
        const roomCenter = {
            x: (room.x + room.width / 2) * this.config.cellSize,
            z: (room.y + room.height / 2) * this.config.cellSize
        };

        switch (roomType) {
            case 'hall':
                await this.decorateHall(room, roomCenter);
                break;
            case 'chamber':
                await this.decorateChamber(room, roomCenter);
                break;
            case 'alcove':
                await this.decorateAlcove(room, roomCenter);
                break;
            case 'perimeter':
                await this.decoratePerimeter(room, roomCenter);
                break;
            default:
                await this.decorateStandard(room, roomCenter);
        }
    }

    /**
     * Decorate large ceremonial halls
     */
    async decorateHall(room, center) {
        // Place columns along the sides
        const columnCount = Math.floor(Math.max(room.width, room.height) / 3);

        // Columns along north-south axis
        if (room.width > 6) {
            for (let i = 1; i < columnCount; i++) {
                const spacing = room.width / (columnCount + 1);
                const x = (room.x + spacing * i) * this.config.cellSize;

                // Left side
                await this.placeColumn(x, (room.y + 2) * this.config.cellSize);
                // Right side
                await this.placeColumn(x, (room.y + room.height - 2) * this.config.cellSize);
            }
        }

        // Central altar or statue in very large halls
        if (room.width > 8 && room.height > 8) {
            await this.placeStatue(center.x, center.z, 'large');
        }

        // Corner braziers (use existing torch positions if available)
        await this.placeRubble(
            (room.x + 1) * this.config.cellSize,
            (room.y + 1) * this.config.cellSize,
            'scattered'
        );
    }

    /**
     * Decorate medium chambers
     */
    async decorateChamber(room, center) {
        // Random decoration type
        const decorationType = Math.random();

        if (decorationType < 0.3) {
            // Storage room: crates and barrels
            await this.placeCrateGroup(room);
        } else if (decorationType < 0.6) {
            // Ruined room: rubble and debris
            await this.placeRubblePiles(room);
        } else {
            // Empty room with corner details
            await this.placeCornerColumns(room);
        }
    }

    /**
     * Decorate small alcoves
     */
    async decorateAlcove(room, center) {
        // Small rooms get a single decoration
        const decorationType = Math.random();

        if (decorationType < 0.4) {
            await this.placeStatue(center.x, center.z, 'small');
        } else if (decorationType < 0.7) {
            await this.placeCrate(center.x, center.z);
        } else {
            await this.placeRubble(center.x, center.z, 'pile');
        }
    }

    /**
     * Decorate perimeter rooms
     */
    async decoratePerimeter(room, center) {
        // Edge rooms often storage or abandoned
        await this.placeBarrelGroup(room);
    }

    /**
     * Decorate standard rooms
     */
    async decorateStandard(room, center) {
        // Sparse decorations
        if (Math.random() < this.config.decorationDensity) {
            const x = (room.x + Math.random() * room.width) * this.config.cellSize;
            const z = (room.y + Math.random() * room.height) * this.config.cellSize;

            if (Math.random() < 0.5) {
                await this.placeRubble(x, z, 'scattered');
            } else {
                await this.placeCrate(x, z);
            }
        }
    }

    /**
     * Create a column decoration
     */
    async placeColumn(x, z, height = null) {
        const columnHeight = height || this.config.wallHeight * 0.9;
        const radius = 0.3;

        // Column shaft
        const shaftGeometry = new THREE.CylinderGeometry(radius, radius * 1.1, columnHeight, 8);
        const columnMaterial = await this.getColumnMaterial();
        const shaft = new THREE.Mesh(shaftGeometry, columnMaterial);

        shaft.position.set(x, columnHeight / 2, z);
        shaft.castShadow = true;
        shaft.receiveShadow = true;

        // Capital (top)
        const capitalGeometry = new THREE.CylinderGeometry(radius * 1.3, radius, 0.3, 8);
        const capital = new THREE.Mesh(capitalGeometry, columnMaterial);
        capital.position.set(x, columnHeight, z);
        capital.castShadow = true;
        capital.receiveShadow = true;

        // Base
        const baseGeometry = new THREE.CylinderGeometry(radius * 1.1, radius * 1.4, 0.3, 8);
        const base = new THREE.Mesh(baseGeometry, columnMaterial);
        base.position.set(x, 0.15, z);
        base.castShadow = true;
        base.receiveShadow = true;

        this.scene.add(shaft);
        this.scene.add(capital);
        this.scene.add(base);

        this.decorations.push(shaft, capital, base);
    }

    /**
     * Create a statue decoration
     */
    async placeStatue(x, z, size = 'medium') {
        const heights = { small: 1.0, medium: 1.5, large: 2.0 };
        const height = heights[size] || heights.medium;

        const pedestal = new THREE.Group();

        // Pedestal base
        const baseGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.8);
        const stoneMaterial = await this.getStoneMaterial();
        const base = new THREE.Mesh(baseGeometry, stoneMaterial);
        base.position.y = 0.2;
        base.castShadow = true;
        base.receiveShadow = true;
        pedestal.add(base);

        // Statue figure (simplified humanoid shape)
        const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.25, height * 0.6, 8);
        const body = new THREE.Mesh(bodyGeometry, stoneMaterial);
        body.position.y = 0.4 + height * 0.3;
        body.castShadow = true;
        pedestal.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const head = new THREE.Mesh(headGeometry, stoneMaterial);
        head.position.y = 0.4 + height * 0.6 + 0.15;
        head.castShadow = true;
        pedestal.add(head);

        pedestal.position.set(x, 0, z);
        this.scene.add(pedestal);
        this.decorations.push(pedestal);
    }

    /**
     * Create a crate decoration
     */
    async placeCrate(x, z, rotation = null) {
        const size = 0.6 + Math.random() * 0.4;
        const crateGeometry = new THREE.BoxGeometry(size, size, size);
        const woodMaterial = await this.getWoodMaterial();

        const crate = new THREE.Mesh(crateGeometry, woodMaterial);
        crate.position.set(x, size / 2, z);
        crate.rotation.y = rotation !== null ? rotation : Math.random() * Math.PI * 2;
        crate.castShadow = true;
        crate.receiveShadow = true;

        this.scene.add(crate);
        this.decorations.push(crate);
    }

    /**
     * Create a barrel decoration
     */
    async placeBarrel(x, z) {
        const barrelGeometry = new THREE.CylinderGeometry(0.3, 0.35, 0.8, 12);
        const woodMaterial = await this.getWoodMaterial();

        const barrel = new THREE.Mesh(barrelGeometry, woodMaterial);
        barrel.position.set(x, 0.4, z);
        barrel.castShadow = true;
        barrel.receiveShadow = true;

        this.scene.add(barrel);
        this.decorations.push(barrel);
    }

    /**
     * Create rubble/debris
     */
    async placeRubble(x, z, type = 'pile') {
        const stoneMaterial = await this.getStoneMaterial();
        const pieces = type === 'pile' ? 3 + Math.floor(Math.random() * 3) : 2;

        for (let i = 0; i < pieces; i++) {
            const size = 0.2 + Math.random() * 0.4;
            const geometry = new THREE.DodecahedronGeometry(size, 0);
            const rubble = new THREE.Mesh(geometry, stoneMaterial);

            const offset = type === 'scattered' ? 1.5 : 0.5;
            rubble.position.set(
                x + (Math.random() - 0.5) * offset,
                size / 2,
                z + (Math.random() - 0.5) * offset
            );
            rubble.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rubble.castShadow = true;
            rubble.receiveShadow = true;

            this.scene.add(rubble);
            this.decorations.push(rubble);
        }
    }

    /**
     * Place a group of crates in a room
     */
    async placeCrateGroup(room) {
        const count = 2 + Math.floor(Math.random() * 3);
        const groupX = (room.x + 1 + Math.random() * (room.width - 2)) * this.config.cellSize;
        const groupZ = (room.y + 1 + Math.random() * (room.height - 2)) * this.config.cellSize;

        for (let i = 0; i < count; i++) {
            const x = groupX + (Math.random() - 0.5) * 2;
            const z = groupZ + (Math.random() - 0.5) * 2;
            await this.placeCrate(x, z);
        }
    }

    /**
     * Place a group of barrels in a room
     */
    async placeBarrelGroup(room) {
        const count = 2 + Math.floor(Math.random() * 4);
        const groupX = (room.x + 1 + Math.random() * (room.width - 2)) * this.config.cellSize;
        const groupZ = (room.y + 1 + Math.random() * (room.height - 2)) * this.config.cellSize;

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = 0.5 + Math.random() * 0.5;
            const x = groupX + Math.cos(angle) * radius;
            const z = groupZ + Math.sin(angle) * radius;
            await this.placeBarrel(x, z);
        }
    }

    /**
     * Place rubble piles in a room
     */
    async placeRubblePiles(room) {
        const count = 2 + Math.floor(Math.random() * 3);

        for (let i = 0; i < count; i++) {
            const x = (room.x + 1 + Math.random() * (room.width - 2)) * this.config.cellSize;
            const z = (room.y + 1 + Math.random() * (room.height - 2)) * this.config.cellSize;
            await this.placeRubble(x, z, 'pile');
        }
    }

    /**
     * Place columns in room corners
     */
    async placeCornerColumns(room) {
        if (room.width < 5 || room.height < 5) return;

        await this.placeColumn(
            (room.x + 1) * this.config.cellSize,
            (room.y + 1) * this.config.cellSize
        );
        await this.placeColumn(
            (room.x + room.width - 1) * this.config.cellSize,
            (room.y + 1) * this.config.cellSize
        );
        await this.placeColumn(
            (room.x + 1) * this.config.cellSize,
            (room.y + room.height - 1) * this.config.cellSize
        );
        await this.placeColumn(
            (room.x + room.width - 1) * this.config.cellSize,
            (room.y + room.height - 1) * this.config.cellSize
        );
    }

    /**
     * Add small details to corridors
     */
    decorateCorridors() {
        if (!this.config.enableDetails) return;

        // Find corridor cells (cells with 2 or fewer walkable neighbors)
        // Add small details like cracks, moss patches, etc.
        // This would be implemented with decals or small geometry

        // Placeholder for future implementation
        console.log('Corridor details would be added here');
    }

    /**
     * Material getters with caching
     */
    async getColumnMaterial() {
        if (!this.columnMaterial) {
            this.columnMaterial = await this.textureManager.createPBRMaterial({}, {
                color: 0x5a5a5a,
                roughness: 0.8,
                metalness: 0.05
            });
        }
        return this.columnMaterial;
    }

    async getStoneMaterial() {
        if (!this.stoneMaterial) {
            this.stoneMaterial = await this.textureManager.createPBRMaterial({}, {
                color: 0x4a4a4a,
                roughness: 0.9,
                metalness: 0.0
            });
        }
        return this.stoneMaterial;
    }

    async getWoodMaterial() {
        if (!this.woodMaterial) {
            this.woodMaterial = await this.textureManager.createWoodMaterial(true);
        }
        return this.woodMaterial;
    }

    /**
     * Remove all decorations from the scene
     */
    dispose() {
        for (const decoration of this.decorations) {
            this.scene.remove(decoration);
            if (decoration.geometry) decoration.geometry.dispose();
            if (decoration.material) decoration.material.dispose();
        }

        for (const detail of this.detailObjects) {
            this.scene.remove(detail);
            if (detail.geometry) detail.geometry.dispose();
            if (detail.material) detail.material.dispose();
        }

        this.decorations = [];
        this.detailObjects = [];
    }
}
