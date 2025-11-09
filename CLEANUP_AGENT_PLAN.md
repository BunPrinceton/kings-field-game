# Agent 4: Cleanup Specialist - Action Plan

**Created:** 2025-11-09
**Total Issues Catalogued:** 86 (from DEBUG-FINDINGS.md)
**Agent 4 Target:** 20 low-conflict, high-impact fixes
**Estimated Total Time:** 3-4 hours

---

## Mission

Fix low-hanging fruit code quality issues without interfering with:
- **DungeonBuilder** (painting system incoming)
- **Scene management** (architecture refactoring planned)
- **Core game loop** (performance optimization scheduled)
- **Global state** (Week 4 refactor planned)

---

## Conflict Risk Classification

### LOW CONFLICT (Agent 4 targets) ✓
Safe, isolated changes with minimal dependencies:
- Magic numbers → named constants
- Missing JSDoc comments
- Console.log cleanup (keep console.warn/error for debugging)
- Inconsistent naming (simple renames within single file)
- Missing const/let declarations
- Simple null checks
- Input validation
- Unused imports
- Dead code removal (commented code)

### MEDIUM CONFLICT (coordinate first) ⚠️
Requires checking active work:
- Event listener cleanup (touches main game loop)
- Memory optimization (geometry disposal)
- Performance improvements (update loops)
- Vector allocation optimization

### HIGH CONFLICT (wait for major features) 🛑
Do NOT touch:
- Architecture refactoring
- Global state changes (game object restructuring)
- Collision system redesign (collidableObjects array issue)
- Entrance/exit validation (dungeon generation logic)
- UI rebuild optimization (full innerHTML replacement)
- Spatial partitioning (O(n) collision checks)

---

## Priority Action List (20 Fixes)

### Tier 1: Constants & Config (30 mins)
**Quick wins, zero conflict risk**

#### Fix #1: Player Eye Height Constant
- **File:** `/mnt/c/Users/benja/Documents/kings-field-game/src/main.js`
- **Lines:** 47
- **Type:** magic-number
- **Conflict Risk:** LOW
- **Estimated Time:** 3 minutes

**Before:**
```javascript
this.position = { x: 0, y: 1.6, z: 5 };
```

**After:**
```javascript
// At top of Player class
static PLAYER_EYE_HEIGHT = 1.6;
static SPAWN_DISTANCE = 5;

this.position = { x: 0, y: Player.PLAYER_EYE_HEIGHT, z: Player.SPAWN_DISTANCE };
```

**Why Safe:** Only affects Player class initialization, self-contained constant.

---

#### Fix #2: Attack Cooldown Constants
- **File:** `/mnt/c/Users/benja/Documents/kings-field-game/src/main.js`
- **Lines:** 53
- **Type:** magic-number
- **Conflict Risk:** LOW
- **Estimated Time:** 2 minutes

**Before:**
```javascript
this.attackCooldownMax = 500; // milliseconds
```

**After:**
```javascript
static ATTACK_COOLDOWN_MS = 500;

this.attackCooldownMax = Player.ATTACK_COOLDOWN_MS;
```

**Why Safe:** Already has a comment, just making it a named constant.

---

#### Fix #3: Footstep Timing Constants
- **File:** `/mnt/c/Users/benja/Documents/kings-field-game/src/main.js`
- **Lines:** ~690-700 (in footstep logic)
- **Type:** magic-number
- **Conflict Risk:** LOW
- **Estimated Time:** 5 minutes

**Before:**
```javascript
// Scattered timing values: 300ms, 450ms
```

**After:**
```javascript
// At top of file or in game config
const FOOTSTEP_TIMING = {
    WALK_INTERVAL_MS: 450,
    RUN_INTERVAL_MS: 300,
    FIRST_FRAME_SKIP: true  // Avoid footstep on frame 1
};
```

**Why Safe:** Audio timing, self-contained, doesn't affect game logic.

