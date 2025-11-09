/**
 * PotionDefinitions - All potion types available in the game
 * Defines stats, effects, and properties for each potion
 */

import { Potion, PotionEffect } from './Potion.js';

/**
 * Factory function to create potion instances from definitions
 */
export function createPotion(potionId, quantity = 1) {
  const definition = POTION_DEFINITIONS[potionId];
  if (!definition) {
    console.warn(`Unknown potion ID: ${potionId}`);
    return null;
  }

  const potion = new Potion(definition);
  // Override quantity for stacks
  if (quantity > 1) {
    potion.data.quantity = quantity;
  }
  return potion;
}

/**
 * All available potion types in the game
 */
export const POTION_DEFINITIONS = {
  // === HEALING POTIONS ===

  health_potion_minor: {
    id: 'health_potion_minor',
    name: 'Minor Health Potion',
    description: 'A small vial of red liquid that heals minor wounds.',
    type: 'consumable',
    category: 'potion',
    icon: '🧪',
    rarity: 'common',
    effectType: PotionEffect.HEAL,
    potency: 25,
    duration: 0,
    cooldown: 1000,
    value: 10,
    stackable: true,
    maxStack: 99,
    weight: 0.1,
    liquidColor: 0xff6666,
    bottleColor: 0xcccccc,
    effects: [{ type: 'heal', amount: 25 }]
  },

  health_potion: {
    id: 'health_potion',
    name: 'Health Potion',
    description: 'A vial filled with crimson liquid that restores vitality.',
    type: 'consumable',
    category: 'potion',
    icon: '🧪',
    rarity: 'common',
    effectType: PotionEffect.HEAL,
    potency: 50,
    duration: 0,
    cooldown: 1000,
    value: 25,
    stackable: true,
    maxStack: 99,
    weight: 0.1,
    liquidColor: 0xff0000,
    bottleColor: 0xcccccc,
    effects: [{ type: 'heal', amount: 50 }]
  },

  health_potion_greater: {
    id: 'health_potion_greater',
    name: 'Greater Health Potion',
    description: 'A potent elixir that mends severe injuries.',
    type: 'consumable',
    category: 'potion',
    icon: '🧪',
    rarity: 'uncommon',
    effectType: PotionEffect.HEAL,
    potency: 100,
    duration: 0,
    cooldown: 1000,
    value: 50,
    stackable: true,
    maxStack: 99,
    weight: 0.2,
    liquidColor: 0xcc0000,
    bottleColor: 0xaaaaff,
    effects: [{ type: 'heal', amount: 100 }]
  },

  health_potion_superior: {
    id: 'health_potion_superior',
    name: 'Superior Health Potion',
    description: 'A masterfully brewed potion that can restore even mortal wounds.',
    type: 'consumable',
    category: 'potion',
    icon: '🧪',
    rarity: 'rare',
    effectType: PotionEffect.HEAL,
    potency: 200,
    duration: 0,
    cooldown: 1000,
    value: 100,
    stackable: true,
    maxStack: 99,
    weight: 0.2,
    liquidColor: 0xaa0000,
    bottleColor: 0x8888ff,
    effects: [{ type: 'heal', amount: 200 }]
  },

  // === STAMINA POTIONS ===

  stamina_potion: {
    id: 'stamina_potion',
    name: 'Stamina Potion',
    description: 'A yellow liquid that restores energy and vigor.',
    type: 'consumable',
    category: 'potion',
    icon: '⚡',
    rarity: 'common',
    effectType: PotionEffect.RESTORE_STAMINA,
    potency: 50,
    duration: 0,
    cooldown: 800,
    value: 20,
    stackable: true,
    maxStack: 99,
    weight: 0.1,
    liquidColor: 0xffff00,
    bottleColor: 0xcccccc,
    effects: []
  },

  stamina_potion_greater: {
    id: 'stamina_potion_greater',
    name: 'Greater Stamina Potion',
    description: 'A golden elixir that provides incredible endurance.',
    type: 'consumable',
    category: 'potion',
    icon: '⚡',
    rarity: 'uncommon',
    effectType: PotionEffect.RESTORE_STAMINA,
    potency: 100,
    duration: 0,
    cooldown: 800,
    value: 40,
    stackable: true,
    maxStack: 99,
    weight: 0.2,
    liquidColor: 0xffcc00,
    bottleColor: 0xaaaaff,
    effects: []
  },

  // === MANA POTIONS ===

  mana_potion: {
    id: 'mana_potion',
    name: 'Mana Potion',
    description: 'A shimmering blue liquid that restores magical energy.',
    type: 'consumable',
    category: 'potion',
    icon: '🔮',
    rarity: 'common',
    effectType: PotionEffect.RESTORE_MANA,
    potency: 30,
    duration: 0,
    cooldown: 1200,
    value: 30,
    stackable: true,
    maxStack: 99,
    weight: 0.1,
    liquidColor: 0x6666ff,
    bottleColor: 0xcccccc,
    effects: []
  },

  mana_potion_greater: {
    id: 'mana_potion_greater',
    name: 'Greater Mana Potion',
    description: 'A vibrant azure elixir brimming with arcane power.',
    type: 'consumable',
    category: 'potion',
    icon: '🔮',
    rarity: 'uncommon',
    effectType: PotionEffect.RESTORE_MANA,
    potency: 60,
    duration: 0,
    cooldown: 1200,
    value: 60,
    stackable: true,
    maxStack: 99,
    weight: 0.2,
    liquidColor: 0x0000ff,
    bottleColor: 0xaaaaff,
    effects: []
  },

  // === CURE POTIONS ===

  antidote: {
    id: 'antidote',
    name: 'Antidote',
    description: 'A green mixture that neutralizes poison.',
    type: 'consumable',
    category: 'potion',
    icon: '💊',
    rarity: 'common',
    effectType: PotionEffect.CURE_POISON,
    potency: 0,
    duration: 0,
    cooldown: 500,
    value: 15,
    stackable: true,
    maxStack: 99,
    weight: 0.1,
    liquidColor: 0x00ff00,
    bottleColor: 0xcccccc,
    effects: []
  },

  // === BUFF POTIONS ===

  strength_elixir: {
    id: 'strength_elixir',
    name: 'Elixir of Strength',
    description: 'A thick orange liquid that enhances physical power.',
    type: 'consumable',
    category: 'potion',
    icon: '💪',
    rarity: 'uncommon',
    effectType: PotionEffect.BUFF_STRENGTH,
    potency: 20, // 20% increase
    duration: 30000, // 30 seconds
    cooldown: 2000,
    value: 75,
    stackable: true,
    maxStack: 20,
    weight: 0.3,
    liquidColor: 0xff8800,
    bottleColor: 0xaaaaff,
    effects: []
  },

  defense_elixir: {
    id: 'defense_elixir',
    name: 'Elixir of Defense',
    description: 'A silver potion that hardens the skin like steel.',
    type: 'consumable',
    category: 'potion',
    icon: '🛡️',
    rarity: 'uncommon',
    effectType: PotionEffect.BUFF_DEFENSE,
    potency: 25, // 25% reduction
    duration: 30000, // 30 seconds
    cooldown: 2000,
    value: 75,
    stackable: true,
    maxStack: 20,
    weight: 0.3,
    liquidColor: 0xc0c0c0,
    bottleColor: 0xaaaaff,
    effects: []
  },

  speed_elixir: {
    id: 'speed_elixir',
    name: 'Elixir of Speed',
    description: 'A light green potion that makes you feel weightless.',
    type: 'consumable',
    category: 'potion',
    icon: '🏃',
    rarity: 'uncommon',
    effectType: PotionEffect.BUFF_SPEED,
    potency: 30, // 30% increase
    duration: 20000, // 20 seconds
    cooldown: 2000,
    value: 60,
    stackable: true,
    maxStack: 20,
    weight: 0.2,
    liquidColor: 0x88ff88,
    bottleColor: 0xaaaaff,
    effects: []
  },

  // === REGENERATION POTIONS ===

  regeneration_potion: {
    id: 'regeneration_potion',
    name: 'Potion of Regeneration',
    description: 'A glowing green elixir that continuously heals wounds.',
    type: 'consumable',
    category: 'potion',
    icon: '💚',
    rarity: 'rare',
    effectType: PotionEffect.REGENERATION,
    potency: 5, // HP per tick
    duration: 10000, // 10 seconds
    cooldown: 1500,
    value: 100,
    stackable: true,
    maxStack: 20,
    weight: 0.3,
    liquidColor: 0x00ff00,
    bottleColor: 0x8888ff,
    effects: []
  },

  regeneration_potion_greater: {
    id: 'regeneration_potion_greater',
    name: 'Greater Potion of Regeneration',
    description: 'A radiant emerald liquid with incredible healing properties.',
    type: 'consumable',
    category: 'potion',
    icon: '💚',
    rarity: 'epic',
    effectType: PotionEffect.REGENERATION,
    potency: 10, // HP per tick
    duration: 15000, // 15 seconds
    cooldown: 1500,
    value: 200,
    stackable: true,
    maxStack: 20,
    weight: 0.3,
    liquidColor: 0x00cc00,
    bottleColor: 0x6666ff,
    effects: []
  },

  // === RESISTANCE POTIONS ===

  resistance_potion: {
    id: 'resistance_potion',
    name: 'Potion of Resistance',
    description: 'A dark purple potion that shields you from harm.',
    type: 'consumable',
    category: 'potion',
    icon: '🔰',
    rarity: 'rare',
    effectType: PotionEffect.RESISTANCE,
    potency: 30, // 30% damage reduction
    duration: 25000, // 25 seconds
    cooldown: 2500,
    value: 150,
    stackable: true,
    maxStack: 20,
    weight: 0.3,
    liquidColor: 0x8800ff,
    bottleColor: 0x8888ff,
    effects: []
  },

  // === LEGENDARY POTIONS ===

  full_restore: {
    id: 'full_restore',
    name: 'Elixir of Full Restore',
    description: 'A legendary iridescent potion that fully restores all vitality.',
    type: 'consumable',
    category: 'potion',
    icon: '✨',
    rarity: 'legendary',
    effectType: PotionEffect.HEAL,
    potency: 9999, // Will cap at max HP
    duration: 0,
    cooldown: 5000,
    value: 500,
    stackable: true,
    maxStack: 5,
    weight: 0.5,
    liquidColor: 0xffffff,
    bottleColor: 0xffaa00,
    effects: [{ type: 'heal', amount: 9999 }]
  }
};

