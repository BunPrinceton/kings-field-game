// CleaningPropsExample.js - Example usage of cleaning props decorator
import * as THREE from 'three';
import { CleaningPropsDecorator } from '../CleaningPropsDecorator.js';
import { CleaningPropType } from '../CleaningPropsManager.js';

/**
 * Example: Integrate cleaning props with dungeon generation
 */
export async function integrateCleaningProps(scene, dungeonData, config = {}) {
    console.log('=== Cleaning Props Integration Example ===');

    // Create decorator
    const decorator = new CleaningPropsDecorator(scene, dungeonData, {
        cellSize: config.cellSize || 4,
        wallHeight: config.wallHeight || 3,
        propDensity: 0.25,  // 25% of rooms get props
        basePath: '/assets/props/cleaning/',
        ...config
    });

    // Load models (GLB or procedural fallbacks)
    console.log('Loading cleaning prop models...');
    await decorator.loadModels();

    // Decorate all rooms automatically
    console.log('Decorating rooms with cleaning props...');
    const props = decorator.decorateRooms();

    console.log(`Placed ${props.length} cleaning props across ${dungeonData.rooms.length} rooms`);

    return decorator;
}

/**
 * Example: Manual prop placement
 */
export async function manualPropPlacement(scene) {
    console.log('=== Manual Prop Placement Example ===');

    const { CleaningPropsManager } = await import('../CleaningPropsManager.js');
    const propsManager = new CleaningPropsManager(scene);

    // Load models
    await propsManager.loadModels();

    // Place individual props
    const broom = propsManager.createProp(
        CleaningPropType.BROOM,
        { x: 5, y: 0, z: 5 },
        {
            rotation: Math.PI / 4,
            randomRotation: true
        }
    );

    const bucket = propsManager.createProp(
        CleaningPropType.BUCKET,
        { x: 6, y: 0, z: 5 }
    );

    const barrel = propsManager.createProp(
        CleaningPropType.BARREL,
        { x: 7, y: 0, z: 5 },
        { scale: 1.2 }
    );

    console.log('Placed broom, bucket, and barrel manually');

    return propsManager;
}

/**
 * Example: Create a custom cleaning corner
 */
export async function createCustomCleaningCorner(scene, position) {
    console.log('=== Custom Cleaning Corner Example ===');

    const { CleaningPropsManager } = await import('../CleaningPropsManager.js');
    const propsManager = new CleaningPropsManager(scene);

    await propsManager.loadModels();

    const { x, z } = position;

    // Arranged cleaning corner
    const props = [
        propsManager.createProp(CleaningPropType.BROOM, { x: x - 0.3, y: 0, z }, {
            rotation: Math.PI / 6
        }),
        propsManager.createProp(CleaningPropType.MOP, { x: x - 0.1, y: 0, z }, {
            rotation: Math.PI / 5
        }),
        propsManager.createProp(CleaningPropType.BUCKET, { x: x + 0.3, y: 0, z }),
        propsManager.createProp(CleaningPropType.BUCKET, { x: x + 0.5, y: 0, z: z + 0.3 }),
        propsManager.createProp(CleaningPropType.BRUSH, { x: x + 0.1, y: 0, z: z + 0.4 }),
        propsManager.createProp(CleaningPropType.RAG_PILE, { x: x - 0.3, y: 0, z: z + 0.5 })
    ];

    console.log(`Created cleaning corner at (${x}, ${z}) with ${props.length} props`);

    return { propsManager, props };
}

/**
 * Example: Storage room with lots of props
 */
export async function createStorageRoom(scene, roomBounds) {
    console.log('=== Storage Room Example ===');

    const { CleaningPropsManager } = await import('../CleaningPropsManager.js');
    const propsManager = new CleaningPropsManager(scene);

    await propsManager.loadModels();

    const { minX, maxX, minZ, maxZ } = roomBounds;
    const props = [];

    // Barrel cluster in corner
    props.push(
        propsManager.createProp(CleaningPropType.BARREL, { x: minX + 1, y: 0, z: minZ + 1 }),
        propsManager.createProp(CleaningPropType.BARREL, { x: minX + 1.8, y: 0, z: minZ + 1 }),
        propsManager.createProp(CleaningPropType.BARREL_SMALL, { x: minX + 1.4, y: 0, z: minZ + 1.8 })
    );

    // Crates along wall
    props.push(
        propsManager.createProp(CleaningPropType.CRATE, { x: maxX - 1, y: 0, z: minZ + 1 }, {
            rotation: Math.random() * Math.PI
        }),
        propsManager.createProp(CleaningPropType.CRATE, { x: maxX - 2, y: 0, z: minZ + 1 }, {
            rotation: Math.random() * Math.PI
        })
    );

    // Buckets scattered
    props.push(
        propsManager.createProp(CleaningPropType.BUCKET, { x: minX + 2.5, y: 0, z: maxZ - 1.5 }),
        propsManager.createProp(CleaningPropType.BUCKET, { x: maxX - 1.5, y: 0, z: maxZ - 1 })
    );

    // Sacks
    props.push(
        propsManager.createProp(CleaningPropType.SACK, { x: minX + 3, y: 0, z: minZ + 2 }),
        propsManager.createProp(CleaningPropType.SACK, { x: minX + 3.5, y: 0, z: minZ + 2.3 })
    );

    console.log(`Created storage room with ${props.length} props`);

    return { propsManager, props };
}

/**
 * Example: Integration with main.js or DungeonBuilder
 */
export const integrationExample = `
// In your main.js or DungeonBuilder.js

import { CleaningPropsDecorator } from './CleaningPropsDecorator.js';

class DungeonBuilder {
    async buildDungeon() {
        // ... existing dungeon generation code ...

        // Add cleaning props decoration
        this.cleaningPropsDecorator = new CleaningPropsDecorator(
            this.scene,
            this.dungeonData,
            {
                cellSize: this.cellSize,
                wallHeight: this.wallHeight,
                propDensity: 0.25  // Adjust to taste
            }
        );

        // Load and place props
        await this.cleaningPropsDecorator.loadModels();
        this.cleaningPropsDecorator.decorateRooms();

        console.log('Dungeon decorated with cleaning props');
    }

    dispose() {
        // ... existing cleanup code ...

        // Clean up props
        if (this.cleaningPropsDecorator) {
            this.cleaningPropsDecorator.dispose();
        }
    }
}
`;

/**
 * Example: Test scene with all prop types
 */
export async function createPropShowcase(scene) {
    console.log('=== Prop Showcase Example ===');

    const { CleaningPropsManager } = await import('../CleaningPropsManager.js');
    const propsManager = new CleaningPropsManager(scene);

    await propsManager.loadModels();

    const propTypes = Object.values(CleaningPropType);
    const spacing = 2;
    const props = [];

    propTypes.forEach((propType, index) => {
        const x = (index % 5) * spacing;
        const z = Math.floor(index / 5) * spacing;

        const prop = propsManager.createProp(propType, { x, y: 0, z });
        props.push(prop);

        console.log(`Placed ${propType} at (${x}, ${z})`);
    });

    console.log(`Created showcase with ${props.length} different prop types`);

    return { propsManager, props };
}
