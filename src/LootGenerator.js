/**
 * LootGenerator - Generates randomized loot for treasure chests
 * Based on chest rarity and game progression
 */

import { SWORD_DEFINITIONS, getSwordsByRarity } from './SwordDefinitions.js';
import { ARMOR_DEFINITIONS } from './ArmorDefinitions.js';
import { POTION_DEFINITIONS } from './PotionDefinitions.js';

export class LootGenerator {
    constructor(itemManager) {
        this.itemManager = itemManager;

        // Loot tables by rarity
        this.lootTables = {
            common: {
                goldRange: [10, 50],
                itemCount: [1, 2],
                rarityWeights: {
                    common: 0.8,
                    uncommon: 0.15,
                    rare: 0.05,
                    legendary: 0.0
                }
            },
            uncommon: {
                goldRange: [30, 100],
                itemCount: [2, 3],
                rarityWeights: {
                    common: 0.5,
                    uncommon: 0.35,
                    rare: 0.13,
                    legendary: 0.02
                }
            },
            rare: {
                goldRange: [75, 200],
                itemCount: [2, 4],
                rarityWeights: {
                    common: 0.2,
                    uncommon: 0.4,
                    rare: 0.35,
                    legendary: 0.05
                }
            },
            legendary: {
                goldRange: [150, 500],
                itemCount: [3, 5],
                rarityWeights: {
                    common: 0.1,
                    uncommon: 0.2,
                    rare: 0.5,
                    legendary: 0.2
                }
            }
        };

        // Item categories and their weights
        this.categoryWeights = {
            sword: 0.35,
            armor: 0.25,
            potion: 0.30,
            gold_only: 0.10
        };
    }

    /**
     * Generate loot for a chest based on its rarity
     */
    generateLoot(chestRarity) {
        const lootTable = this.lootTables[chestRarity];
        if (!lootTable) {
            console.warn(`Invalid chest rarity: ${chestRarity}`);
            return { items: [], gold: 0 };
        }

        // Generate gold amount
        const gold = this.randomInt(lootTable.goldRange[0], lootTable.goldRange[1]);

        // Generate number of items
        const itemCount = this.randomInt(lootTable.itemCount[0], lootTable.itemCount[1]);

        // Generate items
        const items = [];
        for (let i = 0; i < itemCount; i++) {
            const item = this.generateRandomItem(lootTable.rarityWeights);
            if (item) {
                items.push(item);
            }
        }

        return { items, gold };
    }

    /**
     * Generate a random item based on rarity weights
     */
    generateRandomItem(rarityWeights) {
        // First, decide item rarity
        const itemRarity = this.selectRarity(rarityWeights);

        // Then decide item category
        const category = this.selectCategory();

        // Generate item based on category and rarity
        let item = null;

        switch (category) {
            case 'sword':
                item = this.generateSword(itemRarity);
                break;
            case 'armor':
                item = this.generateArmor(itemRarity);
                break;
            case 'potion':
                item = this.generatePotion(itemRarity);
                break;
            case 'gold_only':
                // Return null, extra gold will be added
                return null;
        }

        return item;
    }

    /**
     * Generate a random sword of specific rarity
     */
    generateSword(rarity) {
        const swords = getSwordsByRarity(rarity);
        if (swords.length === 0) {
            console.warn(`No swords found for rarity: ${rarity}`);
            return null;
        }

        const randomSword = swords[Math.floor(Math.random() * swords.length)];
        return this.itemManager.createItem(randomSword.id);
    }

    /**
     * Generate random armor of specific rarity
     */
    generateArmor(rarity) {
        const allArmor = Object.values(ARMOR_DEFINITIONS);
        const armorOfRarity = allArmor.filter(def => def.rarity === rarity);

        if (armorOfRarity.length === 0) {
            // Fallback to any armor
            return null;
        }

        const randomArmor = armorOfRarity[Math.floor(Math.random() * armorOfRarity.length)];
        return this.itemManager.createItem(randomArmor.id);
    }

    /**
     * Generate random potion of specific rarity
     */
    generatePotion(rarity) {
        const allPotions = Object.values(POTION_DEFINITIONS);
        const potionsOfRarity = allPotions.filter(def => def.rarity === rarity);

        if (potionsOfRarity.length === 0) {
            // Fallback to common health potion
            return this.itemManager.createItem('health_potion_small');
        }

        const randomPotion = potionsOfRarity[Math.floor(Math.random() * potionsOfRarity.length)];
        return this.itemManager.createItem(randomPotion.id);
    }

    /**
     * Select a rarity based on weights
     */
    selectRarity(weights) {
        const roll = Math.random();
        let cumulative = 0;

        for (const [rarity, weight] of Object.entries(weights)) {
            cumulative += weight;
            if (roll <= cumulative) {
                return rarity;
            }
        }

        // Fallback
        return 'common';
    }

    /**
     * Select an item category based on weights
     */
    selectCategory() {
        const roll = Math.random();
        let cumulative = 0;

        for (const [category, weight] of Object.entries(this.categoryWeights)) {
            cumulative += weight;
            if (roll <= cumulative) {
                return category;
            }
        }

        // Fallback
        return 'sword';
    }

    /**
     * Generate loot for a specific room type
     */
    generateRoomLoot(roomType) {
        switch (roomType) {
            case 'treasure':
                return this.generateLoot('rare');
            case 'boss':
                return this.generateLoot('legendary');
            case 'safe':
                // Safe rooms have healing items
                return {
                    items: [
                        this.itemManager.createItem('health_potion_medium'),
                        this.itemManager.createItem('health_potion_medium')
                    ],
                    gold: this.randomInt(20, 60)
                };
            case 'puzzle':
                return this.generateLoot('uncommon');
            default:
                return this.generateLoot('common');
        }
    }

    /**
     * Generate guaranteed legendary item
     */
    generateLegendaryItem() {
        const legendaryItems = [
            'moonlight_edge',
            'holy_avenger',
            'dragon_slayer',
            'blood_drinker'
        ];

        const randomId = legendaryItems[Math.floor(Math.random() * legendaryItems.length)];
        return this.itemManager.createItem(randomId);
    }

    /**
     * Generate starter loot (low quality items for early game)
     */
    generateStarterLoot() {
        return {
            items: [
                this.itemManager.createItem('rusty_sword'),
                this.itemManager.createItem('health_potion_small')
            ],
            gold: this.randomInt(5, 20)
        };
    }

    /**
     * Random integer between min and max (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Random chance (0.0 to 1.0)
     */
    chance(probability) {
        return Math.random() < probability;
    }

    /**
     * Custom loot generation
     */
    generateCustomLoot(options = {}) {
        const {
            minGold = 0,
            maxGold = 100,
            guaranteedItems = [],
            randomItemCount = 1,
            itemRarity = 'common'
        } = options;

        const gold = this.randomInt(minGold, maxGold);
        const items = [...guaranteedItems];

        // Add random items
        for (let i = 0; i < randomItemCount; i++) {
            const item = this.generateRandomItem({
                common: itemRarity === 'common' ? 1 : 0,
                uncommon: itemRarity === 'uncommon' ? 1 : 0,
                rare: itemRarity === 'rare' ? 1 : 0,
                legendary: itemRarity === 'legendary' ? 1 : 0
            });

            if (item) {
                items.push(item);
            }
        }

        return { items, gold };
    }
}
