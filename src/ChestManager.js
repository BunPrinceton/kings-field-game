/**
 * ChestManager - Manages all treasure chests in the dungeon
 * Handles placement, interaction, and loot generation
 */

import { TreasureChest, ChestType, ChestRarity } from './TreasureChest.js';
import { LootGenerator } from './LootGenerator.js';
import { POIType } from './DungeonGenerator.js';

export class ChestManager {
    constructor(scene, dungeonData, itemManager, audioManager = null) {
        this.scene = scene;
        this.dungeonData = dungeonData;
        this.itemManager = itemManager;
        this.audioManager = audioManager;
        this.lootGenerator = new LootGenerator(itemManager);

        this.chests = [];
        this.interactionRange = 2.5;
    }

    /**
     * Place chests throughout the dungeon based on room types
     */
    placeChests() {
        const cellSize = 4; // Assuming 4 units per grid cell

        // Place chests in treasure rooms
        const treasureRooms = this.dungeonData.rooms.filter(room => room.type === POIType.TREASURE);
        treasureRooms.forEach(room => {
            const position = {
                x: room.centerX * cellSize,
                y: 0,
                z: room.centerY * cellSize
            };

            // Treasure rooms get rare/ornate chests
            const chestType = Math.random() > 0.5 ? ChestType.ORNATE : ChestType.IRON;
            const rarity = ChestRarity.RARE;

            const chest = this.createChest(position, chestType, rarity, room.type);
            this.chests.push(chest);
        });

        // Place chests in boss rooms
        const bossRooms = this.dungeonData.rooms.filter(room => room.type === POIType.BOSS);
        bossRooms.forEach(room => {
            const position = {
                x: room.centerX * cellSize,
                y: 0,
                z: room.centerY * cellSize
            };

            const chest = this.createChest(position, ChestType.ORNATE, ChestRarity.LEGENDARY, room.type);
            this.chests.push(chest);
        });

        // Place chests in safe rooms (healing items)
        const safeRooms = this.dungeonData.rooms.filter(room => room.type === POIType.SAFE);
        safeRooms.forEach(room => {
            const position = {
                x: room.centerX * cellSize,
                y: 0,
                z: room.centerY * cellSize
            };

            const chest = this.createChest(position, ChestType.WOODEN, ChestRarity.COMMON, room.type);
            this.chests.push(chest);
        });

        // Place chests in puzzle rooms
        const puzzleRooms = this.dungeonData.rooms.filter(room => room.type === POIType.PUZZLE);
        puzzleRooms.forEach(room => {
            const position = {
                x: room.centerX * cellSize,
                y: 0,
                z: room.centerY * cellSize
            };

            const chest = this.createChest(position, ChestType.IRON, ChestRarity.UNCOMMON, room.type);
            this.chests.push(chest);
        });

        // Place random chests in some standard rooms (20% chance)
        const standardRooms = this.dungeonData.rooms.filter(room => room.type === POIType.STANDARD);
        standardRooms.forEach(room => {
            if (Math.random() < 0.2) {
                const position = {
                    x: room.centerX * cellSize + (Math.random() - 0.5) * 2,
                    y: 0,
                    z: room.centerY * cellSize + (Math.random() - 0.5) * 2
                };

                const chestType = Math.random() > 0.7 ? ChestType.IRON : ChestType.WOODEN;
                const rarity = Math.random() > 0.8 ? ChestRarity.UNCOMMON : ChestRarity.COMMON;

                const chest = this.createChest(position, chestType, rarity, 'standard');
                this.chests.push(chest);
            }
        });

        // Place locked chests in hidden locations (corridors, corners)
        this.placeLockedChests();

        console.log(`ChestManager: Placed ${this.chests.length} chests`);
    }

    /**
     * Create a chest with appropriate loot
     */
    createChest(position, chestType, rarity, roomType) {
        const locked = chestType === ChestType.LOCKED;
        const chest = new TreasureChest(this.scene, position, chestType, rarity, locked);

        // Generate loot based on room type or rarity
        const loot = roomType ? this.lootGenerator.generateRoomLoot(roomType) : this.lootGenerator.generateLoot(rarity);

        chest.setLoot(loot.items, loot.gold);

        return chest;
    }

    /**
     * Place locked chests in strategic locations
     */
    placeLockedChests() {
        const cellSize = 4;
        const lockedChestCount = 3;

        // Place in hub rooms (high-value loot)
        const hubRooms = this.dungeonData.rooms.filter(room => room.type === POIType.HUB);

        for (let i = 0; i < Math.min(lockedChestCount, hubRooms.length); i++) {
            const room = hubRooms[i];
            const position = {
                x: room.centerX * cellSize + (Math.random() - 0.5) * 3,
                y: 0,
                z: room.centerY * cellSize + (Math.random() - 0.5) * 3
            };

            const chest = this.createChest(position, ChestType.LOCKED, ChestRarity.RARE, 'hub');
            this.chests.push(chest);
        }
    }

    /**
     * Check for chest interactions
     */
    checkInteraction(playerPosition, player) {
        let nearestChest = null;
        let nearestDistance = this.interactionRange;

        // Find nearest interactable chest
        for (const chest of this.chests) {
            if (!chest.opened && !chest.locked) {
                const distance = chest.getDistanceToPlayer(playerPosition);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestChest = chest;
                }
            }
        }

        return nearestChest;
    }

    /**
     * Interact with a chest
     */
    interactWithChest(chest, player) {
        if (!chest) return false;

        const success = chest.interact(player);

        if (success) {
            // Play chest open sound
            if (this.audioManager && this.audioManager.initialized) {
                this.audioManager.play('ui', 'chest_open', 0);
            }

            console.log(`Opened ${chest.type} chest with ${chest.rarity} loot`);
        } else if (chest.locked) {
            // Play locked sound
            if (this.audioManager && this.audioManager.initialized) {
                this.audioManager.play('ui', 'chest_locked', 0);
            }
        }

        return success;
    }

    /**
     * Get nearest chest to player (for UI prompts)
     */
    getNearestChest(playerPosition) {
        let nearest = null;
        let nearestDistance = this.interactionRange;

        for (const chest of this.chests) {
            if (!chest.opened) {
                const distance = chest.getDistanceToPlayer(playerPosition);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearest = chest;
                }
            }
        }

        return nearest ? { chest: nearest, distance: nearestDistance } : null;
    }

    /**
     * Update all chests
     */
    update(deltaTime) {
        this.chests.forEach(chest => {
            chest.update(deltaTime);
        });
    }

    /**
     * Get chest statistics
     */
    getStats() {
        const total = this.chests.length;
        const opened = this.chests.filter(c => c.opened).length;
        const locked = this.chests.filter(c => c.locked).length;

        return {
            total,
            opened,
            locked,
            unopened: total - opened
        };
    }

    /**
     * Clean up
     */
    destroy() {
        this.chests.forEach(chest => chest.destroy());
        this.chests = [];
    }
}
