/**
 * ItemManager - Manages all items in the game
 * Handles item creation, inventory, and item instances
 */

import { Item, WeaponItem, ConsumableItem } from './Item.js';
import { Sword } from './Sword.js';
import { Armor } from './Armor.js';
import { SWORD_DEFINITIONS } from './SwordDefinitions.js';
import { ARMOR_DEFINITIONS } from './ArmorDefinitions.js';

export class ItemManager {
  constructor() {
    // Registry of all item definitions
    this.definitions = {
      ...SWORD_DEFINITIONS,
      ...ARMOR_DEFINITIONS
      // Add other item types here
    };

    // Active item instances
    this.instances = new Map(); // id -> Item instance
    this.nextInstanceId = 1;

    // Item type constructors
    this.constructors = {
      sword: Sword,
      weapon: WeaponItem,
      armor: Armor,
      consumable: ConsumableItem,
      default: Item
    };
  }

  /**
   * Create a new item instance from a definition
   */
  createItem(definitionId, customData = {}) {
    const definition = this.definitions[definitionId];
    if (!definition) {
      console.error(`Item definition not found: ${definitionId}`);
      return null;
    }

    // Merge custom data with definition
    const itemDef = { ...definition, ...customData };

    // Get the appropriate constructor
    const Constructor = this.constructors[definition.category] ||
                       this.constructors[definition.type] ||
                       this.constructors.default;

    // Create the item instance
    const item = new Constructor(itemDef);

    // Store instance with unique ID
    const instanceId = this.nextInstanceId++;
    this.instances.set(instanceId, item);
    item.instanceId = instanceId;

    return item;
  }

  /**
   * Get an item instance by ID
   */
  getItem(instanceId) {
    return this.instances.get(instanceId);
  }

  /**
   * Remove an item instance
   */
  removeItem(instanceId) {
    return this.instances.delete(instanceId);
  }

  /**
   * Get item definition
   */
  getDefinition(definitionId) {
    return this.definitions[definitionId];
  }

  /**
   * Register a new item definition
   */
  registerDefinition(definition) {
    if (!definition.id) {
      console.error('Item definition must have an id');
      return false;
    }

    this.definitions[definition.id] = definition;
    return true;
  }

  /**
   * Get all definitions of a certain type
   */
  getDefinitionsByType(type) {
    return Object.values(this.definitions).filter(def => def.type === type);
  }

  /**
   * Get all definitions of a certain category
   */
  getDefinitionsByCategory(category) {
    return Object.values(this.definitions).filter(def => def.category === category);
  }

  /**
   * Get all definitions by rarity
   */
  getDefinitionsByRarity(rarity) {
    return Object.values(this.definitions).filter(def => def.rarity === rarity);
  }

  /**
   * Serialize all item instances (for saving)
   */
  serialize() {
    const serialized = {};
    this.instances.forEach((item, id) => {
      serialized[id] = item.serialize();
    });
    return serialized;
  }

  /**
   * Deserialize item instances (for loading)
   */
  deserialize(data) {
    this.instances.clear();
    Object.entries(data).forEach(([id, itemData]) => {
      const definition = this.definitions[itemData.id];
      if (definition) {
        const Constructor = this.constructors[itemData.category] ||
                          this.constructors[itemData.type] ||
                          this.constructors.default;

        const item = new Constructor(definition);
        item.data = itemData.data || {};

        // Restore durability for weapons
        if (itemData.durability !== undefined && item.durability !== undefined) {
          item.durability = itemData.durability;
        }

        this.instances.set(parseInt(id), item);
      }
    });

    // Update next instance ID
    const ids = Array.from(this.instances.keys());
    this.nextInstanceId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
  }
}

/**
 * Inventory - Manages a player's items
 */
export class Inventory {
  constructor(maxSlots = 20) {
    this.maxSlots = maxSlots;
    this.slots = new Array(maxSlots).fill(null);
    this.equipped = {
      weapon: null,
      armor: null,
      accessory1: null,
      accessory2: null
    };
  }

  /**
   * Add item to inventory
   */
  addItem(item, quantity = 1) {
    // Try to stack with existing items first
    if (item.stackable) {
      for (let i = 0; i < this.slots.length; i++) {
        const slot = this.slots[i];
        if (slot && slot.item.canStackWith(item)) {
          const spaceLeft = slot.item.maxStack - slot.quantity;
          const amountToAdd = Math.min(quantity, spaceLeft);

          slot.quantity += amountToAdd;
          quantity -= amountToAdd;

          if (quantity <= 0) {
            return true;
          }
        }
      }
    }

    // Add to empty slots
    while (quantity > 0) {
      const emptySlot = this.slots.findIndex(slot => slot === null);
      if (emptySlot === -1) {
        console.log('Inventory is full!');
        return false;
      }

      const amountToAdd = Math.min(quantity, item.stackable ? item.maxStack : 1);
      this.slots[emptySlot] = {
        item: item,
        quantity: amountToAdd
      };

      quantity -= amountToAdd;
    }

    return true;
  }

