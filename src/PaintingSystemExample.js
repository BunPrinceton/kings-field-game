// PaintingSystemExample.js - Example usage of the painting system
import * as THREE from 'three';
import { PaintingGallery } from './PaintingGallery.js';

/**
 * Example: Initialize and use the painting system
 */
export async function initializePaintingSystem(scene) {
    // Create the gallery manager
    const gallery = new PaintingGallery(scene);

    // Try to load manifest (will fallback to procedural generation)
    await gallery.loadManifest();

    console.log('Painting gallery initialized');
    console.log('Available categories:', gallery.getCategories());
    console.log('Total paintings:', gallery.getAllPaintings().length);

    return gallery;
}

/**
 * Example: Place paintings on dungeon walls
 */
export async function placePaintingsInDungeon(gallery, dungeonData, cellSize = 4) {
    const paintings = [];

    // Place paintings in rooms based on size
    for (const room of dungeonData.rooms) {
        const roomArea = room.width * room.height;

        // Only place paintings in medium to large rooms
        if (roomArea < 20) continue;

        // Determine painting category based on room type/POI
        let category = 'portrait'; // default

        // Check for POI
        const roomPOI = Array.from(dungeonData.pois.values()).find(
            poi => poi.room.id === room.id
        );

        if (roomPOI) {
            switch (roomPOI.type) {
                case 'treasure':
                    category = 'portrait'; // Portraits in treasure rooms
                    break;
                case 'hub':
                    category = 'landscape'; // Landscapes in main areas
                    break;
                case 'puzzle':
                    category = 'creature'; // Creatures in puzzle rooms
                    break;
            }
        }

        // Determine how many paintings to place based on room size
        let paintingCount = 0;
        if (roomArea > 50) {
            paintingCount = 2 + Math.floor(Math.random() * 2); // 2-3 paintings
        } else if (roomArea > 30) {
            paintingCount = 1 + Math.floor(Math.random() * 2); // 1-2 paintings
        } else {
            paintingCount = Math.random() < 0.5 ? 1 : 0; // Maybe 1 painting
        }

        // Place paintings on walls
        for (let i = 0; i < paintingCount; i++) {
            const paintingData = gallery.getRandomPainting(category);
            if (!paintingData) continue;

            // Find a suitable wall position
            const wallPos = findWallPosition(room, dungeonData, cellSize);
            if (wallPos) {
                const painting = await gallery.placePainting(
                    paintingData,
                    wallPos.position,
                    wallPos.normal
                );
                paintings.push(painting);
            }
        }
    }

    console.log(`Placed ${paintings.length} paintings in dungeon`);
    return paintings;
}

/**
 * Helper: Find a suitable wall position for a painting
 */
function findWallPosition(room, dungeonData, cellSize) {
    const wallPositions = [];

    // Check all four walls of the room
    const walls = [
        { side: 'north', normal: new THREE.Vector3(0, 0, 1) },
        { side: 'south', normal: new THREE.Vector3(0, 0, -1) },
        { side: 'east', normal: new THREE.Vector3(-1, 0, 0) },
        { side: 'west', normal: new THREE.Vector3(1, 0, 0) }
    ];

    for (const wall of walls) {
        let x, z;

        switch (wall.side) {
            case 'north':
                x = (room.x + room.width / 2) * cellSize;
                z = (room.y) * cellSize;
                break;
            case 'south':
                x = (room.x + room.width / 2) * cellSize;
                z = (room.y + room.height) * cellSize;
                break;
            case 'east':
                x = (room.x + room.width) * cellSize;
                z = (room.y + room.height / 2) * cellSize;
                break;
            case 'west':
                x = (room.x) * cellSize;
                z = (room.y + room.height / 2) * cellSize;
                break;
        }

        // Check if this wall position is valid (not a doorway)
        const gridX = Math.floor(x / cellSize);
        const gridZ = Math.floor(z / cellSize);

        if (isWall(gridX, gridZ, dungeonData)) {
            wallPositions.push({
                position: new THREE.Vector3(x, 1.5, z), // Eye level height
                normal: wall.normal
            });
        }
    }

    // Return a random valid wall position
    if (wallPositions.length > 0) {
        return wallPositions[Math.floor(Math.random() * wallPositions.length)];
    }

    return null;
}

/**
 * Helper: Check if a grid position is a wall
 */
function isWall(x, z, dungeonData) {
    if (!dungeonData.grid || !dungeonData.grid[z] || !dungeonData.grid[z][x]) {
        return false;
    }
    return dungeonData.grid[z][x] === 1; // 1 = wall
}

/**
 * Example: Test all frame styles
 */
export async function testFrameStyles(gallery, scene) {
    console.log('Testing all frame styles...');

    const frameStyles = ['simple', 'ornate', 'rustic', 'gothic'];
    const paintings = [];

    for (let i = 0; i < frameStyles.length; i++) {
        const paintingData = gallery.getRandomPainting('portrait');
        if (!paintingData) continue;

        const position = new THREE.Vector3(i * 2 - 3, 1.5, -5);
        const normal = new THREE.Vector3(0, 0, 1);

        const painting = await gallery.placePainting(
            paintingData,
            position,
            normal,
            frameStyles[i] // Override frame style
        );

        paintings.push(painting);
        console.log(`Placed ${frameStyles[i]} frame at position ${i}`);
    }

    return paintings;
}

/**
 * Example: Performance test - place many paintings
 */
export async function performanceTest(gallery, scene, count = 20) {
    console.log(`Performance test: Placing ${count} paintings...`);
    const startTime = performance.now();

    const paintings = [];
    const radius = 10;

    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const position = new THREE.Vector3(x, 1.5, z);
        const normal = new THREE.Vector3(-Math.cos(angle), 0, -Math.sin(angle));

        const paintingData = gallery.getRandomPainting();
        if (paintingData) {
            const painting = await gallery.placePainting(paintingData, position, normal);
            paintings.push(painting);
        }
    }

    const endTime = performance.now();
    console.log(`Placed ${paintings.length} paintings in ${(endTime - startTime).toFixed(2)}ms`);

    return paintings;
}

/**
 * Example: Get statistics
 */
export function printGalleryStats(gallery) {
    const stats = gallery.getStats();

    console.log('=== Painting Gallery Statistics ===');
    console.log(`Total paintings available: ${stats.totalPaintings}`);
    console.log(`Total paintings placed: ${stats.totalPlaced}`);
    console.log(`Categories: ${stats.categories}`);

    if (stats.mostUsed) {
        console.log(`Most used painting: ${stats.mostUsed.name} (${stats.mostUsed.count} times)`);
    }

    console.log('===================================');
}
