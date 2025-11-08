// TextureManager.js - Manages texture loading and PBR material creation
import * as THREE from 'three';

export class TextureManager {
    constructor(basePath = '/assets/textures/') {
        this.basePath = basePath;
        this.loader = new THREE.TextureLoader();

        // Cache loaded textures
        this.textureCache = new Map();

        // Cache created materials
        this.materialCache = new Map();

        // Track loading state
        this.loadingQueue = [];
        this.isLoading = false;
    }

    /**
     * Load a single texture with caching
     * @param {string} path - Relative path from basePath
     * @returns {Promise<THREE.Texture>}
     */
    async loadTexture(path) {
        const fullPath = this.basePath + path;

        // Return cached texture if exists
        if (this.textureCache.has(fullPath)) {
            return this.textureCache.get(fullPath);
        }

        return new Promise((resolve, reject) => {
            this.loader.load(
                fullPath,
                (texture) => {
                    // Configure texture for tiling
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;

                    this.textureCache.set(fullPath, texture);
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.warn(`Failed to load texture: ${fullPath}`, error);
                    reject(error);
                }
            );
        });
    }

    /**
     * Load a complete PBR texture set
     * @param {string} name - Texture set name (e.g., 'stone_brick')
     * @param {string} category - Category folder (e.g., 'walls', 'floors')
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} Object containing all texture maps
     */
    async loadPBRSet(name, category, options = {}) {
        const basePath = `${category}/${name}/`;
        const textureSet = {};

        try {
            // Load common PBR maps
            const maps = {
                diffuse: 'diffuse.jpg',
                normal: 'normal.jpg',
                roughness: 'roughness.jpg',
                ao: 'ao.jpg',
                displacement: 'displacement.jpg'
            };

            for (const [key, filename] of Object.entries(maps)) {
                try {
                    textureSet[key] = await this.loadTexture(basePath + filename);

                    // Apply repeat if specified
                    if (options.repeat) {
                        textureSet[key].repeat.set(options.repeat[0], options.repeat[1]);
                    }
                } catch (error) {
                    // Non-critical textures can be skipped
                    if (key !== 'diffuse' && key !== 'normal') {
                        console.warn(`Optional texture not found: ${key}`);
                    } else {
                        throw error;
                    }
                }
            }
        } catch (error) {
            console.error(`Failed to load PBR set: ${name}`, error);
        }

        return textureSet;
    }

    /**
     * Create a PBR material from a texture set
     * @param {Object} textureSet - Textures from loadPBRSet
     * @param {Object} properties - Additional material properties
     * @returns {THREE.MeshStandardMaterial}
     */
    createPBRMaterial(textureSet, properties = {}) {
        const materialConfig = {
            // Default PBR values
            roughness: 0.85,
            metalness: 0.1,
            ...properties
        };

        // Add texture maps if available
        if (textureSet.diffuse) {
            materialConfig.map = textureSet.diffuse;
        }

        if (textureSet.normal) {
            materialConfig.normalMap = textureSet.normal;
            materialConfig.normalScale = new THREE.Vector2(1, 1);
        }

        if (textureSet.roughness) {
            materialConfig.roughnessMap = textureSet.roughness;
        }

        if (textureSet.ao) {
            materialConfig.aoMap = textureSet.ao;
            materialConfig.aoMapIntensity = 1.0;
        }

        if (textureSet.displacement) {
            materialConfig.displacementMap = textureSet.displacement;
            materialConfig.displacementScale = 0.1;
        }

        return new THREE.MeshStandardMaterial(materialConfig);
    }

    /**
     * Get or create a cached material
     * @param {string} name - Material identifier
     * @param {Function} createFn - Function to create material if not cached
     * @returns {THREE.Material}
     */
    async getCachedMaterial(name, createFn) {
        if (this.materialCache.has(name)) {
            return this.materialCache.get(name);
        }

        const material = await createFn();
        this.materialCache.set(name, material);
        return material;
    }

