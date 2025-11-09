# Potion System Documentation

Complete implementation of a potion and inventory system for the King's Field game.

## Overview

The potion system provides a full-featured consumable item framework including:
- **Potion items** with various effects (healing, buffs, restoration)
- **Inventory management** with stacking and hotbar support
- **Status effects** (buffs, regeneration, resistance)
- **Cooldown system** to prevent potion spam
- **Integration ready** with the existing Item base class

## File Structure

### Core Files (in `/src`)

```
src/
├── Item.js                    # Base Item, WeaponItem, ConsumableItem classes (existing)
├── Potion.js                  # Potion class extending ConsumableItem
├── PotionDefinitions.js       # All potion types and factory functions
├── Inventory.js               # Inventory management system
└── PotionSystemExample.js     # Integration helpers and examples
```

### Integration Files (in `/src/items` - alternate location)

The system was also created in `src/items/` for modular organization:
```
src/items/
├── Item.js                    # Standalone Item base (if not using existing)
├── Potion.js                  # Potion implementation
├── PotionDefinitions.js       # Potion definitions
└── Inventory.js               # Inventory system
```

**Note:** Use the `/src` versions as they integrate with the existing Item.js system.

## Available Potions

### Health Potions
- **Minor Health Potion** - Restores 25 HP (Common)
- **Health Potion** - Restores 50 HP (Common)
- **Greater Health Potion** - Restores 100 HP (Uncommon)
- **Superior Health Potion** - Restores 200 HP (Rare)

### Stamina Potions
- **Stamina Potion** - Restores 50 stamina (Common)
- **Greater Stamina Potion** - Restores 100 stamina (Uncommon)

### Mana Potions
- **Mana Potion** - Restores 30 mana (Common)
- **Greater Mana Potion** - Restores 60 mana (Uncommon)

### Cure Potions
- **Antidote** - Cures poison status (Common)

### Buff Potions
- **Elixir of Strength** - +20% attack damage for 30s (Uncommon)
- **Elixir of Defense** - -25% incoming damage for 30s (Uncommon)
- **Elixir of Speed** - +30% movement speed for 20s (Uncommon)

### Regeneration Potions
- **Potion of Regeneration** - 5 HP/second for 10s (Rare)
- **Greater Potion of Regeneration** - 10 HP/second for 15s (Epic)

### Resistance Potions
- **Potion of Resistance** - 30% damage reduction for 25s (Rare)

### Legendary Potions
- **Elixir of Full Restore** - Restores all HP/stamina/mana (Legendary)

## Quick Integration Guide

### 1. Basic Setup

```javascript
import { Inventory } from './Inventory.js';
import { createPotion, getStarterPotions } from './PotionDefinitions.js';

// In your Player class constructor:
this.inventory = new Inventory(20); // 20 inventory slots
this.potionCooldown = 0;
this.buffs = {};
this.statusEffects = {};
this.stamina = 100;
this.maxStamina = 100;
this.mana = 100;
this.maxMana = 100;

// Add starter potions
getStarterPotions().forEach(potion => {
    this.inventory.addItem(potion);
});
```

### 2. Using Potions

```javascript
// Use a potion from inventory slot
player.inventory.useItem(slotIndex, player);

// Use a potion from hotbar
player.inventory.useHotbarItem(hotbarSlot, player);

// Add a specific potion
const healthPotion = createPotion('health_potion');
player.inventory.addItem(healthPotion);
```

### 3. Game Loop Integration

```javascript
import { updatePlayerPotionEffects } from './PotionSystemExample.js';

function update(deltaTime) {
    // ... existing game logic ...

    // Update potion effects, buffs, and cooldowns
    if (player.inventory) {
        updatePlayerPotionEffects(player, deltaTime);
    }
}
```

### 4. Combat Integration

```javascript
import { getModifiedDamage, getModifiedDamageReduction } from './PotionSystemExample.js';

// When player attacks:
const baseDamage = weaponStats.damage;
const finalDamage = getModifiedDamage(player, baseDamage);

// When player takes damage:
const incomingDamage = enemy.attackPower;
const reducedDamage = getModifiedDamageReduction(player, incomingDamage);
player.health.takeDamage(reducedDamage);
```

