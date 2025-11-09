// FurnitureDecorator.js - Helper to populate rooms with appropriate furniture
import { FurnitureManager, FurnitureType, FurnitureCondition } from './FurnitureManager.js';
import { POIType } from './DungeonGenerator.js';

/**
 * Decorates dungeon rooms with contextually appropriate furniture
 */
export class FurnitureDecorator {
    constructor(scene, dungeonData, config = {}) {
        this.scene = scene;
        this.dungeonData = dungeonData;
        this.config = {
            cellSize: config.cellSize || 4,
            wallHeight: config.wallHeight || 3,
            furnitureDensity: config.furnitureDensity || 0.6, // 0-1
            ...config
        };

        this.furnitureManager = new FurnitureManager(scene, config);
        this.placedFurniture = [];
    }

    /**
     * Decorate all rooms in the dungeon
     */
    decorateRooms() {
        console.log('Decorating rooms with furniture...');

        for (const room of this.dungeonData.rooms) {
            this.decorateRoom(room);
        }

        console.log(`Placed ${this.placedFurniture.length} furniture pieces`);
        return this.placedFurniture;
    }

    /**
     * Decorate a single room based on its POI type
     */
    decorateRoom(room) {
        const roomType = room.type || POIType.STANDARD;

        switch (roomType) {
            case POIType.ENTRANCE:
                this.decorateEntranceRoom(room);
                break;
            case POIType.EXIT:
                this.decorateExitRoom(room);
                break;
            case POIType.TREASURE:
                this.decorateTreasureRoom(room);
                break;
            case POIType.BOSS:
                this.decorateBossRoom(room);
                break;
            case POIType.SAFE:
                this.decorateSafeRoom(room);
                break;
            case POIType.PUZZLE:
                this.decoratePuzzleRoom(room);
                break;
            case POIType.HUB:
                this.decorateHubRoom(room);
                break;
            case POIType.LANDMARK:
                this.decorateLandmarkRoom(room);
                break;
            default:
                this.decorateStandardRoom(room);
        }
    }

    /**
     * Entrance room decoration
     */
    decorateEntranceRoom(room) {
        const center = this.getRoomCenter(room);

        // Add benches for resting
        this.placeFurniture(FurnitureType.BENCH, center.x - 2, center.z + 1.5, Math.PI / 2, {
            condition: FurnitureCondition.GOOD
        });
        this.placeFurniture(FurnitureType.BENCH, center.x + 2, center.z + 1.5, Math.PI / 2, {
            condition: FurnitureCondition.GOOD
        });

        // Weapon rack near entrance
        this.placeFurniture(FurnitureType.WEAPON_RACK, center.x - 3, center.z - 2, 0, {
            condition: FurnitureCondition.GOOD
        });

        // Some crates
        this.placeFurniture(FurnitureType.CRATE_MEDIUM, center.x + 3, center.z - 1.5, Math.random() * Math.PI);
        this.placeFurniture(FurnitureType.BARREL_SMALL, center.x + 3.5, center.z - 2.5, 0);
    }

    /**
     * Exit room decoration
     */
    decorateExitRoom(room) {
        const center = this.getRoomCenter(room);

        // Add ornate doors at strategic positions
        if (room.width > 5 && room.height > 5) {
            this.placeFurniture(FurnitureType.ORNATE_DOOR, center.x, center.z - 2, 0, {
                condition: FurnitureCondition.PRISTINE,
                interactable: true
            });
        }

        // Candelabras for dramatic lighting
        this.placeFurniture(FurnitureType.CANDELABRA, center.x - 2, center.z + 2, 0, {
            condition: FurnitureCondition.GOOD
        });
        this.placeFurniture(FurnitureType.CANDELABRA, center.x + 2, center.z + 2, 0, {
            condition: FurnitureCondition.GOOD
        });
    }