---

#### Fix #4: Weapon Hit Window Constants
- **File:** `/mnt/c/Users/benja/Documents/kings-field-game/src/WeaponSystem.js`
- **Lines:** 434
- **Type:** magic-number
- **Conflict Risk:** LOW
- **Estimated Time:** 3 minutes

**Before:**
```javascript
return this.attackProgress >= 0.4 && this.attackProgress <= 0.6;
```

**After:**
```javascript
// At top of WeaponSystem class
static HIT_WINDOW_START = 0.4;
static HIT_WINDOW_END = 0.6;

return this.attackProgress >= WeaponSystem.HIT_WINDOW_START &&
       this.attackProgress <= WeaponSystem.HIT_WINDOW_END;
```

**Why Safe:** Combat timing constant, well-isolated in WeaponSystem.

---

#### Fix #5: Cell Size Constant
- **File:** `/mnt/c/Users/benja/Documents/kings-field-game/src/DungeonBuilder.js`
- **Lines:** 13 (config)
- **Type:** magic-number (hardcoded in multiple places)
- **Conflict Risk:** LOW (but check all references first)
- **Estimated Time:** 8 minutes

**Before:**
```javascript
cellSize: config.cellSize || 4,
// Also hardcoded in MinimapRenderer.js line 99: "/ 4"
```

**After:**
```javascript
// Create shared constant file
// /src/constants/DungeonConstants.js
export const DUNGEON_CONSTANTS = {
    CELL_SIZE: 4,
    WALL_HEIGHT: 3,
    WALL_THICKNESS: 0.2
};

// Update DungeonBuilder.js
import { DUNGEON_CONSTANTS } from './constants/DungeonConstants.js';
cellSize: config.cellSize || DUNGEON_CONSTANTS.CELL_SIZE,
```

**Why Safe:** Creates a single source of truth for dungeon dimensions. Need to update MinimapRenderer.js too.

---

### Tier 2: Null Safety (45 mins)
**Add guards without changing logic flow**

#### Fix #6: SOUND_CONFIG Null Guards
- **File:** `/mnt/c/Users/benja/Documents/kings-field-game/src/main.js`
- **Lines:** 696, 1166, 1211, 1221
- **Type:** null-check
- **Conflict Risk:** LOW
- **Estimated Time:** 10 minutes

**Before:**
```javascript
const numVariations = SOUND_CONFIG.footsteps.stone.files.length;
```

**After:**
```javascript
const numVariations = SOUND_CONFIG?.footsteps?.stone?.files?.length || 1;
```

**Why Safe:** Defensive programming, prevents crashes if SOUND_CONFIG is missing. Add for all 4 locations.

---

#### Fix #7: Enemy Validation in Attack
- **File:** `/mnt/c/Users/benja/Documents/kings-field-game/src/main.js`
- **Lines:** 76-86 (in Player.attack)
- **Type:** null-check
- **Conflict Risk:** LOW
- **Estimated Time:** 5 minutes

**Before:**
```javascript
for (const enemy of enemies) {
    if (enemy.isDead()) continue;
```

**After:**
```javascript
for (const enemy of enemies) {
    if (!enemy || !enemy.mesh || enemy.isDead()) continue;
```

**Why Safe:** Prevents null pointer exceptions, doesn't change attack logic.

---

#### Fix #8: Room Lookup Null Guard
- **File:** `/mnt/c/Users/benja/Documents/kings-field-game/src/DungeonBuilder.js`
- **Lines:** 82-90
- **Type:** null-check
- **Conflict Risk:** LOW
- **Estimated Time:** 5 minutes

**Before:**
```javascript
getRoomAtPosition(x, y) {
    for (const room of this.dungeonData.rooms) {
```

**After:**
```javascript
getRoomAtPosition(x, y) {
    if (!this.dungeonData || !this.dungeonData.rooms) {
        return null;
    }
    for (const room of this.dungeonData.rooms) {
```

