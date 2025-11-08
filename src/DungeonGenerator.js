// DungeonGenerator.js - Intentional dungeon generation with POI system

export const POIType = {
    ENTRANCE: 'entrance',
    EXIT: 'exit',
    TREASURE: 'treasure',
    BOSS: 'boss',
    SAFE: 'safe',
    PUZZLE: 'puzzle',
    HUB: 'hub',
    LANDMARK: 'landmark',
    STANDARD: 'standard'
};

export class DungeonGenerator {
    constructor(width = 40, height = 40, config = {}) {
        this.width = width;
        this.height = height;
        this.grid = [];

        // Configuration
        this.config = {
            minRoomSize: config.minRoomSize || 3,
            maxRoomSize: config.maxRoomSize || 7,
            maxRooms: config.maxRooms || 25,
            centerSymmetryRadius: config.centerSymmetryRadius || 8,
            hubCount: config.hubCount || 3,
            treasureRoomCount: config.treasureRoomCount || 4,
            safeRoomCount: config.safeRoomCount || 2,
            puzzleRoomCount: config.puzzleRoomCount || 2,
            landmarkCount: config.landmarkCount || 3,
            sideAreaChance: config.sideAreaChance || 0.3,
            ...config
        };

        this.rooms = [];
        this.corridors = [];
        this.pois = new Map(); // Map of room ID to POI metadata
        this.criticalPath = []; // Rooms that must be traversed to reach exit
        this.centerX = Math.floor(width / 2);
        this.centerY = Math.floor(height / 2);

        this.initializeGrid();
    }

