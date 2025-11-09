# Sword Item System Implementation

This document describes the comprehensive sword item system implemented for the King's Field game.

## Overview

A complete item system has been implemented with a focus on swords, including:
- Base item classes for extensibility
- Detailed sword implementations with 15 unique sword variants
- Item management and inventory systems
- Integration with the existing weapon and combat systems
- Visual representation and stats display in the UI

## Files Created

### 1. `/src/Item.js`
Base classes for the item system:

- **Item**: Base class for all items in the game
  - Properties: id, name, description, type, category, rarity, weight, value
  - Methods: use(), serialize(), deserialize()

- **WeaponItem**: Extends Item for all weapons
  - Properties: damage, attackSpeed, range, durability, requirements (strength/dexterity)
  - Methods: getEffectiveDamage(), reduceDurability(), repair(), getTooltip()

- **ConsumableItem**: Extends Item for potions, food, etc.
  - Properties: effects, useTime
  - Methods: use(), applyEffect()

### 2. `/src/Sword.js`
Sword-specific implementation:

- **Sword**: Extends WeaponItem with sword-specific features
  - Visual properties: bladeLength, bladeWidth, colors, materials
  - Combat properties: slashBonus, thrustBonus, parryChance
  - Special abilities: fire_slash, life_steal, frost_strike, holy_smite
  - Methods:
    - `createMesh()`: Generates 3D mesh with blade, crossguard, handle, pommel
    - `getWeaponStats()`: Returns combat stats
    - `useSpecialAbility()`: Executes special abilities
    - `getTooltip()`: Displays detailed item information

### 3. `/src/SwordDefinitions.js`
Database of 15 unique sword types:

#### Starter Swords
- **Rusty Sword**: Old, worn blade (15 damage, low durability)
- **Short Sword**: Reliable starter weapon (25 damage)

#### Basic Swords
- **Long Sword**: Well-balanced with good reach (35 damage, 3.0 range)
- **Broad Sword**: Heavy blade with devastating cuts (45 damage, slash bonus)
- **Bastard Sword**: Two-handed versatile blade (50 damage)

#### Special Swords
- **Rapier**: Thin thrusting blade (30 damage, high crit, dexterity-based)
- **Scimitar**: Curved slashing weapon (38 damage, 1.5x slash bonus)

#### Heavy Swords
- **Great Sword**: Massive two-handed blade (70 damage, slow)
- **Claymore**: Enormous Scottish sword (80 damage, 3.8 range)

#### Legendary/Enchanted Swords
- **Flame Blade**: Fire-imbued sword (55 damage + 20 fire damage)
  - Special: Inferno Strike (fire wave attack)
- **Frost Fang**: Ice crystal blade (52 damage + 18 frost damage)
  - Special: Frozen Touch (slows enemies)
- **Moonlight Edge**: Mystical lunar blade (65 damage + 25 magic damage)
  - Special: Lunar Drain (life steal)
  - Never degrades
- **Holy Avenger**: Sacred divine blade (70 damage + 30 holy damage)
  - Special: Divine Judgment (bonus vs undead)
  - Never degrades
- **Dragon Slayer**: Legendary dragon-killing blade (100 damage)
  - Massive reach (4.0 range)
  - Requires 40 strength

#### Unique/Cursed Swords
- **Blood Drinker**: Cursed vampiric blade (60 damage)
  - Special: Blood Feast (powerful life steal)
  - Tracks kill count
- **Crystal Blade**: Pure crystal sword (90 damage, 40% crit)
  - Very fragile (30 durability)
  - High dexterity requirement

### 4. `/src/ItemManager.js`
Manages all items and inventory:

- **ItemManager**: Central item management system
  - Methods:
    - `createItem(definitionId)`: Creates new item instance
    - `getItem(instanceId)`: Retrieves item by ID
    - `registerDefinition()`: Adds new item types
    - `serialize()/deserialize()`: Save/load functionality

- **Inventory**: Player inventory system (20 slots)
  - Methods:
    - `addItem()`: Adds items with stacking support
    - `removeItem()`: Removes items
    - `equipItem()`: Equips weapons/armor
    - `moveItem()`: Rearranges inventory
    - `findItem()`: Searches for items
    - `serialize()/deserialize()`: Save/load support

## Files Modified

### 5. `/src/WeaponSystem.js`
Enhanced to support sword items:

- Added `itemManager` parameter to constructor
- Added `currentWeaponItem` property to track equipped sword
- New methods:
  - `equipSwordItem(swordItem)`: Equips a Sword instance from inventory
  - `unequipWeapon()`: Removes current weapon
  - `getCurrentWeaponItem()`: Returns equipped sword item
- Modified `getWeaponStats()`: Returns stats from sword item if equipped

### 6. `/src/main.js`
Integrated item system into game:

