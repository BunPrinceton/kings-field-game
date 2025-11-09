/**
 * Inventory.js - Manages player inventory and item storage
 */

import { Item } from './Item.js';

export class Inventory {
  constructor(maxSlots = 20) {
    this.maxSlots = maxSlots;
    this.slots = new Array(maxSlots).fill(null);
    this.gold = 0;
  }

  /**
   * Add an item to the inventory
   * @param {Item} item - The item to add
   * @returns {boolean} - Whether the item was successfully added
   */
  addItem(item) {
    if (!(item instanceof Item)) {
      console.warn('Attempted to add non-Item to inventory');
      return false;
    }

    // If item is stackable, try to stack with existing items first
    if (item.stackable) {
      for (let i = 0; i < this.slots.length; i++) {
        const slotItem = this.slots[i];
        if (slotItem && slotItem.canStackWith(item)) {
          const amountAdded = slotItem.addToStack(item.quantity);
          item.removeFromStack(amountAdded);

          // If all items were stacked, we're done
          if (item.quantity === 0) {
            console.log(`Stacked ${amountAdded} ${item.name}(s)`);
            return true;
          }
        }
      }
    }

    // Find empty slot for remaining items
    const emptySlotIndex = this.findEmptySlot();
    if (emptySlotIndex === -1) {
      console.log('Inventory is full!');
      return false;
    }

    this.slots[emptySlotIndex] = item;
    console.log(`Added ${item.name} to inventory slot ${emptySlotIndex}`);
    return true;
  }

  /**
   * Remove an item from the inventory
   * @param {number} slotIndex - The slot to remove from
   * @param {number} amount - How many to remove (for stackable items)
   * @returns {Item|null} - The removed item(s) or null
   */
  removeItem(slotIndex, amount = 1) {
    if (slotIndex < 0 || slotIndex >= this.slots.length) {
      console.warn('Invalid slot index');
      return null;
    }

    const item = this.slots[slotIndex];
    if (!item) {
      console.warn('No item in that slot');
      return null;
    }

    if (item.stackable && item.quantity > amount) {
      // Remove partial stack
      const removedItem = item.clone();
      removedItem.quantity = amount;
      item.removeFromStack(amount);
      return removedItem;
    } else {
      // Remove entire stack/item
      this.slots[slotIndex] = null;
      return item;
    }
  }

  /**
   * Use an item from the inventory
   * @param {number} slotIndex - The slot containing the item to use
   * @param {Object} target - The entity using the item (e.g., player)
   * @returns {boolean} - Whether the item was successfully used
   */
  useItem(slotIndex, target) {
    if (slotIndex < 0 || slotIndex >= this.slots.length) {
      console.warn('Invalid slot index');
      return false;
    }

    const item = this.slots[slotIndex];
    if (!item) {
      console.warn('No item in that slot');
      return false;
    }

    // Try to use the item
    const success = item.use(target);

    if (success) {
      // If item quantity is 0, remove it from inventory
      if (item.quantity <= 0) {
        this.slots[slotIndex] = null;
      }
      return true;
    }

    return false;
  }

  /**
   * Get item at specific slot
   */
  getItem(slotIndex) {
    if (slotIndex < 0 || slotIndex >= this.slots.length) {
      return null;
    }
    return this.slots[slotIndex];
  }

  /**
   * Find first empty slot
   */
  findEmptySlot() {
    return this.slots.findIndex(slot => slot === null);
  }

  /**
   * Find all items of a specific type
   */
  findItemsByType(itemType) {
    return this.slots
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item && item.type === itemType);
  }

  /**
   * Find item by ID
   */
  findItemById(itemId) {
    for (let i = 0; i < this.slots.length; i++) {
      const item = this.slots[i];
      if (item && item.id === itemId) {
        return { item, index: i };
      }
    }
    return null;
  }

  /**
   * Check if inventory has a specific item
   */
  hasItem(itemId, quantity = 1) {
    let totalQuantity = 0;
    for (const item of this.slots) {
      if (item && item.id === itemId) {
        totalQuantity += item.quantity;
        if (totalQuantity >= quantity) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Count total quantity of an item
   */
  countItem(itemId) {
    let total = 0;
    for (const item of this.slots) {
      if (item && item.id === itemId) {
        total += item.quantity;
      }
    }
    return total;
  }

  /**
   * Swap two inventory slots
   */
  swapSlots(slotA, slotB) {
    if (slotA < 0 || slotA >= this.slots.length || slotB < 0 || slotB >= this.slots.length) {
      console.warn('Invalid slot indices');
      return false;
    }

    const temp = this.slots[slotA];
    this.slots[slotA] = this.slots[slotB];
    this.slots[slotB] = temp;
    return true;
  }

  /**
   * Sort inventory (empty slots at end)
   */
  sort() {
    // Move all items to the front, empty slots to the back
    const items = this.slots.filter(item => item !== null);
    const emptySlots = new Array(this.maxSlots - items.length).fill(null);
    this.slots = [...items, ...emptySlots];
  }

  /**
   * Get inventory as array of items (for UI display)
   */
  getInventoryData() {
    return this.slots.map((item, index) => ({
      slotIndex: index,
      item: item ? item.getDisplayInfo() : null,
      itemInstance: item
    }));
  }

  /**
   * Clear inventory
   */
  clear() {
    this.slots.fill(null);
    this.gold = 0;
  }

  /**
   * Get inventory statistics
   */
  getStats() {
    const usedSlots = this.slots.filter(item => item !== null).length;
    const emptySlots = this.maxSlots - usedSlots;

    return {
      totalSlots: this.maxSlots,
      usedSlots,
      emptySlots,
      gold: this.gold
    };
  }

  /**
   * Add gold
   */
  addGold(amount) {
    this.gold += amount;
    console.log(`+${amount} gold (total: ${this.gold})`);
  }

  /**
   * Remove gold
   */
  removeGold(amount) {
    if (this.gold >= amount) {
      this.gold -= amount;
      console.log(`-${amount} gold (total: ${this.gold})`);
      return true;
    }
    console.log('Not enough gold!');
    return false;
  }

  /**
   * Serialize inventory to JSON
   */
  toJSON() {
    return {
      maxSlots: this.maxSlots,
      gold: this.gold,
      slots: this.slots.map(item => {
        if (!item) return null;
        // Store item data for reconstruction
        return {
          id: item.id,
          quantity: item.quantity,
          // Add any other necessary data
        };
      })
    };
  }

  /**
   * Deserialize inventory from JSON
   */
  static fromJSON(data, itemFactory) {
    const inventory = new Inventory(data.maxSlots);
    inventory.gold = data.gold;

    // Reconstruct items using factory function
    if (itemFactory) {
      inventory.slots = data.slots.map(itemData => {
        if (!itemData) return null;
        return itemFactory(itemData.id, itemData.quantity);
      });
    }

    return inventory;
  }
}
