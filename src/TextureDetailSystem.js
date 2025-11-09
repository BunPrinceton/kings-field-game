/**
 * Texture Detail System
 * Manages high-resolution textures for important objects while keeping
 * the rest of the game using lower-resolution textures for performance.
 * Creates that "rustic with selective modern detail" aesthetic.
 */

import * * THREE from 'three';

export class TextureDetailSystem {
    constructor(scene, config = {}) {
        this.scene = scene;

        this.config = {
            // LOD distances for texture swapping
            highDetailDistance: config.highDetailDistance || 8,      // Within 8 units = high res
            mediumDetailDistance: config.mediumDetailDistance || 16, // Within 16 units = medium
            lowDetailDistance: config.lowDetailDistance || 32,       // Beyond = low res

            // Texture resolutions
            highResolution: config.highResolution || 2048,     // For paintings, important items
            mediumResolution: config.mediumResolution || 512,  // Standard game textures
            lowResolution: config.lowResolution || 256,        // Distant objects

            // Performance settings
            maxHighResTextures: config.maxHighResTextures || 8, // Limit high-res textures loaded
            updateInterval: config.updateInterval || 0.5,       // Check LOD every 0.5 seconds
            asyncLoading: config.asyncLoading !== false,        // Load textures asynchronously

            // Visual settings
            enableParallax: config.enableParallax !== false,    // Parallax mapping for depth
            enableNormalMaps: config.enableNormalMaps !== false, // Normal maps for detail
            anisotropy: config.anisotropy || 16,                // Texture filtering quality

            ...config
        };

        // Texture management
        this.textureLoader = new THREE.TextureLoader();
        this.detailObjects = new Map(); // Objects with detail textures
        this.loadedTextures = new Map(); // Cache for loaded textures
        this.activeHighRes = new Set();  // Currently active high-res textures

        // LOD update timing
        this.lastUpdateTime = 0;
        this.updateTimer = 0;

        // Stats for debugging
        this.stats = {
            totalObjects: 0,
            highResActive: 0,
            mediumResActive: 0,
            lowResActive: 0,
            texturesLoaded: 0,
            memorySaved: 0
        };
    }

    /**
     * Register an object for detail texture management
     * @param {Object} object - The Three.js mesh object
     * @param {Object} textureConfig - Configuration for this object's textures
     */
    registerDetailObject(object, textureConfig) {
        const config = {
            type: textureConfig.type || 'standard', // 'painting', 'prop', 'decoration'
            priority: textureConfig.priority || 1,   // Higher priority gets high-res first

            // Texture paths for different LODs
            textures: {
                high: {
                    diffuse: textureConfig.highRes?.diffuse,
                    normal: textureConfig.highRes?.normal,
                    roughness: textureConfig.highRes?.roughness,
                    displacement: textureConfig.highRes?.displacement
                },
                medium: {
                    diffuse: textureConfig.mediumRes?.diffuse,
                    normal: textureConfig.mediumRes?.normal
                },
                low: {
                    diffuse: textureConfig.lowRes?.diffuse || textureConfig.mediumRes?.diffuse
                }
            },

            // Special effects for this object
            effects: {
                parallax: textureConfig.enableParallax !== false && this.config.enableParallax,
                normalMap: textureConfig.enableNormalMap !== false && this.config.enableNormalMaps,
                emissive: textureConfig.emissive || null,
                glowIntensity: textureConfig.glowIntensity || 0
            },

            // Current state
            currentLOD: 'low',
            isLoading: false,
            lastDistance: Infinity
        };

        this.detailObjects.set(object.uuid, {
            mesh: object,
            config: config,
            originalMaterial: object.material.clone() // Keep original for fallback
        });

        this.stats.totalObjects++;

        // Load low-res immediately
        this.loadTextureLOD(object.uuid, 'low');
    }

    /**
     * Register a painting with special high-detail treatment
     */
    registerPainting(painting, imageUrl, frameStyle = 'ornate') {
        const textureConfig = {
            type: 'painting',
            priority: 10, // Paintings get highest priority
            highRes: {
                diffuse: imageUrl,
                normal: this.generateProceduralNormalMap(frameStyle),
                roughness: this.generateFrameRoughnessMap(frameStyle)
            },
            mediumRes: {
                diffuse: this.createDownscaledUrl(imageUrl, 512)
            },
            lowRes: {
                diffuse: this.createDownscaledUrl(imageUrl, 128)
            },
            enableParallax: true,
            glowIntensity: 0.1 // Subtle glow for important art
        };

        this.registerDetailObject(painting, textureConfig);

        // Add special painting shaders
        this.applyPaintingShader(painting);
    }

