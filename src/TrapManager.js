/**
 * TrapManager - Manages all traps in the dungeon
 * Handles placement, triggering, and damage
 */

import * as THREE from 'three';
import {
    Trap,
    SpikeTrap,
    ArrowTrap,
    BladeTrap,
    PitTrap,
    FireTrap,
    BoulderTrap,
    TrapType
} from './Traps.js';
import { POIType } from './DungeonGenerator.js';

export class TrapManager {
    constructor(scene, dungeonData, audioManager = null) {
        this.scene = scene;
        this.dungeonData = dungeonData;
        this.audioManager = audioManager;

        this.traps = [];
    }

    /**
     * Place traps throughout the dungeon
     * Traps are placed strategically near valuable areas and along corridors
     */
    placeTraps() {
        const cellSize = 4; // Assuming 4 units per grid cell

        // Place traps in treasure room approaches (guarding valuable loot)
        const treasureRooms = this.dungeonData.rooms.filter(room => room.type === POIType.TREASURE);
        treasureRooms.forEach(room => {
            // Place 2-3 traps near treasure rooms
            const trapCount = Math.floor(Math.random() * 2) + 2;

            for (let i = 0; i < trapCount; i++) {
                // Place traps in a radius around the treasure room
                const angle = (Math.PI * 2 * i) / trapCount;
                const distance = 6 + Math.random() * 2;

                const position = {
                    x: room.centerX * cellSize + Math.cos(angle) * distance,
                    y: 0,
                    z: room.centerY * cellSize + Math.sin(angle) * distance
                };

                const trap = this.createRandomTrap(position, 'medium');
                this.traps.push(trap);
            }
        });

        // Place traps in boss room approaches
        const bossRooms = this.dungeonData.rooms.filter(room => room.type === POIType.BOSS);
        bossRooms.forEach(room => {
            // More dangerous traps near boss
            const trapCount = Math.floor(Math.random() * 2) + 3;

            for (let i = 0; i < trapCount; i++) {
                const angle = (Math.PI * 2 * i) / trapCount;
                const distance = 8 + Math.random() * 2;

                const position = {
                    x: room.centerX * cellSize + Math.cos(angle) * distance,
                    y: 0,
                    z: room.centerY * cellSize + Math.sin(angle) * distance
                };

                const trap = this.createRandomTrap(position, 'hard');
                this.traps.push(trap);
            }
        });

        // Place traps in corridors (20% chance per corridor)
        this.placeCorridorTraps(cellSize);

        // Place traps in puzzle rooms
        const puzzleRooms = this.dungeonData.rooms.filter(room => room.type === POIType.PUZZLE);
        puzzleRooms.forEach(room => {
            const trapCount = Math.floor(Math.random() * 3) + 1;

            for (let i = 0; i < trapCount; i++) {
                const position = {
                    x: room.centerX * cellSize + (Math.random() - 0.5) * 4,
                    y: 0,
                    z: room.centerY * cellSize + (Math.random() - 0.5) * 4
                };

                const trap = this.createRandomTrap(position, 'medium');
                this.traps.push(trap);
            }
        });

        // Place special trap combinations
        this.placeSpecialTraps(cellSize);

        console.log(`TrapManager: Placed ${this.traps.length} traps`);
    }

    /**
     * Create a random trap based on difficulty
     */
    createRandomTrap(position, difficulty = 'easy') {
        const trapTypes = [
            { type: TrapType.SPIKE, weight: 0.25 },
            { type: TrapType.ARROW, weight: 0.2 },
            { type: TrapType.BLADE, weight: 0.15 },
            { type: TrapType.PIT, weight: 0.15 },
            { type: TrapType.FIRE, weight: 0.15 },
            { type: TrapType.BOULDER, weight: 0.1 }
        ];

        // Select random trap type based on weights
        const roll = Math.random();
        let cumulative = 0;
        let selectedType = TrapType.SPIKE;

        for (const { type, weight } of trapTypes) {
            cumulative += weight;
            if (roll <= cumulative) {
                selectedType = type;
                break;
            }
        }

        // Adjust damage based on difficulty
        const damageMultipliers = {
            easy: 0.8,
            medium: 1.0,
            hard: 1.3
        };

        const multiplier = damageMultipliers[difficulty] || 1.0;

        return this.createTrap(selectedType, position, multiplier);
    }

    /**
     * Create a specific trap type
     */
    createTrap(trapType, position, damageMultiplier = 1.0) {
        let trap = null;

        switch (trapType) {
            case TrapType.SPIKE:
                trap = new SpikeTrap(this.scene, position, 12 * damageMultiplier);
                break;

            case TrapType.ARROW:
                // Random direction for arrow
                const arrowDir = new THREE.Vector3(
                    Math.random() - 0.5,
                    0,
                    Math.random() - 0.5
                ).normalize();
                trap = new ArrowTrap(this.scene, position, arrowDir, 10 * damageMultiplier);
                break;

            case TrapType.BLADE:
                trap = new BladeTrap(this.scene, position, 18 * damageMultiplier);
                break;

            case TrapType.PIT:
                trap = new PitTrap(this.scene, position, 15 * damageMultiplier);
                break;

            case TrapType.FIRE:
                trap = new FireTrap(this.scene, position, 14 * damageMultiplier);
                break;

            case TrapType.BOULDER:
                // Random direction for boulder
                const boulderDir = new THREE.Vector3(
                    Math.random() - 0.5,
                    0,
                    Math.random() - 0.5
                ).normalize();
                trap = new BoulderTrap(this.scene, position, boulderDir, 20 * damageMultiplier);
                break;

            default:
                trap = new SpikeTrap(this.scene, position, 12 * damageMultiplier);
        }

        return trap;
    }

