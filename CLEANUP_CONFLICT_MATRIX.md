# Agent 4: Conflict Matrix - Touch / No-Touch Rules

**Purpose:** Clear boundaries for cleanup work to avoid interfering with active development and major refactors.

---

## The Golden Rules

1. **When in doubt, don't touch** - Better to skip a fix than break a feature
2. **Stay in your lane** - Cleanup is constants, docs, null checks, dead code
3. **Coordinate on shared systems** - If >2 files affected, check first
4. **Test before commit** - Every fix must pass the 5-point verification
5. **Document your reasoning** - Why is this safe? Write it down.

---

## ✅ GREEN ZONE: Safe to Touch

Agent 4 has **full autonomy** on these changes:

### Code Quality (Zero Risk)
- **Magic numbers → Named constants** (within single class)
- **JSDoc comments** (anywhere, anytime)
- **Dead code removal** (commented-out code)
- **Console.log cleanup** (keep console.warn/error)
- **Formatting/whitespace** (eslint fixes)
- **Typos in comments** (documentation fixes)

### Defensive Programming (Low Risk)
- **Null checks** (early returns, optional chaining)
- **Input validation** (typeof checks, bounds checking)
- **Default values** (function parameters)
- **Error messages** (clearer error text)

### Documentation (Zero Risk)
- **Class JSDoc** (any class without docs)
- **Method JSDoc** (public methods)
- **Parameter docs** (@param, @returns)
- **Example usage** (in comments)
- **README updates** (non-architectural)

### Specific Files (Approved)
These files are stable and safe for cleanup:

| File | Safe Changes | Notes |
|------|--------------|-------|
| `HitEffects.js` | Constants, JSDoc, null checks | Isolated visual system |
| `MinimapRenderer.js` | Null checks, constants, JSDoc | Self-contained rendering |
| `AudioManager.js` | Log cleanup, JSDoc | Stable API |
| `TextureManager.js` | Log cleanup, JSDoc | Stable API |
| `SoundConfig.js` | Documentation | Pure data file |
| `WeaponSystem.js` | Constants (hit window), null checks | Isolated combat system |
| `ArmorSystem.js` | JSDoc, constants | Stable system |
| `Item.js` | JSDoc, log cleanup | Stable base class |

---

## ⚠️ YELLOW ZONE: Coordinate First

Require **quick check** before changing:

### Shared Constants
If a constant is used in >1 file, coordinate:

**Example: CELL_SIZE**
- Used in: `DungeonBuilder.js`, `MinimapRenderer.js`, potentially more
- Action: Search codebase first, then create shared constant file
- Coordinate with: Architecture team

**Example: Player Eye Height**
- Used in: `main.js` (Player class), `AtmosphericLighting.js` (player light)
- Action: Create shared constant, update both
- Low risk but test lighting after change

### Footstep Timing
- Affects: Movement feel, audio synchronization
- Files: `main.js` (footstep logic)
- Coordinate with: Audio/movement teams
- Why: Game feel is delicate, timing changes may need playtesting

### SOUND_CONFIG Access Patterns
- Used in: `main.js` (multiple places)
- Change type: Add null safety (optional chaining)
- Coordinate with: Audio team
- Why: Ensure fallback values make sense

### Event Listeners
- Add/remove: Requires coordination
- Why: Memory leak fix is planned (Week 2)
- What you can do: Document which listeners exist
- What you can't do: Change lifecycle

---

## 🛑 RED ZONE: Do Not Touch

Agent 4 must **avoid** these areas entirely:

### Architecture & Core Systems

#### Global Game Object (main.js)
❌ **Don't touch:**
- `game` object structure (20+ properties)
- State management patterns
- Object initialization order

✅ **Can touch:**
- Individual class constants (Player, Health)
- JSDoc within classes
- Null checks within methods

**Why:** Week 4 refactor will restructure entire game object. Any changes now will create merge conflicts.

---

#### Collision System (main.js)
❌ **Don't touch:**
- `collidableObjects` array population (line ~806)
- Collision detection loops (lines 413-433, 580)
- Spatial partitioning logic (P0 bug fix pending)

✅ **Can touch:**
- Comments/docs explaining current system
- Constants for collision distances

**Why:** P0 bug - array never populated. Dedicated fix team working on this.

---

#### DungeonBuilder.build() (DungeonBuilder.js)
❌ **Don't touch:**
- `build()` method logic (lines 50-66)
- Mesh creation/geometry (lines 121-186)
- Material loading (lines 68-80)
- Texture application

✅ **Can touch:**
- JSDoc comments
- Error messages
- Constants (if creating shared file)
- Null guards on `getRoomAtPosition`

**Why:** Painting system incoming. DungeonBuilder will be extended with painting placement logic.

---

#### Scene Management (main.js)
❌ **Don't touch:**
- Scene initialization
- Camera setup
- Renderer configuration
- Light management (beyond constants)

✅ **Can touch:**
- Configuration constants
- JSDoc

**Why:** Architecture refactor will modularize scene setup.

---

#### DungeonGenerator Logic (DungeonGenerator.js)
❌ **Don't touch:**
- Room generation algorithms
- Corridor creation
- POI placement
- Entrance/exit validation (P0 bug)

✅ **Can touch:**
- JSDoc comments
- Null checks (e.g., `findNearestRoom` guard on line 394)
- Error messages

**Why:** P0 bug - entrance/exit can be null. Also, generation is complex and fragile.

---

### Performance Optimizations (Deferred)

#### UI Rebuild Loop (main.js ~693-759)
❌ **Don't touch:**
- `innerHTML` updates
- DOM manipulation
- Update frequency

✅ **Can touch:**
- Comments explaining performance issue

