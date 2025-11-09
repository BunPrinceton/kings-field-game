/**
 * Item.js - Base class for all items in the game
 */

export const ItemType = {
  WEAPON: 'weapon',
  CONSUMABLE: 'consumable',
  KEY_ITEM: 'key_item',
  ARMOR: 'armor',
  MISC: 'misc'
};

export const ItemRarity = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
};

export class Item {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description || '';
    this.type = config.type || ItemType.MISC;
    this.rarity = config.rarity || ItemRarity.COMMON;
    this.stackable = config.stackable !== undefined ? config.stackable : false;
    this.maxStackSize = config.maxStackSize || 1;
    this.quantity = config.quantity || 1;
    this.icon = config.icon || '📦';
    this.value = config.value || 0; // Gold value for selling
  }

  /**
   * Use the item (override in subclasses)
   * @param {Object} target - The entity using the item (player, etc)
   * @returns {boolean} - Whether the item was successfully used
   */
  use(target) {
    console.log(`Cannot use item: ${this.name}`);
    return false;
  }

  /**
   * Check if item can be stacked with another
   */
  canStackWith(otherItem) {
    return this.stackable &&
           otherItem.id === this.id &&
           this.quantity < this.maxStackSize;
  }

  /**
   * Add to stack
   */
  addToStack(amount) {
    if (!this.stackable) return 0;

    const spaceAvailable = this.maxStackSize - this.quantity;
    const amountToAdd = Math.min(amount, spaceAvailable);
    this.quantity += amountToAdd;

    return amountToAdd;
  }

  /**
   * Remove from stack
   */
  removeFromStack(amount) {
    const amountToRemove = Math.min(amount, this.quantity);
    this.quantity -= amountToRemove;
    return amountToRemove;
  }

  /**
   * Clone the item
   */
  clone() {
    return new Item({
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      rarity: this.rarity,
      stackable: this.stackable,
      maxStackSize: this.maxStackSize,
      quantity: this.quantity,
      icon: this.icon,
      value: this.value
    });
  }

  /**
   * Get display info for UI
   */
  getDisplayInfo() {
    return {
      name: this.name,
      description: this.description,
      type: this.type,
      rarity: this.rarity,
      icon: this.icon,
      quantity: this.stackable ? this.quantity : null,
      value: this.value
    };
  }
}