    /**
     * Treasure room decoration
     */
    decorateTreasureRoom(room) {
        const center = this.getRoomCenter(room);

        // Multiple chests
        this.placeFurniture(FurnitureType.CHEST, center.x, center.z, Math.PI / 4, {
            condition: FurnitureCondition.GOOD,
            interactable: true
        });
        this.placeFurniture(FurnitureType.CHEST, center.x - 1.5, center.z + 1, 0, {
            condition: FurnitureCondition.WORN,
            interactable: true
        });
        this.placeFurniture(FurnitureType.CHEST, center.x + 1.5, center.z - 1, Math.PI / 3, {
            condition: FurnitureCondition.GOOD,
            interactable: true
        });

        // Weapon racks with treasures
        this.placeFurniture(FurnitureType.WEAPON_RACK, center.x - 2, center.z - 2, 0, {
            condition: FurnitureCondition.PRISTINE
        });
        this.placeFurniture(FurnitureType.ARMOR_STAND, center.x + 2, center.z - 2, Math.PI, {
            condition: FurnitureCondition.PRISTINE
        });

        // Crates and barrels with loot
        this.placeFurniture(FurnitureType.CRATE_LARGE, center.x - 2.5, center.z + 1.5, Math.random() * Math.PI);
        this.placeFurniture(FurnitureType.BARREL_LARGE, center.x + 2.5, center.z + 1.5, 0);
    }

    /**
     * Boss room decoration
     */
    decorateBossRoom(room) {
        const center = this.getRoomCenter(room);

        // Throne for the boss
        this.placeFurniture(FurnitureType.THRONE, center.x, center.z + 3, Math.PI, {
            condition: FurnitureCondition.PRISTINE
        });

        // Weapon racks (boss's collection)
        this.placeFurniture(FurnitureType.WEAPON_RACK, center.x - 3, center.z + 2, Math.PI / 2, {
            condition: FurnitureCondition.GOOD
        });
        this.placeFurniture(FurnitureType.WEAPON_RACK, center.x + 3, center.z + 2, -Math.PI / 2, {
            condition: FurnitureCondition.GOOD
        });

        // Armor stands
        this.placeFurniture(FurnitureType.ARMOR_STAND, center.x - 4, center.z + 1, 0, {
            condition: FurnitureCondition.GOOD
        });
        this.placeFurniture(FurnitureType.ARMOR_STAND, center.x + 4, center.z + 1, Math.PI, {
            condition: FurnitureCondition.GOOD
        });

        // Some broken furniture from previous battles
        this.placeFurniture(FurnitureType.BROKEN_FURNITURE, center.x - 2, center.z - 2, Math.random() * Math.PI);
        this.placeFurniture(FurnitureType.DEBRIS_PILE, center.x + 2, center.z - 2.5, 0);
    }

    /**
     * Safe room decoration (rest area)
     */
    decorateSafeRoom(room) {
        const center = this.getRoomCenter(room);

        // Beds for resting
        this.placeFurniture(FurnitureType.WOODEN_BED, center.x - 2, center.z + 1, Math.PI / 2, {
            condition: FurnitureCondition.GOOD
        });
        this.placeFurniture(FurnitureType.STRAW_BED, center.x - 2, center.z - 1.5, Math.PI / 2, {
            condition: FurnitureCondition.WORN
        });

        // Table and chairs for a rest stop
        this.placeFurniture(FurnitureType.ROUND_TABLE, center.x + 1.5, center.z, 0, {
            condition: FurnitureCondition.GOOD
        });
        this.placeFurniture(FurnitureType.WOODEN_CHAIR, center.x + 1, center.z - 1, Math.PI / 4, {
            condition: FurnitureCondition.GOOD
        });
        this.placeFurniture(FurnitureType.WOODEN_CHAIR, center.x + 2, center.z + 1, -Math.PI / 4, {
            condition: FurnitureCondition.GOOD
        });

        // Shelf with supplies
        this.placeFurniture(FurnitureType.SHELF, center.x + 3, center.z - 2, 0, {
            condition: FurnitureCondition.GOOD
        });

        // Candelabra for light
        this.placeFurniture(FurnitureType.CANDELABRA, center.x + 1.5, center.z, 0, {
            condition: FurnitureCondition.GOOD
        });
    }

