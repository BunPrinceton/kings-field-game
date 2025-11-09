// CarpetDecorator.js - Carpet placement system for dungeon rooms
import * as THREE from 'three';
import { POIType } from './DungeonGenerator.js';

/**
 * Manages carpet textures and placement in dungeon rooms
 */
export class CarpetDecorator {
    constructor(scene, dungeonData, config = {}) {
        this.scene = scene;
        this.dungeonData = dungeonData;
        this.config = {
            cellSize: config.cellSize || 4,
            carpetDensity: config.carpetDensity || 0.35, // 30-40% of suitable rooms
            basePath: config.basePath || '/assets/carpets/',
            ...config
        };

        this.carpets = [];
        this.textures = {};
        this.manifest = null;
        this.isLoaded = false;
    }

    /**
     * Load carpet manifest and textures
     */
    async loadAssets() {
        console.log('Loading carpet assets...');

        try {
            // Load manifest
            const response = await fetch(this.config.basePath + 'manifest.json');
            this.manifest = await response.json();

            // Load textures for each carpet type
            const textureLoader = new THREE.TextureLoader();

            for (const carpetDef of this.manifest.carpets.textures) {
                const textures = {};
                const basePath = this.config.basePath + carpetDef.path;

                // Load diffuse (color) map
                textures.diffuse = await this.loadTexture(textureLoader, basePath + carpetDef.maps.diffuse);

                // Load normal map
                textures.normal = await this.loadTexture(textureLoader, basePath + carpetDef.maps.normal);

                // Load roughness map
                textures.roughness = await this.loadTexture(textureLoader, basePath + carpetDef.maps.roughness);

                // Load AO map
                textures.ao = await this.loadTexture(textureLoader, basePath + carpetDef.maps.ao);

                // Load displacement map if available
                if (carpetDef.maps.displacement) {
                    textures.displacement = await this.loadTexture(textureLoader, basePath + carpetDef.maps.displacement);
                }

                // Store textures with proper settings
                this.setupTextureSettings(textures);
                this.textures[carpetDef.id] = {
                    definition: carpetDef,
                    textures: textures
                };

                console.log(`Loaded carpet: ${carpetDef.name}`);
            }

            this.isLoaded = true;
            console.log('Carpet assets loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load carpet assets:', error);
            return false;
        }
    }

    /**
     * Helper to load a single texture
     */
    loadTexture(loader, path) {
        return new Promise((resolve, reject) => {
            loader.load(
                path,
                (texture) => resolve(texture),
                undefined,
                (error) => {
                    console.error(`Failed to load texture: ${path}`, error);
                    reject(error);
                }
            );
        });
    }