    /**
     * Create a fallback material (solid color) when textures fail
     * @param {number} color - Hex color
     * @param {Object} properties - Material properties
     * @returns {THREE.MeshStandardMaterial}
     */
    createFallbackMaterial(color, properties = {}) {
        return new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.85,
            metalness: 0.1,
            ...properties
        });
    }

    /**
     * Preset material creators for common dungeon surfaces
     */
    async createWallMaterial(variant = 'default') {
        return this.getCachedMaterial(`wall_${variant}`, async () => {
            try {
                const textureSet = await this.loadPBRSet('stone_brick', 'walls', {
                    repeat: [2, 2]
                });
                return this.createPBRMaterial(textureSet, {
                    roughness: 0.9,
                    metalness: 0.05
                });
            } catch (error) {
                console.warn('Using fallback wall material');
                return this.createFallbackMaterial(0x3a3a3a, {
                    roughness: 0.85,
                    metalness: 0.15
                });
            }
        });
    }

    async createFloorMaterial(variant = 'default') {
        return this.getCachedMaterial(`floor_${variant}`, async () => {
            try {
                const textureSet = await this.loadPBRSet('stone_floor', 'floors', {
                    repeat: [1, 1]
                });
                return this.createPBRMaterial(textureSet, {
                    roughness: 0.9,
                    metalness: 0.1
                });
            } catch (error) {
                console.warn('Using fallback floor material');
                return this.createFallbackMaterial(0x2a2a2a, {
                    roughness: 0.9,
                    metalness: 0.1
                });
            }
        });
    }

    async createCeilingMaterial(variant = 'default') {
        return this.getCachedMaterial(`ceiling_${variant}`, async () => {
            try {
                const textureSet = await this.loadPBRSet('rough_stone', 'ceilings', {
                    repeat: [1, 1]
                });
                return this.createPBRMaterial(textureSet, {
                    roughness: 0.8,
                    metalness: 0.1,
                    side: THREE.DoubleSide
                });
            } catch (error) {
                console.warn('Using fallback ceiling material');
                return this.createFallbackMaterial(0x1a1a1a, {
                    roughness: 0.8,
                    metalness: 0.1,
                    side: THREE.DoubleSide
                });
            }
        });
    }

    async createWoodMaterial(aged = true) {
        return this.getCachedMaterial(`wood_${aged ? 'aged' : 'fresh'}`, async () => {
            try {
                const textureName = aged ? 'wood_weathered' : 'wood_planks';
                const textureSet = await this.loadPBRSet(textureName, 'props');
                return this.createPBRMaterial(textureSet, {
                    roughness: 0.8,
                    metalness: 0.0
                });
            } catch (error) {
                console.warn('Using fallback wood material');
                return this.createFallbackMaterial(0x4a3020, {
                    roughness: 0.8,
                    metalness: 0.0
                });
            }
        });
    }

    async createMetalMaterial(rusty = true) {
        return this.getCachedMaterial(`metal_${rusty ? 'rusty' : 'clean'}`, async () => {
            try {
                const textureName = rusty ? 'metal_rust' : 'metal_iron';
                const textureSet = await this.loadPBRSet(textureName, 'props');
                return this.createPBRMaterial(textureSet, {
                    roughness: rusty ? 0.9 : 0.4,
                    metalness: rusty ? 0.5 : 0.9
                });
            } catch (error) {
                console.warn('Using fallback metal material');
                return this.createFallbackMaterial(0x6a5a4a, {
                    roughness: 0.7,
                    metalness: 0.6
                });
            }
        });
    }

    /**
     * Preload common textures to reduce loading hitches
     * @returns {Promise<void>}
     */
    async preloadCommonTextures() {
        console.log('Preloading common textures...');

        const preloadTasks = [
            this.createWallMaterial(),
            this.createFloorMaterial(),
            this.createCeilingMaterial(),
            this.createWoodMaterial(true),
            this.createMetalMaterial(true)
        ];

        try {
            await Promise.all(preloadTasks);
            console.log('Texture preload complete');
        } catch (error) {
            console.warn('Some textures failed to preload:', error);
        }
    }

    /**
     * Dispose of all cached textures and materials
     */
    dispose() {
        // Dispose textures
        for (const texture of this.textureCache.values()) {
            texture.dispose();
        }
        this.textureCache.clear();

        // Dispose materials
        for (const material of this.materialCache.values()) {
            material.dispose();
        }
        this.materialCache.clear();
    }

    /**
     * Get texture memory usage statistics
     * @returns {Object} Memory usage info
     */
    getMemoryStats() {
        let textureCount = this.textureCache.size;
        let materialCount = this.materialCache.size;

        return {
            textures: textureCount,
            materials: materialCount,
            cacheSize: `${textureCount} textures, ${materialCount} materials`
        };
    }
}
