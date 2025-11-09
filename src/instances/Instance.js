// Instance.js - Base class for all instance zones
import * as THREE from 'three';

/**
 * Base Instance class - Represents a separate zone/area with its own scene
 */
export class Instance {
    constructor(definition, config = {}) {
        this.id = definition.id || Math.random().toString(36).substr(2, 9);
        this.definition = definition;
        this.config = config;

        // State
        this.isLoaded = false;
        this.isCompleted = false;
        this.isLocked = definition.lockDoors || false;
        this.visitCount = 0;
        this.completionTime = null;

        // Scene management
        this.scene = null;
        this.meshes = [];
        this.lights = [];
        this.interactables = new Map();
        this.entities = []; // NPCs, enemies, etc.

        // Exit portal reference
        this.exitPortal = null;

        // Custom data for instance-specific logic
        this.customData = {};
    }

    /**
     * Load the instance - create scene, geometry, entities
     */
    async load() {
        if (this.isLoaded) {
            console.warn(`Instance ${this.definition.name} is already loaded`);
            return;
        }

        console.log(`Loading instance: ${this.definition.name}`);

        // Create scene
        this.scene = new THREE.Scene();

        // Setup lighting
        this.setupLighting();

        // Setup fog
        this.setupFog();

        // Generate geometry
        await this.generateGeometry();

        // Place features
        this.placeFeatures();

        // Spawn entities
        this.spawnEntities();

        // Create exit portal (unless locked)
        if (!this.isLocked) {
            this.createExitPortal();
        }

        this.isLoaded = true;
        this.visitCount++;

        console.log(`Instance ${this.definition.name} loaded successfully`);
    }