    /**
     * Place traps in corridors
     */
    placeCorridorTraps(cellSize) {
        this.dungeonData.corridors.forEach(corridor => {
            // 20% chance to place trap in each corridor
            if (Math.random() > 0.2) return;

            let position;

            if (corridor.type === 'horizontal') {
                const midX = (corridor.x1 + corridor.x2) / 2;
                position = {
                    x: midX * cellSize,
                    y: 0,
                    z: corridor.y * cellSize
                };
            } else {
                const midY = (corridor.y1 + corridor.y2) / 2;
                position = {
                    x: corridor.x * cellSize,
                    y: 0,
                    z: midY * cellSize
                };
            }

            const trap = this.createRandomTrap(position, 'easy');
            this.traps.push(trap);
        });
    }

    /**
     * Place special trap combinations (trap rooms, trap corridors)
     */
    placeSpecialTraps(cellSize) {
        // Find long corridors and create "trap gauntlets"
        const longCorridors = this.dungeonData.corridors.filter(corridor => {
            if (corridor.type === 'horizontal') {
                return Math.abs(corridor.x2 - corridor.x1) > 8;
            } else {
                return Math.abs(corridor.y2 - corridor.y1) > 8;
            }
        });

        // Create trap gauntlets in 30% of long corridors
        longCorridors.forEach(corridor => {
            if (Math.random() > 0.3) return;

            console.log('Creating trap gauntlet in corridor');

            if (corridor.type === 'horizontal') {
                const startX = corridor.x1;
                const endX = corridor.x2;
                const length = endX - startX;
                const trapCount = Math.floor(length / 3);

                for (let i = 0; i < trapCount; i++) {
                    const x = startX + (length / trapCount) * i;
                    const position = {
                        x: x * cellSize,
                        y: 0,
                        z: corridor.y * cellSize
                    };

                    // Alternate trap types for variety
                    const trapTypes = [TrapType.SPIKE, TrapType.FIRE, TrapType.ARROW];
                    const trapType = trapTypes[i % trapTypes.length];

                    const trap = this.createTrap(trapType, position, 0.9);
                    this.traps.push(trap);
                }
            } else {
                const startY = corridor.y1;
                const endY = corridor.y2;
                const length = endY - startY;
                const trapCount = Math.floor(length / 3);

                for (let i = 0; i < trapCount; i++) {
                    const y = startY + (length / trapCount) * i;
                    const position = {
                        x: corridor.x * cellSize,
                        y: 0,
                        z: y * cellSize
                    };

                    const trapTypes = [TrapType.SPIKE, TrapType.FIRE, TrapType.ARROW];
                    const trapType = trapTypes[i % trapTypes.length];

                    const trap = this.createTrap(trapType, position, 0.9);
                    this.traps.push(trap);
                }
            }
        });
    }

    /**
     * Check for trap triggers
     */
    checkTraps(playerPosition, player) {
        const triggeredTraps = [];

        for (const trap of this.traps) {
            if (trap.canTrigger(playerPosition)) {
                const damageResult = trap.trigger(player);

                if (damageResult) {
                    triggeredTraps.push({ trap, damageResult });

                    // Play trap sound
                    this.playTrapSound(trap.type);
                }
            }
        }

        return triggeredTraps;
    }

    /**
     * Play appropriate sound for trap type
     */
    playTrapSound(trapType) {
        if (!this.audioManager || !this.audioManager.initialized) return;

        switch (trapType) {
            case TrapType.SPIKE:
                this.audioManager.play('combat', 'trap_spike', 200);
                break;
            case TrapType.ARROW:
                this.audioManager.play('combat', 'trap_arrow', 200);
                break;
            case TrapType.BLADE:
                this.audioManager.play('combat', 'trap_blade', 200);
                break;
            case TrapType.PIT:
                this.audioManager.play('combat', 'trap_pit', 200);
                break;
            case TrapType.FIRE:
                this.audioManager.play('combat', 'trap_fire', 200);
                break;
            case TrapType.BOULDER:
                this.audioManager.play('combat', 'trap_boulder', 200);
                break;
        }
    }

    /**
     * Update all traps
     */
    update(deltaTime) {
        this.traps.forEach(trap => {
            trap.update(deltaTime);
        });
    }

    /**
     * Get trap statistics
     */
    getStats() {
        const typeCount = {};

        this.traps.forEach(trap => {
            const type = trap.type;
            typeCount[type] = (typeCount[type] || 0) + 1;
        });

        return {
            total: this.traps.length,
            byType: typeCount
        };
    }

    /**
     * Disable all traps (for testing)
     */
    disableAll() {
        this.traps.forEach(trap => {
            trap.active = false;
        });
        console.log('All traps disabled');
    }

    /**
     * Enable all traps
     */
    enableAll() {
        this.traps.forEach(trap => {
            trap.active = true;
        });
        console.log('All traps enabled');
    }

    /**
     * Clean up
     */
    destroy() {
        this.traps.forEach(trap => trap.destroy());
        this.traps = [];
    }
}