    /**
     * Update LOD for all registered objects based on player position
     */
    update(playerPosition, deltaTime) {
        this.updateTimer += deltaTime;

        // Only update at intervals for performance
        if (this.updateTimer < this.config.updateInterval) {
            return;
        }
        this.updateTimer = 0;

        const playerPos = new THREE.Vector3(
            playerPosition.x,
            playerPosition.y,
            playerPosition.z
        );

        // Sort objects by priority and distance
        const sortedObjects = Array.from(this.detailObjects.entries())
            .map(([uuid, data]) => ({
                uuid,
                data,
                distance: playerPos.distanceTo(data.mesh.position),
                priority: data.config.priority
            }))
            .sort((a, b) => {
                // Sort by priority first, then distance
                if (Math.abs(a.priority - b.priority) > 0.5) {
                    return b.priority - a.priority;
                }
                return a.distance - b.distance;
            });

        // Reset counters
        let highResCount = 0;
        this.stats.highResActive = 0;
        this.stats.mediumResActive = 0;
        this.stats.lowResActive = 0;

        // Update LOD for each object
        for (const { uuid, data, distance } of sortedObjects) {
            const newLOD = this.calculateLOD(distance, highResCount);

            // Only update if LOD changed
            if (data.config.currentLOD !== newLOD && !data.config.isLoading) {
                this.loadTextureLOD(uuid, newLOD);
            }

            // Track active LOD counts
            if (newLOD === 'high') {
                highResCount++;
                this.stats.highResActive++;
            } else if (newLOD === 'medium') {
                this.stats.mediumResActive++;
            } else {
                this.stats.lowResActive++;
            }

            data.config.lastDistance = distance;
        }

        // Calculate memory saved
        this.calculateMemorySaved();
    }

