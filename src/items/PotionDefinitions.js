/**
 * PotionDefinitions.js - Predefined potion types
 */

import { Potion, PotionEffect } from './Potion.js';
import { ItemRarity } from './Item.js';

/**
 * Factory function to create potion instances from definitions
 */
export function createPotion(potionId, quantity = 1) {
  const definition = POTION_DEFINITIONS[potionId];
  if (!definition) {
    console.warn(`Unknown potion ID: ${potionId}`);
    return null;
  }

  return new Potion({
    ...definition,
    quantity: quantity
  });
}

/**
 * All available potion types in the game
 */
export const POTION_DEFINITIONS = {
  // === HEALING POTIONS ===

  health_potion_minor: {
    id: 'health_potion_minor',
    name: 'Minor Health Potion',
    description: 'Restores 25 HP instantly.',
    icon: '🧪',
    rarity: ItemRarity.COMMON,
    effectType: PotionEffect.HEAL,
    potency: 25,
    duration: 0,
    cooldown: 1000,
    value: 10,
    maxStackSize: 99
  },

  health_potion: {
    id: 'health_potion',
    name: 'Health Potion',
    description: 'Restores 50 HP instantly.',
    icon: '🧪',
    rarity: ItemRarity.COMMON,
    effectType: PotionEffect.HEAL,
    potency: 50,
    duration: 0,
    cooldown: 1000,
    value: 25,
    maxStackSize: 99
  },

  health_potion_greater: {
    id: 'health_potion_greater',
    name: 'Greater Health Potion',
    description: 'Restores 100 HP instantly.',
    icon: '🧪',
    rarity: ItemRarity.UNCOMMON,
    effectType: PotionEffect.HEAL,
    potency: 100,
    duration: 0,
    cooldown: 1000,
    value: 50,
    maxStackSize: 99
  },

  health_potion_superior: {
    id: 'health_potion_superior',
    name: 'Superior Health Potion',
    description: 'Restores 200 HP instantly.',
    icon: '🧪',
    rarity: ItemRarity.RARE,
    effectType: PotionEffect.HEAL,
    potency: 200,
    duration: 0,
    cooldown: 1000,
    value: 100,
    maxStackSize: 99
  },

  // === STAMINA POTIONS ===

  stamina_potion: {
    id: 'stamina_potion',
    name: 'Stamina Potion',
    description: 'Restores 50 stamina instantly.',
    icon: '⚡',
    rarity: ItemRarity.COMMON,
    effectType: PotionEffect.RESTORE_STAMINA,
    potency: 50,
    duration: 0,
    cooldown: 800,
    value: 20,
    maxStackSize: 99
  },

  stamina_potion_greater: {
    id: 'stamina_potion_greater',
    name: 'Greater Stamina Potion',
    description: 'Restores 100 stamina instantly.',
    icon: '⚡',
    rarity: ItemRarity.UNCOMMON,
    effectType: PotionEffect.RESTORE_STAMINA,
    potency: 100,
    duration: 0,
    cooldown: 800,
    value: 40,
    maxStackSize: 99
  },

  // === MANA POTIONS ===

  mana_potion: {
    id: 'mana_potion',
    name: 'Mana Potion',
    description: 'Restores 30 mana instantly.',
    icon: '🔮',
    rarity: ItemRarity.COMMON,
    effectType: PotionEffect.RESTORE_MANA,
    potency: 30,
    duration: 0,
    cooldown: 1200,
    value: 30,
    maxStackSize: 99
  },

  mana_potion_greater: {
    id: 'mana_potion_greater',
    name: 'Greater Mana Potion',
    description: 'Restores 60 mana instantly.',
    icon: '🔮',
    rarity: ItemRarity.UNCOMMON,
    effectType: PotionEffect.RESTORE_MANA,
    potency: 60,
    duration: 0,
    cooldown: 1200,
    value: 60,
    maxStackSize: 99
  },

  // === CURE POTIONS ===

  antidote: {
    id: 'antidote',
    name: 'Antidote',
    description: 'Cures poison status effect.',
    icon: '💊',
    rarity: ItemRarity.COMMON,
    effectType: PotionEffect.CURE_POISON,
    potency: 0,
    duration: 0,
    cooldown: 500,
    value: 15,
    maxStackSize: 99
  },

  // === BUFF POTIONS ===

  strength_elixir: {
    id: 'strength_elixir',
    name: 'Elixir of Strength',
    description: 'Increases attack damage by 20% for 30 seconds.',
    icon: '💪',
    rarity: ItemRarity.UNCOMMON,
    effectType: PotionEffect.BUFF_STRENGTH,
    potency: 20, // 20% increase
    duration: 30000, // 30 seconds
    cooldown: 2000,
    value: 75,
    maxStackSize: 20
  },

  defense_elixir: {
    id: 'defense_elixir',
    name: 'Elixir of Defense',
    description: 'Reduces incoming damage by 25% for 30 seconds.',
    icon: '🛡️',
    rarity: ItemRarity.UNCOMMON,
    effectType: PotionEffect.BUFF_DEFENSE,
    potency: 25, // 25% reduction
    duration: 30000, // 30 seconds
    cooldown: 2000,
    value: 75,
    maxStackSize: 20
  },

  speed_elixir: {
    id: 'speed_elixir',
    name: 'Elixir of Speed',
    description: 'Increases movement speed by 30% for 20 seconds.',
    icon: '🏃',
    rarity: ItemRarity.UNCOMMON,
    effectType: PotionEffect.BUFF_SPEED,
    potency: 30, // 30% increase
    duration: 20000, // 20 seconds
    cooldown: 2000,
    value: 60,
    maxStackSize: 20
  },

  // === REGENERATION POTIONS ===

  regeneration_potion: {
    id: 'regeneration_potion',
    name: 'Potion of Regeneration',
    description: 'Regenerates 5 HP per second for 10 seconds.',
    icon: '💚',
    rarity: ItemRarity.RARE,
    effectType: PotionEffect.REGENERATION,
    potency: 5, // HP per tick
    duration: 10000, // 10 seconds
    cooldown: 1500,
    value: 100,
    maxStackSize: 20
  },

  regeneration_potion_greater: {
    id: 'regeneration_potion_greater',
    name: 'Greater Potion of Regeneration',
    description: 'Regenerates 10 HP per second for 15 seconds.',
    icon: '💚',
    rarity: ItemRarity.EPIC,
    effectType: PotionEffect.REGENERATION,
    potency: 10, // HP per tick
    duration: 15000, // 15 seconds
    cooldown: 1500,
    value: 200,
    maxStackSize: 20
  },

  // === RESISTANCE POTIONS ===

  resistance_potion: {
    id: 'resistance_potion',
    name: 'Potion of Resistance',
    description: 'Reduces all damage by 30% for 25 seconds.',
    icon: '🔰',
    rarity: ItemRarity.RARE,
    effectType: PotionEffect.RESISTANCE,
    potency: 30, // 30% damage reduction
    duration: 25000, // 25 seconds
    cooldown: 2500,
    value: 150,
    maxStackSize: 20
  },

  // === LEGENDARY POTIONS ===

  full_restore: {
    id: 'full_restore',
    name: 'Elixir of Full Restore',
    description: 'Instantly restores all HP, stamina, and mana.',
    icon: '✨',
    rarity: ItemRarity.LEGENDARY,
    effectType: PotionEffect.HEAL,
    potency: 9999, // Will cap at max HP
    duration: 0,
    cooldown: 5000,
    value: 500,
    maxStackSize: 5
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
export function getRandomPotion(minRarity = ItemRarity.COMMON) {
  const rarityOrder = [
    ItemRarity.COMMON,
    ItemRarity.UNCOMMON,
    ItemRarity.RARE,
    ItemRarity.EPIC,
    ItemRarity.LEGENDARY
  ];

  const minRarityIndex = rarityOrder.indexOf(minRarity);
  const availablePotions = Object.keys(POTION_DEFINITIONS).filter(id => {
    const rarity = POTION_DEFINITIONS[id].rarity;
    return rarityOrder.indexOf(rarity) >= minRarityIndex;
  });

  const randomId = availablePotions[Math.floor(Math.random() * availablePotions.length)];
  return createPotion(randomId);
}
