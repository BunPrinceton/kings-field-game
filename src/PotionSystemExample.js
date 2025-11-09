/**
 * PotionSystemExample - Demonstrates how to integrate the potion system
 * This file shows example usage and can be imported into main.js
 */

import { Inventory } from './Inventory.js';
import { createPotion, getStarterPotions, getRandomPotion } from './PotionDefinitions.js';

/**
 * Initialize player inventory with starter potions
 */
export function initializePlayerInventory(player) {
  // Create inventory
  player.inventory = new Inventory(20);

  // Add starter potions
  const starterPotions = getStarterPotions();
  starterPotions.forEach(potion => {
    player.inventory.addItem(potion);
  });

  // Add some gold
  player.inventory.addGold(100);

  // Initialize potion cooldown tracking
  player.potionCooldown = 0;

  // Initialize buffs and status effects for potion system
  if (!player.buffs) {
    player.buffs = {};
  }
  if (!player.statusEffects) {
    player.statusEffects = {};
  }

  // Optional: Initialize stamina and mana if not present
  if (!player.stamina) {
    player.stamina = 100;
    player.maxStamina = 100;
  }
  if (!player.mana) {
    player.mana = 100;
    player.maxMana = 100;
  }

  console.log('Player inventory initialized with starter potions');
  return player.inventory;
}

/**
 * Setup potion hotkeys (number keys 5-9 for potions)
 */
export function setupPotionHotkeys(player, updateUICallback) {
  // Assign some starter potions to hotbar
  const healthPotion = player.inventory.findItemById('health_potion');
  if (healthPotion) {
    player.inventory.assignToHotbar(healthPotion.index, 0);
  }

  const staminaPotion = player.inventory.findItemById('stamina_potion');
  if (staminaPotion) {
    player.inventory.assignToHotbar(staminaPotion.index, 1);
  }

  // Add keydown listener for hotbar keys
  window.addEventListener('keydown', (e) => {
    // Keys 5-9 for potion hotbar (hotbar slots 0-4)
    if (e.key >= '5' && e.key <= '9') {
      const hotbarSlot = parseInt(e.key) - 5;
      const success = player.inventory.useHotbarItem(hotbarSlot, player);

      if (success && updateUICallback) {
        updateUICallback();
      }
    }
  });

  console.log('Potion hotkeys setup: 5-9 keys');
}

/**
 * Update player status (call in game loop)
 * Handles potion cooldowns, buffs, and status effects
 */
export function updatePlayerPotionEffects(player, deltaTime) {
  // Update potion cooldown
  if (player.potionCooldown > 0) {
    player.potionCooldown = Math.max(0, player.potionCooldown - deltaTime);
  }

  // Update buffs (remove expired ones)
  if (player.buffs) {
    const now = Date.now();
    Object.keys(player.buffs).forEach(buffType => {
      const buff = player.buffs[buffType];
      if (buff && buff.duration) {
        const elapsed = now - buff.startTime;
        if (elapsed >= buff.duration) {
          console.log(`${buffType} buff expired`);
          delete player.buffs[buffType];
        }
      }
    });
  }

  // Update status effects (regeneration, etc.)
  if (player.statusEffects && player.statusEffects.regeneration) {
    const regen = player.statusEffects.regeneration;
    const now = Date.now();
    const elapsed = now - regen.startTime;

    // Check if regeneration is still active
    if (elapsed >= regen.duration) {
      console.log('Regeneration ended');
      delete player.statusEffects.regeneration;
    } else {
      // Apply heal tick
      const timeSinceLastTick = now - regen.lastTick;
      if (timeSinceLastTick >= regen.tickInterval) {
        if (player.health) {
          player.health.heal(regen.tickAmount);
          console.log(`Regeneration: +${regen.tickAmount} HP`);
        }
        regen.lastTick = now;
      }
    }
  }
}

/**
 * Calculate damage with buff modifiers
 */
export function getModifiedDamage(player, baseDamage) {
  let damage = baseDamage;

  // Apply strength buff
  if (player.buffs && player.buffs.strength) {
    const multiplier = 1 + (player.buffs.strength.potency / 100);
    damage *= multiplier;
  }

  return Math.floor(damage);
}

/**
 * Calculate damage reduction from buffs
 */
