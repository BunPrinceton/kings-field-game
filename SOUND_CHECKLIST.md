# Sound File Checklist

Use this checklist when gathering sound files for your King's Field game.

## Priority 1: Core Gameplay Sounds

### Footsteps (4 files)
- [ ] `public/sounds/footsteps/stone_step_1.ogg`
- [ ] `public/sounds/footsteps/stone_step_2.ogg`
- [ ] `public/sounds/footsteps/stone_step_3.ogg`
- [ ] `public/sounds/footsteps/stone_step_4.ogg`

**Search terms**: "stone footstep", "concrete footstep", "dungeon walk"
**Notes**: Short sounds (0.1-0.3s), variations to prevent repetition

### Combat - Sword Swings (3 files)
- [ ] `public/sounds/combat/sword_swing_1.ogg`
- [ ] `public/sounds/combat/sword_swing_2.ogg`
- [ ] `public/sounds/combat/sword_swing_3.ogg`

**Search terms**: "sword whoosh", "blade swing", "weapon swing"
**Notes**: Whoosh sound, 0.2-0.4s duration

### Combat - Sword Hits (2 files)
- [ ] `public/sounds/combat/sword_hit_1.ogg`
- [ ] `public/sounds/combat/sword_hit_2.ogg`

**Search terms**: "sword hit", "blade impact", "metal impact stone"
**Notes**: Impact sound, short and punchy

### Combat - Enemy Deaths (2 files)
- [ ] `public/sounds/combat/enemy_death_1.ogg`
- [ ] `public/sounds/combat/enemy_death_2.ogg`

**Search terms**: "monster death", "creature groan", "enemy defeat"
**Notes**: Death groan or roar, 0.5-1.5s

---

## Priority 2: Atmospheric Ambience

### Ambient Loops (3 files)
- [ ] `public/sounds/ambience/dungeon_ambient.ogg`
- [ ] `public/sounds/ambience/water_drips.ogg`
- [ ] `public/sounds/ambience/wind_echo.ogg`

**Search terms**: "cave ambience", "dungeon atmosphere", "water drip loop", "wind tunnel"
**Notes**: MUST loop seamlessly, 10-60s duration, subtle and dark

---

## Priority 3: UI & Polish

### UI Sounds (2 files)
- [ ] `public/sounds/ui/menu_click.ogg`
- [ ] `public/sounds/ui/attack_cooldown.ogg`

**Search terms**: "menu click", "ui select", "button press", "notification beep"
**Notes**: Very short (0.05-0.1s), subtle

### Player Feedback (1 file)
- [ ] `public/sounds/combat/player_hurt.ogg`

**Search terms**: "player hurt", "damage grunt", "pain sound"
**Notes**: Short grunt or impact, 0.2-0.5s

---

## Optional: Enhanced Atmosphere

### Environmental Sounds
- [ ] `public/sounds/environment/torch_crackle.ogg`
- [ ] `public/sounds/environment/distant_groan_1.ogg`
- [ ] `public/sounds/environment/distant_groan_2.ogg`

**Search terms**: "fire crackle", "torch burn", "distant groan", "echo howl"
**Notes**: Torch should loop, groans occasional

### Background Music
- [ ] `public/sounds/music/dark_ambient.ogg`

**Search terms**: "dark ambient", "atmospheric music", "dungeon music"
**Notes**: MUST loop, very low volume (15%), 2-5 minutes long
**Recommended artist**: Kevin MacLeod (incompetech.com) - "Dark Fog", "Darker"

---

## File Format Requirements

- **Format**: OGG Vorbis (preferred) or MP3
- **Sample Rate**: 44.1kHz
- **Bit Rate**: 128-192kbps
- **Channels**: Mono (effects), Stereo (music/ambience)
- **Looping**: Ambient files MUST loop seamlessly

---

## Recommended Sources

1. **Freesound.org** (Register for free)
   - Filter: "CC0" or "CC-BY"
   - Download: OGG or WAV format
   - Convert WAV to OGG if needed (using Audacity)

2. **OpenGameArt.org**
   - Game-specific sounds
   - Usually pre-looped

3. **Sonniss GDC Bundles**
   - High quality
   - Royalty-free

---

## Quick Tips

- **Start small**: Get Priority 1 sounds first
- **Test often**: Add a few sounds, test the game
- **Adjust volumes**: Use in-game controls to balance
- **Respect licenses**: Track CC-BY sounds for credits
- **Prefer CC0**: No attribution required
- **Convert formats**: Use Audacity (free) to convert WAV→OGG
- **Loop testing**: Play ambience files in a loop to check for clicks/pops
- **Less is more**: Don't over-layer sounds

---

## Testing Commands

```bash
# Start dev server
npm run dev

# Open browser to http://localhost:5173 (or shown port)
# Click or press a key to enable audio
# Move around (WASD) to test footsteps
# Attack (SPACE) to test combat sounds
# Listen for ambient sounds fading in
```

---

## When You're Done

- [ ] Test all sounds in-game
- [ ] Adjust volumes using in-game controls
- [ ] Create CREDITS.md if using CC-BY sounds
- [ ] Enjoy your atmospheric dungeon crawler!

---

**Remember**: The game works perfectly without sounds. Add them incrementally as you find good ones. Silence is powerful in a dungeon - use it wisely!
