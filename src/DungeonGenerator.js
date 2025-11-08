// DungeonGenerator.js - Procedural dungeon generation system

export class DungeonGenerator {
    constructor(width = 20, height = 20, config = {}) {
        this.width = width;
        this.height = height;
        this.grid = [];

        // Configuration
        this.config = {
            minRoomSize: config.minRoomSize || 3,
            maxRoomSize: config.maxRoomSize || 7,
            maxRooms: config.maxRooms || 10,
            roomAttempts: config.roomAttempts || 50,
            ...config
        };

        this.rooms = [];
        this.corridors = [];

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
        this.createRooms();
        this.connectRooms();
        this.addCorridorFloors();
        return {
            grid: this.grid,
            rooms: this.rooms,
            corridors: this.corridors,
            width: this.width,
            height: this.height
        };
    }

    createRooms() {
        let attempts = 0;

        while (this.rooms.length < this.config.maxRooms && attempts < this.config.roomAttempts) {
            attempts++;

            const width = this.randomInt(this.config.minRoomSize, this.config.maxRoomSize);
            const height = this.randomInt(this.config.minRoomSize, this.config.maxRoomSize);
            const x = this.randomInt(1, this.width - width - 1);
            const y = this.randomInt(1, this.height - height - 1);

            const newRoom = {
                x, y, width, height,
                centerX: x + Math.floor(width / 2),
                centerY: y + Math.floor(height / 2)
            };

            // Check if room overlaps with existing rooms
            if (!this.roomOverlaps(newRoom)) {
                this.rooms.push(newRoom);
                this.carveRoom(newRoom);
            }
        }
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

    connectRooms() {
        // Connect each room to the next one
        for (let i = 0; i < this.rooms.length - 1; i++) {
            const roomA = this.rooms[i];
            const roomB = this.rooms[i + 1];

            // Randomly choose horizontal-then-vertical or vertical-then-horizontal
            if (Math.random() < 0.5) {
                this.createHorizontalCorridor(roomA.centerX, roomB.centerX, roomA.centerY);
                this.createVerticalCorridor(roomA.centerY, roomB.centerY, roomB.centerX);
            } else {
                this.createVerticalCorridor(roomA.centerY, roomB.centerY, roomA.centerX);
                this.createHorizontalCorridor(roomA.centerX, roomB.centerX, roomB.centerY);
            }
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
