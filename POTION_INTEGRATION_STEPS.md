# Potion System Integration Steps

Step-by-step guide to integrate the potion system into main.js.

## Step 1: Add Imports to main.js

At the top of `src/main.js`, add these imports:

```javascript
import { Inventory } from './Inventory.js';
import { createPotion, getStarterPotions } from './PotionDefinitions.js';
import {
    initializePlayerInventory,
    updatePlayerPotionEffects,
    getModifiedDamage,
    getModifiedDamageReduction,
    getActiveBuffsDisplay,
    getInventoryDisplayHTML,
    getHotbarDisplayHTML
} from './PotionSystemExample.js';
```

## Step 2: Modify Player Class Constructor

In the `Player` class constructor (around line 40), add inventory initialization:

```javascript
class Player {
    constructor(scene) {
        this.scene = scene;
        this.health = new Health(100);
        this.position = { x: 0, y: 1.6, z: 5 };
        this.rotation = { x: 0, y: 0 };
        this.attackPower = 25;
        this.attackRange = 2.5;
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.attackCooldownMax = 500;

        // Armor system
        this.armorSystem = new ArmorSystem(scene);

        // NEW: Add inventory and potion system support
        this.inventory = null; // Will be initialized later
        this.potionCooldown = 0;
        this.buffs = {};
        this.statusEffects = {};
        this.stamina = 100;
        this.maxStamina = 100;
        this.mana = 100;
        this.maxMana = 100;
    }

    // ... rest of Player class
}
```

## Step 3: Update Player.update() Method

Add potion cooldown update to the `Player.update()` method (around line 122):

```javascript
update(deltaTime) {
    if (this.attackCooldown > 0) {
        this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
    }

    // NEW: Update potion cooldown
    if (this.potionCooldown > 0) {
        this.potionCooldown = Math.max(0, this.potionCooldown - deltaTime);
    }

    // Update armor system
    if (this.armorSystem) {
        this.armorSystem.update(deltaTime);
    }

    // NEW: Update potion effects (buffs, regeneration, etc.)
    if (this.inventory) {
        updatePlayerPotionEffects(this, deltaTime);
    }
}
```

## Step 4: Initialize Player Inventory

In the `init()` function, after player is created (around line 722), initialize inventory:

```javascript
// Initialize player (now as Player class instance)
game.player = new Player(game.scene);

// Link armor system reference for easier access
game.armorSystem = game.player.armorSystem;

// NEW: Initialize player inventory with starter potions
initializePlayerInventory(game.player);

// Set player spawn position
const spawnPos = game.dungeon.generator.getSpawnPosition();
// ... rest of spawn code
```

## Step 5: Add Potion Hotkeys to Input Handler

In the `setupInput()` function (around line 366), add potion hotkey handling:

```javascript
window.addEventListener('keydown', (e) => {
    // Initialize audio on first user interaction
    if (!game.audioInitialized && game.audio) {
        initAudio();
    }

    // Handle attack
    if (e.code === 'Space') {
        e.preventDefault();
        game.input.attack = true;
    }

    // NEW: Handle potion hotkeys (5-9)
    if (e.key >= '5' && e.key <= '9') {
        e.preventDefault();
        const hotbarSlot = parseInt(e.key) - 5;
        if (game.player.inventory) {
            const success = game.player.inventory.useHotbarItem(hotbarSlot, game.player);
            if (success) {
                updateUI();
                // Optional: Play potion use sound
                if (game.audioInitialized) {
                    // game.audio.playSound('ui', 'potion_use', 80);
                }
            }
        }
    }

    // Handle weapon switching (1-4 keys)
    if (game.weaponSystem) {
        const weaponMap = {
            '1': 'sword',
            '2': 'axe',
            '3': 'mace',
            '4': 'dagger'
        };

        if (weaponMap[e.key]) {
            game.weaponSystem.switchWeapon(weaponMap[e.key]);
            updateUI();
        }
    }

    // ... rest of input handling
});
```

## Step 6: Update Combat Damage Calculation

Modify the attack damage to use buff modifiers (around line 940):