**Why Safe:** Early return pattern, prevents crashes if dungeonData is null.

---

#### Fix #9: Minimap Enemy Check Guard
- **File:** `/mnt/c/Users/benja/Documents/kings-field-game/src/MinimapRenderer.js`
- **Lines:** 175 (in enemy rendering loop)
- **Type:** null-check
- **Conflict Risk:** LOW
- **Estimated Time:** 5 minutes

**Before:**
```javascript
for (const enemy of enemies) {
    // Render enemy without checking if mesh exists
```

**After:**
```javascript
for (const enemy of enemies) {
    if (!enemy || !enemy.mesh || enemy.isDead()) continue;
```

**Why Safe:** Prevents rendering errors if enemy data is malformed.

---

#### Fix #10: WeaponSystem Equipment Check
- **File:** `/mnt/c/Users/benja/Documents/kings-field-game/src/WeaponSystem.js`
- **Lines:** 307
- **Type:** null-check enhancement
- **Conflict Risk:** LOW
- **Estimated Time:** 5 minutes

**Before:**
```javascript
if (!(item instanceof Sword)) {
    console.error('Can only equip Sword items');
```

**After:**
```javascript
if (!item) {
    console.error('Cannot equip null item');
    return false;
}
if (!(item instanceof Sword)) {
    console.error('Can only equip Sword items');
```

**Why Safe:** Adds early null check before instanceof check.

---

### Tier 3: Console Cleanup (20 mins)
**Remove debug logs, keep warnings/errors**

#### Fix #11: Remove Debug Console.logs
- **Files:**
  - `/mnt/c/Users/benja/Documents/kings-field-game/src/ItemManager.js` (line 201)
  - `/mnt/c/Users/benja/Documents/kings-field-game/src/ItemManager.js` (line 288)
  - `/mnt/c/Users/benja/Documents/kings-field-game/src/Item.js` (line 64)
- **Type:** console-cleanup
- **Conflict Risk:** LOW
- **Estimated Time:** 8 minutes

**Before:**
```javascript
console.log('Inventory is full!');
console.log('Cannot equip non-weapon in weapon slot');
console.log(`${user.name || 'Player'} used ${this.name}`);
```

**After:**
```javascript
// Remove or convert to proper UI feedback
// Option 1: Remove entirely
// Option 2: Convert to event system (better)
this.emit('inventoryFull');
this.emit('equipmentInvalid', { reason: 'non-weapon' });
```

**Why Safe:** Debug logs that don't provide value. Can remove or enhance to events.

---

#### Fix #12: Standardize AudioManager Logging
- **File:** `/mnt/c/Users/benja/Documents/kings-field-game/src/AudioManager.js`
- **Lines:** 58
- **Type:** console-cleanup
- **Conflict Risk:** LOW
- **Estimated Time:** 3 minutes

**Before:**
```javascript
console.log('AudioManager initialized');
```

**After:**
```javascript
// Remove or make debug-only
if (DEBUG_MODE) {
    console.log('AudioManager initialized');
}
```

**Why Safe:** Initialization log, can be debug-only or removed.

---

#### Fix #13: TextureManager Loading Logs
- **File:** `/mnt/c/Users/benja/Documents/kings-field-game/src/TextureManager.js`
- **Lines:** 278, 290
- **Type:** console-cleanup
- **Conflict Risk:** LOW
- **Estimated Time:** 3 minutes

**Before:**
```javascript
console.log('Preloading common textures...');
console.log('Texture preload complete');
```

**After:**
```javascript
// Make debug-only or remove
if (DEBUG_MODE) {
    console.log('Preloading common textures...');
}
```

**Why Safe:** Loading logs, not critical. Keep the warnings for failures.

---

### Tier 4: Dead Code Removal (15 mins)
**Remove commented code to reduce noise**