/**
 * Get all potion IDs by rarity
 */
export function getPotionsByRarity(rarity) {
  return Object.keys(POTION_DEFINITIONS).filter(
    id => POTION_DEFINITIONS[id].rarity === rarity
  );
}

/**
 * Get all potion IDs by effect type
 */
export function getPotionsByEffect(effectType) {
  return Object.keys(POTION_DEFINITIONS).filter(
    id => POTION_DEFINITIONS[id].effectType === effectType
  );
}

/**
 * Get random potion (for loot drops)
 */
export function getRandomPotion(rarityWeights = null) {
  // Default rarity weights
  if (!rarityWeights) {
    rarityWeights = {
      'common': 0.6,
      'uncommon': 0.25,
      'rare': 0.1,
      'epic': 0.04,
      'legendary': 0.01
    };
  }

  // Build weighted list
  const weightedList = [];
  Object.keys(POTION_DEFINITIONS).forEach(id => {
    const rarity = POTION_DEFINITIONS[id].rarity;
    const weight = rarityWeights[rarity] || 0;
    const copies = Math.ceil(weight * 100);

    for (let i = 0; i < copies; i++) {
      weightedList.push(id);
    }
  });

  if (weightedList.length === 0) {
    return null;
  }

  const randomId = weightedList[Math.floor(Math.random() * weightedList.length)];
  return createPotion(randomId);
}

/**
 * Get starter potions for new players
 */
export function getStarterPotions() {
  return [
    createPotion('health_potion', 3),
    createPotion('health_potion_minor', 5),
    createPotion('stamina_potion', 2)
  ];
}
