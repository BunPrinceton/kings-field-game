/**
 * Item - Base class for all items in the game
 * Provides common functionality for inventory items, weapons, consumables, etc.
 */

export class Item {
  constructor(definition) {
    // Core properties
    this.id = definition.id;
    this.name = definition.name;
    this.description = definition.description || '';
    this.type = definition.type; // 'weapon', 'consumable', 'key', etc.
    this.category = definition.category; // 'sword', 'axe', 'potion', etc.

    // Visual properties
    this.icon = definition.icon || '?';
    this.color = definition.color || 0xffffff;

    // Inventory properties
    this.stackable = definition.stackable || false;
    this.maxStack = definition.maxStack || 1;
    this.weight = definition.weight || 0;

    // Value
    this.value = definition.value || 0;
    this.rarity = definition.rarity || 'common'; // common, uncommon, rare, legendary

    // Flags
    this.droppable = definition.droppable !== false;
    this.tradeable = definition.tradeable !== false;
    this.destroyable = definition.destroyable !== false;

    // Custom data
    this.data = definition.data || {};
  }

  /**
   * Get item display name with rarity coloring
   */
  getDisplayName() {
    return this.name;
  }

  /**
   * Get item tooltip/description
   */
  getTooltip() {
    return this.description;
  }

  /**
   * Check if item can stack with another item
   */
  canStackWith(otherItem) {
    return this.stackable &&
           otherItem.stackable &&
           this.id === otherItem.id;
  }

  /**
   * Use the item (override in subclasses)
   */
  use(user) {
    console.log(`${user.name || 'Player'} used ${this.name}`);
    return false; // Return true if item was consumed
  }

  /**
   * Get item data for serialization
   */
  serialize() {
    return {
      id: this.id,
      type: this.type,
      category: this.category,
      data: this.data
    };
  }

  /**
   * Create item from serialized data
   */
  static deserialize(data, itemDefinitions) {
    const definition = itemDefinitions[data.id];
    if (!definition) {
      console.warn(`Unknown item ID: ${data.id}`);
      return null;
    }

    const item = new Item(definition);
    item.data = data.data || {};
    return item;
  }
}

/**
 * WeaponItem - Base class for all weapon items
 */
export class WeaponItem extends Item {
  constructor(definition) {
    super(definition);

    // Weapon stats
    this.damage = definition.damage || 10;
    this.attackSpeed = definition.attackSpeed || 500;
    this.range = definition.range || 2.0;
    this.swingSpeed = definition.swingSpeed || 0.3;

    // Durability
    this.maxDurability = definition.maxDurability || 100;
    this.durability = definition.durability || this.maxDurability;
    this.degradesOnUse = definition.degradesOnUse !== false;

    // Requirements
    this.requiredStrength = definition.requiredStrength || 0;
    this.requiredDexterity = definition.requiredDexterity || 0;

    // Bonuses
    this.critChance = definition.critChance || 0;
    this.critMultiplier = definition.critMultiplier || 2.0;
    this.elementalDamage = definition.elementalDamage || null; // { type: 'fire', amount: 10 }

    // Animation
    this.attackAnimation = definition.attackAnimation || 'slash';
  }

  /**
   * Get effective damage based on durability
   */
  getEffectiveDamage() {
    const durabilityMultiplier = this.durability / this.maxDurability;
    return Math.floor(this.damage * Math.max(0.25, durabilityMultiplier));
  }

  /**
   * Reduce durability when weapon is used
   */
  reduceDurability(amount = 1) {
    if (!this.degradesOnUse) return;

    this.durability = Math.max(0, this.durability - amount);

    if (this.durability === 0) {
      console.log(`${this.name} is broken!`);
      return true; // Weapon is broken
    }

    return false;
  }

  /**
   * Repair the weapon
   */
  repair(amount) {
    this.durability = Math.min(this.maxDurability, this.durability + amount);
  }

  /**
   * Get durability percentage
   */
  getDurabilityPercent() {
    return (this.durability / this.maxDurability) * 100;
  }

  /**
   * Get weapon tooltip with stats
   */
  getTooltip() {
    let tooltip = `${this.description}\n\n`;
    tooltip += `Damage: ${this.damage}\n`;
    tooltip += `Attack Speed: ${(1000 / this.attackSpeed).toFixed(1)}/s\n`;
    tooltip += `Range: ${this.range.toFixed(1)}\n`;
    tooltip += `Durability: ${this.durability}/${this.maxDurability}\n`;

    if (this.requiredStrength > 0) {
      tooltip += `Required Strength: ${this.requiredStrength}\n`;
    }
    if (this.requiredDexterity > 0) {
      tooltip += `Required Dexterity: ${this.requiredDexterity}\n`;
    }
    if (this.critChance > 0) {
      tooltip += `Critical Chance: ${(this.critChance * 100).toFixed(1)}%\n`;
    }
    if (this.elementalDamage) {
      tooltip += `${this.elementalDamage.type} Damage: ${this.elementalDamage.amount}\n`;
    }

    return tooltip;
  }

  /**
   * Serialize weapon data including durability
   */
  serialize() {
    const data = super.serialize();
    data.durability = this.durability;
    return data;
  }
}

/**
 * ConsumableItem - Base class for consumable items (potions, food, etc.)
 */
export class ConsumableItem extends Item {
  constructor(definition) {
    super(definition);

    this.stackable = true;
    this.maxStack = definition.maxStack || 99;

    // Effects
    this.effects = definition.effects || [];
    this.useTime = definition.useTime || 0; // Time to consume in ms
  }

  /**
   * Use the consumable item
   */
  use(user) {
    console.log(`${user.name || 'Player'} consumed ${this.name}`);

    // Apply effects
    this.effects.forEach(effect => {
      this.applyEffect(effect, user);
    });

    return true; // Item is consumed
  }

  /**
   * Apply a single effect to the user
   */
  applyEffect(effect, user) {
    switch (effect.type) {
      case 'heal':
        if (user.health) {
          user.health.heal(effect.amount);
        }
        break;
      case 'damage':
        if (user.health) {
          user.health.takeDamage(effect.amount);
        }
        break;
      case 'buff':
        // Apply temporary buff
        console.log(`Applied ${effect.stat} buff: +${effect.amount} for ${effect.duration}ms`);
        break;
      default:
        console.warn(`Unknown effect type: ${effect.type}`);
    }
  }
}
