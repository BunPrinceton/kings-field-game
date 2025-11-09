// PaintingGallery.js - Manages painting collection and placement
import * as THREE from 'three';
import { Painting } from './Painting.js';

export class PaintingGallery {
    constructor(scene, manifestPath = '/assets/paintings/manifest.json') {
        this.scene = scene;
        this.manifestPath = manifestPath;

        // Painting data
        this.manifest = null;
        this.paintings = new Map(); // id -> painting data
        this.categories = new Map(); // category -> [painting ids]

        // Placed paintings tracking
        this.placedPaintings = new Map(); // location key -> Painting instance
        this.usageHistory = new Map(); // painting id -> times used

        // Configuration
        this.minRepeatDistance = 5; // Minimum rooms before repeating a painting
        this.recentPaintings = []; // Track recently placed paintings

        // Procedural generation (fallback)
        this.proceduralPaintings = this.initializePaintingData();
        this.textureCache = new Map();
    }

    initializePaintingData() {
        return {
            portraits: [
                {
                    title: "The Forgotten King",
                    artist: "Unknown",
                    description: "His name has been lost to time, but his gaze still pierces the veil between worlds. Some say he rules still, in the spaces between heartbeats.",
                    style: "Ancient Royal",
                    color: 0x3a2a1a
                },
                {
                    title: "The Last Sage",
                    artist: "Master Eldrin",
                    description: "The final keeper of the old magic. His eyes hold secrets that would drive lesser minds to madness.",
                    style: "Mystical",
                    color: 0x2a1a3a
                },
                {
                    title: "Knight of the Abyss",
                    artist: "Unknown",
                    description: "A warrior who descended too deep and returned... changed. His armor still gleams, but his face remains forever in shadow.",
                    style: "Dark Fantasy",
                    color: 0x1a1a2a
                },
                {
                    title: "The Merchant's Widow",
                    artist: "Court Painter",
                    description: "She waits at the threshold between life and death, her fortune unable to purchase her salvation.",
                    style: "Gothic",
                    color: 0x2a2a1a
                },
                {
                    title: "Child of the Moon",
                    artist: "Anonymous",
                    description: "Born under a lunar eclipse, this child's existence was considered both blessing and curse. Their current whereabouts remain unknown.",
                    style: "Ethereal",
                    color: 0x1a2a3a
                },
                {
                    title: "The Plague Doctor",
                    artist: "Survivor",
                    description: "When the darkness came, he tended to both the living and the dying, making no distinction between the two.",
                    style: "Macabre",
                    color: 0x2a1a1a
                }
            ],
            landscapes: [
                {
                    title: "The Last Battle",
                    artist: "War Chronicler",
                    description: "This landscape depicts the final siege before the darkness came. No army has stood here for a hundred years.",
                    style: "Historical",
                    color: 0x3a2a2a
                },
                {
                    title: "The Whispering Woods",
                    artist: "Mad Hermit",
                    description: "Trees that speak in tongues forgotten by men. To listen is to lose oneself in the verdant madness.",
                    style: "Supernatural",
                    color: 0x1a3a1a
                },
                {
                    title: "Ruins of the First Age",
                    artist: "Archaeological Society",
                    description: "Scholars debate whether this place truly existed, or if it's a memory from a timeline that never was.",
                    style: "Ancient Mystery",
                    color: 0x2a2a2a
                },
                {
                    title: "The Frozen Wastes",
                    artist: "Northern Explorer",
                    description: "Where winter never ends and the ice remembers everything that ever died within it.",
                    style: "Desolate",
                    color: 0x2a3a3a
                },
                {
                    title: "Valley of Lost Souls",
                    artist: "Unknown",
                    description: "Travelers report hearing distant songs from this valley. None who investigate ever return to confirm the source.",
                    style: "Haunted",
                    color: 0x1a1a1a
                }
            ],
            creatures: [
                {
                    title: "Ancient Drake",
                    artist: "Dragon Scholar",
                    description: "Scholars debate whether this creature truly existed, or if it's merely the fever dream of our collective nightmares.",
                    style: "Mythological",
                    color: 0x4a2a1a
                },
                {
                    title: "The Guardian Beast",
                    artist: "Temple Monks",
                    description: "Said to protect the sacred grove, this creature appears only to those who have lost their way.",
                    style: "Divine",
                    color: 0x3a3a2a
                },
                {
                    title: "Shadow Stalker",
                    artist: "Dungeon Survivor",
                    description: "Painted from memory by one of the few who encountered it and lived. The artist went blind shortly after completing this work.",
                    style: "Horror",
                    color: 0x1a1a1a
                },
                {
                    title: "Leviathan of the Deep",
                    artist: "Sailor's Tale",
                    description: "From the depths it rises, older than the stones themselves, hungrier than the void.",
                    style: "Oceanic Terror",
                    color: 0x1a2a3a
                }
            ]
        };
    }

