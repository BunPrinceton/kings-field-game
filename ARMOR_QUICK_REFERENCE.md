# Armor System - Quick Reference

## File Locations

```
/src/ArmorSystem.js          - Standalone armor system (in use)
/src/ArmorDefinitions.js     - Armor item definitions (for ItemManager)
/src/Armor.js                - Armor item class (for ItemManager)
/src/main.js                 - Player integration & combat
/src/ItemManager.js          - Updated with armor support
/ARMOR_SYSTEM.md             - Complete documentation
```

## In-Game Controls

| Key | Action |
|-----|--------|
| **F1** | Remove body armor |
| **F2** | Equip Leather Armor |
| **F3** | Equip Chainmail |
| **F4** | Equip Plate Armor |
| **F5** | Remove helmet |
| **F6** | Equip Leather Cap |
| **F7** | Equip Iron Helmet |
| **F8** | Equip Knight Helmet |
| **F9** | Remove shield |
| **F10** | Equip Wooden Shield |
| **F11** | Equip Iron Shield |
| **F12** | Equip Tower Shield |
| **T** | Test damage (20 HP) |
| **H** | Heal 30 HP |
| **R** | Repair all armor |

## Quick Stats Reference

### Body Armor Comparison
| Armor | Defense | Weight | Speed | Phys Resist |
|-------|---------|--------|-------|-------------|
| Leather | 5 | 3 | 100% | 5% |
| Chainmail | 15 | 8 | 90% | 15% |
| Plate | 30 | 15 | 75% | 30% |
| Mage Robes | 3 | 2 | 105% | 3% |

### Shield Comparison
| Shield | Defense | Block % | Weight |
|--------|---------|---------|--------|
| Wooden | 5 | 15% | 3 |
| Iron | 10 | 25% | 6 |
| Tower | 18 | 35% | 12 |
| Magic | 6 | 20% | 2 |

## Code Snippets

### Equip Armor
```javascript
game.armorSystem.equipArmor('plate');
game.armorSystem.equipHelmet('knightHelmet');
game.armorSystem.equipShield('towerShield');
```

### Get Stats
```javascript
const summary = game.armorSystem.getEquipmentSummary();
console.log('Defense:', summary.total.defense);
console.log('Weight:', summary.total.weight);
console.log('Speed:', summary.total.speedModifier);
```

### Check Durability
```javascript
const durability = game.armorSystem.getDurabilityInfo();
console.log('Armor:', durability.armor.percentage + '%');
```

### Deal Damage (with armor reduction)
```javascript
const result = game.player.takeDamage(20, 'physical');
// Returns: { isDead, damageDealt, blocked, damageReduced }
```

### Repair
```javascript
game.armorSystem.repairArmor('armor', 100);
game.armorSystem.repairArmor('helmet', 100);
game.armorSystem.repairArmor('shield', 100);
```

## Damage Types

- `'physical'` - Sword, axe, mace damage
- `'fire'` - Fire-based attacks
- `'ice'` - Ice/frost attacks
- `'lightning'` - Electric attacks

## UI Data Access

```javascript
// From standalone system
const equipment = game.armorSystem.getEquipmentSummary();
equipment.armor.stats.name       // "Plate Armor"
equipment.total.defense          // 60
equipment.total.resistances      // {physical: 0.57, ...}
equipment.total.blockChance      // 0.35

// From item system
const armor = itemManager.createItem('plate_armor');
armor.name                       // "Plate Armor"
armor.stats.defense              // 30
armor.durability                 // 250
armor.getTooltip()              // Full description
```

## Build Archetypes

### Tank Build
```javascript
game.armorSystem.equipArmor('plate');
game.armorSystem.equipHelmet('knightHelmet');
game.armorSystem.equipShield('towerShield');
// Result: 60 def, 67% phys resist, 35% block, 60% speed
```

### Balanced Build
```javascript
game.armorSystem.equipArmor('chainmail');
game.armorSystem.equipHelmet('ironHelmet');
game.armorSystem.equipShield('ironShield');
// Result: 33 def, 38% phys resist, 25% block, 90% speed
```

### Speed Build
```javascript
game.armorSystem.equipArmor('leather');
game.armorSystem.equipHelmet('leatherCap');
game.armorSystem.equipShield('woodenShield');
// Result: 12 def, 17% phys resist, 15% block, 100% speed
```

### Mage Build
```javascript
game.armorSystem.equipArmor('mage');
game.armorSystem.equipHelmet('wizardHat');
game.armorSystem.equipShield('magicShield');
// Result: 10 def, 50% elemental resist, 20% block, 105% speed
```

## Common Tasks

### Add new armor type
1. Add definition to `ArmorDefinitions.js`
2. Add to ARMOR_STATS in `ArmorSystem.js` (if using standalone)
3. Add keybinding in `main.js` if desired

### Modify damage formula
Edit `ArmorSystem.calculateDamageReduction()` method

### Change durability loss rate
Edit Player.takeDamage() in main.js:
```javascript
this.armorSystem.damageArmor(Math.max(1, Math.floor(amount / 10)));
// Change the /10 to adjust rate
```

### Add new resistance type
1. Add to all armor definitions in resistances object
2. Update calculateDamageReduction() to handle new type
3. Update UI display in updateUI()

## Debug Console Commands

```javascript
// Check current armor
game.armorSystem.getEquipmentSummary()

// Test damage calculation
game.player.takeDamage(50, 'fire')

// Force repair
game.armorSystem.repairArmor('armor', 1000)

// Check all armor definitions
Object.keys(ARMOR_DEFINITIONS)

// Create armor item
itemManager.createItem('plate_armor')
```

## Stat Formulas

### Defense Reduction
```
defenseReduction = min(totalDefense * 0.5, incomingDamage * 0.5)
```

### Resistance Multiplier
```
finalDamage = (damage - defenseReduction) * (1 - resistance)
```

### Block Calculation
```
if (random() < blockChance) {
  finalDamage *= 0.5
}
```

### Durability Loss
```
durabilityLoss = max(1, floor(incomingDamage / 10))
```

### Total Weight
```
totalWeight = armorWeight + helmetWeight + shieldWeight
```

### Speed Modifier
```
finalSpeed = baseSpeed * armorSpeedMod * shieldSpeedMod
```

## Tips

1. **Heavy armor trades speed for protection** - Use for bosses
2. **Shields are crucial** - 35% block chance is huge
3. **Resistance stacks additively** - Combine gear for max effect
4. **Durability matters** - Broken armor = 0 defense
5. **Weight affects stamina** - Heavy armor = more stamina drain
6. **Elemental resist can be negative** - Metal armor conducts lightning
7. **Mage builds are viable** - Speed + elemental resist
8. **Repair before bosses** - Durability loss is permanent until repaired

## Troubleshooting

**Armor not showing in UI?**
- Check `game.armorSystem` is initialized
- Call `updateUI()` after equipment change

**Damage not reducing?**
- Verify armor has durability > 0
- Check resistance type matches damage type
- Console.log the damage result object

**Stats seem wrong?**
- Resistances are capped at 75% / -50%
- Defense reduction capped at 50% of damage
- Speed modifiers are multiplicative

**Durability draining too fast?**
- Adjust formula in Player.takeDamage()
- Current: 20 damage = 2 durability loss

## Version Info

- **Armor System Version**: 1.0
- **Compatible with**: King's Field Game main.js (Nov 2025)
- **Total Armor Pieces**: 19 (13 in standalone, 19 in item system)
- **Equipment Slots**: 3 (body, helmet, shield)
- **Damage Types**: 4 (physical, fire, ice, lightning)