#### Fix #14: Remove Commented Shadow Code
- **File:** `/mnt/c/Users/benja/Documents/kings-field-game/src/main.js`
- **Lines:** ~578-579
- **Type:** dead-code
- **Conflict Risk:** LOW
- **Estimated Time:** 2 minutes

**Before:**
```javascript
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
```

**After:**
```javascript
// Remove entirely (or move to config if might be re-enabled)
```

**Why Safe:** Commented code from old shadow implementation. Can remove.

---

#### Fix #15: Remove Commented Decorations
- **File:** `/mnt/c/Users/benja/Documents/kings-field-game/src/main.js`
- **Lines:** ~613-627
- **Type:** dead-code
- **Conflict Risk:** LOW
- **Estimated Time:** 2 minutes

**Before:**
```javascript
// Commented out decoration code
```

**After:**
```javascript
// Remove or move to separate feature branch
```

**Why Safe:** Not being used, clutters codebase.

---

#### Fix #16: Remove Commented Atmospheric Details
- **File:** `/mnt/c/Users/benja/Documents/kings-field-game/src/main.js`
- **Lines:** ~629-643
- **Type:** dead-code
- **Conflict Risk:** LOW
- **Estimated Time:** 2 minutes

**Before:**
```javascript
// Commented atmospheric code
```

**After:**
```javascript
// Remove or move to feature branch
```

**Why Safe:** Not active, reduces file clutter.

---

### Tier 5: Documentation (60 mins)
**Add JSDoc to undocumented public methods**

#### Fix #17: Document Player Class
- **File:** `/mnt/c/Users/benja/Documents/kings-field-game/src/main.js`
- **Lines:** 42-107
- **Type:** jsdoc
- **Conflict Risk:** LOW
- **Estimated Time:** 15 minutes

**Before:**
```javascript
class Player {
    constructor(scene) {
```

**After:**
```javascript
/**
 * Player - Manages player state, health, and combat
 * @class
 */
class Player {
    /**
     * Create a new player
     * @param {THREE.Scene} scene - The Three.js scene
     */
    constructor(scene) {
```

**Why Safe:** Documentation only, no code changes.

---

#### Fix #18: Document Health Class
- **File:** `/mnt/c/Users/benja/Documents/kings-field-game/src/main.js`
- **Lines:** 18-40
- **Type:** jsdoc
- **Conflict Risk:** LOW
- **Estimated Time:** 10 minutes

**Before:**
```javascript
class Health {
    constructor(maxHealth) {
```

**After:**
```javascript
/**
 * Health - Manages health points with damage and healing
 * @class
 */
class Health {
    /**
     * Initialize health system
     * @param {number} maxHealth - Maximum health points
     */
    constructor(maxHealth) {
```

**Why Safe:** Documentation only.

---

#### Fix #19: Document HitEffects Class
- **File:** `/mnt/c/Users/benja/Documents/kings-field-game/src/HitEffects.js`
- **Lines:** 1-128 (entire file missing JSDoc)
- **Type:** jsdoc
- **Conflict Risk:** LOW
- **Estimated Time:** 20 minutes

**Before:**
```javascript
export class HitEffects {
  constructor(scene) {
```

**After:**
```javascript
/**
 * HitEffects - Manages visual feedback for combat (particles, screen shake)
 * @class
 */
export class HitEffects {
  /**
   * Create hit effects manager
   * @param {THREE.Scene} scene - The Three.js scene
   */
  constructor(scene) {
```

**Why Safe:** Documentation only, covers public API.

---

#### Fix #20: Document MinimapRenderer Key Methods
- **File:** `/mnt/c/Users/benja/Documents/kings-field-game/src/MinimapRenderer.js`
- **Lines:** Throughout (partial JSDoc exists)
- **Type:** jsdoc
- **Conflict Risk:** LOW
- **Estimated Time:** 15 minutes

**Before:**
```javascript
// Some methods have JSDoc, others don't
```