    /**
     * Get a random painting from a specific category
     * @param {string} category - Category name (portrait, landscape, creature, etc)
     * @param {boolean} ensureVariety - Avoid recently used paintings
     * @returns {Object|null} Painting data
     */
    getRandomPainting(category = null, ensureVariety = true) {
        let candidateIds;

        if (category && this.categories.has(category)) {
            candidateIds = this.categories.get(category);
        } else {
            // Get all paintings if no category specified
            candidateIds = Array.from(this.paintings.keys());
        }

        if (candidateIds.length === 0) {
            console.warn(`No paintings found in category: ${category}`);
            return null;
        }

        // Filter out recently used paintings if ensuring variety
        if (ensureVariety && this.recentPaintings.length > 0) {
            const filtered = candidateIds.filter(id => !this.recentPaintings.includes(id));
            if (filtered.length > 0) {
                candidateIds = filtered;
            }
        }

        // Weighted random selection based on rarity and usage
        const id = this.selectWeightedRandom(candidateIds);
        const paintingData = this.paintings.get(id);

        // Track this painting
        this.trackPaintingUsage(id);

        return paintingData;
    }

    /**
     * Create a procedurally generated texture for a painting
     * @param {object} paintingData - Painting metadata
     * @param {number} width - Texture width
     * @param {number} height - Texture height
     * @returns {THREE.CanvasTexture} Generated texture
     */
    generatePaintingTexture(paintingData, width = 256, height = 256) {
        // Check cache first
        const cacheKey = `${paintingData.title}_${width}x${height}`;
        if (this.textureCache.has(cacheKey)) {
            return this.textureCache.get(cacheKey);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Background color from painting data
        const color = paintingData.color || 0x2a2a2a;
        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;

        // Create gradient background
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
        gradient.addColorStop(0, `rgb(${r + 30}, ${g + 30}, ${b + 30})`);
        gradient.addColorStop(1, `rgb(${r}, ${g}, ${b})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Add texture noise
        ctx.globalAlpha = 0.15;
        for (let i = 0; i < 2000; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const brightness = Math.random() * 100 + 100;
            ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
            ctx.fillRect(x, y, 1, 1);
        }
        ctx.globalAlpha = 1.0;

        // Add abstract shapes based on category
        this.addAbstractArt(ctx, width, height, paintingData);

        // Add vignette effect
        const vignette = ctx.createRadialGradient(width/2, height/2, width/4, width/2, height/2, width/2);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        // Create and cache texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        this.textureCache.set(cacheKey, texture);

        // Limit texture cache size to prevent memory bloat
        const MAX_TEXTURE_CACHE_SIZE = 50;
        if (this.textureCache.size > MAX_TEXTURE_CACHE_SIZE) {
            // Remove oldest texture (first in map)
            const firstKey = this.textureCache.keys().next().value;
            const oldTexture = this.textureCache.get(firstKey);
            if (oldTexture) oldTexture.dispose();
            this.textureCache.delete(firstKey);
        }

        return texture;
    }

    /**
     * Add abstract artistic elements based on painting category
     */
    addAbstractArt(ctx, width, height, paintingData) {
        const color = paintingData.color || 0x2a2a2a;
        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;

        // Different patterns for different categories
        if (paintingData.style?.includes('Portrait') || paintingData.title?.includes('King') ||
            paintingData.title?.includes('Knight') || paintingData.title?.includes('Sage')) {
            // Vertical strokes for portraits
            ctx.globalAlpha = 0.3;
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * width;
                const h = Math.random() * height * 0.7 + height * 0.2;
                const y = (height - h) / 2;
                ctx.fillStyle = `rgba(${r + 50}, ${g + 40}, ${b + 30}, 0.4)`;
                ctx.fillRect(x, y, 3, h);
            }
        } else if (paintingData.title?.includes('Drake') || paintingData.title?.includes('Beast') ||
                   paintingData.title?.includes('Stalker')) {
            // Jagged shapes for creatures
            ctx.globalAlpha = 0.4;
            for (let i = 0; i < 15; i++) {
                ctx.beginPath();
                const cx = Math.random() * width;
                const cy = Math.random() * height;
                const size = Math.random() * 30 + 20;

                ctx.moveTo(cx, cy);
                for (let j = 0; j < 6; j++) {
                    const angle = (j / 6) * Math.PI * 2;
                    const radius = size * (0.7 + Math.random() * 0.6);
                    ctx.lineTo(
                        cx + Math.cos(angle) * radius,
                        cy + Math.sin(angle) * radius
                    );
                }
                ctx.closePath();
                ctx.fillStyle = `rgba(${r + 40}, ${g + 30}, ${b + 20}, 0.3)`;
                ctx.fill();
            }
        } else {
            // Horizontal strokes for landscapes
            ctx.globalAlpha = 0.3;
            for (let i = 0; i < 25; i++) {
                const y = Math.random() * height;
                const w = Math.random() * width * 0.8 + width * 0.2;
                const x = (width - w) / 2;
                ctx.fillStyle = `rgba(${r + 40}, ${g + 50}, ${b + 40}, 0.3)`;
                ctx.fillRect(x, y, w, 2);
            }
        }

        ctx.globalAlpha = 1.0;
    }

    /**
     * Clear texture cache to free memory
     */
    clearCache() {
        for (const texture of this.textureCache.values()) {
            texture.dispose();
        }
        this.textureCache.clear();
    }

    /**
     * Load the paintings manifest (for image-based paintings)
     * @returns {Promise<boolean>} Success status
     */
    async loadManifest() {
        try {
            const response = await fetch(this.manifestPath);
            if (!response.ok) {
                throw new Error(`Failed to load manifest: ${response.status}`);
            }

            this.manifest = await response.json();
            this.processManifest();

            console.log(`Loaded ${this.paintings.size} paintings across ${this.categories.size} categories`);
            return true;
        } catch (error) {
            console.error('Failed to load painting manifest:', error);
            this.createFallbackManifest();
            return false;
        }
    }

    /**
     * Process the manifest and organize paintings by category
     */
    processManifest() {
        if (!this.manifest || !this.manifest.paintings) {
            console.warn('Invalid manifest format');
            return;
        }

        for (const paintingData of this.manifest.paintings) {
            // Add default values for missing fields
            const processedData = {
                ...paintingData,
                // Parse dimensions string (e.g., "200x200") to get aspect ratio
                width: this.calculateWidth(paintingData.dimensions),
                height: this.calculateHeight(paintingData.dimensions),
                rarity: paintingData.rarity || 'common',
                frameStyle: paintingData.frameStyle || this.selectFrameStyle(paintingData.category),
                hasLight: paintingData.hasLight !== false,
                name: paintingData.name || paintingData.id
            };

            // Store painting data
            this.paintings.set(processedData.id, processedData);

            // Track usage
            this.usageHistory.set(processedData.id, 0);

            // Organize by category
            const category = processedData.category || 'misc';
            if (!this.categories.has(category)) {
                this.categories.set(category, []);
            }
            this.categories.get(category).push(processedData.id);
        }
    }

    /**
     * Calculate painting width from dimensions string
     * @param {string} dimensions - Format: "WIDTHxHEIGHT"
     * @returns {number} Width in meters
     */
    calculateWidth(dimensions) {
        if (!dimensions) return 1.0;

        const parts = dimensions.split('x');
        const width = parseInt(parts[0]) || 200;
        const height = parseInt(parts[1]) || 200;

        // Scale to reasonable size (portraits ~0.8-1.2m, landscapes ~1.2-1.8m)
        const aspect = width / height;
        if (aspect > 1.2) {
            // Landscape
            return Math.min(1.8, 1.0 + aspect * 0.3);
        } else {
            // Portrait or square
            return Math.min(1.2, 0.8 + aspect * 0.2);
        }
    }

    /**
     * Calculate painting height from dimensions string
     * @param {string} dimensions - Format: "WIDTHxHEIGHT"
     * @returns {number} Height in meters
     */
    calculateHeight(dimensions) {
        if (!dimensions) return 1.2;

        const parts = dimensions.split('x');
        const width = parseInt(parts[0]) || 200;
        const height = parseInt(parts[1]) || 200;

        // Scale to reasonable size
        const aspect = width / height;
        if (aspect > 1.2) {
            // Landscape
            return Math.min(1.2, 0.8 / aspect + 0.4);
        } else {
            // Portrait or square
            return Math.min(1.4, 1.0 / aspect + 0.2);
        }
    }

    /**
     * Select appropriate frame style based on category
     * @param {string} category - Painting category
     * @returns {string} Frame style
     */
    selectFrameStyle(category) {
        const styles = {
            portrait: ['ornate', 'simple', 'rustic'],
            landscape: ['simple', 'rustic', 'gothic'],
            creature: ['gothic', 'rustic', 'ornate'],
            abstract: ['gothic', 'simple']
        };

        const categoryStyles = styles[category] || ['simple'];
        return categoryStyles[Math.floor(Math.random() * categoryStyles.length)];
    }

    /**
     * Create a fallback manifest with procedural paintings
     */
    createFallbackManifest() {
        console.log('Creating fallback painting manifest with procedural generation');

        const paintings = [];
        const categories = ['portrait', 'landscape', 'creature'];

        // Convert procedural paintings to manifest format
        categories.forEach(category => {
            const categoryKey = category + 's'; // portraits, landscapes, creatures
            const categoryPaintings = this.proceduralPaintings[categoryKey] || [];

            categoryPaintings.forEach((painting, i) => {
                const id = `${category}_${i}`;
                paintings.push({
                    id: id,
                    name: painting.title,
                    category: category,
                    path: null, // Will use procedural generation
                    width: 0.8 + Math.random() * 0.4,
                    height: 1.0 + Math.random() * 0.4,
                    rarity: 'common',
                    frameStyle: ['simple', 'ornate', 'rustic', 'gothic'][Math.floor(Math.random() * 4)],
                    hasLight: true,
                    procedural: true,
                    proceduralData: painting
                });
            });
        });

        this.manifest = { paintings };
        this.processManifest();
    }

    /**
     * Get painting data by ID (supports both manifest and procedural)
     * @param {string} id - Painting ID
     * @returns {Object|null} Painting data
     */
    getPaintingById(id) {
        return this.paintings.get(id) || null;
    }

    /**
     * Get all paintings
     * @returns {Array<Object>} Array of painting data
     */
    getAllPaintings() {
        return Array.from(this.paintings.values());
    }

    /**
     * Get all paintings in a category
     * @param {string} category - Category name
     * @returns {Array<Object>} Array of painting data
     */
    getPaintingsByCategory(category) {
        const ids = this.categories.get(category) || [];
        return ids.map(id => this.paintings.get(id));
    }

    /**
     * Get available categories
     * @returns {Array<string>} Category names
     */
    getCategories() {
        return Array.from(this.categories.keys());
    }

    /**
     * Select a painting using weighted random based on rarity and usage
     * @param {Array<string>} candidateIds - Candidate painting IDs
     * @returns {string} Selected painting ID
     */
    selectWeightedRandom(candidateIds) {
        const weights = candidateIds.map(id => {
            const painting = this.paintings.get(id);
            const usageCount = this.usageHistory.get(id) || 0;

            // Rarity weights
            const rarityWeights = {
                'common': 10,
                'uncommon': 5,
                'rare': 2,
                'legendary': 1
            };

            const rarityWeight = rarityWeights[painting.rarity] || 5;

            // Penalize frequently used paintings
            const usagePenalty = Math.max(1, usageCount + 1);

            return rarityWeight / usagePenalty;
        });

        // Calculate total weight
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);

        // Random selection
        let random = Math.random() * totalWeight;
        for (let i = 0; i < candidateIds.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return candidateIds[i];
            }
        }

        // Fallback to last item
        return candidateIds[candidateIds.length - 1];
    }

    /**
     * Track painting usage for variety management
     * @param {string} id - Painting ID
     */
    trackPaintingUsage(id) {
        // Increment usage count
        const currentCount = this.usageHistory.get(id) || 0;
        this.usageHistory.set(id, currentCount + 1);

        // Add to recent list
        this.recentPaintings.push(id);

        // Maintain recent list size
        if (this.recentPaintings.length > this.minRepeatDistance) {
            this.recentPaintings.shift();
        }
    }

    /**
     * Create and place a painting on a wall
     * @param {Object} paintingData - Painting data from manifest
     * @param {THREE.Vector3} position - World position
     * @param {THREE.Vector3} normal - Wall normal
     * @param {string} frameStyleOverride - Optional frame style override
     * @returns {Promise<Painting>} Painting instance
     */
    async placePainting(paintingData, position, normal, frameStyleOverride = null) {
        const frameStyle = frameStyleOverride || paintingData.frameStyle || 'simple';
        const painting = new Painting(paintingData, frameStyle);

        // If this is a procedural painting, generate the texture
        if (paintingData.procedural && paintingData.proceduralData) {
            const texture = this.generatePaintingTexture(paintingData.proceduralData, 512, 512);
            painting.texture = texture;
            painting.createCanvas();
            painting.createFrame(frameStyle);
            if (paintingData.hasLight !== false) {
                painting.createLight();
            }
            painting.isLoaded = true;
        } else {
            await painting.load();
        }

        painting.placeOnWall(position, normal);

        // Add to scene
        this.scene.add(painting.getGroup());

        // Track placement
        const locationKey = `${position.x},${position.y},${position.z}`;
        this.placedPaintings.set(locationKey, painting);

        return painting;
    }

    /**
     * Remove a placed painting
     * @param {THREE.Vector3} position - World position of painting
     */
    removePainting(position) {
        const locationKey = `${position.x},${position.y},${position.z}`;
        const painting = this.placedPaintings.get(locationKey);

        if (painting) {
            this.scene.remove(painting.getGroup());
            painting.dispose();
            this.placedPaintings.delete(locationKey);
        }
    }

    /**
     * Get usage statistics
     * @returns {Object} Statistics about painting usage
     */
    getStats() {
        const totalPaintings = this.paintings.size;
        const totalPlaced = this.placedPaintings.size;

        // Most used painting
        let mostUsedId = null;
        let mostUsedCount = 0;
        for (const [id, count] of this.usageHistory.entries()) {
            if (count > mostUsedCount) {
                mostUsedCount = count;
                mostUsedId = id;
            }
        }

        const mostUsed = mostUsedId ? this.paintings.get(mostUsedId) : null;

        return {
            totalPaintings,
            totalPlaced,
            categories: this.categories.size,
            mostUsed: mostUsed ? {
                name: mostUsed.name,
                count: mostUsedCount
            } : null
        };
    }

    /**
     * Clean up all placed paintings
     */
    dispose() {
        for (const painting of this.placedPaintings.values()) {
            this.scene.remove(painting.getGroup());
            painting.dispose();
        }

        this.placedPaintings.clear();
        this.usageHistory.clear();
        this.recentPaintings = [];
        this.clearCache();
    }
}