    /**
     * Puzzle room decoration
     */
    decoratePuzzleRoom(room) {
        const center = this.getRoomCenter(room);

        // Lecterns with puzzle clues
        this.placeFurniture(FurnitureType.LECTERN, center.x - 2, center.z + 2, Math.PI / 4, {
            condition: FurnitureCondition.GOOD
        });
        this.placeFurniture(FurnitureType.LECTERN, center.x + 2, center.z + 2, -Math.PI / 4, {
            condition: FurnitureCondition.GOOD
        });

        // Bookcases with ancient knowledge
        this.placeFurniture(FurnitureType.BOOKCASE, center.x - 3, center.z - 1, Math.PI / 2, {
            condition: FurnitureCondition.WORN
        });

        // Some crates that might need to be moved
        this.placeFurniture(FurnitureType.CRATE_MEDIUM, center.x, center.z - 2, 0);
        this.placeFurniture(FurnitureType.CRATE_MEDIUM, center.x + 1, center.z - 2, Math.PI / 6);
    }

    /**
     * Hub room decoration (central gathering area)
     */
    decorateHubRoom(room) {
        const center = this.getRoomCenter(room);

        // Large banquet table
        this.placeFurniture(FurnitureType.BANQUET_TABLE, center.x, center.z, 0, {
            condition: FurnitureCondition.GOOD
        });

        // Chairs around the table
        const chairPositions = [
            [center.x - 2.5, center.z - 1],
            [center.x - 2.5, center.z + 1],
            [center.x, center.z - 1],
            [center.x, center.z + 1],
            [center.x + 2.5, center.z - 1],
            [center.x + 2.5, center.z + 1]
        ];
        chairPositions.forEach(([x, z]) => {
            this.placeFurniture(FurnitureType.WOODEN_CHAIR, x, z, Math.random() * Math.PI, {
                condition: FurnitureCondition.GOOD
            });
        });

        // Chandelier above (ceiling-mounted)
        this.placeFurniture(FurnitureType.CHANDELIER, center.x, this.config.wallHeight - 0.5, 0, {
            condition: FurnitureCondition.PRISTINE
        });

        // Weapon and armor storage along walls
        this.placeFurniture(FurnitureType.WEAPON_RACK, center.x - 4, center.z + 3, 0, {
            condition: FurnitureCondition.GOOD
        });
        this.placeFurniture(FurnitureType.ARMOR_STAND, center.x + 4, center.z + 3, Math.PI, {
            condition: FurnitureCondition.GOOD
        });

        // Barrel of supplies
        this.placeFurniture(FurnitureType.BARREL_LARGE, center.x - 4, center.z - 3, 0);
    }

    /**
     * Landmark room decoration
     */
    decorateLandmarkRoom(room) {
        const center = this.getRoomCenter(room);

        // Sarcophagus as landmark
        this.placeFurniture(FurnitureType.SARCOPHAGUS, center.x, center.z, 0, {
            condition: FurnitureCondition.WORN
        });

        // Surrounding candelabras
        this.placeFurniture(FurnitureType.CANDELABRA, center.x - 2, center.z + 2, 0, {
            condition: FurnitureCondition.GOOD
        });
        this.placeFurniture(FurnitureType.CANDELABRA, center.x + 2, center.z + 2, 0, {
            condition: FurnitureCondition.GOOD
        });
        this.placeFurniture(FurnitureType.CANDELABRA, center.x - 2, center.z - 2, 0, {
            condition: FurnitureCondition.GOOD
        });
        this.placeFurniture(FurnitureType.CANDELABRA, center.x + 2, center.z - 2, 0, {
            condition: FurnitureCondition.GOOD
        });

        // Weapon racks as offerings
        this.placeFurniture(FurnitureType.WEAPON_RACK, center.x - 3, center.z, Math.PI / 2, {
            condition: FurnitureCondition.WORN
        });
        this.placeFurniture(FurnitureType.SHIELD_RACK, center.x + 3, center.z, -Math.PI / 2, {
            condition: FurnitureCondition.WORN
        });
    }

    /**
     * Standard room decoration (varied based on room size)
     */
    decorateStandardRoom(room) {
        const center = this.getRoomCenter(room);
        const area = room.width * room.height;

        // Skip very small rooms
        if (area < 16) {
            // Small alcove - just debris or a single item
            if (Math.random() < 0.5) {
                this.placeFurniture(FurnitureType.DEBRIS_PILE, center.x, center.z, 0);
            } else {
                this.placeFurniture(FurnitureType.CRATE_SMALL, center.x, center.z, Math.random() * Math.PI, {
                    condition: FurnitureCondition.DAMAGED
                });
            }
            return;
        }

        // Determine room function randomly
        const roomFunction = Math.random();

        if (roomFunction < 0.15) {
            // Barracks/bedroom
            this.decorateBarracks(room, center);
        } else if (roomFunction < 0.3) {
            // Dining area
            this.decorateDiningArea(room, center);
        } else if (roomFunction < 0.45) {
            // Storage room
            this.decorateStorage(room, center);
        } else if (roomFunction < 0.6) {
            // Library/study
            this.decorateLibrary(room, center);
        } else if (roomFunction < 0.75) {
            // Armory
            this.decorateArmory(room, center);
        } else if (roomFunction < 0.85) {
            // Workshop
            this.decorateWorkshop(room, center);
        } else {
            // Abandoned/ruined
            this.decorateAbandoned(room, center);
        }
    }