### 5. UI Integration

```javascript
import { getInventoryDisplayHTML, getHotbarDisplayHTML, getActiveBuffsDisplay } from './PotionSystemExample.js';

function updateUI() {
    // ... existing UI code ...

    const inventoryHTML = getInventoryDisplayHTML(player);
    const hotbarHTML = getHotbarDisplayHTML(player);
    const buffsHTML = getActiveBuffsDisplay(player);

    // Add to your UI display
}
```

### 6. Hotkey Setup

```javascript
import { setupPotionHotkeys } from './PotionSystemExample.js';

// In your init() function:
setupPotionHotkeys(player, updateUI);

// This sets up keys 5-9 for the potion hotbar
```

## Advanced Usage

### Creating Custom Potions

```javascript
import { Potion, PotionEffect } from './Potion.js';

const customPotion = new Potion({
    id: 'my_custom_potion',
    name: 'Potion of Awesomeness',
    description: 'Makes you awesome!',
    type: 'consumable',
    category: 'potion',
    icon: '⭐',
    rarity: 'legendary',
    effectType: PotionEffect.BUFF_STRENGTH,
    potency: 50, // 50% damage boost
    duration: 60000, // 60 seconds
    cooldown: 3000,
    value: 1000,
    stackable: true,
    maxStack: 5,
    weight: 0.5,
    liquidColor: 0xffd700,
    bottleColor: 0xff00ff,
    effects: []
});
```

### Random Loot Drops

```javascript
import { getRandomPotion } from './PotionDefinitions.js';

// When enemy dies, chance to drop potion:
if (Math.random() < 0.3) { // 30% chance
    const lootPotion = getRandomPotion();
    player.inventory.addItem(lootPotion);
}

// Custom rarity weights:
const rarePotion = getRandomPotion({
    'common': 0.1,
    'uncommon': 0.2,
    'rare': 0.4,
    'epic': 0.2,
    'legendary': 0.1
});
```

### Inventory Management

```javascript
// Get all potions in inventory
const potions = player.inventory.findItemsByCategory('potion');

// Count specific potion
const healthPotionCount = player.inventory.countItem('health_potion');

// Check if player has item
if (player.inventory.hasItem('health_potion', 5)) {
    console.log('Player has at least 5 health potions');
}

// Sort inventory (move empty slots to end)
player.inventory.sort();

// Get inventory stats
const stats = player.inventory.getStats();
console.log(`${stats.usedSlots}/${stats.totalSlots} slots used`);
console.log(`Total weight: ${stats.totalWeight}`);
```

### Hotbar Management

```javascript
// Assign inventory slot 3 to hotbar slot 0 (key 5)
player.inventory.assignToHotbar(3, 0);

// Get hotbar item
const hotbarItem = player.inventory.getHotbarItem(0);

// Use hotbar item (already implemented in hotkey setup)
player.inventory.useHotbarItem(0, player);
```

## Potion Effects Reference

### PotionEffect Types

```javascript
export const PotionEffect = {
  HEAL: 'heal',                    // Instant HP restore
  RESTORE_STAMINA: 'restore_stamina', // Instant stamina restore
  RESTORE_MANA: 'restore_mana',    // Instant mana restore
  CURE_POISON: 'cure_poison',      // Remove poison status
  BUFF_STRENGTH: 'buff_strength',  // Increase damage output
  BUFF_DEFENSE: 'buff_defense',    // Decrease damage taken
  BUFF_SPEED: 'buff_speed',        // Increase movement speed
  REGENERATION: 'regeneration',    // HP over time
  RESISTANCE: 'resistance'         // Damage reduction
};
```

### Effect Behavior

