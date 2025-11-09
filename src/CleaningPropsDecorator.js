// CleaningPropsDecorator.js - Adds atmospheric cleaning props to dungeons
import { CleaningPropsManager, CleaningPropType } from './CleaningPropsManager.js';
import { POIType } from './DungeonGenerator.js';

/**
 * Prop group templates for natural clustering
 */
const PropGroups = {
    JANITOR_CORNER: 'janitor_corner',
    STORAGE_PILE: 'storage_pile',
    LONE_CLEANER: 'lone_cleaner',
    BARREL_CLUSTER: 'barrel_cluster',
    CLEANING_STATION: 'cleaning_station'
};

/**
 * Decorates dungeons with cleaning supplies and maintenance props
 */
export class CleaningPropsDecorator {
    constructor(scene, dungeonData, config = {}) {
        this.scene = scene;
        this.dungeonData = dungeonData;
        this.config = {
            cellSize: config.cellSize || 4,
            wallHeight: config.wallHeight || 3,
            propDensity: config.propDensity || 0.25, // 0-1, how many rooms get props
            ...config
        };

        this.propsManager = new CleaningPropsManager(scene, config);
        this.placedProps = [];
    }

    /**
     * Load models before decorating
     */
    async loadModels() {
        await this.propsManager.loadModels();
    }

    /**
     * Decorate all rooms in the dungeon
     */
    decorateRooms() {
        console.log('Decorating dungeon with cleaning props...');

        for (const room of this.dungeonData.rooms) {
            this.decorateRoom(room);
        }

        console.log(`Placed ${this.placedProps.length} cleaning props`);
        return this.placedProps;
    }

    /**
     * Decorate a single room
     */
    decorateRoom(room) {
        const roomType = room.type || POIType.STANDARD;
        const roomArea = room.width * room.height;

        // Skip very small rooms
        if (roomArea < 9) return;

        // Different decoration strategies based on room type
        switch (roomType) {
            case POIType.ENTRANCE:
                this.decorateEntranceRoom(room);
                break;
            case POIType.SAFE:
                this.decorateSafeRoom(room);
                break;
            case POIType.HUB:
                this.decorateHubRoom(room);
                break;
            case POIType.TREASURE:
                // Storage-like, lots of containers
                this.decorateStorageRoom(room, 0.8);
                break;
            default:
                this.decorateStandardRoom(room);
        }
    }

    /**
     * Entrance room - minimal cleaning supplies
     */
    decorateEntranceRoom(room) {
        const center = this.getRoomCenter(room);

        // Small chance of a broom or bucket in corner
        if (Math.random() < 0.3) {
            const corner = this.getRandomCorner(room);
            this.placeGroup(PropGroups.LONE_CLEANER, corner.x, corner.z);
        }

        // Maybe a barrel near entrance
        if (Math.random() < 0.4) {
            const wallPos = this.getRandomWallPosition(room);
            this.placeProp(CleaningPropType.BARREL_SMALL, wallPos.x, wallPos.z, {
                randomRotation: true
            });
        }
    }

    /**
     * Safe room - clean, organized supplies
     */
    decorateSafeRoom(room) {
        const center = this.getRoomCenter(room);

        // Cleaning supplies in organized corner
        if (Math.random() < 0.6) {
            const corner = this.getRandomCorner(room);
            this.placeGroup(PropGroups.CLEANING_STATION, corner.x, corner.z);
        }

        // Maybe a barrel of water
        if (Math.random() < 0.5) {
            this.placeProp(CleaningPropType.BARREL, center.x + 2, center.z - 2);
        }
    }

    /**
     * Hub room - some maintenance supplies
     */
    decorateHubRoom(room) {
        const center = this.getRoomCenter(room);

        // Cleaning corner
        const corner = this.getRandomCorner(room);
        this.placeGroup(PropGroups.JANITOR_CORNER, corner.x, corner.z);

        // Barrel cluster near wall
        if (Math.random() < 0.7) {
            const wallPos = this.getRandomWallPosition(room);
            this.placeGroup(PropGroups.BARREL_CLUSTER, wallPos.x, wallPos.z);
        }
    }

