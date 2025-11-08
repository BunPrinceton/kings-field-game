# Future Features & Planned Iterations

This document tracks planned features for future development iterations.

---

## Iteration 3+ Candidates

### 🌍 Outdoor Level Designer
**Priority:** High
**Description:** Create the surface/overworld area before entering the dungeon

**Features:**
- Outdoor environment design (entrance area, ruins, forest, etc.)
- Transition system from outdoor to dungeon
- Skybox and outdoor lighting
- Outdoor enemies/encounters
- Points of interest in overworld
- Weather effects (rain, fog, etc.)
- Day/night cycle (optional)

**Why Later:** Foundation needs to be solid first, outdoor is "nice to have"

---

### 💬 NPC Interaction System
**Priority:** High
**Description:** UI-based NPC system without 3D character models

**Features:**
- **UI-Based NPCs:**
  - 2D portraits/avatars for NPCs
  - Dialogue interface
  - Quest acceptance UI
  - Merchant/shop interface
  - Inventory trading system

- **Trigger Zones:**
  - Walk into zone to trigger NPC encounter
  - Notification system (red number badge in top-right UI)
  - "Unread messages" style indicator
  - Open notification to read NPC dialogue

- **NPC Types:**
  - Merchants (buy/sell items)
  - Quest givers
  - Lore NPCs (storytellers)
  - Friendly spirits/ghosts
  - Cryptic advisors

- **Placeholder Trigger Zones:**
  - Add red debug cubes in current build
  - Mark where NPC triggers will be
  - Allows level designers to plan NPC placement

**Why Later:** Narrative and UI foundation needed first

---

### 🎒 Inventory & Items System
**Priority:** Medium-High
**Description:** Full inventory management and loot system

**Features:**
- Grid-based inventory UI
- Item categories (weapons, consumables, key items, crafting)
- Pickup/drop mechanics
- Item stats and tooltips
- Equipment system
- Consumable items (potions, food, etc.)
- Key items for progression
- Randomized loot drops
- Treasure chests

**Dependencies:** Needs modern UI system from Iteration 2

---

### 🔮 Magic System
**Priority:** Medium
**Description:** Spellcasting and magic mechanics

**Features:**
- Spell inventory/hotbar
- MP/Mana system
- Spell casting animations
- Different spell types (attack, defense, utility)
- Spell effects (projectiles, area effects)
- Magic find/learning system
- Spell upgrade system

**Dependencies:** Needs player animation system and combat refinement

---

### 🎯 Advanced Combat
**Priority:** Medium
**Description:** Expand combat beyond basic attack

**Features:**
- Blocking/parrying system
- Dodge roll / evasive maneuvers
- Weapon combos
- Critical hits
- Status effects (poison, bleed, curse)
- Enemy AI improvements
- Boss enemy types
- Lock-on targeting (optional)

**Dependencies:** Needs basic combat to be polished first

---

### 📊 Progression Systems
**Priority:** Medium
**Description:** Character leveling and growth

**Features:**
- Experience points and leveling
- Stat system (STR, DEX, VIT, INT, etc.)
- Level-up UI
- Skill trees or ability unlocks
- Equipment requirements based on stats
- Stat respeccing (optional)

**Dependencies:** Needs inventory and combat systems

---

### 💾 Save/Load System
**Priority:** High (but after core gameplay is fun)
**Description:** Persistent game state

**Features:**
- Save game slots
- Autosave points (checkpoints)
- Manual save (bonfires/save points)
- Cloud save support (optional)
- Save data includes: position, inventory, stats, quest progress, discovered areas

---

### 🗺️ Procedural Generation v2
**Priority:** Low
**Description:** Enhance dungeon generation further

**Features:**
- Multiple dungeon themes/biomes
- Seed-based generation (shareable dungeons)
- Difficulty scaling by depth
- Special room types
- Secret areas
- Interconnected multi-level dungeons

**Dependencies:** Needs basic level design to be excellent first

---

### 🎮 Controller Support
**Priority:** Low-Medium
**Description:** Full gamepad support

**Features:**
- Xbox/PlayStation controller mapping
- Radial menus for controller
- Controller-friendly UI
- Rumble/haptic feedback
- On-screen button prompts

---

### 🎵 Music System
**Priority:** Low
**Description:** Beyond ambient sound, add musical score

**Features:**
- Dynamic music system
- Combat music triggers
- Boss battle themes
- Area-specific themes
- Adaptive music (responds to gameplay)

**Dependencies:** Needs basic sound/audio system first

---

### 🏆 Achievements/Challenges
**Priority:** Low
**Description:** Optional objectives and rewards

**Features:**
- Achievement system
- Challenge modes
- Speedrun timer
- Permadeath mode
- New Game+

---

## Iteration 2 Implementation Notes

**NPC Placeholder System:**
Even though full NPC system is later, add visual placeholders NOW:
- Add small red debug cubes at planned NPC locations
- Label them (NPC-Merchant-1, NPC-Quest-1, etc.)
- Allows level designers to plan encounters
- Easy to activate later when NPC system is built

**Code Structure for Future:**
- Keep systems modular
- Design with future features in mind
- Document extension points
- Use clear naming conventions

---

## How to Propose New Features

1. Add to this document under appropriate section
2. Include priority level (High/Medium/Low)
3. List dependencies (what needs to exist first)
4. Describe core features
5. Explain why it should wait (or not!)

Remember: Focus on making what exists GREAT before adding more!