  /**
   * Remove item from inventory
   */
  removeItem(slotIndex, quantity = 1) {
    const slot = this.slots[slotIndex];
    if (!slot) return null;

    const removedItem = slot.item;
    slot.quantity -= quantity;

    if (slot.quantity <= 0) {
      this.slots[slotIndex] = null;
    }

    return removedItem;
  }

  /**
   * Get item at slot
   */
  getSlot(index) {
    return this.slots[index];
  }

  /**
   * Move item between slots
   */
  moveItem(fromSlot, toSlot) {
    const from = this.slots[fromSlot];
    const to = this.slots[toSlot];

    if (!from) return false;

    // Swap if target has item
    if (to) {
      // Try to stack
      if (from.item.canStackWith(to.item)) {
        const spaceLeft = to.item.maxStack - to.quantity;
        const amountToMove = Math.min(from.quantity, spaceLeft);

        to.quantity += amountToMove;
        from.quantity -= amountToMove;

        if (from.quantity <= 0) {
          this.slots[fromSlot] = null;
        }
      } else {
        // Swap
        this.slots[toSlot] = from;
        this.slots[fromSlot] = to;
      }
    } else {
      // Move to empty slot
      this.slots[toSlot] = from;
      this.slots[fromSlot] = null;
    }

    return true;
  }

  /**
   * Equip an item
   */
  equipItem(slotIndex, equipSlot) {
    const slot = this.slots[slotIndex];
    if (!slot) return false;

    const item = slot.item;

    // Check if item can be equipped in this slot
    if (equipSlot === 'weapon' && item.type !== 'weapon') {
      console.log('Cannot equip non-weapon in weapon slot');
      return false;
    }

    // Unequip current item in that slot
    if (this.equipped[equipSlot]) {
      this.addItem(this.equipped[equipSlot]);
    }

    // Equip new item
    this.equipped[equipSlot] = item;
    this.removeItem(slotIndex, 1);

    return true;
  }

  /**
   * Unequip an item
   */
  unequipItem(equipSlot) {
    const item = this.equipped[equipSlot];
    if (!item) return false;

    if (this.addItem(item)) {
      this.equipped[equipSlot] = null;
      return true;
    }

    console.log('Inventory is full, cannot unequip');
    return false;
  }

  /**
   * Get equipped item
   */
  getEquipped(slot) {
    return this.equipped[slot];
  }

  /**
   * Use item at slot
   */
  useItem(slotIndex, user) {
    const slot = this.slots[slotIndex];
    if (!slot) return false;

    const consumed = slot.item.use(user);

    if (consumed) {
      this.removeItem(slotIndex, 1);
    }

    return true;
  }

  /**
   * Find item by ID
   */
  findItem(itemId) {
    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      if (slot && slot.item.id === itemId) {
        return { index: i, slot: slot };
      }
    }
    return null;
  }

  /**
   * Count items of a specific ID
   */
  countItem(itemId) {
    let count = 0;
    this.slots.forEach(slot => {
      if (slot && slot.item.id === itemId) {
        count += slot.quantity;
      }
    });
    return count;
  }

  /**
   * Get total weight
   */
  getTotalWeight() {
    let weight = 0;
    this.slots.forEach(slot => {
      if (slot) {
        weight += slot.item.weight * slot.quantity;
      }
    });
    Object.values(this.equipped).forEach(item => {
      if (item) {
        weight += item.weight;
      }
    });
    return weight;
  }

  /**
   * Serialize inventory
   */
  serialize() {
    return {
      slots: this.slots.map(slot => {
        if (!slot) return null;
        return {
          itemId: slot.item.id,
          instanceId: slot.item.instanceId,
          quantity: slot.quantity
        };
      }),
      equipped: {
        weapon: this.equipped.weapon?.instanceId || null,
        armor: this.equipped.armor?.instanceId || null,
        accessory1: this.equipped.accessory1?.instanceId || null,
        accessory2: this.equipped.accessory2?.instanceId || null
      }
    };
  }

  /**
   * Deserialize inventory
   */
  deserialize(data, itemManager) {
    // Clear current inventory
    this.slots = new Array(this.maxSlots).fill(null);

    // Restore slots
    data.slots.forEach((slotData, index) => {
      if (slotData) {
        const item = itemManager.getItem(slotData.instanceId);
        if (item) {
          this.slots[index] = {
            item: item,
            quantity: slotData.quantity
          };
        }
      }
    });

    // Restore equipped items
    Object.entries(data.equipped).forEach(([slot, instanceId]) => {
      if (instanceId) {
        const item = itemManager.getItem(instanceId);
        if (item) {
          this.equipped[slot] = item;
        }
      }
    });
  }
}
