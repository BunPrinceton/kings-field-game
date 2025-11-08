# Atmospheric Audio System - King's Field Game

## What's Been Added

Your King's Field dungeon crawler now has a complete atmospheric audio system! Here's what's been implemented:

### Core Systems

1. **AudioManager** (`src/AudioManager.js`)
   - Full-featured audio management system using Three.js Audio API
   - Category-based sound organization (ambience, footsteps, combat, environment, ui, music)
   - Individual volume controls per category
   - Master volume control
   - Spatial 3D audio support
   - Audio ducking/mixing capabilities
   - Fade in/out effects
   - Cooldown system to prevent audio spam
   - Graceful handling of missing sound files

2. **Sound Configuration** (`src/SoundConfig.js`)
   - Centralized configuration for all game sounds
   - Easy-to-modify sound properties
   - Support for sound variations (randomized playback)
   - Placeholder sound generator for testing

3. **Game Integration** (`src/main.js`)
   - Audio initialization on user interaction (browser requirement)
   - Footstep sounds triggered on movement
   - Combat sounds (swing, hit, death) triggered on attacks
   - Ambient sounds that fade in on game start
   - UI feedback sounds
   - Audio controls in the game UI

### Sound Categories

- **Ambience**: Background atmospheric loops (dungeon atmosphere, water drips, wind)
- **Footsteps**: Movement sounds with variations
- **Combat**: Sword swings, hits, enemy deaths
- **Environment**: Environmental effects (torches, distant sounds)
- **UI**: User interface feedback sounds
- **Music**: Optional atmospheric background music

### Features

- Spatial audio (sounds positioned in 3D space)
- Random variation selection (prevents repetitive sounds)
- Cooldown system (prevents audio spam)
- Fade in/out effects
- Audio ducking (lower background sounds when important sounds play)
- Per-category volume controls
- Master volume control
- Works perfectly without sound files (graceful degradation)

## Getting Started

### Step 1: Understand the System

The audio system is **fully functional** and integrated into your game right now. However, you need to add actual sound files for it to make sounds.

### Step 2: Find Sound Files

See `AUDIO_RESOURCES.md` for detailed information on free audio sources.

**Quick recommendation**: Start with Freesound.org
1. Create a free account
2. Use the search terms provided in the audio resources doc
3. Filter by "CC0" license (no attribution needed)
4. Download OGG or MP3 format

### Step 3: Add Sound Files

Place sound files in the `public/sounds/` directory:

```
public/sounds/
├── ambience/       (background loops)
├── footsteps/      (stone steps 1-4)
├── combat/         (sword swings, hits, deaths)
├── ui/             (menu clicks, feedback)
└── music/          (optional atmospheric music)
```

See `public/sounds/README.md` for the complete file list.

### Step 4: Test the Game

```bash
npm run dev
```

Open the game, click or press a key to enable audio, and play!

- Move around to hear footsteps
- Attack to hear combat sounds
- Listen for ambient sounds fading in

### Step 5: Adjust Settings

Use the in-game audio controls or edit configuration files:
- **In-game**: Master volume +/- buttons, category toggles
- **Config**: Edit `src/SoundConfig.js` for sound properties
- **Volumes**: Edit `src/AudioManager.js` for default category volumes

## File Structure

```
.
├── src/
│   ├── AudioManager.js          # Core audio system
│   ├── SoundConfig.js            # Sound file configuration
│   └── main.js                   # Game integration (updated)
├── public/
│   └── sounds/                   # Sound files go here
│       ├── README.md             # Sound file requirements
│       ├── ambience/
│       ├── footsteps/
│       ├── combat/
│       ├── environment/
│       ├── ui/
│       └── music/
├── AUDIO_RESOURCES.md            # Where to find free sounds
├── AUDIO_SETUP_GUIDE.md          # Detailed setup instructions
└── README_AUDIO.md               # This file
```

## Quick Checklist

- [ ] Read `AUDIO_RESOURCES.md` to find free sound sources
- [ ] Download footstep sounds (4 variations)
- [ ] Download combat sounds (sword swings, hits, deaths)
- [ ] Download ambient loops (dungeon atmosphere)
- [ ] Place files in `public/sounds/[category]/` directories
- [ ] Name files according to `src/SoundConfig.js` specifications
- [ ] Test the game
- [ ] Adjust volumes as needed
- [ ] (Optional) Add environmental sounds
- [ ] (Optional) Add background music
- [ ] (Optional) Create CREDITS.md if using CC-BY sounds