    /**
     * Standard room decoration
     */
    decorateStandardRoom(room) {
        const area = room.width * room.height;

        // Determine if this is a storage room (15% chance)
        const isStorage = Math.random() < 0.15;

        if (isStorage) {
            this.decorateStorageRoom(room, 0.9);
            return;
        }

        // Large rooms (>36 cells)
        if (area > 36) {
            // 40% chance of props in corner
            if (Math.random() < 0.4) {
                const corner = this.getRandomCorner(room);
                const groupType = Math.random() < 0.5 ? PropGroups.BARREL_CLUSTER : PropGroups.JANITOR_CORNER;
                this.placeGroup(groupType, corner.x, corner.z);
            }

            // Additional single props
            if (Math.random() < 0.3) {
                const wallPos = this.getRandomWallPosition(room);
                this.placeProp(CleaningPropType.BROOM, wallPos.x, wallPos.z, {
                    rotation: Math.random() * Math.PI * 2,
                    randomRotation: true
                });
            }
        }
        // Medium rooms (16-36 cells)
        else if (area > 16) {
            // 20% chance of single prop or small group
            if (Math.random() < 0.2) {
                if (Math.random() < 0.7) {
                    // Single prop
                    const corner = this.getRandomCorner(room);
                    const propType = this.getRandomPropType();
                    this.placeProp(propType, corner.x, corner.z, { randomRotation: true });
                } else {
                    // Small group
                    const corner = this.getRandomCorner(room);
                    this.placeGroup(PropGroups.LONE_CLEANER, corner.x, corner.z);
                }
            }
        }
        // Small rooms (9-16 cells)
        else {
            // 10% chance of single prop
            if (Math.random() < 0.1) {
                const corner = this.getRandomCorner(room);
                const propType = this.getRandomPropType();
                this.placeProp(propType, corner.x, corner.z, { randomRotation: true });
            }
        }

        // Hallways (narrow rooms)
        if (room.width === 1 || room.height === 1) {
            // 8% chance of bucket against wall
            if (Math.random() < 0.08) {
                const pos = this.getRoomCenter(room);
                this.placeProp(CleaningPropType.BUCKET, pos.x, pos.z, {
                    randomRotation: true
                });
            }
        }
    }

    /**
     * Storage room - lots of props
     */
    decorateStorageRoom(room, density = 0.9) {
        const center = this.getRoomCenter(room);

        // Should we add storage props?
        if (Math.random() > density) return;

        // Multiple groups
        const numGroups = Math.floor(2 + Math.random() * 3); // 2-4 groups

        for (let i = 0; i < numGroups; i++) {
            const position = this.getRandomFloorPosition(room, 0.7); // Stay away from edges
            const groupType = this.getRandomStorageGroup();
            this.placeGroup(groupType, position.x, position.z);
        }

        // Additional scattered props
        const numScattered = Math.floor(2 + Math.random() * 4); // 2-5 props

        for (let i = 0; i < numScattered; i++) {
            const position = this.getRandomFloorPosition(room, 0.8);
            const propType = this.getRandomStorageProp();
            this.placeProp(propType, position.x, position.z, { randomRotation: true });
        }
    }

    /**
     * Place a prop group
     */
    placeGroup(groupType, x, z) {
        switch (groupType) {
            case PropGroups.JANITOR_CORNER:
                // Broom + Bucket + Mop
                this.placeProp(CleaningPropType.BROOM, x - 0.2, z, {
                    rotation: Math.PI / 4,
                    randomRotation: true
                });
                this.placeProp(CleaningPropType.BUCKET, x + 0.3, z + 0.2, {
                    randomRotation: true
                });
                this.placeProp(CleaningPropType.MOP, x + 0.1, z - 0.3, {
                    rotation: -Math.PI / 6,
                    randomRotation: true
                });
                this.placeProp(CleaningPropType.RAG_PILE, x - 0.3, z + 0.4);
                break;

            case PropGroups.STORAGE_PILE:
                // 2-3 Barrels + Bucket + Crate
                this.placeProp(CleaningPropType.BARREL, x - 0.4, z);
                this.placeProp(CleaningPropType.BARREL, x + 0.4, z, {
                    randomRotation: true
                });
                if (Math.random() < 0.7) {
                    this.placeProp(CleaningPropType.BARREL_SMALL, x, z + 0.5);
                }
                this.placeProp(CleaningPropType.BUCKET, x + 0.2, z - 0.5, {
                    randomRotation: true
                });
                this.placeProp(CleaningPropType.CRATE, x - 0.5, z - 0.4, {
                    rotation: Math.random() * Math.PI
                });
                break;

            case PropGroups.LONE_CLEANER:
                // Single broom or mop leaning against wall
                const tool = Math.random() < 0.6 ? CleaningPropType.BROOM : CleaningPropType.MOP;
                this.placeProp(tool, x, z, {
                    rotation: Math.PI / 3 + Math.random() * Math.PI / 6
                });
                break;

            case PropGroups.BARREL_CLUSTER:
                // 2-4 barrels grouped together
                const numBarrels = Math.floor(2 + Math.random() * 3);
                const positions = [
                    [x - 0.3, z],
                    [x + 0.3, z],
                    [x, z + 0.4],
                    [x, z - 0.4]
                ];

                for (let i = 0; i < numBarrels; i++) {
                    const barrelType = Math.random() < 0.6 ? CleaningPropType.BARREL : CleaningPropType.BARREL_SMALL;
                    this.placeProp(barrelType, positions[i][0], positions[i][1], {
                        randomRotation: true
                    });
                }
                break;

            case PropGroups.CLEANING_STATION:
                // Organized cleaning area
                this.placeProp(CleaningPropType.BROOM, x - 0.4, z, {
                    rotation: Math.PI / 4
                });
                this.placeProp(CleaningPropType.MOP, x - 0.2, z, {
                    rotation: Math.PI / 5
                });
                this.placeProp(CleaningPropType.BUCKET, x + 0.3, z);
                this.placeProp(CleaningPropType.BUCKET, x + 0.5, z + 0.3);
                this.placeProp(CleaningPropType.BRUSH, x + 0.1, z + 0.4);
                this.placeProp(CleaningPropType.RAG_PILE, x - 0.3, z + 0.5);
                break;
        }
    }