```javascript
// Deal damage during weapon swing (at the right timing)
if (game.weaponSystem && game.weaponSystem.isAttacking && game.attackTarget) {
    if (game.weaponSystem.getAttackHitTiming()) {
        const weaponStats = game.weaponSystem.getWeaponStats();

        // NEW: Apply potion buffs to damage
        const baseDamage = weaponStats.damage;
        const modifiedDamage = getModifiedDamage(game.player, baseDamage);

        const dead = game.attackTarget.takeDamage(modifiedDamage);

        // ... rest of hit effects code
    }
}
```

## Step 7: Update Player Damage Reception

If enemies can damage the player, modify the damage calculation (location varies):

```javascript
// When player takes damage from enemy
const incomingDamage = enemy.attackPower;

// NEW: Apply potion buffs to damage reduction
const reducedDamage = getModifiedDamageReduction(game.player, incomingDamage);

const damageResult = game.player.takeDamage(reducedDamage);
```

## Step 8: Update UI Display

Modify the `updateUI()` function (around line 772) to include inventory and potions:

```javascript
function updateUI() {
    const healthPercent = game.player.health.getPercentage();
    const healthColor = healthPercent > 50 ? '#0f0' : healthPercent > 25 ? '#ff0' : '#f00';

    // Get weapon stats if weapon system is initialized
    let weaponInfo = '';
    if (game.weaponSystem) {
        const stats = game.weaponSystem.getWeaponStats();
        weaponInfo = `
            <div style="font-size: 12px; margin-top: 10px; padding: 5px; background: rgba(0,0,0,0.5); border: 1px solid #666;">
                <div style="color: #ffa500; margin-bottom: 3px;">${stats.name}</div>
                <div style="font-size: 11px;">Damage: ${stats.damage} | Range: ${stats.range.toFixed(1)} | Speed: ${(1000/stats.attackSpeed).toFixed(1)}/s</div>
            </div>
        `;
    }

    // Get armor stats if armor system is initialized
    let armorInfo = '';
    if (game.armorSystem) {
        // ... existing armor info code ...
    }

    // NEW: Get inventory and potion info
    let inventoryInfo = '';
    let hotbarInfo = '';
    let buffsInfo = '';
    if (game.player.inventory) {
        inventoryInfo = getInventoryDisplayHTML(game.player);
        hotbarInfo = getHotbarDisplayHTML(game.player);
        buffsInfo = getActiveBuffsDisplay(game.player);
    }

    const audioStatus = game.audioInitialized
        ? '<span style="color: #0f0;">ENABLED</span>'
        : '<span style="color: #ff0;">Click to enable</span>';

    const masterVolume = game.audio ? Math.round(game.audio.masterVolume * 100) : 100;

    const uiHTML = `
        <div style="font-size: 16px;">
            <div style="margin-bottom: 10px;">Kings Field - Ready</div>
            <div style="margin-bottom: 5px;">
                Health: <span style="color: ${healthColor}">${game.player.health.current}/${game.player.health.max}</span>
            </div>
            <div style="background: #333; width: 200px; height: 20px; border: 2px solid #fff; margin-bottom: 10px;">
                <div style="background: ${healthColor}; width: ${healthPercent}%; height: 100%; transition: width 0.3s;"></div>
            </div>
            ${weaponInfo}
            ${armorInfo}
            ${buffsInfo}
            ${inventoryInfo}
            ${hotbarInfo}
            <div style="font-size: 12px; opacity: 0.7; margin-top: 10px;">
                Enemies: ${game.enemies.filter(e => !e.isDead()).length}/${game.enemies.length}
            </div>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">
                WASD: Move | Q/E: Rotate | SPACE: Attack | 1-4: Weapons | 5-9: Potions
            </div>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">
                F1-F4: Armor | F5-F8: Helmets | F9-F12: Shields
            </div>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">
                Audio: ${audioStatus}
            </div>
            ${game.audioInitialized ? `
            <div style="font-size: 11px; opacity: 0.6; margin-top: 5px;">
                <div style="margin-bottom: 3px;">
                    Master Volume: ${masterVolume}%
                    <button onclick="window.adjustMasterVolume(-0.1)" style="margin-left: 5px; padding: 2px 6px;">-</button>
                    <button onclick="window.adjustMasterVolume(0.1)" style="padding: 2px 6px;">+</button>
                </div>
                <div style="margin-bottom: 3px;">
                    <button onclick="window.toggleAudioCategory('ambience')" style="padding: 2px 6px; font-size: 10px;">Toggle Ambience</button>
                    <button onclick="window.toggleAudioCategory('combat')" style="padding: 2px 6px; font-size: 10px;">Toggle Combat</button>
                </div>
            </div>
            ` : ''}
            </div>
        </div>
    `;

    document.querySelector('#ui').innerHTML = uiHTML;
}
```