    initializeGrid() {
        // Create empty grid (0 = wall, 1 = floor)
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = 0;
            }
        }
    }

    generate() {
        // Phase 1: Create symmetrical center area
        this.createCenterArea();

        // Phase 2: Create critical path (entrance -> hubs -> exit)
        this.createCriticalPath();

        // Phase 3: Add optional side areas with asymmetry
        this.createSideAreas();

        // Phase 4: Add special POI rooms
        this.placePOIRooms();

        // Phase 5: Connect everything
        this.connectAllRooms();
        this.addCorridorFloors();

        // Phase 6: Add landmark features
        this.addLandmarkFeatures();

        return {
            grid: this.grid,
            rooms: this.rooms,
            corridors: this.corridors,
            pois: this.pois,
            criticalPath: this.criticalPath,
            width: this.width,
            height: this.height,
            entrance: this.entrance,
            exit: this.exit
        };
    }

    // === PHASE 1: CREATE SYMMETRICAL CENTER AREA ===
    createCenterArea() {
        const radius = this.config.centerSymmetryRadius;

        // Create a large central hub room
        const centerRoom = {
            id: 'center_hub',
            x: this.centerX - radius,
            y: this.centerY - radius,
            width: radius * 2,
            height: radius * 2,
            centerX: this.centerX,
            centerY: this.centerY,
            type: POIType.HUB,
            isSymmetrical: true,
            distanceFromCenter: 0
        };

        this.rooms.push(centerRoom);
        this.carveRoom(centerRoom);
        this.pois.set(centerRoom.id, {
            type: POIType.HUB,
            description: 'Central Hub - The heart of the dungeon',
            isCriticalPath: true
        });

        // Create symmetrical rooms around the center (4-way symmetry)
        const symmetricRoomCount = 4;
        const angleStep = (Math.PI * 2) / symmetricRoomCount;

        for (let i = 0; i < symmetricRoomCount; i++) {
            const angle = angleStep * i;
            const distance = radius + 6;
            const roomX = Math.floor(this.centerX + Math.cos(angle) * distance);
            const roomY = Math.floor(this.centerY + Math.sin(angle) * distance);

            const roomWidth = this.randomInt(5, 7);
            const roomHeight = this.randomInt(5, 7);

            const symmetricRoom = {
                id: `symmetric_${i}`,
                x: roomX - Math.floor(roomWidth / 2),
                y: roomY - Math.floor(roomHeight / 2),
                width: roomWidth,
                height: roomHeight,
                centerX: roomX,
                centerY: roomY,
                type: POIType.STANDARD,
                isSymmetrical: true,
                distanceFromCenter: 1
            };

            if (!this.roomOverlaps(symmetricRoom)) {
                this.rooms.push(symmetricRoom);
                this.carveRoom(symmetricRoom);
            }
        }
    }

    // === PHASE 2: CREATE CRITICAL PATH ===
    createCriticalPath() {
        // Create entrance in one direction from center
        const entranceAngle = this.randomInt(0, 3) * Math.PI / 2;
        const entranceDistance = this.config.centerSymmetryRadius + 15;
        const entranceX = Math.floor(this.centerX + Math.cos(entranceAngle) * entranceDistance);
        const entranceY = Math.floor(this.centerY + Math.sin(entranceAngle) * entranceDistance);

        this.entrance = this.createPOIRoom(
            entranceX, entranceY,
            this.randomInt(4, 6), this.randomInt(4, 6),
            POIType.ENTRANCE,
            'entrance',
            'Dungeon Entrance'
        );
        if (this.entrance) {
            this.criticalPath.push(this.entrance);
        }

        // Create hub rooms along the path
        for (let i = 0; i < this.config.hubCount; i++) {
            const hubAngle = Math.random() * Math.PI * 2;
            const hubDistance = this.randomInt(12, 20);
            const hubX = Math.floor(this.centerX + Math.cos(hubAngle) * hubDistance);
            const hubY = Math.floor(this.centerY + Math.sin(hubAngle) * hubDistance);

            const hub = this.createPOIRoom(
                hubX, hubY,
                this.randomInt(6, 9), this.randomInt(6, 9),
                POIType.HUB,
                `hub_${i}`,
                `Mini-Hub ${i + 1}`
            );

            if (hub) {
                this.criticalPath.push(hub);
            }
        }

        // Create exit in opposite direction from entrance
        const exitAngle = entranceAngle + Math.PI;
        const exitDistance = this.config.centerSymmetryRadius + 15;
        const exitX = Math.floor(this.centerX + Math.cos(exitAngle) * exitDistance);
        const exitY = Math.floor(this.centerY + Math.sin(exitAngle) * exitDistance);

        this.exit = this.createPOIRoom(
            exitX, exitY,
            this.randomInt(5, 7), this.randomInt(5, 7),
            POIType.EXIT,
            'exit',
            'Dungeon Exit'
        );
        if (this.exit) {
            this.criticalPath.push(this.exit);
        }

        // Add center hub to critical path
        const centerHub = this.rooms.find(r => r.id === 'center_hub');
        if (centerHub) {
            this.criticalPath.push(centerHub);
        }
    }

    // === PHASE 3: CREATE SIDE AREAS ===
    createSideAreas() {
        const sideAreaCount = Math.floor(this.config.maxRooms * 0.4);

        for (let i = 0; i < sideAreaCount; i++) {
            if (Math.random() > this.config.sideAreaChance) continue;

            // Place side areas with increasing asymmetry from center
            const angle = Math.random() * Math.PI * 2;
            const distance = this.randomInt(15, 25);
            const roomX = Math.floor(this.centerX + Math.cos(angle) * distance);
            const roomY = Math.floor(this.centerY + Math.sin(angle) * distance);

            // Asymmetry increases with distance from center
            const distFromCenter = Math.sqrt(
                Math.pow(roomX - this.centerX, 2) + Math.pow(roomY - this.centerY, 2)
            );
            const asymmetryFactor = Math.min(distFromCenter / 20, 1);

            // More irregular shapes further from center
            const widthVariance = Math.floor(asymmetryFactor * 3);
            const heightVariance = Math.floor(asymmetryFactor * 3);

            const roomWidth = this.randomInt(
                this.config.minRoomSize,
                this.config.maxRoomSize + widthVariance
            );
            const roomHeight = this.randomInt(
                this.config.minRoomSize,
                this.config.maxRoomSize + heightVariance
            );

            const room = {
                id: `side_${i}`,
                x: roomX - Math.floor(roomWidth / 2),
                y: roomY - Math.floor(roomHeight / 2),
                width: roomWidth,
                height: roomHeight,
                centerX: roomX,
                centerY: roomY,
                type: POIType.STANDARD,
                isSymmetrical: false,
                distanceFromCenter: distFromCenter
            };

            if (!this.roomOverlaps(room) && this.isWithinBounds(room)) {
                this.rooms.push(room);
                this.carveRoom(room);
            }
        }
    }

    // === PHASE 4: PLACE POI ROOMS ===
    placePOIRooms() {
        // Place treasure rooms (off critical path)
        for (let i = 0; i < this.config.treasureRoomCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = this.randomInt(10, 20);
            const x = Math.floor(this.centerX + Math.cos(angle) * distance);
            const y = Math.floor(this.centerY + Math.sin(angle) * distance);

            this.createPOIRoom(x, y, 5, 5, POIType.TREASURE, `treasure_${i}`, `Treasure Room ${i + 1}`);
        }

        // Place safe rooms (rest areas)
        for (let i = 0; i < this.config.safeRoomCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = this.randomInt(8, 18);
            const x = Math.floor(this.centerX + Math.cos(angle) * distance);
            const y = Math.floor(this.centerY + Math.sin(angle) * distance);

            this.createPOIRoom(x, y, 4, 4, POIType.SAFE, `safe_${i}`, `Safe Room ${i + 1}`);
        }

        // Place puzzle rooms
        for (let i = 0; i < this.config.puzzleRoomCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = this.randomInt(10, 22);
            const x = Math.floor(this.centerX + Math.cos(angle) * distance);
            const y = Math.floor(this.centerY + Math.sin(angle) * distance);

            this.createPOIRoom(x, y, 6, 6, POIType.PUZZLE, `puzzle_${i}`, `Puzzle Room ${i + 1}`);
        }

        // Place boss arena (near exit)
        if (this.exit) {
            const bossX = this.exit.centerX + this.randomInt(-8, 8);
            const bossY = this.exit.centerY + this.randomInt(-8, 8);

            this.createPOIRoom(bossX, bossY, 10, 10, POIType.BOSS, 'boss', 'Boss Arena');
        }
    }

    createPOIRoom(centerX, centerY, width, height, type, id, description) {
        const room = {
            id: id,
            x: centerX - Math.floor(width / 2),
            y: centerY - Math.floor(height / 2),
            width: width,
            height: height,
            centerX: centerX,
            centerY: centerY,
            type: type,
            isSymmetrical: false,
            distanceFromCenter: Math.sqrt(
                Math.pow(centerX - this.centerX, 2) + Math.pow(centerY - this.centerY, 2)
            )
        };

        if (!this.roomOverlaps(room) && this.isWithinBounds(room)) {
            this.rooms.push(room);
            this.carveRoom(room);
            this.pois.set(id, {
                type: type,
                description: description,
                isCriticalPath: type === POIType.ENTRANCE || type === POIType.EXIT || type === POIType.HUB
            });
            return room;
        }
        return null;
    }

    // === PHASE 5: CONNECT ROOMS ===
    connectAllRooms() {
        // First, connect critical path rooms
        for (let i = 0; i < this.criticalPath.length - 1; i++) {
            this.connectTwoRooms(this.criticalPath[i], this.criticalPath[i + 1]);
        }

        // Connect entrance to center hub
        const centerHub = this.rooms.find(r => r.id === 'center_hub');
        if (this.entrance && centerHub) {
            this.connectTwoRooms(this.entrance, centerHub);
        }

        // Connect exit to center hub
        if (this.exit && centerHub) {
            this.connectTwoRooms(this.exit, centerHub);
        }

        // Connect other rooms to nearest hub or critical path room
        for (const room of this.rooms) {
            if (this.criticalPath.includes(room)) continue;

            const nearestCriticalRoom = this.findNearestRoom(room, this.criticalPath);
            if (nearestCriticalRoom) {
                this.connectTwoRooms(room, nearestCriticalRoom);
            }
        }

        // Add some extra connections for alternate paths
        const roomCount = this.rooms.length;
        const extraConnections = Math.floor(roomCount * 0.2);

        for (let i = 0; i < extraConnections; i++) {
            const room1 = this.rooms[this.randomInt(0, roomCount - 1)];
            const room2 = this.findNearestRoom(room1, this.rooms.filter(r => r !== room1));

            if (room2) {
                this.connectTwoRooms(room1, room2);
            }
        }
    }

    connectTwoRooms(roomA, roomB) {
        // Safety check: ensure both rooms are valid
        if (!roomA || !roomB) {
            console.warn('Attempted to connect invalid rooms:', roomA, roomB);
            return;
        }

        if (Math.random() < 0.5) {
            this.createHorizontalCorridor(roomA.centerX, roomB.centerX, roomA.centerY);
            this.createVerticalCorridor(roomA.centerY, roomB.centerY, roomB.centerX);
        } else {
            this.createVerticalCorridor(roomA.centerY, roomB.centerY, roomA.centerX);
            this.createHorizontalCorridor(roomA.centerX, roomB.centerX, roomB.centerY);
        }
    }

    findNearestRoom(room, candidateRooms) {
        // Safety check: ensure room is valid
        if (!room) {
            console.warn('findNearestRoom called with null room');
            return null;
        }

        let nearest = null;
        let minDistance = Infinity;

        // Filter out null/undefined candidates
        const validCandidates = candidateRooms.filter(c => c !== null && c !== undefined);

        for (const candidate of validCandidates) {
            const distance = Math.sqrt(
                Math.pow(room.centerX - candidate.centerX, 2) +
                Math.pow(room.centerY - candidate.centerY, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearest = candidate;
            }
        }

        return nearest;
    }

    // === PHASE 6: ADD LANDMARK FEATURES ===
    addLandmarkFeatures() {
        // Add distinctive shapes to landmark rooms
        for (let i = 0; i < this.config.landmarkCount; i++) {
            // Find a suitable room to make a landmark
            const eligibleRooms = this.rooms.filter(r =>
                r.type === POIType.STANDARD && r.width >= 5 && r.height >= 5
            );

            if (eligibleRooms.length > 0) {
                const room = eligibleRooms[this.randomInt(0, eligibleRooms.length - 1)];
                room.type = POIType.LANDMARK;

                // Add a distinctive feature (e.g., pillars, cross shape, etc.)
                this.addLandmarkShape(room, i);

                this.pois.set(room.id + '_landmark', {
                    type: POIType.LANDMARK,
                    description: `Landmark ${i + 1}`,
                    isCriticalPath: false
                });
            }
        }
    }

    addLandmarkShape(room, shapeIndex) {
        const shapes = ['cross', 'pillars', 'circle'];
        const shape = shapes[shapeIndex % shapes.length];

        const cx = room.centerX;
        const cy = room.centerY;

        switch (shape) {
            case 'cross':
                // Carve a cross pattern
                for (let i = -2; i <= 2; i++) {
                    this.setGridSafe(cx + i, cy, 1);
                    this.setGridSafe(cx, cy + i, 1);
                }
                break;

            case 'pillars':
                // Add pillar pattern (actually remove floor to create pillars)
                const pillarPositions = [
                    [cx - 2, cy - 2], [cx + 2, cy - 2],
                    [cx - 2, cy + 2], [cx + 2, cy + 2]
                ];
                for (const [px, py] of pillarPositions) {
                    this.setGridSafe(px, py, 0); // Wall for pillar
                }
                break;

            case 'circle':
                // Carve circular pattern
                const radius = 2;
                for (let dx = -radius; dx <= radius; dx++) {
                    for (let dy = -radius; dy <= radius; dy++) {
                        if (dx * dx + dy * dy <= radius * radius) {
                            this.setGridSafe(cx + dx, cy + dy, 1);
                        }
                    }
                }
                break;
        }

        room.landmarkShape = shape;
    }

    carveRoom(room) {
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
                    this.grid[y][x] = 1; // Floor
                }
            }
        }
    }

    // === HELPER METHODS ===
    roomOverlaps(newRoom) {
        for (const room of this.rooms) {
            if (!(newRoom.x + newRoom.width + 1 < room.x ||
                  newRoom.x > room.x + room.width + 1 ||
                  newRoom.y + newRoom.height + 1 < room.y ||
                  newRoom.y > room.y + room.height + 1)) {
                return true;
            }
        }
        return false;
    }

    isWithinBounds(room) {
        return room.x >= 1 && room.y >= 1 &&
               room.x + room.width < this.width - 1 &&
               room.y + room.height < this.height - 1;
    }

    setGridSafe(x, y, value) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.grid[y][x] = value;
        }
    }

    createHorizontalCorridor(x1, x2, y) {
        const startX = Math.min(x1, x2);
        const endX = Math.max(x1, x2);

        this.corridors.push({
            type: 'horizontal',
            x1: startX,
            x2: endX,
            y: y
        });
    }

    createVerticalCorridor(y1, y2, x) {
        const startY = Math.min(y1, y2);
        const endY = Math.max(y1, y2);

        this.corridors.push({
            type: 'vertical',
            y1: startY,
            y2: endY,
            x: x
        });
    }

    addCorridorFloors() {
        for (const corridor of this.corridors) {
            if (corridor.type === 'horizontal') {
                for (let x = corridor.x1; x <= corridor.x2; x++) {
                    if (corridor.y >= 0 && corridor.y < this.height &&
                        x >= 0 && x < this.width) {
                        this.grid[corridor.y][x] = 1;
                    }
                }
            } else {
                for (let y = corridor.y1; y <= corridor.y2; y++) {
                    if (y >= 0 && y < this.height &&
                        corridor.x >= 0 && corridor.x < this.width) {
                        this.grid[y][corridor.x] = 1;
                    }
                }
            }
        }
    }

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getSpawnPosition() {
        // Return center of first room as spawn position
        if (this.rooms.length > 0) {
            const room = this.rooms[0];
            return {
                x: room.centerX,
                z: room.centerY
            };
        }
        return { x: this.width / 2, z: this.height / 2 };
    }
}