    /**
     * Decorate as barracks
     */
    decorateBarracks(room, center) {
        // Beds
        this.placeFurniture(FurnitureType.STRAW_BED, center.x - 2, center.z - 1, Math.PI / 2, {
            condition: FurnitureCondition.WORN
        });
        this.placeFurniture(FurnitureType.STRAW_BED, center.x - 2, center.z + 1.5, Math.PI / 2, {
            condition: FurnitureCondition.WORN
        });

        // Storage
        this.placeFurniture(FurnitureType.CHEST, center.x + 2, center.z - 1, 0, {
            condition: FurnitureCondition.WORN,
            interactable: true
        });
        this.placeFurniture(FurnitureType.CHEST, center.x + 2, center.z + 1.5, 0, {
            condition: FurnitureCondition.DAMAGED,
            interactable: true
        });

        // Weapon rack
        this.placeFurniture(FurnitureType.WEAPON_RACK, center.x, center.z + 2.5, 0, {
            condition: FurnitureCondition.WORN
        });

        // Stool
        this.placeFurniture(FurnitureType.STOOL, center.x + 1, center.z, Math.random() * Math.PI, {
            condition: FurnitureCondition.DAMAGED
        });
    }

    /**
     * Decorate as dining area
     */
    decorateDiningArea(room, center) {
        // Table
        this.placeFurniture(FurnitureType.DINING_TABLE, center.x, center.z, 0, {
            condition: FurnitureCondition.WORN
        });

        // Chairs
        this.placeFurniture(FurnitureType.WOODEN_CHAIR, center.x - 1.5, center.z - 0.8, 0, {
            condition: FurnitureCondition.WORN
        });
        this.placeFurniture(FurnitureType.WOODEN_CHAIR, center.x + 1.5, center.z - 0.8, Math.PI, {
            condition: FurnitureCondition.DAMAGED
        });
        this.placeFurniture(FurnitureType.BENCH, center.x, center.z + 1, Math.PI, {
            condition: FurnitureCondition.WORN
        });

        // Barrels and crates (food storage)
        this.placeFurniture(FurnitureType.BARREL_LARGE, center.x - 2.5, center.z + 2, 0, {
            condition: FurnitureCondition.WORN
        });
        this.placeFurniture(FurnitureType.CRATE_MEDIUM, center.x + 2.5, center.z + 2, Math.random() * Math.PI, {
            condition: FurnitureCondition.DAMAGED
        });
    }

    /**
     * Decorate as storage room
     */
    decorateStorage(room, center) {
        // Multiple crates and barrels
        const storagePositions = [
            [center.x - 1.5, center.z - 1],
            [center.x + 1.5, center.z - 1],
            [center.x - 1.5, center.z + 1],
            [center.x + 1.5, center.z + 1],
            [center.x, center.z]
        ];

        storagePositions.forEach(([x, z], i) => {
            if (Math.random() > 0.5) {
                const size = Math.random() > 0.5 ? FurnitureType.CRATE_LARGE : FurnitureType.CRATE_MEDIUM;
                this.placeFurniture(size, x, z, Math.random() * Math.PI, {
                    condition: i < 2 ? FurnitureCondition.GOOD : FurnitureCondition.WORN
                });
            } else {
                const size = Math.random() > 0.5 ? FurnitureType.BARREL_LARGE : FurnitureType.BARREL_SMALL;
                this.placeFurniture(size, x, z, 0, {
                    condition: i < 2 ? FurnitureCondition.GOOD : FurnitureCondition.DAMAGED
                });
            }
        });

        // Shelf
        this.placeFurniture(FurnitureType.SHELF, center.x - 2.5, center.z + 2, 0, {
            condition: FurnitureCondition.WORN
        });
    }

