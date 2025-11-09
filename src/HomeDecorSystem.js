// HomeDecorSystem.js - Comprehensive home decoration and room design system
import * as THREE from 'three';
import { POIType } from './DungeonGenerator.js';

export class HomeDecorSystem {
    constructor(scene, dungeonData, config = {}) {
        this.scene = scene;
        this.dungeonData = dungeonData;

        this.config = {
            cellSize: config.cellSize || 4,
            wallHeight: config.wallHeight || 3.5,
            decorDensity: config.decorDensity || 0.7, // 0.0 to 1.0
            enableLighting: config.enableLighting !== undefined ? config.enableLighting : true,
            ...config
        };

        this.decorations = [];
        this.lights = [];

        // Material cache to prevent exceeding WebGL limits
        this.materialCache = new Map();
    }

    /**
     * Main entry point - decorates all rooms based on their type
     */
    async decorateAllRooms() {
        console.log('Starting home decor placement...');

        for (const room of this.dungeonData.rooms) {
            await this.decorateRoom(room);
        }

        console.log(`Placed ${this.decorations.length} decorative items with ${this.lights.length} light sources`);

        return {
            decorations: this.decorations,
            lights: this.lights
        };
    }

    /**
     * Decorate a single room based on its POI type
     */
    async decorateRoom(room) {
        // Skip very small rooms (corridors)
        if (room.width < 3 || room.height < 3) return;

        const roomType = room.type || POIType.STANDARD;

        // Determine room theme based on POI type
        switch (roomType) {
            case POIType.HUB:
                await this.createThroneRoom(room);
                break;
            case POIType.TREASURE:
                await this.createTreasuryRoom(room);
                break;
            case POIType.SAFE:
                await this.createLivingQuarters(room);
                break;
            case POIType.BOSS:
                await this.createBossArena(room);
                break;
            case POIType.PUZZLE:
                await this.createLibrary(room);
                break;
            case POIType.ENTRANCE:
                await this.createEntryHall(room);
                break;
            case POIType.EXIT:
                await this.createExitChamber(room);
                break;
            default:
                await this.createGenericRoom(room);
        }
    }

    // ===== ROOM TEMPLATES =====

    /**
     * Throne Room - grand and imposing
     */
    async createThroneRoom(room) {
        const center = this.getRoomCenter(room);

        // Place throne at the back
        const thronePos = {
            x: center.x,
            z: (room.y + room.height - 2) * this.config.cellSize
        };
        this.placeThrone(thronePos.x, thronePos.z);

        // Red carpet leading to throne
        this.placeRugPath(
            center.x,
            (room.y + 2) * this.config.cellSize,
            center.x,
            thronePos.z - 2,
            0.3, 'red'
        );

        // Wall tapestries on sides
        this.placeWallTapestries(room, 'royal');

        // Standing candelabras along sides
        const spacing = Math.floor(room.height / 3);
        for (let i = 1; i < 3; i++) {
            this.placeCandelabra(
                (room.x + 2) * this.config.cellSize,
                (room.y + i * spacing) * this.config.cellSize
            );
            this.placeCandelabra(
                (room.x + room.width - 2) * this.config.cellSize,
                (room.y + i * spacing) * this.config.cellSize
            );
        }

        // Wall-mounted shields
        this.placeShieldsOnWalls(room, 4);
    }

    /**
     * Treasury Room - filled with treasure and decorative items
     */
    async createTreasuryRoom(room) {
        const center = this.getRoomCenter(room);

        // Multiple treasure chests
        for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
            const x = (room.x + 1 + Math.random() * (room.width - 2)) * this.config.cellSize;
            const z = (room.y + 1 + Math.random() * (room.height - 2)) * this.config.cellSize;
            this.placeChest(x, z);
        }

        // Scattered coins and valuables
        for (let i = 0; i < 10; i++) {
            const x = (room.x + 1 + Math.random() * (room.width - 2)) * this.config.cellSize;
            const z = (room.y + 1 + Math.random() * (room.height - 2)) * this.config.cellSize;
            this.placeCoinPile(x, z);
        }

        // Decorative vases in corners
        this.placeVase((room.x + 1) * this.config.cellSize, (room.y + 1) * this.config.cellSize);
        this.placeVase((room.x + room.width - 1) * this.config.cellSize, (room.y + 1) * this.config.cellSize);