**After:**
```javascript
// Ensure all public methods have JSDoc
/**
 * Check if a cell has been explored
 * @param {number} gridX - X grid coordinate
 * @param {number} gridZ - Z grid coordinate
 * @returns {boolean} True if explored
 */
isCellExplored(gridX, gridZ) {
```

**Why Safe:** Documentation only, fills gaps in existing docs.

---

## Quick Wins List (Top 10)

For immediate morale boost, start here:

1. **Player Eye Height Constant** (3 min) - Fix #1
2. **Attack Cooldown Constant** (2 min) - Fix #2
3. **Weapon Hit Window Constants** (3 min) - Fix #4
4. **Remove Shadow Code Comment** (2 min) - Fix #14
5. **Remove Decorations Comment** (2 min) - Fix #15
6. **Remove Atmospheric Comment** (2 min) - Fix #16
7. **WeaponSystem Null Check** (5 min) - Fix #10
8. **Enemy Validation in Attack** (5 min) - Fix #7
9. **AudioManager Log Cleanup** (3 min) - Fix #12
10. **TextureManager Log Cleanup** (3 min) - Fix #13

**Total Quick Wins Time:** ~30 minutes
**Impact:** Cleaner code, better constants, safer execution

---

## Conflict Matrix

### Agent 4 CAN Touch:
✅ Player class constants
✅ WeaponSystem constants
✅ AudioManager logging
✅ HitEffects documentation
✅ MinimapRenderer null checks
✅ Console.log cleanup (non-critical)
✅ Commented dead code
✅ JSDoc comments (anywhere)
✅ Simple null guards (defensive)
✅ Magic number extraction

### Agent 4 CANNOT Touch:
🛑 DungeonBuilder.build() logic (paintings incoming)
🛑 game object structure (architecture refactor pending)
🛑 collidableObjects array population (P0 bug, dedicated fix team)
🛑 Event listener lifecycle (memory leak fix pending)
🛑 UI update loops (performance optimization pending)
🛑 Scene management
🛑 Collision detection algorithms
🛑 Dungeon generation logic
🛑 Particle geometry pooling (memory fix pending)

### Agent 4 SHOULD COORDINATE:
⚠️ Cell size constant (used in multiple systems)
⚠️ Footstep timing (affects audio and movement)
⚠️ SOUND_CONFIG access patterns (shared across files)

---

## Testing Checklist

After each fix, verify:

- [ ] Game still loads
- [ ] Player movement works
- [ ] Combat system functions
- [ ] Audio plays correctly
- [ ] Minimap renders
- [ ] No new console errors
- [ ] No regression in gameplay feel

---

## Success Metrics

**Code Quality Improvements:**
- Magic numbers reduced: 14 → ~5
- Null checks added: +8 defensive guards
- Dead code removed: ~50 lines
- Documentation coverage: +4 classes fully documented
- Console noise reduced: ~8 debug logs removed

**No Conflicts:**
- Zero painting system conflicts
- Zero architecture refactor conflicts
- Zero P0 bug interference
- All changes isolated and testable

---

## Next Steps After Agent 4

Once Agent 4 completes these 20 fixes:

1. **Review impact** - Did code quality metrics improve?
2. **Identify new quick wins** - Run fresh analysis
3. **Coordinate with other agents** - Share learnings
4. **Tackle Tier 2 conflicts** - Event listeners, memory optimization
5. **Support major refactors** - Documentation helps Week 4 work

---

## Files Created

This plan will be supplemented by:

1. **CLEANUP_QUICK_WINS.md** - Top 10 easiest fixes
2. **CLEANUP_CONFLICT_MATRIX.md** - Detailed touch/no-touch rules
3. **CLEANUP_TESTING_GUIDE.md** - How to verify each fix

---

**Agent 4 Philosophy:**

> "Steady, safe, unsexy wins. We clean up the mess so others can build the magic."

Fix the boring stuff well, stay out of the way, and make the codebase 1% better every day.
