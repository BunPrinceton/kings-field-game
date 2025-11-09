/**
 * Armor - Armor item class for the item system
 * Extends Item to provide armor-specific functionality
 */

import { Item } from './Item.js';

export class Armor extends Item {
  constructor(definition) {
    super(definition);

    // Armor-specific properties
    this.subtype = definition.subtype; // 'body', 'helmet', 'shield'
    this.stats = { ...definition.stats };

    // Current durability (starts at max)
    this.durability = definition.stats.durability || 100;
    this.maxDurability = definition.stats.maxDurability || 100;

    // Store base stats for restoration after repair
    this.baseStats = {
      defense: this.stats.defense,
      resistances: { ...this.stats.resistances }
    };
  }

  /**
   * Get current defense value (reduced when durability is low)
   */
  getDefense() {
    if (this.durability <= 0) return 0;

    // Reduce defense when durability is below 25%
    const durabilityPercent = this.durability / this.maxDurability;
    if (durabilityPercent < 0.25) {
      return Math.floor(this.baseStats.defense * durabilityPercent * 4);
    }

    return this.stats.defense;
  }

  /**
   * Get current resistances (reduced when durability is low)
   */
  getResistances() {
    if (this.durability <= 0) {
      return { physical: 0, fire: 0, ice: 0, lightning: 0 };
    }

    // Reduce resistances when durability is below 25%
    const durabilityPercent = this.durability / this.maxDurability;
    if (durabilityPercent < 0.25) {
      const resistances = {};
      Object.keys(this.stats.resistances).forEach(type => {
        resistances[type] = this.stats.resistances[type] * durabilityPercent * 4;
      });
      return resistances;
    }

    return this.stats.resistances;
  }

  /**
   * Damage the armor's durability
   */
  damage(amount = 1) {
    this.durability = Math.max(0, this.durability - amount);

    // Update stats if armor is broken
    if (this.durability <= 0 && this.stats.defense > 0) {
      console.log(`${this.name} has broken!`);
      this.stats.defense = 0;
      this.stats.resistances = { physical: 0, fire: 0, ice: 0, lightning: 0 };
    }
  }

  /**
   * Repair the armor
   */
  repair(amount = 100) {
    const oldDurability = this.durability;
    this.durability = Math.min(this.maxDurability, this.durability + amount);

    // Restore stats if repaired from broken state
    if (oldDurability <= 0 && this.durability > 0) {
      this.stats.defense = this.baseStats.defense;
      this.stats.resistances = { ...this.baseStats.resistances };
    }

    return this.durability - oldDurability; // Return amount repaired
  }

  /**
   * Check if armor is broken
   */
  isBroken() {
    return this.durability <= 0;
  }

  /**
   * Get durability percentage
   */
  getDurabilityPercent() {
    return (this.durability / this.maxDurability) * 100;
  }

  /**
   * Get detailed armor stats for tooltip
   */
  getTooltip() {
    let tooltip = `${this.description}\n\n`;

    // Durability status
    const durabilityPercent = this.getDurabilityPercent();
    let durabilityStatus = 'Excellent';
    if (durabilityPercent < 25) durabilityStatus = 'Broken';
    else if (durabilityPercent < 50) durabilityStatus = 'Poor';
    else if (durabilityPercent < 75) durabilityStatus = 'Fair';
    else if (durabilityPercent < 90) durabilityStatus = 'Good';

    tooltip += `Condition: ${durabilityStatus} (${Math.floor(this.durability)}/${this.maxDurability})\n`;
    tooltip += `Weight: ${this.weight}\n\n`;

    // Stats
    tooltip += `Defense: ${this.getDefense()}`;
    if (this.durability < this.maxDurability && this.getDefense() < this.baseStats.defense) {
      tooltip += ` (Base: ${this.baseStats.defense})`;
    }
    tooltip += `\n`;

    // Resistances
    const resistances = this.getResistances();
    tooltip += `Resistances:\n`;
    Object.entries(resistances).forEach(([type, value]) => {
      if (value !== 0) {
        const sign = value > 0 ? '+' : '';
        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
        tooltip += `  ${capitalizedType}: ${sign}${(value * 100).toFixed(0)}%\n`;
      }
    });

    // Special modifiers
    if (this.stats.speedModifier && this.stats.speedModifier !== 1.0) {
      const speedPercent = ((this.stats.speedModifier - 1) * 100).toFixed(0);
      const sign = speedPercent > 0 ? '+' : '';
      tooltip += `Speed: ${sign}${speedPercent}%\n`;
    }

    if (this.stats.staminaModifier && this.stats.staminaModifier !== 1.0) {
      const staminaPercent = ((1 - this.stats.staminaModifier) * 100).toFixed(0);
      const sign = staminaPercent > 0 ? '+' : '';
      tooltip += `Stamina Cost: ${sign}${staminaPercent}%\n`;
    }

    if (this.stats.blockChance) {
      tooltip += `Block Chance: ${(this.stats.blockChance * 100).toFixed(0)}%\n`;
    }

    // Special effects
    if (this.stats.specialEffects && this.stats.specialEffects.length > 0) {
      tooltip += `\nSpecial Effects:\n`;
      this.stats.specialEffects.forEach(effect => {
        const formattedEffect = effect.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        tooltip += `  • ${formattedEffect}\n`;
      });
    }

    // Rarity
    tooltip += `\nRarity: ${this.rarity.charAt(0).toUpperCase() + this.rarity.slice(1)}`;

    return tooltip;
  }

  /**
   * Equip the armor
   */
  use(user) {
    // Armor is equipped through the inventory system, not used directly
    console.log(`Equip ${this.name} in the armor slot`);
    return false;
  }

  /**
   * Serialize armor data
   */
  serialize() {
    return {
      ...super.serialize(),
      durability: this.durability,
      maxDurability: this.maxDurability
    };
  }

  /**
   * Get rarity color for UI display
   */
  getRarityColor() {
    const rarityColors = {
      common: '#ffffff',
      uncommon: '#1eff00',
      rare: '#0070dd',
      epic: '#a335ee',
      legendary: '#ff8000'
    };
    return rarityColors[this.rarity] || rarityColors.common;
  }

  /**
   * Create a copy of this armor (for dropping, trading, etc.)
   */
  clone() {
    const clone = new Armor({
      ...this,
      stats: { ...this.stats }
    });
    clone.durability = this.durability;
    return clone;
  }
}
