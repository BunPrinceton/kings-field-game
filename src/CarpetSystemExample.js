// CarpetSystemExample.js - Example of integrating the carpet system
import { CarpetDecorator } from './CarpetDecorator.js';

/**
 * Example integration of the carpet system into the main game
 *
 * Usage in main.js:
 *
 * import { CarpetDecorator } from './CarpetDecorator.js';
 *
 * // After dungeon generation and before rendering:
 * const carpetDecorator = new CarpetDecorator(scene, dungeonData, {
 *     cellSize: 4,
 *     carpetDensity: 0.35, // 35% of rooms get carpets
 *     basePath: '/assets/carpets/'
 * });
 *
 * // Load assets (async)
 * await carpetDecorator.loadAssets();
 *
 * // Decorate rooms with carpets
 * carpetDecorator.decorateRooms();
 *
 * // Optional: Get statistics
 * const stats = carpetDecorator.getStats();
 * console.log('Carpet stats:', stats);
 */

export class CarpetSystemExample {
    constructor(scene, dungeonGenerator) {
        this.scene = scene;
        this.dungeonGenerator = dungeonGenerator;
        this.carpetDecorator = null;
    }

    /**
     * Initialize and load the carpet system
     */
    async init() {
        console.log('Initializing carpet system...');

        // Get dungeon data from generator
        const dungeonData = this.dungeonGenerator.getDungeonData();

        // Create carpet decorator
        this.carpetDecorator = new CarpetDecorator(this.scene, dungeonData, {
            cellSize: 4,
            carpetDensity: 0.35, // 35% of rooms
            basePath: '/assets/carpets/'
        });

        // Load assets
        const success = await this.carpetDecorator.loadAssets();

        if (!success) {
            console.error('Failed to load carpet assets');
            return false;
        }

        console.log('Carpet system initialized');
        return true;
    }

    /**
     * Decorate the dungeon with carpets
     */
    decorate() {
        if (!this.carpetDecorator) {
            console.error('Carpet system not initialized');
            return;
        }

        // Place carpets in rooms
        this.carpetDecorator.decorateRooms();

        // Log statistics
        const stats = this.carpetDecorator.getStats();
        console.log('Carpets placed:', stats.total);
        console.log('By type:', stats.byType);
    }

    /**
     * Update method (called each frame if needed)
     */
    update(deltaTime) {
        if (this.carpetDecorator) {
            this.carpetDecorator.update(deltaTime);
        }
    }

    /**
     * Clean up carpets
     */
    cleanup() {
        if (this.carpetDecorator) {
            this.carpetDecorator.clearCarpets();
        }
    }
}

/**
 * Standalone function to add carpets to an existing scene
 */
export async function addCarpetsToScene(scene, dungeonData, config = {}) {
    const decorator = new CarpetDecorator(scene, dungeonData, config);

    // Load assets
    const success = await decorator.loadAssets();
    if (!success) {
        throw new Error('Failed to load carpet assets');
    }

    // Place carpets
    decorator.decorateRooms();

    return decorator;
}

export default CarpetSystemExample;