    /**
     * Calculate appropriate LOD based on distance and limits
     */
    calculateLOD(distance, currentHighResCount) {
        // Respect high-res texture limit
        if (distance < this.config.highDetailDistance &&
            currentHighResCount < this.config.maxHighResTextures) {
            return 'high';
        } else if (distance < this.config.mediumDetailDistance) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Load textures for a specific LOD level
     */
    async loadTextureLOD(objectUuid, lod) {
        const objectData = this.detailObjects.get(objectUuid);
        if (!objectData) return;

        const { mesh, config } = objectData;
        config.isLoading = true;

        const texturePaths = config.textures[lod];
        if (!texturePaths || !texturePaths.diffuse) {
            config.isLoading = false;
            return;
        }

        try {
            // Load textures (use cache if available)
            const textures = await this.loadTextureSet(texturePaths, lod);

            // Create material based on LOD and type
            const material = this.createLODMaterial(textures, config, lod);

            // Apply to mesh
            mesh.material = material;
            mesh.material.needsUpdate = true;

            // Update state
            config.currentLOD = lod;
            config.isLoading = false;

            // Special effects for high-detail objects
            if (lod === 'high' && config.type === 'painting') {
                this.applyHighDetailEffects(mesh);
            }

        } catch (error) {
            console.warn(`Failed to load ${lod} textures for object:`, error);
            config.isLoading = false;
        }
    }

    /**
     * Load a set of textures with caching
     */
    async loadTextureSet(paths, lod) {
        const textures = {};

        for (const [type, path] of Object.entries(paths)) {
            if (!path) continue;

            const cacheKey = `${path}_${lod}`;

            // Check cache
            if (this.loadedTextures.has(cacheKey)) {
                textures[type] = this.loadedTextures.get(cacheKey);
            } else {
                // Load new texture
                const texture = await this.loadTextureAsync(path);

                // Configure texture based on LOD
                this.configureTexture(texture, lod);

                // Cache it
                this.loadedTextures.set(cacheKey, texture);
                textures[type] = texture;

                this.stats.texturesLoaded++;
            }
        }

        return textures;
    }

    /**
     * Load texture asynchronously
     */
    loadTextureAsync(path) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                path,
                (texture) => resolve(texture),
                undefined,
                (error) => reject(error)
            );
        });
    }

    /**
     * Configure texture settings based on LOD
     */
    configureTexture(texture, lod) {
        if (lod === 'high') {
            texture.anisotropy = this.config.anisotropy;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = true;
        } else if (lod === 'medium') {
            texture.anisotropy = Math.min(8, this.config.anisotropy);
            texture.minFilter = THREE.LinearMipmapNearestFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = true;
        } else {
            texture.anisotropy = 1;
            texture.minFilter = THREE.NearestFilter;
            texture.magFilter = THREE.NearestFilter;
            texture.generateMipmaps = false;
        }

        texture.needsUpdate = true;
    }

    /**
     * Create material based on LOD and available textures
     */
    createLODMaterial(textures, config, lod) {
        const materialConfig = {
            map: textures.diffuse,
            roughness: lod === 'high' ? 0.7 : 0.9,
            metalness: lod === 'high' ? 0.1 : 0.05
        };

        // Add normal map for medium/high LOD
        if (textures.normal && (lod === 'high' || lod === 'medium')) {
            materialConfig.normalMap = textures.normal;
            materialConfig.normalScale = new THREE.Vector2(
                lod === 'high' ? 1.0 : 0.5,
                lod === 'high' ? 1.0 : 0.5
            );
        }

        // Add roughness map for high LOD
        if (textures.roughness && lod === 'high') {
            materialConfig.roughnessMap = textures.roughness;
        }

        // Add displacement for ultra-high detail
        if (textures.displacement && lod === 'high' && config.effects.parallax) {
            materialConfig.displacementMap = textures.displacement;
            materialConfig.displacementScale = 0.05;
        }

        // Add emissive for special objects
        if (config.effects.emissive) {
            materialConfig.emissive = new THREE.Color(config.effects.emissive);
            materialConfig.emissiveIntensity = config.effects.glowIntensity;
        }

        return new THREE.MeshStandardMaterial(materialConfig);
    }

    /**
     * Apply special shaders for paintings
     */
    applyPaintingShader(painting) {
        // Custom shader for canvas texture and varnish effect
        const shader = {
            uniforms: {
                canvasTexture: { value: null },
                varnishStrength: { value: 0.3 },
                time: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D canvasTexture;
                uniform float varnishStrength;
                uniform float time;
                varying vec2 vUv;

                void main() {
                    vec4 color = texture2D(canvasTexture, vUv);

                    // Add subtle varnish shine
                    float shine = sin(vUv.x * 10.0 + time) * sin(vUv.y * 10.0 + time) * varnishStrength;
                    color.rgb += vec3(shine * 0.1);

                    gl_FragColor = color;
                }
            `
        };

        // Store shader for later use
        painting.userData.paintingShader = shader;
    }

    /**
     * Apply special effects for high-detail objects
     */
    applyHighDetailEffects(mesh) {
        // Add subtle glow/outline for important objects
        if (mesh.userData.outlineMesh) {
            this.scene.add(mesh.userData.outlineMesh);
        }
    }

    /**
     * Generate procedural normal map for painting frames
     */
    generateProceduralNormalMap(frameStyle) {
        // This would generate a normal map texture procedurally
        // For now, return a path to pre-made normal maps
        const normalMaps = {
            ornate: '/assets/textures/frames/ornate_normal.jpg',
            simple: '/assets/textures/frames/simple_normal.jpg',
            rustic: '/assets/textures/frames/rustic_normal.jpg'
        };
        return normalMaps[frameStyle] || normalMaps.simple;
    }

    /**
     * Generate roughness map for frame materials
     */
    generateFrameRoughnessMap(frameStyle) {
        const roughnessMaps = {
            ornate: '/assets/textures/frames/gold_roughness.jpg',
            simple: '/assets/textures/frames/wood_roughness.jpg',
            rustic: '/assets/textures/frames/worn_roughness.jpg'
        };
        return roughnessMaps[frameStyle] || roughnessMaps.simple;
    }

    /**
     * Create downscaled URL for lower LODs
     */
    createDownscaledUrl(originalUrl, resolution) {
        // In production, this would point to pre-generated lower-res versions
        // For now, we'll use the same URL and let the browser handle it
        return originalUrl;
    }

    /**
     * Calculate memory saved by using LOD system
     */
    calculateMemorySaved() {
        // Rough calculation: 2048x2048 RGBA = 16MB, 512x512 = 1MB, 256x256 = 0.25MB
        const highResSize = 16; // MB
        const medResSize = 1;   // MB
        const lowResSize = 0.25; // MB

        const wouldBeSize = this.stats.totalObjects * highResSize;
        const actualSize = (this.stats.highResActive * highResSize) +
                          (this.stats.mediumResActive * medResSize) +
                          (this.stats.lowResActive * lowResSize);

        this.stats.memorySaved = Math.round(wouldBeSize - actualSize);
    }

    /**
     * Get system stats for debugging
     */
    getStats() {
        return {
            ...this.stats,
            cacheSize: this.loadedTextures.size,
            detailObjectsCount: this.detailObjects.size
        };
    }

    /**
     * Clear cache and reset system
     */
    clear() {
        // Dispose of all textures
        for (const texture of this.loadedTextures.values()) {
            texture.dispose();
        }

        // Reset materials to originals
        for (const [uuid, data] of this.detailObjects.entries()) {
            data.mesh.material = data.originalMaterial;
        }

        // Clear collections
        this.loadedTextures.clear();
        this.detailObjects.clear();
        this.activeHighRes.clear();

        // Reset stats
        this.stats = {
            totalObjects: 0,
            highResActive: 0,
            mediumResActive: 0,
            lowResActive: 0,
            texturesLoaded: 0,
            memorySaved: 0
        };
    }
}