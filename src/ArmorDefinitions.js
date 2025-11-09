/**
 * Armor item definitions compatible with ItemManager
 * These definitions integrate with the existing item system
 */

export const ARMOR_DEFINITIONS = {
  // ========== BODY ARMOR ==========

  leather_armor: {
    id: 'leather_armor',
    name: 'Leather Armor',
    description: 'Light armor made from treated leather. Good for agile fighters.',
    type: 'armor',
    category: 'armor',
    subtype: 'body',
    rarity: 'common',
    weight: 3,
    value: 50,
    stackable: false,
    stats: {
      defense: 5,
      durability: 80,
      maxDurability: 80,
      resistances: {
        physical: 0.05,
        fire: 0.02,
        ice: 0.02,
        lightning: 0.0
      },
      speedModifier: 1.0,
      staminaModifier: 0.95
    }
  },

  chainmail_armor: {
    id: 'chainmail_armor',
    name: 'Chainmail Armor',
    description: 'Interlocking metal rings provide good protection with moderate weight.',
    type: 'armor',
    category: 'armor',
    subtype: 'body',
    rarity: 'uncommon',
    weight: 8,
    value: 150,
    stackable: false,
    stats: {
      defense: 15,
      durability: 150,
      maxDurability: 150,
      resistances: {
        physical: 0.15,
        fire: 0.05,
        ice: 0.10,
        lightning: -0.10
      },
      speedModifier: 0.9,
      staminaModifier: 0.85
    }
  },

  plate_armor: {
    id: 'plate_armor',
    name: 'Plate Armor',
    description: 'Heavy steel plates offer maximum protection at the cost of mobility.',
    type: 'armor',
    category: 'armor',
    subtype: 'body',
    rarity: 'rare',
    weight: 15,
    value: 400,
    stackable: false,
    stats: {
      defense: 30,
      durability: 250,
      maxDurability: 250,
      resistances: {
        physical: 0.30,
        fire: 0.15,
        ice: 0.20,
        lightning: -0.05
      },
      speedModifier: 0.75,
      staminaModifier: 0.7
    }
  },

  mage_robes: {
    id: 'mage_robes',
    name: 'Mage Robes',
    description: 'Enchanted robes that provide excellent elemental protection.',
    type: 'armor',
    category: 'armor',
    subtype: 'body',
    rarity: 'uncommon',
    weight: 2,
    value: 200,
    stackable: false,
    stats: {
      defense: 3,
      durability: 60,
      maxDurability: 60,
      resistances: {
        physical: 0.03,
        fire: 0.25,
        ice: 0.25,
        lightning: 0.25
      },
      speedModifier: 1.05,
      staminaModifier: 1.1
    }
  },

  dragon_scale_armor: {
    id: 'dragon_scale_armor',
    name: 'Dragon Scale Armor',
    description: 'Legendary armor crafted from dragon scales. Nearly impervious to fire.',
    type: 'armor',
    category: 'armor',
    subtype: 'body',
    rarity: 'legendary',
    weight: 12,
    value: 1500,
    stackable: false,
    stats: {
      defense: 35,
      durability: 300,
      maxDurability: 300,
      resistances: {
        physical: 0.35,
        fire: 0.50,
        ice: 0.10,
        lightning: 0.05
      },
      speedModifier: 0.85,
      staminaModifier: 0.8
    }
  },

  // ========== HELMETS ==========

  leather_cap: {
    id: 'leather_cap',
    name: 'Leather Cap',
    description: 'A simple leather cap offering basic head protection.',
    type: 'armor',
    category: 'armor',
    subtype: 'helmet',
    rarity: 'common',
    weight: 1,
    value: 20,
    stackable: false,
    stats: {
      defense: 2,
      durability: 50,
      maxDurability: 50,
      resistances: {
        physical: 0.02,
        fire: 0.01,
        ice: 0.01,
        lightning: 0.0
      }
    }
  },

  iron_helmet: {
    id: 'iron_helmet',
    name: 'Iron Helmet',
    description: 'A sturdy iron helmet with a protective visor.',
    type: 'armor',
    category: 'armor',
    subtype: 'helmet',
    rarity: 'uncommon',
    weight: 4,
    value: 80,
    stackable: false,
    stats: {
      defense: 8,
      durability: 120,
      maxDurability: 120,
      resistances: {
        physical: 0.08,
        fire: 0.03,
        ice: 0.05,
        lightning: -0.05
      }
    }
  },

  knight_helmet: {
    id: 'knight_helmet',
    name: 'Knight Helmet',
    description: 'A full-face helmet worn by elite knights.',
    type: 'armor',
    category: 'armor',
    subtype: 'helmet',
    rarity: 'rare',
    weight: 6,
    value: 200,
    stackable: false,
    stats: {
      defense: 12,
      durability: 180,
      maxDurability: 180,
      resistances: {
        physical: 0.12,
        fire: 0.06,
        ice: 0.08,
        lightning: -0.03
      }
    }
  },

  wizard_hat: {
    id: 'wizard_hat',
    name: 'Wizard Hat',
    description: 'A tall pointed hat imbued with magical properties.',
    type: 'armor',
    category: 'armor',
    subtype: 'helmet',
    rarity: 'uncommon',
    weight: 0.5,
    value: 120,
    stackable: false,
    stats: {
      defense: 1,
      durability: 40,
      maxDurability: 40,
      resistances: {
        physical: 0.01,
        fire: 0.10,
        ice: 0.10,
        lightning: 0.10
      }
    }
  },

  dragon_horn_helm: {
    id: 'dragon_horn_helm',
    name: 'Dragon Horn Helm',
    description: 'A fearsome helmet adorned with dragon horns.',
    type: 'armor',
    category: 'armor',
    subtype: 'helmet',
    rarity: 'legendary',
    weight: 7,
    value: 800,
    stackable: false,
    stats: {
      defense: 15,
      durability: 220,
      maxDurability: 220,
      resistances: {
        physical: 0.15,
        fire: 0.25,
        ice: 0.08,
        lightning: 0.05
      }
    }
  },

  // ========== SHIELDS ==========

  wooden_shield: {
    id: 'wooden_shield',
    name: 'Wooden Shield',
    description: 'A basic wooden shield reinforced with metal bands.',
    type: 'armor',
    category: 'armor',
    subtype: 'shield',
    rarity: 'common',
    weight: 3,
    value: 30,
    stackable: false,
    stats: {
      defense: 5,
      blockChance: 0.15,
      durability: 70,
      maxDurability: 70,
      resistances: {
        physical: 0.10,
        fire: -0.10,
        ice: 0.05,
        lightning: 0.0
      }
    }
  },

  iron_shield: {
    id: 'iron_shield',
    name: 'Iron Shield',
    description: 'A solid iron shield capable of blocking most attacks.',
    type: 'armor',
    category: 'armor',
    subtype: 'shield',
    rarity: 'uncommon',
    weight: 6,
    value: 100,
    stackable: false,
    stats: {
      defense: 10,
      blockChance: 0.25,
      durability: 150,
      maxDurability: 150,
      resistances: {
        physical: 0.15,
        fire: 0.05,
        ice: 0.10,
        lightning: -0.05
      }
    }
  },

  tower_shield: {
    id: 'tower_shield',
    name: 'Tower Shield',
    description: 'A massive shield that covers the entire body. Very heavy.',
    type: 'armor',
    category: 'armor',
    subtype: 'shield',
    rarity: 'rare',
    weight: 12,
    value: 300,
    stackable: false,
    stats: {
      defense: 18,
      blockChance: 0.35,
      durability: 250,
      maxDurability: 250,
      resistances: {
        physical: 0.25,
        fire: 0.10,
        ice: 0.15,
        lightning: -0.03
      },
      speedModifier: 0.8
    }
  },

  magic_shield: {
    id: 'magic_shield',
    name: 'Magic Shield',
    description: 'A lightweight shield enhanced with protective enchantments.',
    type: 'armor',
    category: 'armor',
    subtype: 'shield',
    rarity: 'uncommon',
    weight: 2,
    value: 180,
    stackable: false,
    stats: {
      defense: 6,
      blockChance: 0.20,
      durability: 100,
      maxDurability: 100,
      resistances: {
        physical: 0.08,
        fire: 0.15,
        ice: 0.15,
        lightning: 0.15
      }
    }
  },

  dragon_scale_shield: {
    id: 'dragon_scale_shield',
    name: 'Dragon Scale Shield',
    description: 'A legendary shield crafted from dragon scales.',
    type: 'armor',
    category: 'armor',
    subtype: 'shield',
    rarity: 'legendary',
    weight: 8,
    value: 1000,
    stackable: false,
    stats: {
      defense: 20,
      blockChance: 0.40,
      durability: 300,
      maxDurability: 300,
      resistances: {
        physical: 0.28,
        fire: 0.40,
        ice: 0.12,
        lightning: 0.10
      },
      speedModifier: 0.9
    }
  },

  // ========== SPECIAL ARMOR SETS ==========

  shadow_cloak: {
    id: 'shadow_cloak',
    name: 'Shadow Cloak',
    description: 'A dark cloak that makes the wearer harder to detect.',
    type: 'armor',
    category: 'armor',
    subtype: 'body',
    rarity: 'rare',
    weight: 1.5,
    value: 350,
    stackable: false,
    stats: {
      defense: 4,
      durability: 90,
      maxDurability: 90,
      resistances: {
        physical: 0.04,
        fire: 0.0,
        ice: 0.15,
        lightning: 0.05
      },
      speedModifier: 1.1,
      staminaModifier: 1.05,
      specialEffects: ['stealth']
    }
  },

  crystal_armor: {
    id: 'crystal_armor',
    name: 'Crystal Armor',
    description: 'Mystical armor made from enchanted crystals. Glows faintly.',
    type: 'armor',
    category: 'armor',
    subtype: 'body',
    rarity: 'epic',
    weight: 7,
    value: 800,
    stackable: false,
    stats: {
      defense: 20,
      durability: 150,
      maxDurability: 150,
      resistances: {
        physical: 0.18,
        fire: 0.30,
        ice: 0.30,
        lightning: 0.30
      },
      speedModifier: 0.95,
      staminaModifier: 0.95,
      specialEffects: ['magic_regeneration']
    }
  },

  demon_armor: {
    id: 'demon_armor',
    name: 'Demon Armor',
    description: 'Dark armor forged in the depths of hell. Grants power at a cost.',
    type: 'armor',
    category: 'armor',
    subtype: 'body',
    rarity: 'legendary',
    weight: 18,
    value: 2000,
    stackable: false,
    stats: {
      defense: 40,
      durability: 350,
      maxDurability: 350,
      resistances: {
        physical: 0.40,
        fire: 0.60,
        ice: -0.20,
        lightning: 0.10
      },
      speedModifier: 0.7,
      staminaModifier: 0.6,
      specialEffects: ['life_drain', 'strength_boost']
    }
  },

  holy_armor: {
    id: 'holy_armor',
    name: 'Holy Armor',
    description: 'Blessed armor that radiates divine light. Effective against undead.',
    type: 'armor',
    category: 'armor',
    subtype: 'body',
    rarity: 'legendary',
    weight: 10,
    value: 1800,
    stackable: false,
    stats: {
      defense: 28,
      durability: 280,
      maxDurability: 280,
      resistances: {
        physical: 0.28,
        fire: 0.20,
        ice: 0.20,
        lightning: 0.35
      },
      speedModifier: 0.88,
      staminaModifier: 0.85,
      specialEffects: ['holy_damage', 'undead_slayer', 'health_regeneration']
    }
  }
};

