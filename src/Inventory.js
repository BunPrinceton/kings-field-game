/**
 * Inventory - Manages player inventory and item storage
 * Works with Item, WeaponItem, ConsumableItem, etc.
 */

import { Item } from './Item.js';

export class Inventory {
  constructor(maxSlots = 20) {
    this.maxSlots = maxSlots;
    this.slots = new Array(maxSlots).fill(null);
    this.gold = 0;

    // Quick-access slots for hotbar (references to inventory slots)
    this.hotbarSlots = new Array(5).fill(null);
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
          // Stack items (assuming we have quantity in data)
          const currentQuantity = slotItem.data.quantity || 1;
          const addQuantity = item.data.quantity || 1;

          if (currentQuantity < slotItem.maxStack) {
            const spaceLeft = slotItem.maxStack - currentQuantity;
            const amountToAdd = Math.min(spaceLeft, addQuantity);

            slotItem.data.quantity = currentQuantity + amountToAdd;
            item.data.quantity = addQuantity - amountToAdd;

            // If all items were stacked, we're done
            if (item.data.quantity <= 0) {
              console.log(`Stacked ${addQuantity} ${item.name}(s)`);
              return true;
            }
          }
        }
      }
    }

    // Find empty slot for remaining items (or non-stackable items)
    const emptySlotIndex = this.findEmptySlot();
    if (emptySlotIndex === -1) {
      console.log('Inventory is full!');
      return false;
    }

    // Initialize quantity if stackable and not set
    if (item.stackable && !item.data.quantity) {
      item.data.quantity = 1;
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

    if (item.stackable && item.data.quantity) {
      const currentQuantity = item.data.quantity;

      if (currentQuantity > amount) {
        // Remove partial stack - create new item with reduced quantity
        item.data.quantity -= amount;
        // Return a copy representing what was removed
        return item; // In real implementation, would clone with amount
      } else {
        // Remove entire stack
        this.slots[slotIndex] = null;
        return item;
      }
    } else {
      // Remove single item
      this.slots[slotIndex] = null;
      return item;
    }
  }

  /**
   * Use an item from the inventory
   * @param {number} slotIndex - The slot containing the item to use
   * @param {Object} user - The entity using the item (e.g., player)
   * @returns {boolean} - Whether the item was successfully used
   */
  useItem(slotIndex, user) {
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
    const consumed = item.use(user);

    if (consumed) {
      // Decrease quantity or remove item
      if (item.stackable && item.data.quantity) {
        item.data.quantity--;

        // Remove item if quantity is 0
        if (item.data.quantity <= 0) {
          this.slots[slotIndex] = null;
        }
      } else {
        // Non-stackable consumables are removed
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
   * Find all items of a specific type or category
   */
  findItemsByType(itemType) {
    return this.slots
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item && item.type === itemType);
  }

  findItemsByCategory(category) {
    return this.slots
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item && item.category === category);
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
        totalQuantity += item.data.quantity || 1;
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
        total += item.data.quantity || 1;
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
   * Assign item slot to hotbar
   */
  assignToHotbar(inventorySlot, hotbarSlot) {
    if (hotbarSlot < 0 || hotbarSlot >= this.hotbarSlots.length) {
      console.warn('Invalid hotbar slot');
      return false;
    }

    if (inventorySlot < 0 || inventorySlot >= this.slots.length) {
      console.warn('Invalid inventory slot');
      return false;
    }

    this.hotbarSlots[hotbarSlot] = inventorySlot;
    return true;
  }

  /**
   * Use item from hotbar slot
   */
  useHotbarItem(hotbarSlot, user) {
    if (hotbarSlot < 0 || hotbarSlot >= this.hotbarSlots.length) {
      return false;
    }

    const inventorySlot = this.hotbarSlots[hotbarSlot];
    if (inventorySlot === null) {
      return false;
    }

    return this.useItem(inventorySlot, user);
  }

  /**
   * Get hotbar item
   */
  getHotbarItem(hotbarSlot) {
    if (hotbarSlot < 0 || hotbarSlot >= this.hotbarSlots.length) {
      return null;
    }

    const inventorySlot = this.hotbarSlots[hotbarSlot];
    if (inventorySlot === null) {
      return null;
    }

    return this.getItem(inventorySlot);
  }

  /**
   * Sort inventory (empty slots at end)
   */
  sort() {
    // Move all items to the front, empty slots to the back
    const items = this.slots.filter(item => item !== null);
    const emptySlots = new Array(this.maxSlots - items.length).fill(null);
    this.slots = [...items, ...emptySlots];

    // Update hotbar references
    // This is simplified - a full implementation would track old -> new indices
    this.hotbarSlots.fill(null);
  }

  /**
   * Get inventory as array of items (for UI display)
   */
  getInventoryData() {
    return this.slots.map((item, index) => ({
      slotIndex: index,
      item: item,
      quantity: item ? (item.data.quantity || 1) : 0,
      isEmpty: item === null
    }));
  }

  /**
   * Get hotbar data for UI
   */
  getHotbarData() {
    return this.hotbarSlots.map((inventorySlot, hotbarIndex) => {
      if (inventorySlot === null) {
        return { hotbarIndex, isEmpty: true, item: null };
      }

      const item = this.getItem(inventorySlot);
      return {
        hotbarIndex,
        inventorySlot,
        item,
        quantity: item ? (item.data.quantity || 1) : 0,
        isEmpty: item === null
      };
    });
  }

  /**
   * Clear inventory
   */
  clear() {
    this.slots.fill(null);
    this.hotbarSlots.fill(null);
    this.gold = 0;
  }

  /**
   * Get inventory statistics
   */
  getStats() {
    const usedSlots = this.slots.filter(item => item !== null).length;
    const emptySlots = this.maxSlots - usedSlots;
    const totalWeight = this.slots.reduce((sum, item) => {
      if (!item) return sum;
      const quantity = item.data.quantity || 1;
      return sum + (item.weight * quantity);
    }, 0);

    return {
      totalSlots: this.maxSlots,
      usedSlots,
      emptySlots,
      gold: this.gold,
      totalWeight: totalWeight.toFixed(1)
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
      slots: this.slots.map(item => item ? item.serialize() : null),
      hotbarSlots: this.hotbarSlots
    };
  }

  /**
   * Deserialize inventory from JSON
   */
  static fromJSON(data, itemDefinitions) {
    const inventory = new Inventory(data.maxSlots);
    inventory.gold = data.gold;

    // Reconstruct items
    inventory.slots = data.slots.map(itemData => {
      if (!itemData) return null;
      return Item.deserialize(itemData, itemDefinitions);
    });

    inventory.hotbarSlots = data.hotbarSlots || new Array(5).fill(null);

    return inventory;
  }
}