    /**
     * Unload the instance - clean up all resources
     */
    unload() {
        if (!this.isLoaded) return;

        console.log(`Unloading instance: ${this.definition.name}`);

        // Dispose of all meshes
        for (const mesh of this.meshes) {
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(m => m.dispose());
                } else {
                    mesh.material.dispose();
                }
            }
            if (mesh.parent) {
                mesh.parent.remove(mesh);
            }
        }

        // Remove all lights
        for (const light of this.lights) {
            if (light.parent) {
                light.parent.remove(light);
            }
        }

        // Clear arrays
        this.meshes = [];
        this.lights = [];
        this.interactables.clear();
        this.entities = [];

        // Clear scene
        if (this.scene) {
            while (this.scene.children.length > 0) {
                this.scene.remove(this.scene.children[0]);
            }
        }

        this.scene = null;
        this.isLoaded = false;

        console.log(`Instance ${this.definition.name} unloaded`);
    }

    /**
     * Setup lighting based on preset
     */
    setupLighting() {
        const def = this.definition;
        const ambientIntensity = def.ambientIntensity || 0.4;

        // Ambient light
        const ambient = new THREE.AmbientLight(0xffffff, ambientIntensity);
        this.scene.add(ambient);
        this.lights.push(ambient);

        // Directional light (soft top-down)
        const directional = new THREE.DirectionalLight(0xffffff, 0.3);
        directional.position.set(0, 10, 0);
        this.scene.add(directional);
        this.lights.push(directional);

        // Lighting preset colors
        const presetColors = this.getLightingPresetColor(def.lighting);
        if (presetColors) {
            // Add colored ambient light
            const coloredAmbient = new THREE.AmbientLight(presetColors.ambient, presetColors.intensity);
            this.scene.add(coloredAmbient);
            this.lights.push(coloredAmbient);
        }
    }

    /**
     * Get color values for lighting preset
     */
    getLightingPresetColor(preset) {
        const presets = {
            dramatic_red: { ambient: 0x440000, intensity: 0.3 },
            warm_library: { ambient: 0x443322, intensity: 0.4 },
            golden_vault: { ambient: 0x443300, intensity: 0.5 },
            peaceful_blue: { ambient: 0x223344, intensity: 0.4 },
            mystical_purple: { ambient: 0x332244, intensity: 0.3 },
            royal_gold: { ambient: 0x443311, intensity: 0.4 },
            holy_white: { ambient: 0xffffff, intensity: 0.6 },
            forge_orange: { ambient: 0x442200, intensity: 0.4 }
        };
        return presets[preset];
    }

    /**
     * Setup fog
     */
    setupFog() {
        const def = this.definition;
        if (def.fogColor !== undefined) {
            this.scene.fog = new THREE.Fog(
                def.fogColor,
                def.fogNear || 10,
                def.fogFar || 50
            );
        }
    }

    /**
     * Generate basic geometry - override in subclasses for custom shapes
     */
    async generateGeometry() {
        const size = this.definition.size;
        const width = size.width;
        const depth = size.depth;
        const height = size.height;

        // Create floor
        const floorGeometry = new THREE.PlaneGeometry(width, depth);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.9,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        this.scene.add(floor);
        this.meshes.push(floor);

        // Create ceiling
        const ceilingGeometry = new THREE.PlaneGeometry(width, depth);
        const ceilingMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.8,
            metalness: 0.1,
            side: THREE.DoubleSide
        });
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = height;
        this.scene.add(ceiling);
        this.meshes.push(ceiling);

        // Create walls
        this.createWalls(width, depth, height);
    }

    /**
     * Create walls around the instance
     */
    createWalls(width, depth, height) {
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.85,
            metalness: 0.15
        });

        // North wall
        const northWall = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height),
            wallMaterial
        );
        northWall.position.set(0, height / 2, -depth / 2);
        this.scene.add(northWall);
        this.meshes.push(northWall);

        // South wall
        const southWall = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height),
            wallMaterial
        );
        southWall.position.set(0, height / 2, depth / 2);
        southWall.rotation.y = Math.PI;
        this.scene.add(southWall);
        this.meshes.push(southWall);

        // East wall
        const eastWall = new THREE.Mesh(
            new THREE.PlaneGeometry(depth, height),
            wallMaterial
        );
        eastWall.position.set(width / 2, height / 2, 0);
        eastWall.rotation.y = -Math.PI / 2;
        this.scene.add(eastWall);
        this.meshes.push(eastWall);

        // West wall
        const westWall = new THREE.Mesh(
            new THREE.PlaneGeometry(depth, height),
            wallMaterial
        );
        westWall.position.set(-width / 2, height / 2, 0);
        westWall.rotation.y = Math.PI / 2;
        this.scene.add(westWall);
        this.meshes.push(westWall);
    }

    /**
     * Place features based on definition - override in subclasses
     */
    placeFeatures() {
        // Base implementation - subclasses should override
        console.log(`Placing features for ${this.definition.name}`);
    }

    /**
     * Spawn entities (NPCs, enemies, etc.) - override in subclasses
     */
    spawnEntities() {
        // Base implementation - subclasses should override
        console.log(`Spawning entities for ${this.definition.name}`);
    }

    /**
     * Create exit portal
     */
    createExitPortal() {
        const portalGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 16);
        const portalMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 0.7
        });
        const portal = new THREE.Mesh(portalGeometry, portalMaterial);
        portal.position.set(0, 0.05, this.definition.size.depth / 2 - 3);
        portal.userData.isExitPortal = true;
        this.scene.add(portal);
        this.meshes.push(portal);
        this.exitPortal = portal;

        // Add light
        const light = new THREE.PointLight(0x00ff88, 2, 10);
        light.position.copy(portal.position);
        light.position.y = 1;
        this.scene.add(light);
        this.lights.push(light);
    }

    /**
     * Update instance (called every frame)
     */
    update(deltaTime, player) {
        // Animate exit portal
        if (this.exitPortal) {
            this.exitPortal.rotation.y += deltaTime * 0.5;
            this.exitPortal.position.y = 0.05 + Math.sin(Date.now() * 0.001) * 0.1;
        }

        // Update entities
        for (const entity of this.entities) {
            if (entity.update) {
                entity.update(deltaTime, player);
            }
        }
    }

    /**
     * Mark instance as completed
     */
    complete() {
        if (this.isCompleted) return;

        this.isCompleted = true;
        this.completionTime = Date.now();

        // Unlock doors if locked
        if (this.isLocked) {
            this.unlock();
        }

        console.log(`Instance ${this.definition.name} completed!`);
    }

    /**
     * Unlock instance doors
     */
    unlock() {
        this.isLocked = false;

        // Create exit portal if it doesn't exist
        if (!this.exitPortal) {
            this.createExitPortal();
        }

        console.log(`Instance ${this.definition.name} unlocked`);
    }

    /**
     * Get spawn position for player
     */
    getSpawnPosition() {
        return {
            x: 0,
            y: 1.6,
            z: -this.definition.size.depth / 2 + 5
        };
    }

    /**
     * Check if player is near exit portal
     */
    isPlayerNearExit(playerPosition) {
        if (!this.exitPortal) return false;

        const portalPos = this.exitPortal.position;
        const distance = Math.sqrt(
            Math.pow(playerPosition.x - portalPos.x, 2) +
            Math.pow(playerPosition.z - portalPos.z, 2)
        );

        return distance < 2.5;
    }

    /**
     * Serialize instance state for saving
     */
    serialize() {
        return {
            id: this.id,
            isCompleted: this.isCompleted,
            visitCount: this.visitCount,
            completionTime: this.completionTime,
            customData: this.customData
        };
    }

    /**
     * Restore instance state from save
     */
    deserialize(data) {
        this.isCompleted = data.isCompleted || false;
        this.visitCount = data.visitCount || 0;
        this.completionTime = data.completionTime || null;
        this.customData = data.customData || {};

        if (this.isCompleted && this.isLocked) {
            this.unlock();
        }
    }
}
