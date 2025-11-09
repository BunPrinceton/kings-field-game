/**
 * SwordDefinitions - Database of all sword types in the game
 * Contains definitions for various sword variants with different stats and properties
 */

export const SWORD_DEFINITIONS = {
  // STARTER SWORDS
  rusty_sword: {
    id: 'rusty_sword',
    name: 'Rusty Sword',
    description: 'An old, worn blade. It has seen better days.',
    type: 'weapon',
    category: 'sword',
    rarity: 'common',
    icon: '🗡️',
    damage: 15,
    attackSpeed: 550,
    range: 2.3,
    swingSpeed: 0.35,
    maxDurability: 50,
    bladeLength: 0.5,
    bladeWidth: 0.045,
    grip: 'one-handed',
    bladeMaterial: 'iron',
    bladeColor: 0x886655,
    handleColor: 0x3a2718,
    value: 10
  },

  short_sword: {
    id: 'short_sword',
    name: 'Short Sword',
    description: 'A reliable short blade, perfect for quick strikes.',
    type: 'weapon',
    category: 'sword',
    rarity: 'common',
    icon: '🗡️',
    damage: 25,
    attackSpeed: 500,
    range: 2.5,
    swingSpeed: 0.3,
    maxDurability: 100,
    bladeLength: 0.6,
    bladeWidth: 0.05,
    grip: 'one-handed',
    bladeMaterial: 'steel',
    bladeColor: 0xcccccc,
    handleColor: 0x4a3728,
    value: 50
  },

  // BASIC SWORDS
  long_sword: {
    id: 'long_sword',
    name: 'Long Sword',
    description: 'A well-balanced longsword with good reach.',
    type: 'weapon',
    category: 'sword',
    rarity: 'common',
    icon: '⚔️',
    damage: 35,
    attackSpeed: 600,
    range: 3.0,
    swingSpeed: 0.35,
    maxDurability: 150,
    bladeLength: 0.8,
    bladeWidth: 0.055,
    grip: 'one-handed',
    bladeMaterial: 'steel',
    bladeColor: 0xdddddd,
    handleColor: 0x5a4738,
    guardColor: 0x9b8365,
    slashBonus: 1.1,
    value: 100
  },

  broad_sword: {
    id: 'broad_sword',
    name: 'Broad Sword',
    description: 'A heavy blade that delivers devastating cuts.',
    type: 'weapon',
    category: 'sword',
    rarity: 'uncommon',
    icon: '⚔️',
    damage: 45,
    attackSpeed: 700,
    range: 2.8,
    swingSpeed: 0.4,
    maxDurability: 120,
    bladeLength: 0.7,
    bladeWidth: 0.08,
    grip: 'one-handed',
    bladeMaterial: 'steel',
    bladeColor: 0xcccccc,
    handleColor: 0x4a3728,
    guardColor: 0x8b7355,
    slashBonus: 1.3,
    requiredStrength: 15,
    value: 200
  },

  bastard_sword: {
    id: 'bastard_sword',
    name: 'Bastard Sword',
    description: 'A versatile blade that can be wielded with one or two hands.',
    type: 'weapon',
    category: 'sword',
    rarity: 'uncommon',
    icon: '⚔️',
    damage: 50,
    attackSpeed: 650,
    range: 3.2,
    swingSpeed: 0.4,
    maxDurability: 180,
    bladeLength: 0.85,
    bladeWidth: 0.06,
    grip: 'two-handed',
    bladeMaterial: 'steel',
    bladeColor: 0xdddddd,
    handleColor: 0x5a4738,
    guardColor: 0xab9375,
    slashBonus: 1.2,
    thrustBonus: 1.1,
    requiredStrength: 18,
    value: 250
  },

  // SPECIAL SWORDS
  rapier: {
    id: 'rapier',
    name: 'Rapier',
    description: 'A thin, pointed blade designed for precise thrusting attacks.',
    type: 'weapon',
    category: 'sword',
    rarity: 'uncommon',
    icon: '🗡️',
    damage: 30,
    attackSpeed: 400,
    range: 2.8,
    swingSpeed: 0.25,
    maxDurability: 100,
    bladeLength: 0.75,
    bladeWidth: 0.02,
    bladeThickness: 0.02,
    grip: 'one-handed',
    bladeMaterial: 'steel',
    bladeColor: 0xdddddd,
    handleColor: 0x6a5748,
    guardColor: 0xffd700,
    slashBonus: 0.7,
    thrustBonus: 1.8,
    critChance: 0.15,
    requiredDexterity: 18,
    value: 300
  },

  scimitar: {
    id: 'scimitar',
    name: 'Scimitar',
    description: 'A curved blade that excels at slashing attacks.',
    type: 'weapon',
    category: 'sword',
    rarity: 'uncommon',
    icon: '🗡️',
    damage: 38,
    attackSpeed: 520,
    range: 2.7,
    swingSpeed: 0.32,
    maxDurability: 130,
    bladeLength: 0.7,
    bladeWidth: 0.055,
    grip: 'one-handed',
    bladeMaterial: 'steel',
    bladeColor: 0xe0e0e0,
    handleColor: 0x7a5738,
    guardColor: 0xcd7f32,
    slashBonus: 1.5,
    thrustBonus: 0.8,
    value: 220
  },

  // HEAVY SWORDS
  great_sword: {
    id: 'great_sword',
    name: 'Great Sword',
    description: 'A massive two-handed blade that cleaves through enemies.',
    type: 'weapon',
    category: 'sword',
    rarity: 'rare',
    icon: '⚔️',
    damage: 70,
    attackSpeed: 900,
    range: 3.5,
    swingSpeed: 0.5,
    maxDurability: 200,
    bladeLength: 1.1,
    bladeWidth: 0.08,
    grip: 'two-handed',
    bladeMaterial: 'steel',
    bladeColor: 0xcccccc,
    handleColor: 0x4a3728,
    guardColor: 0x8b7355,
    slashBonus: 1.5,
    requiredStrength: 25,
    value: 500
  },

  claymore: {
    id: 'claymore',
    name: 'Claymore',
    description: 'An enormous Scottish sword with devastating power.',
    type: 'weapon',
    category: 'sword',
    rarity: 'rare',
    icon: '⚔️',
    damage: 80,
    attackSpeed: 1000,
    range: 3.8,
    swingSpeed: 0.55,
    maxDurability: 220,
    bladeLength: 1.2,
    bladeWidth: 0.09,
    grip: 'two-handed',
    bladeMaterial: 'steel',
    bladeColor: 0xdddddd,
    handleColor: 0x5a4738,
    guardColor: 0x9b8365,
    slashBonus: 1.6,
    thrustBonus: 1.2,
    requiredStrength: 30,
    value: 700
  },

  // LEGENDARY/ENCHANTED SWORDS
  flame_blade: {
    id: 'flame_blade',
    name: 'Flame Blade',
    description: 'A sword imbued with the power of eternal flame.',
    type: 'weapon',
    category: 'sword',
    rarity: 'rare',
    icon: '🔥',
    damage: 55,
    attackSpeed: 550,
    range: 2.9,
    swingSpeed: 0.35,
    maxDurability: 300,
    bladeLength: 0.75,
    bladeWidth: 0.06,
    grip: 'one-handed',
    bladeMaterial: 'enchanted steel',
    bladeColor: 0xff4444,
    handleColor: 0x5a3728,
    guardColor: 0xff8800,
    hasEnchantment: true,
    enchantmentColor: 0xff4400,
    elementalDamage: { type: 'fire', amount: 20 },
    specialAbility: {
      type: 'fire_slash',
      name: 'Inferno Strike',
      description: 'Unleashes a wave of fire that damages enemies.',
      multiplier: 1.5,
      cooldown: 5000
    },
    requiredStrength: 20,
    value: 1000
  },

  frost_fang: {
    id: 'frost_fang',
    name: 'Frost Fang',
    description: 'A blade forged in the heart of an ancient glacier.',
    type: 'weapon',
    category: 'sword',
    rarity: 'rare',
    icon: '❄️',
    damage: 52,
    attackSpeed: 500,
    range: 2.8,
    swingSpeed: 0.3,
    maxDurability: 280,
    bladeLength: 0.7,
    bladeWidth: 0.055,
    grip: 'one-handed',
    bladeMaterial: 'frost crystal',
    bladeColor: 0x88ccff,
    handleColor: 0x4a5a68,
    guardColor: 0x6688bb,
    hasEnchantment: true,
    enchantmentColor: 0x00ccff,
    elementalDamage: { type: 'frost', amount: 18 },
    specialAbility: {
      type: 'frost_strike',
      name: 'Frozen Touch',
      description: 'Slows enemies with freezing magic.',
      multiplier: 1.3,
      duration: 4000,
      cooldown: 6000
    },
    requiredStrength: 18,
    requiredDexterity: 15,
    value: 950
  },

  moonlight_edge: {
    id: 'moonlight_edge',
    name: 'Moonlight Edge',
    description: 'A mystical blade that glows with lunar energy.',
    type: 'weapon',
    category: 'sword',
    rarity: 'legendary',
    icon: '🌙',
    damage: 65,
    attackSpeed: 520,
    range: 3.0,
    swingSpeed: 0.33,
    maxDurability: 500,
    degradesOnUse: false,
    bladeLength: 0.85,
    bladeWidth: 0.06,
    grip: 'one-handed',
    bladeMaterial: 'moonstone',
    bladeColor: 0xaaddff,
    handleColor: 0x5a4a78,
    guardColor: 0x8877bb,
    hasEnchantment: true,
    enchantmentColor: 0x88ddff,
    critChance: 0.25,
    critMultiplier: 2.5,
    elementalDamage: { type: 'magic', amount: 25 },
    specialAbility: {
      type: 'life_steal',
      name: 'Lunar Drain',
      description: 'Absorbs life force from enemies.',
      multiplier: 1.4,
      cooldown: 7000
    },
    requiredStrength: 22,
    requiredDexterity: 20,
    value: 2000
  },

  holy_avenger: {
    id: 'holy_avenger',
    name: 'Holy Avenger',
    description: 'A sacred blade blessed by the divine to smite evil.',
    type: 'weapon',
    category: 'sword',
    rarity: 'legendary',
    icon: '✨',
    damage: 70,
    attackSpeed: 580,
    range: 3.1,
    swingSpeed: 0.38,
    maxDurability: 600,
    degradesOnUse: false,
    bladeLength: 0.9,
    bladeWidth: 0.07,
    grip: 'two-handed',
    bladeMaterial: 'celestial steel',
    bladeColor: 0xffffdd,
    handleColor: 0x6a5a48,
    guardColor: 0xffd700,
    hasEnchantment: true,
    enchantmentColor: 0xffffaa,
    critChance: 0.2,
    critMultiplier: 3.0,
    elementalDamage: { type: 'holy', amount: 30 },
    specialAbility: {
      type: 'holy_smite',
      name: 'Divine Judgment',
      description: 'Strikes down enemies with holy power. Extra damage to undead.',
      multiplier: 1.6,
      cooldown: 8000
    },
    requiredStrength: 25,
    value: 3000
  },

  dragon_slayer: {
    id: 'dragon_slayer',
    name: 'Dragon Slayer',
    description: 'A legendary blade forged to slay dragons. Impossibly heavy.',
    type: 'weapon',
    category: 'sword',
    rarity: 'legendary',
    icon: '🐉',
    damage: 100,
    attackSpeed: 1200,
    range: 4.0,
    swingSpeed: 0.6,
    maxDurability: 1000,
    degradesOnUse: false,
    bladeLength: 1.5,
    bladeWidth: 0.12,
    grip: 'two-handed',
    bladeMaterial: 'dragonite',
    bladeColor: 0x888888,
    handleColor: 0x3a2718,
    guardColor: 0xcc4444,
    slashBonus: 2.0,
    thrustBonus: 1.5,
    critChance: 0.15,
    critMultiplier: 3.5,
    requiredStrength: 40,
    value: 5000
  },

  // UNIQUE/CURSED SWORDS
  blood_drinker: {
    id: 'blood_drinker',
    name: 'Blood Drinker',
    description: 'A cursed blade that thirsts for blood. It grows stronger with each kill.',
    type: 'weapon',
    category: 'sword',
    rarity: 'legendary',
    icon: '🩸',
    damage: 60,
    attackSpeed: 480,
    range: 2.9,
    swingSpeed: 0.3,
    maxDurability: 666,
    degradesOnUse: false,
    bladeLength: 0.8,
    bladeWidth: 0.06,
    grip: 'one-handed',
    bladeMaterial: 'cursed steel',
    bladeColor: 0x880000,
    handleColor: 0x220000,
    guardColor: 0x440000,
    hasEnchantment: true,
    enchantmentColor: 0xff0000,
    critChance: 0.3,
    critMultiplier: 2.5,
    specialAbility: {
      type: 'life_steal',
      name: 'Blood Feast',
      description: 'Drains life from enemies with each strike.',
      multiplier: 1.8,
      cooldown: 4000
    },
    requiredStrength: 20,
    requiredDexterity: 20,
    value: 2500,
    data: {
      cursed: true,
      killCount: 0
    }
  },

  crystal_blade: {
    id: 'crystal_blade',
    name: 'Crystal Blade',
    description: 'A sword made of pure crystal. Beautiful but fragile.',
    type: 'weapon',
    category: 'sword',
    rarity: 'rare',
    icon: '💎',
    damage: 90,
    attackSpeed: 450,
    range: 2.8,
    swingSpeed: 0.28,
    maxDurability: 30,
    bladeLength: 0.75,
    bladeWidth: 0.05,
    grip: 'one-handed',
    bladeMaterial: 'crystal',
    bladeColor: 0xccffff,
    handleColor: 0x6688aa,
    guardColor: 0x88ccee,
    hasEnchantment: true,
    enchantmentColor: 0xccffff,
    critChance: 0.4,
    critMultiplier: 3.0,
    requiredDexterity: 25,
    value: 1500
  }
};

/**
 * Get a sword definition by ID
 */
export function getSwordDefinition(id) {
  return SWORD_DEFINITIONS[id] || null;
}

/**
 * Get all sword definitions
 */
export function getAllSwordDefinitions() {
  return SWORD_DEFINITIONS;
}

/**
 * Get swords by rarity
 */
export function getSwordsByRarity(rarity) {
  return Object.values(SWORD_DEFINITIONS).filter(def => def.rarity === rarity);
}

/**
 * Get swords by grip type
 */
export function getSwordsByGrip(grip) {
  return Object.values(SWORD_DEFINITIONS).filter(def => def.grip === grip);
}
