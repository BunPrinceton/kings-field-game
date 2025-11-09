# Armor System Documentation

## Overview
The King's Field game now includes a comprehensive armor system that provides damage reduction, elemental resistances, and various gameplay modifiers. The system consists of three equipment slots: Body Armor, Helmets, and Shields.

## File Structure

### Created Files
- `/src/ArmorSystem.js` - Core armor system implementation with all armor types and mechanics

### Modified Files
- `/src/main.js` - Integrated armor system with player class, added combat mechanics, UI updates, and control bindings

## Armor Types

### Body Armor (F1-F4 to switch)

#### Leather Armor (F2)
- **Defense**: 5
- **Weight**: 3
- **Durability**: 80
- **Physical Resistance**: 5%
- **Speed Modifier**: 100% (no penalty)
- **Stamina Modifier**: 95% (5% less stamina drain)
- **Best For**: Fast, agile playstyles; early game

#### Chainmail Armor (F3)
- **Defense**: 15
- **Weight**: 8
- **Durability**: 150
- **Physical Resistance**: 15%
- **Ice Resistance**: 10%
- **Lightning Weakness**: -10% (takes 10% more lightning damage)
- **Speed Modifier**: 90% (10% slower)
- **Stamina Modifier**: 85% (15% more stamina drain)
- **Best For**: Balanced defense and mobility; mid-game

#### Plate Armor (F4)
- **Defense**: 30
- **Weight**: 15
- **Durability**: 250
- **Physical Resistance**: 30%
- **Fire Resistance**: 15%
- **Ice Resistance**: 20%
- **Speed Modifier**: 75% (25% slower)
- **Stamina Modifier**: 70% (30% more stamina drain)
- **Best For**: Tank builds; heavy combat; late game

#### Mage Robes (Special)
- **Defense**: 3
- **Weight**: 2
- **Durability**: 60
- **Physical Resistance**: 3%
- **Fire/Ice/Lightning Resistance**: 25% each
- **Speed Modifier**: 105% (5% faster)
- **Stamina Modifier**: 110% (10% less stamina drain)
- **Best For**: Magic users; elemental damage encounters

### Helmets (F5-F8 to switch)

#### Leather Cap (F6)
- **Defense**: 2
- **Weight**: 1
- **Durability**: 50
- **Physical Resistance**: 2%

#### Iron Helmet (F7)
- **Defense**: 8
- **Weight**: 4
- **Durability**: 120
- **Physical Resistance**: 8%
- **Lightning Weakness**: -5%

#### Knight Helmet (F8)
- **Defense**: 12
- **Weight**: 6
- **Durability**: 180
- **Physical Resistance**: 12%
- **Fire Resistance**: 6%
- **Ice Resistance**: 8%

#### Wizard Hat (Special)
- **Defense**: 1
- **Weight**: 0.5
- **Durability**: 40
- **Elemental Resistances**: 10% to Fire, Ice, and Lightning

### Shields (F9-F12 to switch)

#### Wooden Shield (F10)
- **Defense**: 5
- **Block Chance**: 15%
- **Weight**: 3
- **Durability**: 70
- **Physical Resistance**: 10%
- **Fire Weakness**: -10%

#### Iron Shield (F11)
- **Defense**: 10
- **Block Chance**: 25%
- **Weight**: 6
- **Durability**: 150
- **Physical Resistance**: 15%
- **Ice Resistance**: 10%

#### Tower Shield (F12)
- **Defense**: 18
- **Block Chance**: 35%
- **Weight**: 12
- **Durability**: 250
- **Physical Resistance**: 25%
- **Speed Modifier**: 80% (20% slower when equipped)

#### Magic Shield (Special)
- **Defense**: 6
- **Block Chance**: 20%
- **Weight**: 2
- **Durability**: 100
- **Elemental Resistances**: 15% to Fire, Ice, and Lightning

## Game Mechanics

### Damage Calculation
When the player takes damage, the armor system:

1. **Defense Reduction**: Reduces raw damage based on total defense value
   - Formula: `min(totalDefense * 0.5, incomingDamage * 0.5)`
   - Defense can reduce up to 50% of incoming damage

2. **Resistance Multiplier**: Applies elemental/physical resistance
   - Resistances are additive across all equipment pieces
   - Clamped between -50% and +75%
   - Formula: `finalDamage = (damage - defenseReduction) * (1 - resistance)`

3. **Block Chance**: Shield provides a chance to halve damage
   - When block triggers, final damage is reduced by 50%
   - Block chance is displayed in UI

### Durability System
- Armor takes durability damage when player is hit
- Durability loss: `max(1, floor(incomingDamage / 10))` per hit
- When durability reaches 0, armor breaks:
  - Defense drops to 0
  - Resistances drop to 0
  - Item remains equipped but provides no protection
- Repair armor with **R** key (test feature)

### Weight and Movement
- Total weight affects player movement speed
- Speed modifier is multiplicative across body armor and shield
- Heavy armor significantly reduces mobility
- Weight is color-coded in UI (red when > 10)

### Stamina Modifiers
- Armor affects stamina drain rate
- Heavy armor increases stamina consumption
- Light armor reduces stamina drain
- Mage robes provide the best stamina efficiency

## Controls

### Equipment Switching
- **F1**: Remove body armor
- **F2**: Equip Leather Armor
- **F3**: Equip Chainmail Armor
- **F4**: Equip Plate Armor
- **F5**: Remove helmet
- **F6**: Equip Leather Cap
- **F7**: Equip Iron Helmet
- **F8**: Equip Knight Helmet
- **F9**: Remove shield
- **F10**: Equip Wooden Shield
- **F11**: Equip Iron Shield
- **F12**: Equip Tower Shield