/**
 * Helper function to get armor by subtype
 */
export function getArmorBySubtype(subtype) {
  return Object.values(ARMOR_DEFINITIONS).filter(
    armor => armor.subtype === subtype
  );
}

/**
 * Helper function to get armor by rarity
 */
export function getArmorByRarity(rarity) {
  return Object.values(ARMOR_DEFINITIONS).filter(
    armor => armor.rarity === rarity
  );
}

/**
 * Calculate total armor stats from equipped pieces
 */
export function calculateTotalArmorStats(bodyArmor, helmet, shield) {
  const stats = {
    defense: 0,
    weight: 0,
    resistances: { physical: 0, fire: 0, ice: 0, lightning: 0 },
    speedModifier: 1.0,
    staminaModifier: 1.0,
    blockChance: 0.0,
    specialEffects: []
  };

  const pieces = [bodyArmor, helmet, shield].filter(piece => piece !== null);

  pieces.forEach(piece => {
    if (!piece || !piece.stats) return;

    // Sum defense and weight
    stats.defense += piece.stats.defense || 0;
    stats.weight += piece.weight || 0;

    // Add resistances
    Object.keys(stats.resistances).forEach(type => {
      stats.resistances[type] += piece.stats.resistances?.[type] || 0;
    });

    // Multiply speed modifiers
    if (piece.stats.speedModifier) {
      stats.speedModifier *= piece.stats.speedModifier;
    }

    // Multiply stamina modifiers (only from body armor)
    if (piece.subtype === 'body' && piece.stats.staminaModifier) {
      stats.staminaModifier *= piece.stats.staminaModifier;
    }

    // Block chance only from shields
    if (piece.subtype === 'shield' && piece.stats.blockChance) {
      stats.blockChance = piece.stats.blockChance;
    }

    // Collect special effects
    if (piece.stats.specialEffects) {
      stats.specialEffects.push(...piece.stats.specialEffects);
    }
  });

  // Clamp resistances between -0.5 and 0.75
  Object.keys(stats.resistances).forEach(type => {
    stats.resistances[type] = Math.max(-0.5, Math.min(0.75, stats.resistances[type]));
  });

  return stats;
}