export function getModifiedDamageReduction(player, incomingDamage) {
  let damage = incomingDamage;

  // Apply defense buff
  if (player.buffs && player.buffs.defense) {
    const reduction = player.buffs.defense.potency / 100;
    damage *= (1 - reduction);
  }

  // Apply resistance buff
  if (player.buffs && player.buffs.resistance) {
    const reduction = player.buffs.resistance.potency / 100;
    damage *= (1 - reduction);
  }

  return Math.floor(damage);
}

/**
 * Get UI display for active buffs
 */
export function getActiveBuffsDisplay(player) {
  if (!player.buffs || Object.keys(player.buffs).length === 0) {
    return '';
  }

  const now = Date.now();
  let html = '<div style="font-size: 11px; margin-top: 5px; color: #8f8;">';
  html += '<div style="font-weight: bold;">Active Buffs:</div>';

  Object.keys(player.buffs).forEach(buffType => {
    const buff = player.buffs[buffType];
    if (buff && buff.duration) {
      const elapsed = now - buff.startTime;
      const remaining = buff.duration - elapsed;
      const secondsLeft = Math.ceil(remaining / 1000);

      html += `<div>${buffType}: +${buff.potency}% (${secondsLeft}s)</div>`;
    }
  });

  html += '</div>';
  return html;
}

/**
 * Add random potion loot to inventory
 */
export function addRandomPotionLoot(player) {
  const potion = getRandomPotion();
  if (potion) {
    const success = player.inventory.addItem(potion);
    if (success) {
      console.log(`Found ${potion.name}!`);
      return potion;
    }
  }
  return null;
}

/**
 * Example: Use a specific potion by ID
 */
export function usePotion(player, potionId) {
  const result = player.inventory.findItemById(potionId);
  if (result) {
    return player.inventory.useItem(result.index, player);
  }
  console.log(`Potion ${potionId} not found in inventory`);
  return false;
}

/**
 * Get inventory display HTML
 */
export function getInventoryDisplayHTML(player) {
  if (!player.inventory) return '';

  const inventoryData = player.inventory.getInventoryData();
  const stats = player.inventory.getStats();

  let html = '<div style="font-size: 11px; margin-top: 10px; padding: 5px; background: rgba(0,0,0,0.7); border: 1px solid #666;">';
  html += '<div style="color: #ffa500; margin-bottom: 3px; font-weight: bold;">INVENTORY</div>';
  html += `<div style="font-size: 10px; opacity: 0.7;">Slots: ${stats.usedSlots}/${stats.totalSlots} | Gold: ${stats.gold}</div>`;

  // Show first few items
  const visibleItems = inventoryData.filter(slot => !slot.isEmpty).slice(0, 5);
  if (visibleItems.length > 0) {
    html += '<div style="margin-top: 3px; font-size: 10px;">';
    visibleItems.forEach(slot => {
      const quantity = slot.quantity > 1 ? ` x${slot.quantity}` : '';
      html += `<div>${slot.item.icon} ${slot.item.name}${quantity}</div>`;
    });
    html += '</div>';
  }

  html += '</div>';
  return html;
}

/**
 * Get hotbar display HTML
 */
export function getHotbarDisplayHTML(player) {
  if (!player.inventory) return '';

  const hotbarData = player.inventory.getHotbarData();

  let html = '<div style="font-size: 11px; margin-top: 5px; padding: 3px; background: rgba(0,0,0,0.6);">';
  html += '<div style="font-size: 9px; opacity: 0.7; margin-bottom: 2px;">Hotbar (5-9):</div>';
  html += '<div style="display: flex; gap: 3px;">';

  hotbarData.forEach((slot, index) => {
    const key = index + 5;
    if (slot.isEmpty) {
      html += `<div style="width: 30px; height: 30px; border: 1px solid #444; background: #222; text-align: center; line-height: 30px; font-size: 9px; opacity: 0.5;">${key}</div>`;
    } else {
      const quantity = slot.quantity > 1 ? `<div style="position: absolute; bottom: 0; right: 2px; font-size: 8px;">${slot.quantity}</div>` : '';
      html += `<div style="position: relative; width: 30px; height: 30px; border: 1px solid #888; background: #333; text-align: center; line-height: 30px; font-size: 16px;">${slot.item.icon}${quantity}</div>`;
    }
  });

  html += '</div></div>';
  return html;
}