**Why:** Week 2 performance optimization. UI is rebuilt every frame, needs proper state diffing.

---

#### Particle System (HitEffects.js)
❌ **Don't touch:**
- Particle creation (lines 17-47)
- Geometry instantiation
- Material instances

✅ **Can touch:**
- Constants (particle count, lifetime)
- JSDoc
- Update loop constants

**Why:** Week 1 fix - particle geometry leak. Object pooling implementation planned.

---

#### Vector Allocations (main.js ~436-483)
❌ **Don't touch:**
- Vector3 instantiation patterns
- Movement calculations

✅ **Can touch:**
- Comments, docs

**Why:** Week 2 optimization - creates new Vector3 every frame. Needs object pooling.

---

### Active Development Areas

#### ItemManager / Inventory
⚠️ **Partial restrictions:**
- ❌ Don't change: Item equip/unequip logic
- ✅ Can change: Debug console.logs (lines 201, 288)
- ✅ Can add: JSDoc, null checks

**Why:** Potentially active development. Logs can be cleaned, but logic should be stable.

---

#### WeaponSystem Equipment
⚠️ **Partial restrictions:**
- ❌ Don't change: Sword equip logic (around line 307)
- ✅ Can add: Null check before instanceof
- ✅ Can add: JSDoc
- ✅ Can extract: Hit window constants (line 434)

**Why:** Combat system is stable, but equipment integration may be evolving.

---

## Coordination Checklist

Before touching YELLOW ZONE items, ask:

- [ ] Is this constant used in multiple files? (Grep search)
- [ ] Does this affect game feel? (Timing, movement, combat)
- [ ] Is this part of a planned refactor? (Check DEBUG-FINDINGS.md)
- [ ] Could this create merge conflicts? (Check active branches)
- [ ] Have I tested this change thoroughly? (5-point verification)

If **any** answer is "maybe" or "yes", coordinate first.

---

## File-by-File Reference

### High Touch (Safe)
| File | Risk Level | Cleanup Types Allowed |
|------|------------|------------------------|
| HitEffects.js | 🟢 Low | All: constants, JSDoc, null checks |
| MinimapRenderer.js | 🟢 Low | All: constants, JSDoc, null checks |
| AudioManager.js | 🟢 Low | Logs, JSDoc, null checks |
| TextureManager.js | 🟢 Low | Logs, JSDoc, null checks |
| SoundConfig.js | 🟢 Low | JSDoc only (pure data) |
| ArmorSystem.js | 🟢 Low | JSDoc, constants |
| Item.js | 🟢 Low | JSDoc, log cleanup |

### Medium Touch (Coordinate)
| File | Risk Level | Restrictions |
|------|------------|--------------|
| WeaponSystem.js | 🟡 Medium | Constants OK, logic NO |
| ItemManager.js | 🟡 Medium | Logs OK, equip logic NO |
| DungeonBuilder.js | 🟡 Medium | Docs OK, build() NO |
| AtmosphericLighting.js | 🟡 Medium | Constants OK, light setup NO |

### Low Touch (Avoid)
| File | Risk Level | What NOT to Touch |
|------|------------|-------------------|
| main.js | 🔴 High | game object, collision, scene, UI loop |
| DungeonGenerator.js | 🔴 High | Generation algorithms, POI logic |

---

## Conflict Detection

### How to check if a fix is safe:

1. **Grep for usage:**
   ```bash
   grep -r "constantName" src/
   ```
   If >1 file, coordinate.

2. **Check DEBUG-FINDINGS.md:**
   Search for the area you want to touch. Is it mentioned as a P0/P1 issue?

3. **Look for TODOs:**
   ```bash
   grep -r "TODO" src/yourfile.js
   ```
   TODOs might indicate active work.

4. **Test the change:**
   Run the game, check all 5 verification points.

---

## Escalation Path

**If unsure about a fix:**

1. **Document the question** - Write down why you're unsure
2. **Check this matrix** - Is it RED or YELLOW?
3. **Search DEBUG-FINDINGS** - Is it a known issue?
4. **Skip for now** - Add to "needs coordination" list
5. **Ask in coordination log** - Flag for team review

**Never:**
- Guess and commit
- "Try it and see" with RED zone items
- Merge without testing

---

## Success Stories (Safe Changes Made)

Document successful cleanups here to build confidence:

### ✅ Example: Player Eye Height Constant
- **Risk:** Low (only used in 2 places)
- **Coordination:** None needed (verified with grep)
- **Test:** Game loaded, movement OK
- **Result:** Success

### ✅ Example: Console.log Cleanup in AudioManager
- **Risk:** Zero (informational log)
- **Coordination:** None needed
- **Test:** Audio still initialized
- **Result:** Success

---

## Red Flags (Stop Immediately)

If you see these, **stop the fix**:

🚩 **Error in console after your change**
🚩 **Game doesn't load**
🚩 **Movement feels different**
🚩 **Combat doesn't work**
🚩 **Grep shows >5 files using this constant**
🚩 **DEBUG-FINDINGS mentions this as P0/P1**
🚩 **You're not 100% sure it's safe**

Action: `git checkout .` and move on.

---

## Philosophy

Agent 4 is the **cleanup specialist**, not the **refactoring hero**.

✅ Good Agent 4 work:
- "I removed 50 lines of dead code"
- "I added null checks to prevent 3 crashes"
- "I documented 4 undocumented classes"
- "I extracted 8 magic numbers to constants"

❌ Bad Agent 4 work:
- "I refactored the collision system"
- "I optimized the particle system"
- "I redesigned the game object structure"
- "I fixed the entrance/exit bug"

**Stay in your lane, do it well, don't break things.**

The boring work is important work.