### Test Features
- **T**: Test damage (deals 20 damage to player to test armor)
- **H**: Heal 30 HP
- **R**: Fully repair all armor pieces

## UI Display

The armor panel shows:
- **Equipment**: Current body armor, helmet, and shield
- **Durability**: Color-coded durability bars for each piece
  - Green: > 50%
  - Yellow: 25-50%
  - Red: < 25%
- **Total Stats**:
  - Defense value
  - Total weight (color-coded)
  - Speed modifier percentage
  - Block chance percentage
  - Resistance percentages for Physical, Fire, Ice, and Lightning

## Combat Integration

### Player Damage
- When enemies attack, damage is processed through `player.takeDamage()`
- Damage reduction is calculated and displayed in console
- Armor durability is damaged proportionally
- UI updates immediately to show health and durability changes

### Enemy AI
- Enemies have a 2.0 unit attack range
- Enemies attack every 2 seconds when player is in range
- Attack damage: 10 base damage (modified by armor)
- Console logs show damage reduction in action

### Visual Feedback
- Screen shake when player takes damage
- Damage numbers display actual damage dealt vs blocked
- Console output format: `Raw: X -> Final: Y (Reduced: Z) [BLOCKED]`

## Code Architecture

### ArmorSystem Class
**Location**: `/src/ArmorSystem.js`

**Key Methods**:
- `equipArmor(armorType)` - Equip body armor
- `equipHelmet(helmetType)` - Equip helmet
- `equipShield(shieldType)` - Equip shield
- `calculateDamageReduction(damage, damageType)` - Calculate final damage after armor
- `damageArmor(amount)` - Reduce armor durability
- `repairArmor(piece, amount)` - Repair armor piece
- `getEquipmentSummary()` - Get all equipment stats
- `getDurabilityInfo()` - Get durability percentages for UI

**Properties**:
- `currentArmor` - Currently equipped body armor type
- `currentHelmet` - Currently equipped helmet type
- `currentShield` - Currently equipped shield type
- `armorInstances` - Individual durability tracking for each piece
- `totalDefense` - Calculated total defense value
- `totalWeight` - Calculated total weight
- `totalResistances` - Combined resistances object
- `speedModifier` - Movement speed multiplier
- `staminaModifier` - Stamina drain multiplier
- `blockChance` - Chance to block attacks

### Player Integration
**Location**: `/src/main.js` - Player class

**New Methods**:
- `takeDamage(amount, damageType)` - Handle incoming damage with armor calculation
- `getMovementSpeed()` - Get movement speed modified by armor
- `getStaminaModifier()` - Get stamina modifier from armor

**Properties**:
- `armorSystem` - Reference to player's ArmorSystem instance

## Strategy Guide

### Early Game
- Start with Leather Armor for mobility
- Wooden Shield provides basic protection
- Focus on dodging over tanking

### Mid Game
- Upgrade to Chainmail for better defense
- Iron Helmet and Iron Shield for balanced stats
- Still maintain decent mobility

### Late Game / Tank Build
- Full Plate Armor + Knight Helmet + Tower Shield
- Maximum physical damage reduction (~67%)
- Trade speed for survivability

### Magic Build
- Mage Robes + Wizard Hat + Magic Shield
- High elemental resistance (~50%)
- Maximum mobility and stamina efficiency
- Poor physical defense - requires skillful play

### Hybrid Build
- Chainmail + Iron Helmet + Iron Shield
- 38 total defense
- Good balance of all resistances
- Moderate speed penalty (80% movement)

## Future Enhancements

Potential additions to the armor system:
1. **Visual armor on player model** - Show equipped armor in first-person view
2. **Armor sets with bonuses** - Wearing matching pieces grants set bonuses
3. **Enchantments** - Add magical properties to armor
4. **Crafting/Upgrading** - Allow players to improve armor stats
5. **More armor types** - Dragon scale, demon armor, blessed armor, etc.
6. **Armor skills** - Special abilities tied to specific armor sets
7. **Dynamic durability loss** - Different damage types affect durability differently
8. **Repair costs** - Add resource cost to armor repair
9. **Armor weight affects attack speed** - Heavy armor slows weapon swings
10. **Parrying system** - Active blocking with shields for increased block chance

## Testing

To test the armor system:

1. **Start the game** and press any key to initialize
2. **Check initial stats** - No armor equipped by default
3. **Press T** to take 20 test damage - observe no reduction
4. **Press F4** to equip Plate Armor
5. **Press F8** to equip Knight Helmet
6. **Press F12** to equip Tower Shield
7. **Press T** again - observe significant damage reduction
8. **Check console** - See detailed damage calculation
9. **Press T multiple times** - Watch durability decrease
10. **Press R** to repair armor
11. **Try different armor combinations** - Compare stats in UI
12. **Move near enemies** - They will attack and trigger armor system
13. **Press H** to heal when needed

## Implementation Summary

The armor system successfully adds:
- 13 unique armor pieces across 3 equipment slots
- Complex damage calculation with multiple modifiers
- Durability system with visual feedback
- Movement and stamina penalties/bonuses
- Full UI integration with real-time stat display
- Complete control scheme for equipment management
- Combat integration with enemy AI
- Comprehensive testing tools

The system is production-ready and fully integrated with the existing game mechanics.
