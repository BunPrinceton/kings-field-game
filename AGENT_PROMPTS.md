# Agent Prompts - Iteration 2

Copy-paste these prompts into each Claude instance:

---

## Agent 1: Controls Modernization Expert

```
Modernize the player controls for the Kings Field game while keeping the stylistic grid-based approach. Current system uses WASD/arrows for movement and Q/E for rotation with grid-based movement.

Improvements needed:
- Keep the grid-based movement aesthetic but make it feel more responsive
- Add mouse look option (optional toggle) while preserving classic keyboard-only controls
- Implement smooth camera transitions
- Add sprint/run toggle (Shift key)
- Implement interaction key (E or F for future use)
- Add ability to strafe while looking in a direction
- Make movement feel modern but honor the deliberate, methodical King's Field pacing
- Add control remapping system
- Ensure all controls work with the existing collision and combat systems

Test thoroughly and ensure movement feels good!
```

---

## Agent 2: Level Design Expert (POIs & Symmetry)

```
Enhance the dungeon generation system to be less random and more intentional. Create a sophisticated level design system with Points of Interest (POIs).

Requirements:
- Modify DungeonGenerator.js to create a symmetrical core/center area of the map
- Use asymmetry as you move further from the center
- Add POI system: treasure rooms, boss arenas, safe rooms, puzzle rooms
- Create mini-hub areas that connect multiple corridors
- Ensure the dungeon feels hand-crafted, not random
- Add landmark rooms that help with navigation
- Implement a "critical path" that ensures players can always reach the exit
- Add optional side areas with rewards
- Make the center area feel significant and memorable
- Balance exploration vs. guided progression

The dungeon should feel like it was designed by a level designer, not generated randomly.
```

---

## Agent 3: Textures & Decorations Artist

```
Transform the dungeon from bland gray boxes into a visually interesting, lived-in environment using free/creative commons textures.

Tasks:
- Find and integrate free texture resources (CC0, public domain, or free game assets)
- Apply varied stone/brick textures to walls
- Add floor textures (worn stone, dirt, etc.)
- Create ceiling textures
- Add environmental decorations: columns, statues, rubble, crates, barrels
- Place torches/braziers that match the existing lighting system
- Add atmospheric details: cobwebs, moss, water puddles, cracks
- Make different room types visually distinct
- Create modular decoration pieces that can be reused
- Ensure textures work with the dark, atmospheric lighting
- Keep performance in mind (optimize texture sizes)

The goal is to make it feel like an ancient, lived-in dungeon with history. Think Dark Souls meets King's Field.
```

---

## Agent 4: Player & Weapons Expert

```
Implement first-person hands, weapon models, and animations for the player.

Requirements:
- Create visible player hands in first-person view
- Implement idle animation (subtle breathing/sway)
- Create attack animation (works for all weapons)
- Design 3-4 different melee weapon models (sword, axe, mace, dagger - start simple)
- Weapons should be low-poly but visually distinct
- Integrate weapon switching system (number keys 1-4)
- Ensure attack animations sync with the combat system
- Add weapon bob/sway during movement
- Make attack animation feel weighty and impactful
- Add visual feedback when hitting enemies
- Consider weapon stats (damage, speed, range differences)

Start with simple geometric weapon models - we can improve later. Focus on functionality and feel.
```

---

## Agent 5: Modern UI/UX Expert

```
Redesign the game UI with modern UX principles while paying homage to classic King's Field interfaces.

Tasks:
- Redesign the health bar (keep oldschool aesthetic but modernize)
- Create a better HUD layout that doesn't obstruct view
- Add weapon/inventory UI (hotbar style)
- Design a minimap or compass system
- Create notification system for damage, pickups, etc.
- Add stamina bar (if sprint is implemented)
- Design pause menu with settings, controls display
- Keep some retro King's Field UI elements as homage
- Add smooth UI animations and transitions
- Implement radial menu for quick actions (optional)
- Create UI for interaction prompts
- Design message/lore text display system (for future NPC interactions)
- Ensure UI scales properly for different resolutions

Balance modern usability with nostalgic aesthetics. Think "What if King's Field was made in 2024?"
```

---

## Agent 6: Narrative & Lore Writer

```
Create the narrative foundation and descriptive text for the game world.

Deliverables:
- Write a compelling backstory for the dungeon
- Create player character background/motivation
- Write descriptions for each enemy type
- Design item descriptions (for weapons, consumables, etc.)
- Write environmental storytelling text (examine objects, read signs)
- Create lore fragments that can be discovered
- Design quest concepts (for future NPC system)
- Write flavor text for UI elements
- Create location names for different dungeon areas
- Develop the overall tone and writing style
- Plan NPC character concepts (personalities, roles, dialogue themes)
- Design merchant/quest-giver concepts (UI-based, not 3D models)

Think Elden Ring / Dark Souls style: mysterious, fragmented lore that rewards exploration. Keep the King's Field vibe: lonely, oppressive, mysterious.
```

---

## Agent 7: Sound & Audio Designer

```
Add atmospheric audio to bring the dungeon to life using free/creative commons sound resources.

Requirements:
- Find free game audio resources (freesound.org, CC0 libraries, etc.)
- Implement background ambience (distant drips, wind, echoes)
- Add footstep sounds (stone, different surfaces)
- Create combat sounds (sword swings, hits, enemy death)
- Add environmental sounds (torch crackles, distant groans)
- Implement spatial audio (3D positioned sounds)
- Add UI sounds (menu clicks, notifications)
- Create audio manager system for easy control
- Add volume controls for different sound categories
- Implement audio ducking/mixing for important sounds
- Add subtle music layer (optional, atmospheric only)
- Ensure sounds enhance atmosphere without being overwhelming

Focus on creating an oppressive, atmospheric soundscape. Silence is powerful - use it wisely.
```

---

## Notes for Future Iterations

**Outdoor Level Designer Agent** (Not this iteration)
- Create overworld/surface area before dungeon entrance
- Design outdoor environments

**NPC System Agent** (Not this iteration)
- Implement UI-based NPC interaction system
- Create notification triggers (red number indicators)
- Build dialogue/shop/quest interfaces
- Add placeholder trigger zones in levels

---

## Launch Instructions

1. Run: `./launch-7-agents.sh`
2. Copy-paste the appropriate prompt into each pane
3. Let them work simultaneously!
4. When done, merge all branches back to main

Good luck! 🎮