## Current Sound Requirements

### Priority 1 (Core Gameplay)
- 4 footstep variations (`stone_step_1.ogg` through `stone_step_4.ogg`)
- 3 sword swing variations (`sword_swing_1.ogg` through `sword_swing_3.ogg`)
- 2 sword hit variations (`sword_hit_1.ogg`, `sword_hit_2.ogg`)
- 2 enemy death sounds (`enemy_death_1.ogg`, `enemy_death_2.ogg`)

### Priority 2 (Atmosphere)
- Dungeon ambient loop (`dungeon_ambient.ogg`)
- Water drips loop (`water_drips.ogg`)
- Wind echo loop (`wind_echo.ogg`)

### Priority 3 (Polish)
- UI click sound (`menu_click.ogg`)
- Attack cooldown sound (`attack_cooldown.ogg`)
- Player hurt sound (`player_hurt.ogg`)

### Optional
- Background music track (`dark_ambient.ogg`)
- Environmental sounds (torches, distant groans)

## Audio System API

### Playing Sounds

```javascript
// Play a sound
game.audio.play('category', 'soundName', cooldown);

// Play random variation
game.audio.playRandomVariation('category', 'baseName', variationCount, cooldown);

// Play positioned sound
game.audio.playPositional('category', 'soundName', position, parentObject);
```

### Volume Control

```javascript
// Set category volume (0.0 to 1.0)
game.audio.setCategoryVolume('ambience', 0.5);

// Set master volume (0.0 to 1.0)
game.audio.setMasterVolume(0.8);

// Get volume
const volume = game.audio.getCategoryVolume('combat');
```

### Effects

```javascript
// Fade in over 2 seconds
game.audio.fadeIn('music', 'ambient_track', 2000);

// Fade out over 3 seconds
game.audio.fadeOut('music', 'ambient_track', 3000);

// Duck background sounds
game.audio.duck(0.5, ['ui']); // Duck by 50%, except UI

// Restore normal volume
game.audio.unduck();
```

## Testing Without Sound Files

The system is designed to work perfectly without sound files:
- Game runs normally
- Console shows warnings for missing files
- No errors or crashes
- Add sounds incrementally as you find them

This lets you develop and test game logic before worrying about audio.

## Troubleshooting

**No audio?**
- Click or press a key to enable (browser requirement)
- Check console for "Audio system ready"
- Verify files exist in `public/sounds/`

**Performance issues?**
- Reduce number of looping sounds
- Lower audio file bitrates
- Check for too many simultaneous sounds

**Files not loading?**
- Check console for "Could not load" warnings
- Verify file paths match `SoundConfig.js`
- Ensure files are OGG or MP3 format

See `AUDIO_SETUP_GUIDE.md` for detailed troubleshooting.

## What Makes This Atmospheric

The audio system creates an oppressive, atmospheric dungeon soundscape through:

1. **Layered Ambience**: Multiple subtle loops at different volumes
2. **Silence is Powerful**: Not overwhelming, spaces between sounds
3. **Spatial Audio**: Sounds positioned in 3D space
4. **Randomization**: Variations prevent repetition
5. **Smooth Fading**: Sounds fade in/out naturally
6. **Dynamic Mixing**: Important sounds duck background audio
7. **Low Volumes**: Atmospheric rather than loud

## License Compliance

If you use CC-BY licensed sounds, create a `CREDITS.md` file with:
- Sound name
- Author name
- License type
- Source URL

CC0 sounds require no attribution but it's nice to credit creators anyway!

## Next Steps

1. **Read** `AUDIO_RESOURCES.md` - Find free sound sources
2. **Download** Priority 1 sounds (footsteps, combat)
3. **Test** the game with sounds
4. **Adjust** volumes and settings
5. **Add** atmospheric sounds (Priority 2)
6. **Polish** with UI and environmental sounds
7. **Enjoy** your atmospheric dungeon crawler!

## Notes

- The game is fully playable without sounds
- Add sounds incrementally as you find good ones
- Use "silence is powerful" - don't over-layer sounds
- Test with headphones for spatial audio effects
- Adjust volumes to taste - current settings are starting points

**Silence in a dungeon is powerful. Use it wisely.**

Enjoy creating an oppressive, atmospheric soundscape for your King's Field-inspired game!