    /**
     * Decorate as library
     */
    decorateLibrary(room, center) {
        // Bookcases
        this.placeFurniture(FurnitureType.BOOKCASE, center.x - 2.5, center.z - 2, Math.PI / 2, {
            condition: FurnitureCondition.WORN
        });
        this.placeFurniture(FurnitureType.BOOKCASE, center.x - 2.5, center.z + 1, Math.PI / 2, {
            condition: FurnitureCondition.GOOD
        });

        // Desk
        this.placeFurniture(FurnitureType.DESK, center.x + 1.5, center.z, Math.PI, {
            condition: FurnitureCondition.GOOD
        });

        // Chair
        this.placeFurniture(FurnitureType.WOODEN_CHAIR, center.x + 1.5, center.z + 1, Math.PI, {
            condition: FurnitureCondition.GOOD
        });

        // Lectern
        this.placeFurniture(FurnitureType.LECTERN, center.x - 1, center.z + 2, Math.PI / 4, {
            condition: FurnitureCondition.WORN
        });

        // Candelabra for reading light
        this.placeFurniture(FurnitureType.CANDELABRA, center.x + 1.5, center.z, 0, {
            condition: FurnitureCondition.GOOD
        });
    }

    /**
     * Decorate as armory
     */
    decorateArmory(room, center) {
        // Weapon racks
        this.placeFurniture(FurnitureType.WEAPON_RACK, center.x - 2, center.z - 2, 0, {
            condition: FurnitureCondition.GOOD
        });
        this.placeFurniture(FurnitureType.WEAPON_RACK, center.x + 2, center.z - 2, Math.PI, {
            condition: FurnitureCondition.WORN
        });

        // Armor stands
        this.placeFurniture(FurnitureType.ARMOR_STAND, center.x - 2, center.z + 1, 0, {
            condition: FurnitureCondition.GOOD
        });
        this.placeFurniture(FurnitureType.ARMOR_STAND, center.x, center.z + 1, 0, {
            condition: FurnitureCondition.GOOD
        });
        this.placeFurniture(FurnitureType.ARMOR_STAND, center.x + 2, center.z + 1, 0, {
            condition: FurnitureCondition.WORN
        });

        // Shield rack
        this.placeFurniture(FurnitureType.SHIELD_RACK, center.x - 2.5, center.z + 2.5, Math.PI / 4, {
            condition: FurnitureCondition.GOOD
        });

        // Crate of equipment
        this.placeFurniture(FurnitureType.CRATE_LARGE, center.x + 2.5, center.z + 2, Math.random() * Math.PI, {
            condition: FurnitureCondition.GOOD
        });
    }

    /**
     * Decorate as workshop
     */
    decorateWorkshop(room, center) {
        // Anvil
        this.placeFurniture(FurnitureType.ANVIL, center.x - 1.5, center.z, 0, {
            condition: FurnitureCondition.WORN
        });

        // Forge
        this.placeFurniture(FurnitureType.FORGE, center.x - 2.5, center.z - 2, 0, {
            condition: FurnitureCondition.DAMAGED
        });

        // Work table
        this.placeFurniture(FurnitureType.WORK_TABLE, center.x + 1.5, center.z, Math.PI / 2, {
            condition: FurnitureCondition.WORN
        });

        // Stool
        this.placeFurniture(FurnitureType.STOOL, center.x + 1.5, center.z + 1, 0, {
            condition: FurnitureCondition.DAMAGED
        });

        // Crates of materials
        this.placeFurniture(FurnitureType.CRATE_MEDIUM, center.x + 2.5, center.z + 2, Math.random() * Math.PI, {
            condition: FurnitureCondition.WORN
        });
        this.placeFurniture(FurnitureType.BOX, center.x + 2, center.z - 2, Math.random() * Math.PI, {
            condition: FurnitureCondition.DAMAGED
        });
    }