- Added imports for ItemManager, Inventory, and Sword
- Added to game state:
  - `game.itemManager`: Item system manager
  - `game.inventory`: Player inventory (20 slots)
- Initialization:
  - Creates ItemManager and Inventory on startup
  - Adds starter swords to inventory (Short Sword, Long Sword, Flame Blade, Frost Fang)
- Input handling:
  - Keys 1-4: Switch to default weapons (sword, axe, mace, dagger)
  - Keys 5-9: Equip swords from inventory slots 0-4
- Combat integration:
  - Durability reduction on hit
  - Automatic weapon switch when broken
  - Uses sword stats for damage calculation
- UI enhancements:
  - Displays current weapon with durability bar
  - Shows elemental damage and crit chance
  - Inventory display with rarity-coded colors
  - Color-coded durability warnings

## Features Implemented

### Item System Features
- Flexible base class system for easy extension
- Support for multiple item types (weapons, consumables, etc.)
- Rarity system (common, uncommon, rare, legendary)
- Weight and value tracking
- Stackable item support
- Item serialization for save games

### Sword-Specific Features
- 15 unique sword variants with different stats
- Durability system with degradation on use
- Elemental damage types (fire, frost, magic, holy)
- Special abilities with cooldowns
- Critical hit chances
- Stat requirements (strength, dexterity)
- Visual customization (blade color, materials, enchantment glow)
- Dynamic 3D mesh generation based on properties

### Combat Integration
- Weapon stats affect damage, speed, and range
- Durability decreases with each hit
- Effective damage scales with durability (minimum 25%)
- Broken weapons auto-switch to default
- Special ability system (framework in place)

### UI/UX Features
- Real-time weapon stats display
- Durability bar with color warnings (green/yellow/red)
- Inventory display showing first 5 slots
- Rarity-based color coding
  - Common: Gray
  - Uncommon: Green
  - Rare: Blue
  - Legendary: Orange
- Elemental damage and crit chance display
- Keyboard shortcuts for quick weapon switching

## Usage

### Equipping Swords
1. Press keys 5-9 to equip swords from inventory slots 0-4
2. Press keys 1-4 for default weapons (backward compatible)
3. The equipped sword's stats will be displayed in the UI

### Sword Properties
Each sword has:
- Base damage and attack speed
- Range and swing animation speed
- Durability that degrades with use
- Optional elemental damage
- Optional critical hit chance
- Optional special abilities
- Stat requirements for equipping

### Adding New Swords
To add a new sword type:

1. Add definition to `/src/SwordDefinitions.js`:
```javascript
new_sword: {
  id: 'new_sword',
  name: 'New Sword',
  description: 'Description here',
  type: 'weapon',
  category: 'sword',
  rarity: 'rare',
  damage: 50,
  attackSpeed: 600,
  range: 2.8,
  // ... other properties
}
```

2. Create item in game:
```javascript
const newSword = game.itemManager.createItem('new_sword');
game.inventory.addItem(newSword);
```

3. Equip from inventory using keys 5-9

## Technical Design Decisions

### Object-Oriented Architecture
- Base classes (Item, WeaponItem) allow easy extension
- Sword class encapsulates all sword-specific logic
- Separation of concerns: definitions vs instances

### Visual Representation
- Procedural 3D mesh generation based on properties
- Enchantment glow effects for magical swords
- Color customization for blade, handle, and guard

### Durability System
- Weapons degrade with use for realism
- Effective damage scales with durability (never below 25%)
- Legendary weapons can be set to never degrade
- Provides item sink for game economy

### Inventory System
- 20-slot inventory with stacking support
- Equipped items tracked separately
- Serialization support for save/load
- Weight tracking for potential encumbrance system

### Integration Strategy
- Minimal changes to existing WeaponSystem
- Backward compatible with default weapons
- Item system independent of weapon rendering
- Easy to extend for other item types (armor, consumables, etc.)

## Future Enhancements

Potential additions:
1. Weapon repair system
2. Weapon crafting/upgrading
3. Socket system for gems/runes
4. Weapon sets with bonuses
5. Unique weapon abilities with cooldowns
6. Visual effects for elemental damage
7. Weapon leveling/experience system
8. Trading/selling system
9. Item drops from enemies
10. Treasure chests with random loot

## Testing

To test the sword system:
1. Start the game
2. Press 5, 6, 7, or 8 to equip different swords
3. Attack enemies with SPACE to see damage and durability
4. Watch durability decrease in the UI
5. Observe different damage values based on sword type
6. Test legendary swords (Flame Blade, Frost Fang) for special properties

## Summary

The sword item system provides a robust foundation for item management in the King's Field game. With 15 unique swords, durability mechanics, special abilities, and full UI integration, the system enhances gameplay depth while remaining extensible for future features.
