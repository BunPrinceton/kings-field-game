// InstanceDefinitions.js - Declarative definitions for all instance types

export const InstanceType = {
    BOSS_ARENA: 'boss_arena',
    GRAND_LIBRARY: 'grand_library',
    TREASURE_VAULT: 'treasure_vault',
    SAFE_HAVEN: 'safe_haven',
    PUZZLE_CHAMBER: 'puzzle_chamber',
    THRONE_ROOM: 'throne_room',
    CHAPEL: 'chapel',
    WORKSHOP: 'workshop'
};

export const LightingPreset = {
    DRAMATIC_RED: 'dramatic_red',
    WARM_LIBRARY: 'warm_library',
    GOLDEN_VAULT: 'golden_vault',
    PEACEFUL_BLUE: 'peaceful_blue',
    MYSTICAL_PURPLE: 'mystical_purple',
    ROYAL_GOLD: 'royal_gold',
    HOLY_WHITE: 'holy_white',
    FORGE_ORANGE: 'forge_orange'
};

// Instance definitions - declarative configuration for each instance type
export const INSTANCE_DEFINITIONS = {
    // Boss Arena - Large dramatic space for epic battles
    boss_arena_demon_lord: {
        type: InstanceType.BOSS_ARENA,
        name: 'Demon Lord Chamber',
        description: 'A vast arena where ancient evil awaits',
        size: { width: 40, depth: 40, height: 10 },
        lighting: LightingPreset.DRAMATIC_RED,
        ambientIntensity: 0.2,
        fogColor: 0x330000,
        fogNear: 5,
        fogFar: 35,
        music: 'boss_theme',
        lockDoors: true, // Lock exit until boss defeated
        features: {
            pillars: true,
            torches: true,
            centerPlatform: true
        },
        spawns: {
            boss: 'demon_lord',
            minions: []
        },
        rewards: ['legendary_chest', 'boss_soul'],
        entryRequirements: {
            minLevel: 5,
            questFlag: 'found_demon_key'
        }
    },

    boss_arena_dragon: {
        type: InstanceType.BOSS_ARENA,
        name: 'Dragon\'s Lair',
        description: 'The ancient dragon\'s domain',
        size: { width: 50, depth: 50, height: 15 },
        lighting: LightingPreset.FORGE_ORANGE,
        ambientIntensity: 0.3,
        fogColor: 0x442200,
        fogNear: 8,
        fogFar: 45,
        music: 'dragon_theme',
        lockDoors: true,
        features: {
            lavaPits: true,
            treasurePiles: true,
            columns: true
        },
        spawns: {
            boss: 'ancient_dragon'
        },
        rewards: ['dragon_hoard', 'dragon_scale_armor']
    },

    // Grand Library - Detailed room with many bookshelves
    grand_library: {
        type: InstanceType.GRAND_LIBRARY,
        name: 'The Grand Library',
        description: 'A vast collection of ancient knowledge',
        size: { width: 35, depth: 50, height: 8 },
        lighting: LightingPreset.WARM_LIBRARY,
        ambientIntensity: 0.5,
        fogColor: 0x2a2520,
        fogNear: 10,
        fogFar: 40,
        music: 'library_ambience',
        lockDoors: false,
        features: {
            bookshelves: 'abundant', // Many bookshelves
            readingTables: 6,
            ladders: 4,
            chandelier: true,
            scrollRacks: 8
        },
        interactables: {
            books: 'random_knowledge',
            secretBooks: 'spell_tomes'
        },
        spawns: {
            npcs: ['librarian', 'scholar']
        }
    },

    // Treasure Vault - Shiny room with riches
    treasure_vault: {
        type: InstanceType.TREASURE_VAULT,
        name: 'The Royal Vault',
        description: 'A room overflowing with treasures',
        size: { width: 25, depth: 25, height: 7 },
        lighting: LightingPreset.GOLDEN_VAULT,
        ambientIntensity: 0.6,
        fogColor: 0x332200,
        fogNear: 5,
        fogFar: 20,
        music: 'treasure_theme',
        lockDoors: false,
        features: {
            goldPiles: 12,
            gemstones: 20,
            chests: 8,
            pedestals: 4,
            wallSafes: 6
        },
        spawns: {
            enemies: ['mimic', 'treasure_guardian'],
            traps: ['pressure_plate', 'dart_trap']
        },
        rewards: ['gold', 'gems', 'rare_items']
    },

    // Safe Haven - Peaceful rest area
    safe_haven: {
        type: InstanceType.SAFE_HAVEN,
        name: 'Sanctuary of Rest',
        description: 'A peaceful haven from the dangers outside',
        size: { width: 20, depth: 20, height: 6 },
        lighting: LightingPreset.PEACEFUL_BLUE,
        ambientIntensity: 0.7,
        fogColor: 0x1a2a3a,
        fogNear: 8,
        fogFar: 18,
        music: 'peaceful_ambience',
        lockDoors: false,
        preventEnemySpawns: true,
        features: {
            healingFountain: true,
            savePoint: true,
            campfire: true,
            bedrolls: 4,
            cookingPot: true
        },
        spawns: {
            npcs: ['merchant', 'healer']
        },
        services: {
            healing: true,
            shopping: true,
            saving: true,
            rest: true
        }
    },

    // Puzzle Chamber - Custom mechanics room
    puzzle_chamber_runes: {
        type: InstanceType.PUZZLE_CHAMBER,
        name: 'Chamber of Ancient Runes',
        description: 'A room filled with mystical puzzles',
        size: { width: 30, depth: 30, height: 7 },
        lighting: LightingPreset.MYSTICAL_PURPLE,
        ambientIntensity: 0.4,
        fogColor: 0x2a1a3a,
        fogNear: 6,
        fogFar: 25,
        music: 'puzzle_theme',
        lockDoors: true, // Lock until puzzle solved
        features: {
            runeStones: 8,
            pressurePlates: 6,
            magicCircle: true,
            movableBlocks: 4
        },
        puzzle: {
            type: 'rune_sequence',
            difficulty: 'medium',
            hint: 'Activate runes in the order of the elements'
        },
        rewards: ['puzzle_key', 'intelligence_tome']
    },

    puzzle_chamber_mirrors: {
        type: InstanceType.PUZZLE_CHAMBER,
        name: 'Hall of Mirrors',
        description: 'Reflect light to unlock the way forward',
        size: { width: 35, depth: 25, height: 8 },
        lighting: LightingPreset.MYSTICAL_PURPLE,
        ambientIntensity: 0.5,
        fogColor: 0x1a1a2a,
        fogNear: 7,
        fogFar: 28,
        music: 'puzzle_theme',
        lockDoors: true,
        features: {
            mirrors: 12,
            lightBeams: 4,
            crystals: 6
        },
        puzzle: {
            type: 'light_reflection',
            difficulty: 'hard'
        },
        rewards: ['mirror_shield', 'wisdom_scroll']
    },

    // Throne Room - Grand royal hall
    throne_room: {
        type: InstanceType.THRONE_ROOM,
        name: 'The Fallen King\'s Hall',
        description: 'Once grand, now abandoned',
        size: { width: 45, depth: 30, height: 12 },
        lighting: LightingPreset.ROYAL_GOLD,
        ambientIntensity: 0.4,
        fogColor: 0x2a2a1a,
        fogNear: 10,
        fogFar: 35,
        music: 'throne_room_theme',
        lockDoors: false,
        features: {
            throne: true,
            redCarpet: true,
            pillars: 8,
            banners: 12,
            chandelier: true,
            statues: 6
        },
        spawns: {
            boss: 'fallen_king',
            guards: ['royal_guard', 'royal_guard']
        }
    },

    // Chapel - Holy sanctuary
    chapel: {
        type: InstanceType.CHAPEL,
        name: 'Chapel of Light',
        description: 'A sacred place of worship',
        size: { width: 25, depth: 35, height: 10 },
        lighting: LightingPreset.HOLY_WHITE,
        ambientIntensity: 0.8,
        fogColor: 0x2a2a2a,
        fogNear: 8,
        fogFar: 30,
        music: 'chapel_hymn',
        lockDoors: false,
        preventEnemySpawns: true,
        features: {
            altar: true,
            pews: 12,
            candles: 30,
            stainedGlass: 4,
            holySymbol: true,
            offeringBox: true
        },
        spawns: {
            npcs: ['priest', 'acolyte']
        },
        services: {
            blessing: true,
            purification: true,
            donation: true
        }
    },

    // Workshop - Crafting area
    workshop: {
        type: InstanceType.WORKSHOP,
        name: 'Blacksmith\'s Workshop',
        description: 'A place to craft and upgrade equipment',
        size: { width: 30, depth: 25, height: 7 },
        lighting: LightingPreset.FORGE_ORANGE,
        ambientIntensity: 0.5,
        fogColor: 0x332211,
        fogNear: 6,
        fogFar: 22,
        music: 'workshop_ambience',
        lockDoors: false,
        features: {
            forge: true,
            anvil: true,
            grindstone: true,
            workbenches: 4,
            toolRacks: 6,
            materialBins: 8,
            weaponDisplay: true
        },
        spawns: {
            npcs: ['blacksmith', 'apprentice']
        },
        services: {
            crafting: true,
            repair: true,
            upgrade: true,
            enchanting: true
        }
    }
};

// Helper function to get instance definition by ID
export function getInstanceDefinition(instanceId) {
    return INSTANCE_DEFINITIONS[instanceId];
}

// Helper function to get all instances of a specific type
export function getInstancesByType(type) {
    return Object.entries(INSTANCE_DEFINITIONS)
        .filter(([id, def]) => def.type === type)
        .map(([id, def]) => ({ id, ...def }));
}