    /**
     * Place a single prop
     */
    placeProp(propType, x, z, options = {}) {
        const prop = this.propsManager.createProp(propType, { x, y: 0, z }, options);

        if (prop) {
            this.placedProps.push(prop);
        }

        return prop;
    }

    /**
     * Get random prop type for general use
     */
    getRandomPropType() {
        const types = [
            CleaningPropType.BROOM,
            CleaningPropType.BUCKET,
            CleaningPropType.BARREL_SMALL,
            CleaningPropType.CRATE,
            CleaningPropType.SACK
        ];
        return types[Math.floor(Math.random() * types.length)];
    }

    /**
     * Get random storage prop
     */
    getRandomStorageProp() {
        const types = [
            CleaningPropType.BARREL,
            CleaningPropType.BARREL_SMALL,
            CleaningPropType.CRATE,
            CleaningPropType.SACK,
            CleaningPropType.BUCKET
        ];
        return types[Math.floor(Math.random() * types.length)];
    }

    /**
     * Get random storage group type
     */
    getRandomStorageGroup() {
        const groups = [
            PropGroups.STORAGE_PILE,
            PropGroups.BARREL_CLUSTER,
            PropGroups.CLEANING_STATION
        ];
        return groups[Math.floor(Math.random() * groups.length)];
    }

    /**
     * Get world-space center of a room
     */
    getRoomCenter(room) {
        return {
            x: (room.x + room.width / 2) * this.config.cellSize,
            z: (room.y + room.height / 2) * this.config.cellSize
        };
    }

    /**
     * Get a random corner position in a room
     */
    getRandomCorner(room) {
        const corners = [
            { x: room.x + 0.5, z: room.y + 0.5 },           // Top-left
            { x: room.x + room.width - 0.5, z: room.y + 0.5 },  // Top-right
            { x: room.x + 0.5, z: room.y + room.height - 0.5 }, // Bottom-left
            { x: room.x + room.width - 0.5, z: room.y + room.height - 0.5 } // Bottom-right
        ];

        const corner = corners[Math.floor(Math.random() * corners.length)];

        return {
            x: corner.x * this.config.cellSize,
            z: corner.z * this.config.cellSize
        };
    }

    /**
     * Get a random wall position in a room
     */
    getRandomWallPosition(room) {
        const walls = [
            { x: room.x + 0.5, z: room.y + room.height / 2 },        // Left wall
            { x: room.x + room.width - 0.5, z: room.y + room.height / 2 }, // Right wall
            { x: room.x + room.width / 2, z: room.y + 0.5 },         // Top wall
            { x: room.x + room.width / 2, z: room.y + room.height - 0.5 }  // Bottom wall
        ];

        const wall = walls[Math.floor(Math.random() * walls.length)];

        return {
            x: wall.x * this.config.cellSize,
            z: wall.z * this.config.cellSize
        };
    }

    /**
     * Get a random floor position in a room
     */
    getRandomFloorPosition(room, edgeBuffer = 0.5) {
        const bufferCells = edgeBuffer;

        const x = room.x + bufferCells + Math.random() * (room.width - bufferCells * 2);
        const z = room.y + bufferCells + Math.random() * (room.height - bufferCells * 2);

        return {
            x: x * this.config.cellSize,
            z: z * this.config.cellSize
        };
    }

    /**
     * Clean up all props
     */
    dispose() {
        this.propsManager.dispose();
        this.placedProps = [];
    }

    /**
     * Get the props manager for direct access
     */
    getPropsManager() {
        return this.propsManager;
    }
}