## Step 9: Setup Hotbar (Optional)

After inventory initialization in `init()`, you can pre-assign potions to hotbar:

```javascript
// NEW: Setup potion hotbar
if (game.player.inventory) {
    // Assign health potion to hotbar slot 0 (key 5)
    const healthPotion = game.player.inventory.findItemById('health_potion');
    if (healthPotion) {
        game.player.inventory.assignToHotbar(healthPotion.index, 0);
    }

    // Assign stamina potion to hotbar slot 1 (key 6)
    const staminaPotion = game.player.inventory.findItemById('stamina_potion');
    if (staminaPotion) {
        game.player.inventory.assignToHotbar(staminaPotion.index, 1);
    }
}
```

## Step 10: Add Potion Loot Drops (Optional)

When enemies die, add a chance to drop potions (around line 957):

```javascript
if (dead) {
    console.log('Enemy defeated!');

    // Play death sound
    if (game.audioInitialized) {
        const deathVariations = SOUND_CONFIG.combat.enemy_death.files.length;
        game.audio.playRandomVariation('combat', 'enemy_death', deathVariations, 100);
    }

    // NEW: Chance to drop potion loot
    if (Math.random() < 0.3) { // 30% chance
        const lootPotion = getRandomPotion();
        if (lootPotion) {
            // In a full implementation, you'd drop this at enemy position
            // For now, just add to inventory
            game.player.inventory.addItem(lootPotion);
            console.log(`Dropped ${lootPotion.name}!`);
        }
    }
}
```

## Testing the Integration

After completing these steps:

1. **Start the game**: `npm run dev`
2. **Check console**: Should see "Player inventory initialized with starter potions"
3. **Press 5**: Should use a health potion from hotbar
4. **Check UI**: Should display inventory and hotbar slots
5. **Take damage**: Use potions to heal
6. **Use buff potions**: Should see active buffs displayed
7. **Kill enemies**: Should randomly get potion loot

## Quick Test Commands

Open browser console and try:

```javascript
// Add a specific potion
const strongPotion = createPotion('health_potion_superior');
game.player.inventory.addItem(strongPotion);

// Check inventory
console.log(game.player.inventory.getInventoryData());

// Get random loot
import { getRandomPotion } from './PotionDefinitions.js';
const loot = getRandomPotion();
game.player.inventory.addItem(loot);

// Check active buffs
console.log(game.player.buffs);
```

## Troubleshooting

**"Cannot find module" errors:**
- Make sure all files are in `/src` directory
- Check import paths are correct

**Potions not working:**
- Verify player has `health`, `stamina`, `mana` properties
- Check `potionCooldown` is being updated in player.update()

**UI not showing inventory:**
- Ensure `getInventoryDisplayHTML()` is called in `updateUI()`
- Check that player.inventory is initialized

**Hotkeys not working:**
- Verify hotkey handler is in `setupInput()`
- Check that keys 5-9 are not being used elsewhere

## Summary

You've successfully integrated:
- ✅ Full inventory system (20 slots)
- ✅ Potion consumption with effects
- ✅ Buff/status effect system
- ✅ Hotbar (5 slots, keys 5-9)
- ✅ UI display for inventory and buffs
- ✅ Combat integration with damage modifiers
- ✅ Optional loot drop system

The potion system is now fully functional!