    /**
     * Decorate as abandoned/ruined room
     */
    decorateAbandoned(room, center) {
        // Broken furniture
        this.placeFurniture(FurnitureType.BROKEN_FURNITURE, center.x - 1, center.z - 1, Math.random() * Math.PI, {
            condition: FurnitureCondition.BROKEN
        });
        this.placeFurniture(FurnitureType.BROKEN_FURNITURE, center.x + 1.5, center.z + 1, Math.random() * Math.PI, {
            condition: FurnitureCondition.BROKEN
        });

        // Debris piles
        this.placeFurniture(FurnitureType.DEBRIS_PILE, center.x, center.z, 0);
        this.placeFurniture(FurnitureType.DEBRIS_PILE, center.x - 2, center.z + 1.5, 0);

        // Broken door leaning against wall
        this.placeFurniture(FurnitureType.BROKEN_DOOR, center.x + 2, center.z - 1.5, Math.PI / 6, {
            condition: FurnitureCondition.BROKEN
        });

        // Maybe a damaged chest
        if (Math.random() > 0.5) {
            this.placeFurniture(FurnitureType.CHEST, center.x - 1.5, center.z + 2, Math.random() * Math.PI, {
                condition: FurnitureCondition.BROKEN,
                interactable: false
            });
        }
    }

    /**
     * Helper to place furniture and track it
     */
    placeFurniture(type, x, z, rotation = 0, options = {}) {
        const furniture = this.furnitureManager.createFurniture(
            type,
            { x, y: 0, z },
            {
                rotation,
                ...options
            }
        );

        if (furniture) {
            this.placedFurniture.push(furniture);
        }

        return furniture;
    }

    /**
     * Get the world-space center of a room
     */
    getRoomCenter(room) {
        return {
            x: (room.x + room.width / 2) * this.config.cellSize,
            z: (room.y + room.height / 2) * this.config.cellSize
        };
    }

    /**
     * Add doors to corridors and room entrances
     */
    addDoorsToCorridors() {
        console.log('Adding doors to corridors...');
        let doorCount = 0;

        for (const room of this.dungeonData.rooms) {
            // Find corridor connections
            // This is a simplified approach - you could enhance it to detect actual doorways
            const roomEdges = this.getRoomEdges(room);

            // Add doors at some edges
            roomEdges.forEach(edge => {
                if (Math.random() < 0.3) { // 30% chance of door
                    const doorType = this.getRandomDoorType();
                    const furniture = this.furnitureManager.createFurniture(
                        doorType,
                        { x: edge.x, y: 0, z: edge.z },
                        {
                            rotation: edge.rotation,
                            condition: this.getRandomCondition(),
                            interactable: true
                        }
                    );

                    if (furniture) {
                        this.placedFurniture.push(furniture);
                        doorCount++;
                    }
                }
            });
        }

        console.log(`Added ${doorCount} doors`);
    }

    /**
     * Get edges of a room for door placement
     */
    getRoomEdges(room) {
        const edges = [];
        const center = this.getRoomCenter(room);

        // North edge
        edges.push({
            x: center.x,
            z: (room.y) * this.config.cellSize,
            rotation: 0
        });

        // South edge
        edges.push({
            x: center.x,
            z: (room.y + room.height) * this.config.cellSize,
            rotation: Math.PI
        });

        // West edge
        edges.push({
            x: (room.x) * this.config.cellSize,
            z: center.z,
            rotation: -Math.PI / 2
        });

        // East edge
        edges.push({
            x: (room.x + room.width) * this.config.cellSize,
            z: center.z,
            rotation: Math.PI / 2
        });

        return edges;
    }

    /**
     * Get a random door type
     */
    getRandomDoorType() {
        const types = [
            FurnitureType.WOODEN_DOOR,
            FurnitureType.IRON_DOOR,
            FurnitureType.REINFORCED_DOOR
        ];
        return types[Math.floor(Math.random() * types.length)];
    }

    /**
     * Get a random furniture condition
     */
    getRandomCondition() {
        const rand = Math.random();
        if (rand < 0.1) return FurnitureCondition.PRISTINE;
        if (rand < 0.3) return FurnitureCondition.GOOD;
        if (rand < 0.7) return FurnitureCondition.WORN;
        if (rand < 0.9) return FurnitureCondition.DAMAGED;
        return FurnitureCondition.BROKEN;
    }

    /**
     * Dispose of all furniture
     */
    dispose() {
        this.furnitureManager.dispose();
        this.placedFurniture = [];
    }

    /**
     * Get the furniture manager for direct access
     */
    getFurnitureManager() {
        return this.furnitureManager;
    }
}