    /**
     * Setup texture settings for proper rendering
     */
    setupTextureSettings(textures) {
        Object.values(textures).forEach(texture => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.anisotropy = 4; // Better quality at angles
        });
    }

    /**
     * Decorate all suitable rooms with carpets
     */
    decorateRooms() {
        if (!this.isLoaded) {
            console.error('Carpet assets not loaded. Call loadAssets() first.');
            return [];
        }

        console.log('Decorating rooms with carpets...');

        for (const room of this.dungeonData.rooms) {
            // Randomly decide if this room gets a carpet
            if (Math.random() < this.config.carpetDensity) {
                this.decorateRoom(room);
            }
        }

        console.log(`Placed ${this.carpets.length} carpets`);
        return this.carpets;
    }

    /**
     * Decorate a single room based on its type
     */
    decorateRoom(room) {
        const roomType = room.type || POIType.STANDARD;

        switch (roomType) {
            case POIType.BOSS:
            case POIType.LANDMARK:
                this.placeGrandCarpet(room);
                break;
            case POIType.TREASURE:
            case POIType.SAFE:
                this.placeMediumCarpet(room);
                break;
            case POIType.HUB:
                this.placeLargeCarpet(room);
                break;
            default:
                this.placeStandardCarpet(room);
        }
    }

    /**
     * Place a grand carpet for throne/boss rooms
     */
    placeGrandCarpet(room) {
        const size = this.getRoomSize(room);

        // Only place grand carpets in large rooms
        if (size.width < 6 || size.height < 6) {
            this.placeMediumCarpet(room);
            return;
        }

        const center = this.getRoomCenter(room);
        const carpetId = 'carpet_011'; // Yellow ornate carpet for grand rooms

        // 4x4 grand carpet
        const carpetSize = [4, 4];
        this.createCarpet(carpetId, center.x, center.z, carpetSize, Math.random() * Math.PI * 0.1);
    }

    /**
     * Place a large carpet for hub rooms
     */
    placeLargeCarpet(room) {
        const size = this.getRoomSize(room);

        if (size.width < 5 || size.height < 5) {
            this.placeMediumCarpet(room);
            return;
        }

        const center = this.getRoomCenter(room);
        const carpetId = 'carpet_012'; // Blue carpet for hubs

        // 3x3 large carpet
        const carpetSize = [3, 3];
        this.createCarpet(carpetId, center.x, center.z, carpetSize, Math.random() * Math.PI * 0.05);
    }

    /**
     * Place a medium carpet
     */
    placeMediumCarpet(room) {
        const center = this.getRoomCenter(room);
        const carpetId = 'carpet_016'; // Beige carpet for medium rooms

        // 2x2 medium carpet
        const carpetSize = [2, 2];
        this.createCarpet(carpetId, center.x, center.z, carpetSize, Math.random() * Math.PI * 0.1);
    }

    /**
     * Place a standard small carpet/mat
     */
    placeStandardCarpet(room) {
        const center = this.getRoomCenter(room);
        const carpetId = 'dirty_carpet'; // Worn carpet for standard rooms

        // 1x1 or 2x2 small mat
        const carpetSize = Math.random() > 0.5 ? [1, 1] : [2, 2];
        this.createCarpet(carpetId, center.x, center.z, carpetSize, Math.random() * Math.PI * 0.2);
    }

    /**
     * Create a carpet mesh with PBR materials
     */
    createCarpet(carpetId, x, z, size, rotation = 0) {
        const carpetData = this.textures[carpetId];
        if (!carpetData) {
            console.error(`Carpet type not found: ${carpetId}`);
            return null;
        }

        const { textures } = carpetData;
        const [width, depth] = size;

        // Create carpet geometry
        const geometry = new THREE.PlaneGeometry(
            width * this.config.cellSize,
            depth * this.config.cellSize
        );

        // Calculate texture repeat based on size
        const repeatX = width;
        const repeatY = depth;

        // Create PBR material
        const material = new THREE.MeshStandardMaterial({
            map: textures.diffuse,
            normalMap: textures.normal,
            roughnessMap: textures.roughness,
            aoMap: textures.ao,
            side: THREE.DoubleSide
        });

        // Apply texture repeating
        material.map.repeat.set(repeatX, repeatY);
        material.normalMap.repeat.set(repeatX, repeatY);
        material.roughnessMap.repeat.set(repeatX, repeatY);
        material.aoMap.repeat.set(repeatX, repeatY);

        // Add displacement if available
        if (textures.displacement) {
            material.displacementMap = textures.displacement;
            material.displacementMap.repeat.set(repeatX, repeatY);
            material.displacementScale = 0.05;
        }

        // Create mesh
        const carpet = new THREE.Mesh(geometry, material);

        // Position carpet just above the floor to prevent z-fighting
        carpet.rotation.x = -Math.PI / 2;
        carpet.rotation.z = rotation;
        carpet.position.set(x, 0.01, z);

        // Add metadata
        carpet.userData = {
            isCarpet: true,
            carpetId: carpetId,
            size: size,
            roomPosition: { x, z }
        };

        // Add to scene
        this.scene.add(carpet);
        this.carpets.push(carpet);

        return carpet;
    }

    /**
     * Get room center in world coordinates
     */
    getRoomCenter(room) {
        const centerX = (room.x + room.width / 2) * this.config.cellSize;
        const centerZ = (room.y + room.height / 2) * this.config.cellSize;
        return { x: centerX, z: centerZ };
    }

    /**
     * Get room dimensions
     */
    getRoomSize(room) {
        return {
            width: room.width,
            height: room.height
        };
    }

    /**
     * Remove all carpets from the scene
     */
    clearCarpets() {
        this.carpets.forEach(carpet => {
            carpet.geometry.dispose();
            carpet.material.map?.dispose();
            carpet.material.normalMap?.dispose();
            carpet.material.roughnessMap?.dispose();
            carpet.material.aoMap?.dispose();
            carpet.material.displacementMap?.dispose();
            carpet.material.dispose();
            this.scene.remove(carpet);
        });
        this.carpets = [];
    }

    /**
     * Update carpet rendering (if needed for animations/effects)
     */
    update(deltaTime) {
        // Future: Add subtle carpet movement/physics if needed
    }

    /**
     * Get all placed carpets
     */
    getCarpets() {
        return this.carpets;
    }

    /**
     * Get carpet statistics
     */
    getStats() {
        const stats = {
            total: this.carpets.length,
            byType: {}
        };

        this.carpets.forEach(carpet => {
            const id = carpet.userData.carpetId;
            stats.byType[id] = (stats.byType[id] || 0) + 1;
        });

        return stats;
    }
}

export default CarpetDecorator;