**Instant Effects:**
- `HEAL`: Restores HP immediately (won't overheal)
- `RESTORE_STAMINA`: Restores stamina immediately
- `RESTORE_MANA`: Restores mana immediately
- `CURE_POISON`: Removes poison status effect

**Buff Effects (temporary):**
- `BUFF_STRENGTH`: Increases attack damage by potency%
- `BUFF_DEFENSE`: Reduces incoming damage by potency%
- `BUFF_SPEED`: Increases movement speed by potency%
- `RESISTANCE`: Reduces all damage by potency%

**Over-Time Effects:**
- `REGENERATION`: Heals potency HP every second for duration

## Player Properties Required

For the potion system to work, the player object needs:

```javascript
{
    health: { current, max, heal(), takeDamage() },
    stamina: number,        // Optional
    maxStamina: number,     // Optional
    mana: number,           // Optional
    maxMana: number,        // Optional
    inventory: Inventory,
    potionCooldown: number,
    buffs: {},             // Auto-initialized by potions
    statusEffects: {}      // Auto-initialized by potions
}
```

## Design Decisions

1. **Stackable System**: Potions are stackable to save inventory space
2. **Cooldown System**: Global potion cooldown prevents spam (configurable per potion)
3. **Smart Usage**: Potions won't be consumed if they have no effect (e.g., healing at full HP)
4. **Buff Management**: Buffs automatically expire and are tracked in player.buffs
5. **Rarity System**: Common → Uncommon → Rare → Epic → Legendary
6. **Integration**: Works with existing Item/ConsumableItem architecture

## Extending the System

### Adding New Effect Types

1. Add to `PotionEffect` enum in `Potion.js`
2. Implement handler in `applyEffect()` method
3. Add tooltip display in `getTooltip()`

### Adding New Potions

Add to `POTION_DEFINITIONS` in `PotionDefinitions.js`:

```javascript
my_new_potion: {
    id: 'my_new_potion',
    name: 'My New Potion',
    description: 'Does something cool',
    type: 'consumable',
    category: 'potion',
    icon: '🧪',
    rarity: 'uncommon',
    effectType: PotionEffect.HEAL,
    potency: 75,
    duration: 0,
    cooldown: 1500,
    value: 35,
    stackable: true,
    maxStack: 99,
    weight: 0.15,
    liquidColor: 0xff00ff,
    bottleColor: 0xcccccc,
    effects: [{ type: 'heal', amount: 75 }]
}
```

## Troubleshooting

### Potions Not Working
- Ensure player has required properties (health, stamina, etc.)
- Check that `potionCooldown` is being updated in game loop
- Verify potion is actually in inventory

### Buffs Not Expiring
- Make sure `updatePlayerPotionEffects()` is called every frame
- Check that `deltaTime` is in milliseconds

### Inventory Full Issues
- Increase `maxSlots` in Inventory constructor
- Implement inventory expansion system
- Add item dropping functionality

## Future Enhancements

Potential additions to the system:
- Crafting system (combine ingredients to make potions)
- Potion brewing mechanics
- Throwable potions (area effects)
- Cursed/poisoned potions
- Potion enchantment system
- Alchemy skill progression
- Recipe discovery system

## Files Modified/Created

### Created Files:
1. `/src/Potion.js` - Potion class implementation
2. `/src/PotionDefinitions.js` - All potion definitions
3. `/src/Inventory.js` - Inventory system
4. `/src/PotionSystemExample.js` - Integration helpers
5. `/src/items/Item.js` - Alternative standalone Item base
6. `/src/items/Potion.js` - Alternative location
7. `/src/items/PotionDefinitions.js` - Alternative location
8. `/src/items/Inventory.js` - Alternative location

### Files to Modify (for integration):
- `src/main.js` - Add inventory to Player, update loop, add hotkeys
- `src/ui/UIManager.js` - Add inventory/hotbar display (optional)

## Summary

The potion system is fully implemented and ready for integration. It provides:
- ✅ 17 different potion types across 5 rarities
- ✅ Complete inventory management with 20 slots
- ✅ Hotbar system (5 quick-use slots)
- ✅ Buff/status effect system
- ✅ Cooldown management
- ✅ Stack support for consumables
- ✅ Random loot generation
- ✅ Integration helpers and examples
- ✅ Full documentation

The system is modular and can be extended with new potion types, effects, and features.