        // Golden candelabras
        this.placeCandelabra(
            (room.x + room.width / 2) * this.config.cellSize,
            (room.y + 1.5) * this.config.cellSize,
            'gold'
        );
    }

    /**
     * Living Quarters - cozy and furnished
     */
    async createLivingQuarters(room) {
        // Bed in corner
        this.placeBed(
            (room.x + 1.5) * this.config.cellSize,
            (room.y + 1.5) * this.config.cellSize
        );

        // Small table with candles
        const tablePos = {
            x: (room.x + room.width - 2) * this.config.cellSize,
            z: (room.y + 2) * this.config.cellSize
        };
        this.placeTable(tablePos.x, tablePos.z, 'small');
        this.placeCandle(tablePos.x, tablePos.z, 0.5);

        // Wall-mounted torch
        this.placeWallTorch(
            (room.x + room.width / 2) * this.config.cellSize,
            (room.y + 0.5) * this.config.cellSize
        );

        // Small rug in center
        const center = this.getRoomCenter(room);
        this.placeRug(center.x, center.z, 2, 1.5, 'simple');

        // Personal items - pottery
        this.placeVase(
            (room.x + 2) * this.config.cellSize,
            (room.y + room.height - 1.5) * this.config.cellSize
        );
    }

    /**
     * Boss Arena - intimidating with dramatic decorations
     */
    async createBossArena(room) {
        const center = this.getRoomCenter(room);

        // Large fireplace at back
        this.placeFireplace(
            center.x,
            (room.y + room.height - 1) * this.config.cellSize
        );

        // Hanging chains from ceiling
        const chainCount = 4;
        for (let i = 0; i < chainCount; i++) {
            const angle = (i / chainCount) * Math.PI * 2;
            const radius = Math.min(room.width, room.height) * this.config.cellSize * 0.3;
            this.placeHangingChain(
                center.x + Math.cos(angle) * radius,
                center.z + Math.sin(angle) * radius
            );
        }

        // Dark banners on walls
        this.placeWallTapestries(room, 'dark');

        // Skulls and bones scattered
        for (let i = 0; i < 6; i++) {
            const x = (room.x + 1 + Math.random() * (room.width - 2)) * this.config.cellSize;
            const z = (room.y + 1 + Math.random() * (room.height - 2)) * this.config.cellSize;
            this.placeSkull(x, z);
        }
    }

    /**
     * Library - scholarly atmosphere
     */
    async createLibrary(room) {
        // Bookshelves along walls
        this.placeBookshelves(room);

        // Reading table in center
        const center = this.getRoomCenter(room);
        this.placeTable(center.x, center.z, 'large');

        // Candles on table for reading
        this.placeCandle(center.x - 0.5, center.z, 0.5);
        this.placeCandle(center.x + 0.5, center.z, 0.5);

        // Stacks of books
        for (let i = 0; i < 5; i++) {
            const x = (room.x + 1 + Math.random() * (room.width - 2)) * this.config.cellSize;
            const z = (room.y + 1 + Math.random() * (room.height - 2)) * this.config.cellSize;
            this.placeBookStack(x, z);
        }

        // Wall-mounted candelabras for lighting
        const wallPoints = this.getWallMountPoints(room, 3);
        wallPoints.forEach(point => {
            this.placeWallTorch(point.x, point.z);
        });
    }

    /**
     * Entry Hall - welcoming with decorative elements
     */
    async createEntryHall(room) {
        const center = this.getRoomCenter(room);

        // Central rug
        this.placeRug(center.x, center.z, 3, 2, 'ornate');

        // Welcome torches
        this.placeWallTorch(
            (room.x + 1) * this.config.cellSize,
            (room.y + room.height / 2) * this.config.cellSize
        );
        this.placeWallTorch(
            (room.x + room.width - 1) * this.config.cellSize,
            (room.y + room.height / 2) * this.config.cellSize
        );

        // Decorative vases at entrance
        this.placeVase((room.x + 2) * this.config.cellSize, (room.y + 1) * this.config.cellSize);
        this.placeVase((room.x + room.width - 2) * this.config.cellSize, (room.y + 1) * this.config.cellSize);
    }

    /**
     * Exit Chamber - mystical and otherworldly
     */
    async createExitChamber(room) {
        const center = this.getRoomCenter(room);

        // Mystical candles in circle
        const candleCount = 6;
        const radius = 2;
        for (let i = 0; i < candleCount; i++) {
            const angle = (i / candleCount) * Math.PI * 2;
            this.placeCandle(
                center.x + Math.cos(angle) * radius,
                center.z + Math.sin(angle) * radius,
                0,
                'purple'
            );
        }

        // Mystical tapestries
        this.placeWallTapestries(room, 'mystical');
    }

    /**
     * Generic Room - varied decorations
     */
    async createGenericRoom(room) {
        const decorType = Math.random();

        if (decorType < 0.25) {
            // Dining area
            await this.createDiningHall(room);
        } else if (decorType < 0.5) {
            // Storage room
            await this.createStorageRoom(room);
        } else if (decorType < 0.75) {
            // Armory
            await this.createArmory(room);
        } else {
            // Prison/dungeon cell
            await this.createPrisonCell(room);
        }
    }

    /**
     * Dining Hall - tables, chairs, and eating area
     */
    async createDiningHall(room) {
        const center = this.getRoomCenter(room);

        // Long dining table
        this.placeTable(center.x, center.z, 'large');

        // Chairs around table
        this.placeChair(center.x - 1.5, center.z, 0);
        this.placeChair(center.x + 1.5, center.z, Math.PI);
        this.placeChair(center.x, center.z - 1, Math.PI / 2);
        this.placeChair(center.x, center.z + 1, -Math.PI / 2);

        // Table settings - dishes and candles
        this.placeDish(center.x - 0.5, center.z, 0.5);
        this.placeDish(center.x + 0.5, center.z, 0.5);
        this.placeCandle(center.x, center.z, 0.5);

        // Wall tapestries for decoration
        this.placeWallTapestries(room, 'decorative');

        // Barrels in corner (storage)
        this.placeBarrel((room.x + 1) * this.config.cellSize, (room.y + 1) * this.config.cellSize);
    }

    /**
     * Storage Room - barrels, crates, shelves
     */
    async createStorageRoom(room) {
        // Multiple barrel groups
        for (let i = 0; i < 3; i++) {
            const x = (room.x + 1 + Math.random() * (room.width - 2)) * this.config.cellSize;
            const z = (room.y + 1 + Math.random() * (room.height - 2)) * this.config.cellSize;
            this.placeBarrel(x, z);
        }

        // Crate stacks
        for (let i = 0; i < 4; i++) {
            const x = (room.x + 1 + Math.random() * (room.width - 2)) * this.config.cellSize;
            const z = (room.y + 1 + Math.random() * (room.height - 2)) * this.config.cellSize;
            this.placeCrate(x, z);
        }

        // Simple torch for lighting
        const center = this.getRoomCenter(room);
        this.placeWallTorch(center.x, (room.y + 1) * this.config.cellSize);
    }

    /**
     * Armory - weapon racks, armor stands
     */
    async createArmory(room) {
        // Weapon racks along walls
        const rackPoints = this.getWallMountPoints(room, 4);
        rackPoints.forEach(point => {
            this.placeWeaponRack(point.x, point.z);
        });

        // Armor stands in corners
        if (room.width >= 5 && room.height >= 5) {
            this.placeArmorStand(
                (room.x + 1.5) * this.config.cellSize,
                (room.y + 1.5) * this.config.cellSize
            );
            this.placeArmorStand(
                (room.x + room.width - 1.5) * this.config.cellSize,
                (room.y + room.height - 1.5) * this.config.cellSize
            );
        }

        // Shields on walls
        this.placeShieldsOnWalls(room, 6);

        // Central equipment table
        const center = this.getRoomCenter(room);
        this.placeTable(center.x, center.z, 'small');
    }

    /**
     * Prison Cell - chains, straw, minimal furniture
     */
    async createPrisonCell(room) {
        // Hanging chains
        this.placeHangingChain(
            (room.x + 1) * this.config.cellSize,
            (room.y + 1) * this.config.cellSize
        );

        // Straw pile (bed)
        this.placeStrawPile(
            (room.x + 1.5) * this.config.cellSize,
            (room.y + room.height - 1.5) * this.config.cellSize
        );

        // Scattered bones
        for (let i = 0; i < 3; i++) {
            const x = (room.x + Math.random() * room.width) * this.config.cellSize;
            const z = (room.y + Math.random() * room.height) * this.config.cellSize;
            this.placeSkull(x, z);
        }

        // Cobwebs in corners
        this.placeCobweb((room.x + 0.5) * this.config.cellSize, (room.y + 0.5) * this.config.cellSize);
        this.placeCobweb((room.x + room.width - 0.5) * this.config.cellSize, (room.y + 0.5) * this.config.cellSize);

        // Single dim torch
        this.placeWallTorch(
            (room.x + room.width / 2) * this.config.cellSize,
            (room.y + 0.5) * this.config.cellSize,
            0.3
        );
    }

    // ===== DECORATIVE ITEM CREATION =====

    /**
     * Place a wall tapestry
     */
    placeWallTapestries(room, style = 'standard') {
        const tapestryPoints = this.getWallMountPoints(room, 3);

        const colors = {
            'royal': 0x8B0000,      // Dark red
            'dark': 0x1a1a1a,       // Very dark
            'mystical': 0x4a0080,   // Purple
            'decorative': 0x2a4a2a  // Dark green
        };

        const color = colors[style] || 0x3a3a3a;

        tapestryPoints.forEach(point => {
            this.createTapestry(point.x, point.z, color);
        });
    }

    createTapestry(x, z, color = 0x8B0000) {
        const tapestryGroup = new THREE.Group();

        // Main fabric
        const fabricGeom = new THREE.PlaneGeometry(1.2, 2);
        const fabricMat = this.getCachedMaterial(color, { roughness: 0.9 });
        const fabric = new THREE.Mesh(fabricGeom, fabricMat);
        fabric.rotation.y = Math.PI / 2;
        tapestryGroup.add(fabric);

        // Decorative border
        const borderGeom = new THREE.PlaneGeometry(1.3, 2.1);
        const borderMat = this.getCachedMaterial(0xFFD700, { roughness: 0.6, metalness: 0.3 });
        const border = new THREE.Mesh(borderGeom, borderMat);
        border.rotation.y = Math.PI / 2;
        border.position.z = -0.02;
        tapestryGroup.add(border);

        tapestryGroup.position.set(x, this.config.wallHeight / 2, z);
        this.scene.add(tapestryGroup);
        this.decorations.push(tapestryGroup);
    }

    /**
     * Place a fireplace with flames
     */
    placeFireplace(x, z) {
        const fireplaceGroup = new THREE.Group();

        // Fireplace base
        const baseGeom = new THREE.BoxGeometry(2, 1.5, 0.8);
        const baseMat = this.getCachedMaterial(0x2a2a2a, { roughness: 0.9 });
        const base = new THREE.Mesh(baseGeom, baseMat);
        base.position.y = 0.75;
        fireplaceGroup.add(base);

        // Mantel
        const mantelGeom = new THREE.BoxGeometry(2.4, 0.2, 0.9);
        const mantelMat = this.getCachedMaterial(0x3a2a1a, { roughness: 0.8 });
        const mantel = new THREE.Mesh(mantelGeom, mantelMat);
        mantel.position.y = 1.5;
        fireplaceGroup.add(mantel);

        // Fire
        const fireGeom = new THREE.ConeGeometry(0.3, 0.6, 4);
        const fireMat = new THREE.MeshStandardMaterial({
            color: 0xff6600,
            emissive: 0xff4400,
            emissiveIntensity: 1
        });
        const fire = new THREE.Mesh(fireGeom, fireMat);
        fire.position.set(0, 0.3, 0);
        fire.userData.isFlame = true;
        fireplaceGroup.add(fire);

        // Embers
        for (let i = 0; i < 5; i++) {
            const emberGeom = new THREE.SphereGeometry(0.05, 4, 4);
            const emberMat = new THREE.MeshStandardMaterial({
                color: 0xff3300,
                emissive: 0xff3300,
                emissiveIntensity: 0.8
            });
            const ember = new THREE.Mesh(emberGeom, emberMat);
            ember.position.set(
                (Math.random() - 0.5) * 0.4,
                Math.random() * 0.2,
                (Math.random() - 0.5) * 0.3
            );
            ember.userData.isEmber = true;
            fireplaceGroup.add(ember);
        }

        fireplaceGroup.position.set(x, 0, z);
        this.scene.add(fireplaceGroup);
        this.decorations.push(fireplaceGroup);

        // Add warm light
        if (this.config.enableLighting) {
            const light = new THREE.PointLight(0xff6600, 2, 8);
            light.position.set(x, 1, z);
            this.scene.add(light);
            this.lights.push(light);
        }
    }

    /**
     * Place a candelabra with multiple candles
     */
    placeCandelabra(x, z, material = 'iron') {
        const candelabraGroup = new THREE.Group();

        const baseColor = material === 'gold' ? 0xFFD700 : 0x4a4a4a;

        // Base
        const baseGeom = new THREE.CylinderGeometry(0.15, 0.2, 0.3, 8);
        const baseMat = this.getCachedMaterial(baseColor, { roughness: 0.5, metalness: 0.6 });
        const base = new THREE.Mesh(baseGeom, baseMat);
        base.position.y = 0.15;
        candelabraGroup.add(base);

        // Central stem
        const stemGeom = new THREE.CylinderGeometry(0.05, 0.08, 1, 8);
        const stem = new THREE.Mesh(stemGeom, baseMat);
        stem.position.y = 0.8;
        candelabraGroup.add(stem);

        // Three candle holders
        const positions = [-0.3, 0, 0.3];
        positions.forEach(offset => {
            // Holder
            const holderGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.1, 6);
            const holder = new THREE.Mesh(holderGeom, baseMat);
            holder.position.set(offset, 1.3, 0);
            candelabraGroup.add(holder);

            // Candle
            const candleGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.15, 8);
            const candleMat = this.getCachedMaterial(0xf0e68c, { roughness: 0.7 });
            const candle = new THREE.Mesh(candleGeom, candleMat);
            candle.position.set(offset, 1.45, 0);
            candelabraGroup.add(candle);

            // Flame
            const flameGeom = new THREE.SphereGeometry(0.05, 6, 6);
            const flameMat = new THREE.MeshStandardMaterial({
                color: 0xffaa00,
                emissive: 0xffaa00,
                emissiveIntensity: 1
            });
            const flame = new THREE.Mesh(flameGeom, flameMat);
            flame.position.set(offset, 1.58, 0);
            flame.userData.isFlame = true;
            candelabraGroup.add(flame);
        });

        candelabraGroup.position.set(x, 0, z);
        this.scene.add(candelabraGroup);
        this.decorations.push(candelabraGroup);

        // Add warm light
        if (this.config.enableLighting) {
            const light = new THREE.PointLight(0xffaa00, 1.5, 6);
            light.position.set(x, 1.5, z);
            this.scene.add(light);
            this.lights.push(light);
        }
    }

    /**
     * Place a single candle
     */
    placeCandle(x, z, yOffset = 0, color = 'warm') {
        const candleGroup = new THREE.Group();

        // Candle body
        const bodyGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8);
        const bodyMat = this.getCachedMaterial(0xf0e68c, { roughness: 0.7 });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 0.1;
        candleGroup.add(body);

        // Flame
        const flameColor = color === 'purple' ? 0x8a4a9a : 0xffaa00;
        const flameGeom = new THREE.SphereGeometry(0.06, 6, 6);
        const flameMat = new THREE.MeshStandardMaterial({
            color: flameColor,
            emissive: flameColor,
            emissiveIntensity: 1
        });
        const flame = new THREE.Mesh(flameGeom, flameMat);
        flame.position.y = 0.25;
        flame.userData.isFlame = true;
        candleGroup.add(flame);

        candleGroup.position.set(x, yOffset, z);
        this.scene.add(candleGroup);
        this.decorations.push(candleGroup);

        // Add light
        if (this.config.enableLighting) {
            const light = new THREE.PointLight(flameColor, 0.8, 4);
            light.position.set(x, yOffset + 0.25, z);
            this.scene.add(light);
            this.lights.push(light);
        }
    }

    /**
     * Place a wall-mounted torch
     */
    placeWallTorch(x, z, intensity = 1.0) {
        const torchGroup = new THREE.Group();

        // Wall bracket
        const bracketGeom = new THREE.BoxGeometry(0.1, 0.05, 0.3);
        const bracketMat = this.getCachedMaterial(0x3a3a3a, { roughness: 0.8, metalness: 0.3 });
        const bracket = new THREE.Mesh(bracketGeom, bracketMat);
        bracket.position.y = this.config.wallHeight * 0.6;
        torchGroup.add(bracket);

        // Torch stick
        const stickGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6);
        const stickMat = this.getCachedMaterial(0x4a3020, { roughness: 0.9 });
        const stick = new THREE.Mesh(stickGeom, stickMat);
        stick.position.y = this.config.wallHeight * 0.6;
        stick.rotation.z = Math.PI / 6;
        torchGroup.add(stick);

        // Flame
        const flameGeom = new THREE.SphereGeometry(0.1, 8, 8);
        const flameMat = new THREE.MeshStandardMaterial({
            color: 0xff6600,
            emissive: 0xff6600,
            emissiveIntensity: 1
        });
        const flame = new THREE.Mesh(flameGeom, flameMat);
        flame.position.set(0.15, this.config.wallHeight * 0.6 + 0.15, 0);
        flame.userData.isFlame = true;
        torchGroup.add(flame);

        torchGroup.position.set(x, 0, z);
        this.scene.add(torchGroup);
        this.decorations.push(torchGroup);

        // Add flickering light
        if (this.config.enableLighting) {
            const light = new THREE.PointLight(0xff6600, 1.5 * intensity, 7);
            light.position.set(x + 0.15, this.config.wallHeight * 0.6 + 0.15, z);
            this.scene.add(light);
            this.lights.push(light);
        }
    }

    /**
     * Place a rug/carpet
     */
    placeRug(x, z, width = 2, depth = 1.5, style = 'simple') {
        const colors = {
            'simple': 0x8B4513,
            'ornate': 0x8B0000,
            'red': 0xAA0000
        };

        const rugGeom = new THREE.PlaneGeometry(width, depth);
        const rugMat = this.getCachedMaterial(colors[style] || 0x8B4513, { roughness: 0.95 });
        const rug = new THREE.Mesh(rugGeom, rugMat);
        rug.rotation.x = -Math.PI / 2;
        rug.position.set(x, 0.01, z);

        this.scene.add(rug);
        this.decorations.push(rug);
    }

    /**
     * Place a rug path between two points
     */
    placeRugPath(x1, z1, x2, z2, width = 0.5, style = 'red') {
        const distance = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
        const angle = Math.atan2(z2 - z1, x2 - x1);

        this.placeRug(
            (x1 + x2) / 2,
            (z1 + z2) / 2,
            distance,
            width,
            style
        );
    }

    /**
     * Place decorative vase/pottery
     */
    placeVase(x, z) {
        const vaseGeom = new THREE.CylinderGeometry(0.15, 0.2, 0.5, 8);
        const vaseMat = this.getCachedMaterial(0x8B7355, { roughness: 0.6 });
        const vase = new THREE.Mesh(vaseGeom, vaseMat);
        vase.position.set(x, 0.25, z);

        this.scene.add(vase);
        this.decorations.push(vase);
    }

    /**
     * Place a decorative dish
     */
    placeDish(x, z, yOffset = 0) {
        const dishGeom = new THREE.CylinderGeometry(0.15, 0.12, 0.03, 16);
        const dishMat = this.getCachedMaterial(0xcccccc, { roughness: 0.3, metalness: 0.2 });
        const dish = new THREE.Mesh(dishGeom, dishMat);
        dish.position.set(x, yOffset, z);

        this.scene.add(dish);
        this.decorations.push(dish);
    }

    /**
     * Place hanging chain
     */
    placeHangingChain(x, z) {
        const chainGroup = new THREE.Group();

        const linkCount = 8;
        const linkHeight = 0.15;

        for (let i = 0; i < linkCount; i++) {
            const linkGeom = new THREE.TorusGeometry(0.08, 0.02, 8, 6);
            const linkMat = this.getCachedMaterial(0x4a4a4a, { roughness: 0.6, metalness: 0.7 });
            const link = new THREE.Mesh(linkGeom, linkMat);
            link.position.y = this.config.wallHeight - i * linkHeight;
            link.rotation.x = i % 2 === 0 ? 0 : Math.PI / 2;
            chainGroup.add(link);
        }

        chainGroup.position.set(x, 0, z);
        this.scene.add(chainGroup);
        this.decorations.push(chainGroup);
    }

    /**
     * Place cobweb decoration
     */
    placeCobweb(x, z) {
        const webGeom = new THREE.PlaneGeometry(0.5, 0.5);
        const webMat = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const web = new THREE.Mesh(webGeom, webMat);
        web.position.set(x, this.config.wallHeight * 0.9, z);
        web.rotation.y = Math.random() * Math.PI;

        this.scene.add(web);
        this.decorations.push(web);
    }

    /**
     * Place throne
     */
    placeThrone(x, z) {
        const throneGroup = new THREE.Group();

        // Seat
        const seatGeom = new THREE.BoxGeometry(1, 0.3, 1);
        const throneMat = this.getCachedMaterial(0x8B0000, { roughness: 0.7, metalness: 0.2 });
        const seat = new THREE.Mesh(seatGeom, throneMat);
        seat.position.y = 0.6;
        throneGroup.add(seat);

        // Back
        const backGeom = new THREE.BoxGeometry(1, 1.5, 0.2);
        const back = new THREE.Mesh(backGeom, throneMat);
        back.position.set(0, 1.2, -0.4);
        throneGroup.add(back);

        // Arms
        const armGeom = new THREE.BoxGeometry(0.15, 0.5, 0.8);
        const leftArm = new THREE.Mesh(armGeom, throneMat);
        leftArm.position.set(-0.5, 0.75, 0);
        throneGroup.add(leftArm);

        const rightArm = new THREE.Mesh(armGeom, throneMat);
        rightArm.position.set(0.5, 0.75, 0);
        throneGroup.add(rightArm);

        // Crown ornament
        const crownGeom = new THREE.ConeGeometry(0.15, 0.3, 4);
        const crownMat = this.getCachedMaterial(0xFFD700, { roughness: 0.3, metalness: 0.8 });
        const crown = new THREE.Mesh(crownGeom, crownMat);
        crown.position.set(0, 2, -0.4);
        throneGroup.add(crown);

        throneGroup.position.set(x, 0, z);
        this.scene.add(throneGroup);
        this.decorations.push(throneGroup);
    }

    /**
     * Place table
     */
    placeTable(x, z, size = 'medium') {
        const dimensions = {
            'small': { width: 1, depth: 0.8, height: 0.8 },
            'medium': { width: 1.5, depth: 1, height: 0.8 },
            'large': { width: 2.5, depth: 1.2, height: 0.8 }
        };

        const dim = dimensions[size] || dimensions.medium;

        const tableGroup = new THREE.Group();

        // Top
        const topGeom = new THREE.BoxGeometry(dim.width, 0.1, dim.depth);
        const woodMat = this.getCachedMaterial(0x5a3a2a, { roughness: 0.7 });
        const top = new THREE.Mesh(topGeom, woodMat);
        top.position.y = dim.height;
        tableGroup.add(top);

        // Legs
        const legGeom = new THREE.CylinderGeometry(0.05, 0.05, dim.height, 6);
        const legPositions = [
            [-dim.width / 2 + 0.1, -dim.depth / 2 + 0.1],
            [dim.width / 2 - 0.1, -dim.depth / 2 + 0.1],
            [-dim.width / 2 + 0.1, dim.depth / 2 - 0.1],
            [dim.width / 2 - 0.1, dim.depth / 2 - 0.1]
        ];

        legPositions.forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(legGeom, woodMat);
            leg.position.set(lx, dim.height / 2, lz);
            tableGroup.add(leg);
        });

        tableGroup.position.set(x, 0, z);
        this.scene.add(tableGroup);
        this.decorations.push(tableGroup);
    }

    /**
     * Place chair
     */
    placeChair(x, z, rotation = 0) {
        const chairGroup = new THREE.Group();
        const woodMat = this.getCachedMaterial(0x4a2a1a, { roughness: 0.8 });

        // Seat
        const seatGeom = new THREE.BoxGeometry(0.4, 0.05, 0.4);
        const seat = new THREE.Mesh(seatGeom, woodMat);
        seat.position.y = 0.4;
        chairGroup.add(seat);

        // Back
        const backGeom = new THREE.BoxGeometry(0.4, 0.5, 0.05);
        const back = new THREE.Mesh(backGeom, woodMat);
        back.position.set(0, 0.65, -0.175);
        chairGroup.add(back);

        // Legs
        const legGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6);
        [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(legGeom, woodMat);
            leg.position.set(lx, 0.2, lz);
            chairGroup.add(leg);
        });

        chairGroup.position.set(x, 0, z);
        chairGroup.rotation.y = rotation;
        this.scene.add(chairGroup);
        this.decorations.push(chairGroup);
    }

    /**
     * Place bed
     */
    placeBed(x, z) {
        const bedGroup = new THREE.Group();

        // Frame
        const frameGeom = new THREE.BoxGeometry(2, 0.5, 1.2);
        const frameMat = this.getCachedMaterial(0x4a2a1a, { roughness: 0.8 });
        const frame = new THREE.Mesh(frameGeom, frameMat);
        frame.position.y = 0.25;
        bedGroup.add(frame);

        // Mattress
        const mattressGeom = new THREE.BoxGeometry(1.9, 0.2, 1.1);
        const mattressMat = this.getCachedMaterial(0xf0f0f0, { roughness: 0.9 });
        const mattress = new THREE.Mesh(mattressGeom, mattressMat);
        mattress.position.y = 0.6;
        bedGroup.add(mattress);

        // Pillow
        const pillowGeom = new THREE.BoxGeometry(0.5, 0.1, 0.3);
        const pillow = new THREE.Mesh(pillowGeom, mattressMat);
        pillow.position.set(0, 0.75, -0.35);
        bedGroup.add(pillow);

        bedGroup.position.set(x, 0, z);
        this.scene.add(bedGroup);
        this.decorations.push(bedGroup);
    }

    /**
     * Place chest
     */
    placeChest(x, z) {
        const chestGroup = new THREE.Group();

        // Base
        const baseGeom = new THREE.BoxGeometry(0.8, 0.5, 0.6);
        const woodMat = this.getCachedMaterial(0x5a3a1a, { roughness: 0.8 });
        const base = new THREE.Mesh(baseGeom, woodMat);
        base.position.y = 0.25;
        chestGroup.add(base);

        // Lid
        const lidGeom = new THREE.BoxGeometry(0.8, 0.15, 0.6);
        const lid = new THREE.Mesh(lidGeom, woodMat);
        lid.position.y = 0.575;
        lid.rotation.x = -0.2;
        chestGroup.add(lid);

        // Metal bands
        const bandGeom = new THREE.BoxGeometry(0.85, 0.05, 0.05);
        const metalMat = this.getCachedMaterial(0x4a4a4a, { roughness: 0.4, metalness: 0.8 });
        const band1 = new THREE.Mesh(bandGeom, metalMat);
        band1.position.y = 0.15;
        chestGroup.add(band1);

        chestGroup.position.set(x, 0, z);
        this.scene.add(chestGroup);
        this.decorations.push(chestGroup);
    }

    /**
     * Place barrel
     */
    placeBarrel(x, z) {
        const barrelGeom = new THREE.CylinderGeometry(0.3, 0.35, 0.8, 12);
        const woodMat = this.getCachedMaterial(0x5a3a1a, { roughness: 0.85 });
        const barrel = new THREE.Mesh(barrelGeom, woodMat);
        barrel.position.set(x, 0.4, z);

        this.scene.add(barrel);
        this.decorations.push(barrel);
    }

    /**
     * Place crate
     */
    placeCrate(x, z) {
        const size = 0.6 + Math.random() * 0.3;
        const crateGeom = new THREE.BoxGeometry(size, size, size);
        const woodMat = this.getCachedMaterial(0x6a4a2a, { roughness: 0.9 });
        const crate = new THREE.Mesh(crateGeom, woodMat);
        crate.position.set(x, size / 2, z);
        crate.rotation.y = Math.random() * Math.PI;

        this.scene.add(crate);
        this.decorations.push(crate);
    }

    /**
     * Place bookshelf
     */
    placeBookshelves(room) {
        const wallPoints = this.getWallMountPoints(room, 4);

        wallPoints.forEach(point => {
            const shelfGroup = new THREE.Group();

            // Back panel
            const backGeom = new THREE.BoxGeometry(1.5, 2, 0.1);
            const woodMat = this.getCachedMaterial(0x4a3020, { roughness: 0.8 });
            const back = new THREE.Mesh(backGeom, woodMat);
            back.position.y = 1;
            shelfGroup.add(back);

            // Shelves
            for (let i = 0; i < 4; i++) {
                const shelfGeom = new THREE.BoxGeometry(1.5, 0.05, 0.3);
                const shelf = new THREE.Mesh(shelfGeom, woodMat);
                shelf.position.set(0, 0.5 + i * 0.5, 0.1);
                shelfGroup.add(shelf);

                // Books on shelf
                for (let j = 0; j < 5; j++) {
                    const bookGeom = new THREE.BoxGeometry(0.15, 0.25, 0.2);
                    const bookColors = [0x8B0000, 0x00008B, 0x006400, 0x8B4513];
                    const bookMat = this.getCachedMaterial(
                        bookColors[Math.floor(Math.random() * bookColors.length)],
                        { roughness: 0.7 }
                    );
                    const book = new THREE.Mesh(bookGeom, bookMat);
                    book.position.set(
                        -0.6 + j * 0.3,
                        0.65 + i * 0.5,
                        0.15
                    );
                    book.rotation.y = (Math.random() - 0.5) * 0.2;
                    shelfGroup.add(book);
                }
            }

            shelfGroup.position.set(point.x, 0, point.z);
            this.scene.add(shelfGroup);
            this.decorations.push(shelfGroup);
        });
    }

    /**
     * Place book stack
     */
    placeBookStack(x, z) {
        const stackGroup = new THREE.Group();
        const bookCount = 3 + Math.floor(Math.random() * 3);

        for (let i = 0; i < bookCount; i++) {
            const bookGeom = new THREE.BoxGeometry(0.2, 0.05, 0.15);
            const bookColors = [0x8B0000, 0x00008B, 0x006400, 0x8B4513];
            const bookMat = this.getCachedMaterial(
                bookColors[Math.floor(Math.random() * bookColors.length)],
                { roughness: 0.7 }
            );
            const book = new THREE.Mesh(bookGeom, bookMat);
            book.position.y = i * 0.05 + 0.025;
            book.rotation.y = (Math.random() - 0.5) * 0.3;
            stackGroup.add(book);
        }

        stackGroup.position.set(x, 0, z);
        this.scene.add(stackGroup);
        this.decorations.push(stackGroup);
    }

    /**
     * Place weapon rack
     */
    placeWeaponRack(x, z) {
        const rackGroup = new THREE.Group();

        // Rack frame
        const frameGeom = new THREE.BoxGeometry(0.1, 1.5, 1);
        const woodMat = this.getCachedMaterial(0x4a2a1a, { roughness: 0.8 });
        const frame = new THREE.Mesh(frameGeom, woodMat);
        frame.position.y = 0.75;
        rackGroup.add(frame);

        // Mounted swords
        for (let i = 0; i < 3; i++) {
            const swordGroup = new THREE.Group();

            // Blade
            const bladeGeom = new THREE.BoxGeometry(0.05, 0.8, 0.05);
            const bladeMat = this.getCachedMaterial(0xcccccc, { roughness: 0.2, metalness: 0.9 });
            const blade = new THREE.Mesh(bladeGeom, bladeMat);
            swordGroup.add(blade);

            // Hilt
            const hiltGeom = new THREE.BoxGeometry(0.3, 0.05, 0.05);
            const hiltMat = this.getCachedMaterial(0x8B4513, { roughness: 0.7 });
            const hilt = new THREE.Mesh(hiltGeom, hiltMat);
            hilt.position.y = -0.4;
            swordGroup.add(hilt);

            swordGroup.position.set(0.1, 0.3 + i * 0.5, -0.3 + i * 0.3);
            swordGroup.rotation.z = Math.PI / 4;
            rackGroup.add(swordGroup);
        }

        rackGroup.position.set(x, 0, z);
        this.scene.add(rackGroup);
        this.decorations.push(rackGroup);
    }

    /**
     * Place armor stand
     */
    placeArmorStand(x, z) {
        const standGroup = new THREE.Group();

        // Base
        const baseGeom = new THREE.CylinderGeometry(0.3, 0.35, 0.1, 8);
        const woodMat = this.getCachedMaterial(0x4a2a1a, { roughness: 0.8 });
        const base = new THREE.Mesh(baseGeom, woodMat);
        base.position.y = 0.05;
        standGroup.add(base);

        // Pole
        const poleGeom = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
        const pole = new THREE.Mesh(poleGeom, woodMat);
        pole.position.y = 0.8;
        standGroup.add(pole);

        // Armor chest plate
        const chestGeom = new THREE.BoxGeometry(0.6, 0.7, 0.3);
        const armorMat = this.getCachedMaterial(0x888888, { roughness: 0.4, metalness: 0.8 });
        const chest = new THREE.Mesh(chestGeom, armorMat);
        chest.position.y = 1.2;
        standGroup.add(chest);

        // Helmet
        const helmetGeom = new THREE.SphereGeometry(0.2, 8, 8);
        const helmet = new THREE.Mesh(helmetGeom, armorMat);
        helmet.position.y = 1.7;
        standGroup.add(helmet);

        standGroup.position.set(x, 0, z);
        this.scene.add(standGroup);
        this.decorations.push(standGroup);
    }

    /**
     * Place shield on wall
     */
    placeShieldsOnWalls(room, count = 4) {
        const points = this.getWallMountPoints(room, count);

        points.forEach(point => {
            const shieldGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 16);
            const shieldMat = this.getCachedMaterial(0x888888, { roughness: 0.5, metalness: 0.6 });
            const shield = new THREE.Mesh(shieldGeom, shieldMat);
            shield.rotation.x = Math.PI / 2;
            shield.position.set(point.x, this.config.wallHeight * 0.6, point.z);

            this.scene.add(shield);
            this.decorations.push(shield);
        });
    }

    /**
     * Place skull decoration
     */
    placeSkull(x, z) {
        const skullGroup = new THREE.Group();

        // Skull
        const skullGeom = new THREE.SphereGeometry(0.12, 8, 8);
        const boneMat = this.getCachedMaterial(0xe0d0c0, { roughness: 0.8 });
        const skull = new THREE.Mesh(skullGeom, boneMat);
        skull.scale.set(1, 1.1, 0.9);
        skull.position.y = 0.1;
        skullGroup.add(skull);

        // Eye sockets
        const eyeGeom = new THREE.SphereGeometry(0.03, 6, 6);
        const eyeMat = this.getCachedMaterial(0x000000);
        const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
        leftEye.position.set(-0.04, 0.12, 0.1);
        skullGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
        rightEye.position.set(0.04, 0.12, 0.1);
        skullGroup.add(rightEye);

        skullGroup.position.set(x, 0, z);
        skullGroup.rotation.y = Math.random() * Math.PI * 2;
        this.scene.add(skullGroup);
        this.decorations.push(skullGroup);
    }

    /**
     * Place straw pile
     */
    placeStrawPile(x, z) {
        const strawGroup = new THREE.Group();

        for (let i = 0; i < 20; i++) {
            const strawGeom = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 4);
            const strawMat = this.getCachedMaterial(0xdaa520, { roughness: 0.9 });
            const straw = new THREE.Mesh(strawGeom, strawMat);
            straw.position.set(
                (Math.random() - 0.5) * 0.6,
                Math.random() * 0.1,
                (Math.random() - 0.5) * 0.6
            );
            straw.rotation.set(
                (Math.random() - 0.5) * Math.PI / 4,
                Math.random() * Math.PI * 2,
                (Math.random() - 0.5) * Math.PI / 4
            );
            strawGroup.add(straw);
        }

        strawGroup.position.set(x, 0, z);
        this.scene.add(strawGroup);
        this.decorations.push(strawGroup);
    }

    /**
     * Place coin pile
     */
    placeCoinPile(x, z) {
        const coinGroup = new THREE.Group();

        for (let i = 0; i < 10; i++) {
            const coinGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16);
            const coinMat = this.getCachedMaterial(0xFFD700, { roughness: 0.2, metalness: 0.9 });
            const coin = new THREE.Mesh(coinGeom, coinMat);
            coin.position.set(
                (Math.random() - 0.5) * 0.3,
                i * 0.02,
                (Math.random() - 0.5) * 0.3
            );
            coin.rotation.y = Math.random() * Math.PI;
            coinGroup.add(coin);
        }

        coinGroup.position.set(x, 0, z);
        this.scene.add(coinGroup);
        this.decorations.push(coinGroup);
    }

    // ===== UTILITY METHODS =====

    /**
     * Get room center position
     */
    getRoomCenter(room) {
        return {
            x: (room.x + room.width / 2) * this.config.cellSize,
            z: (room.y + room.height / 2) * this.config.cellSize
        };
    }

    /**
     * Get wall mount points for decorations
     */
    getWallMountPoints(room, count = 4) {
        const points = [];
        const spacing = Math.max(room.width, room.height) / (count + 1);

        // North wall
        for (let i = 1; i <= count; i++) {
            if (i * spacing < room.width - 1) {
                points.push({
                    x: (room.x + i * spacing) * this.config.cellSize,
                    z: (room.y + 0.5) * this.config.cellSize
                });
            }
        }

        return points.slice(0, count);
    }

    /**
     * Get or create cached material
     */
    getCachedMaterial(color, properties = {}) {
        const key = `${color}_${properties.roughness || 0.9}_${properties.metalness || 0.1}`;

        if (this.materialCache.has(key)) {
            return this.materialCache.get(key);
        }

        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: properties.roughness !== undefined ? properties.roughness : 0.9,
            metalness: properties.metalness !== undefined ? properties.metalness : 0.1,
            side: properties.side || THREE.FrontSide
        });

        this.materialCache.set(key, material);
        return material;
    }

    /**
     * Animate flames and candles
     */
    animateFlames(time) {
        this.decorations.forEach(decoration => {
            decoration.traverse(child => {
                if (child.userData.isFlame) {
                    // Flicker effect
                    const flicker = Math.sin(time * 8 + child.position.x) * 0.2 +
                                  Math.sin(time * 13 + child.position.z) * 0.1;
                    child.scale.setScalar(1 + flicker);
                }
                if (child.userData.isEmber) {
                    // Ember glow pulse
                    const pulse = Math.sin(time * 5 + child.position.x * 10) * 0.3 + 0.7;
                    if (child.material.emissiveIntensity !== undefined) {
                        child.material.emissiveIntensity = pulse;
                    }
                }
            });
        });
    }

    /**
     * Clear all decorations (for level transitions)
     */
    clearAll() {
        this.dispose();
    }

    /**
     * Dispose of all decorations
     */
    dispose() {
        this.decorations.forEach(decoration => {
            this.scene.remove(decoration);
            if (decoration.geometry) decoration.geometry.dispose();
            if (decoration.material) decoration.material.dispose();
        });

        this.lights.forEach(light => {
            this.scene.remove(light);
        });

        this.decorations = [];
        this.lights = [];
        this.materialCache.clear();
    }
}
