# Audio System Setup Guide

## Overview

Your King's Field game now has a fully integrated atmospheric audio system! The system includes:

- Ambient background sounds (dungeon atmosphere, water drips, wind)
- Footstep sounds for player movement
- Combat sounds (sword swings, hits, enemy deaths)
- UI feedback sounds
- Spatial 3D audio support
- Volume controls per category
- Master volume control
- Audio ducking/mixing capabilities

## Quick Start

### 1. The Audio System is Ready to Use

The audio system is fully integrated and will work as soon as you add sound files. The game will run perfectly fine even without sound files - it will just display console warnings for missing files.

### 2. Adding Sound Files

Sound files should be placed in the `public/sounds/` directory according to this structure:

```
public/sounds/
├── ambience/
│   ├── dungeon_ambient.ogg
│   ├── water_drips.ogg
│   └── wind_echo.ogg
├── footsteps/
│   ├── stone_step_1.ogg
│   ├── stone_step_2.ogg
│   ├── stone_step_3.ogg
│   └── stone_step_4.ogg
├── combat/
│   ├── sword_swing_1.ogg
│   ├── sword_swing_2.ogg
│   ├── sword_swing_3.ogg
│   ├── sword_hit_1.ogg
│   ├── sword_hit_2.ogg
│   ├── enemy_death_1.ogg
│   └── enemy_death_2.ogg
├── ui/
│   ├── menu_click.ogg
│   └── attack_cooldown.ogg
└── music/ (optional)
    └── dark_ambient.ogg
```

### 3. Finding Free Sounds

See `AUDIO_RESOURCES.md` for detailed sources. Quick links:

- **Freesound.org** - Filter by CC0 or CC-BY license
- **OpenGameArt.org** - Game-specific sounds
- **Sonniss GDC Bundles** - Professional quality game audio

Search terms to use:
- "dungeon ambient loop"
- "stone footstep"
- "sword swing whoosh"
- "sword impact"
- "monster death"
- "torch fire loop"
- "cave atmosphere"

### 4. Testing the Audio System

1. Start your development server: `npm run dev`
2. Open the game in your browser
3. Click anywhere or press a key to enable audio (browser requirement)
4. You should see "Audio: ENABLED" in the UI
5. Move around (WASD) to hear footsteps
6. Attack (SPACE) to hear combat sounds
7. Ambient sounds will fade in automatically

### 5. Audio Controls

The game includes built-in audio controls in the UI:

- **Master Volume**: Use +/- buttons to adjust overall volume
- **Toggle Ambience**: Turn ambient sounds on/off
- **Toggle Combat**: Turn combat sounds on/off

## Audio Events Integration

The audio system is automatically triggered by these game events:

### Movement
- **Footsteps**: Play when moving (WASD keys)
- **Variations**: Randomly selects from 4 different footstep sounds
- **Cooldown**: 150ms between footsteps

### Combat
- **Sword Swing**: Plays when attacking (even if no enemy is hit)
- **Sword Hit**: Plays when hitting an enemy
- **Enemy Death**: Plays when an enemy is defeated
- **Attack Failed**: UI sound when attacking on cooldown or missing

### Ambience
- **Dungeon Base**: Main atmospheric loop, fades in over 3 seconds
- **Water Drips**: Subtle dripping sounds, fades in over 4 seconds
- **Wind Echo**: Distant wind/echo, fades in over 5 seconds

## Customizing the Audio

### Adjusting Volumes

Edit `src/SoundConfig.js` to change default volumes:

```javascript
ambience: {
    dungeon_base: {
        files: ['sounds/ambience/dungeon_ambient.ogg'],
        loop: true,
        volume: 0.3,  // Change this (0.0 to 1.0)
        positional: false
    }
}
```

### Adjusting Category Volumes

Edit `src/AudioManager.js` in the constructor:

```javascript
this.categories = {
    ambience: { volume: 0.3, sounds: new Map() },  // Change these
    footsteps: { volume: 0.4, sounds: new Map() },
    combat: { volume: 0.5, sounds: new Map() },
    // ...
};
```

### Adding New Sounds

1. Add the sound file to `public/sounds/[category]/`
2. Add the configuration to `src/SoundConfig.js`
3. Update `src/main.js` to trigger the sound at the appropriate event

Example - adding a door open sound:

```javascript
// In SoundConfig.js
environment: {
    door_open: {
        files: ['sounds/environment/door_open.ogg'],
        loop: false,
        volume: 0.5,
        positional: true,
        cooldown: 200
    }
}

// In main.js (where door opens)
if (game.audioInitialized) {
    game.audio.play('environment', 'door_open', 200);
}
```

## Advanced Features

### Spatial Audio

The audio system supports 3D positioned sounds. Currently configured for:
- Combat hit sounds (play from enemy position)
- Enemy death sounds (play from enemy position)

To add more spatial sounds, set `positional: true` in SoundConfig.js.

### Audio Ducking

Temporarily reduce volume of background sounds when important sounds play:

```javascript
// Duck ambience by 50% when dialog plays
game.audio.duck(0.5, ['ui', 'combat']);  // Don't duck UI and combat

// Restore normal volume
game.audio.unduck();
```

### Fade In/Out

```javascript
// Fade in over 2 seconds
game.audio.fadeIn('music', 'ambient_track', 2000);

// Fade out over 3 seconds
game.audio.fadeOut('music', 'ambient_track', 3000);
```

## Troubleshooting

### No Sound Playing

1. Check browser console for errors
2. Ensure you clicked/pressed a key to enable audio
3. Check that sound files exist in `public/sounds/`
4. Verify file paths in `src/SoundConfig.js` match actual files
5. Check browser's audio is not muted

### Audio Not Initializing

The browser requires user interaction before playing audio. The system automatically initializes on:
- First keypress
- First click

You should see "Audio system ready" in the console when it works.

### Sound Files Not Loading

Check the console for "Could not load [filename]" warnings. This usually means:
- File doesn't exist at the specified path
- File format is not supported (use OGG or MP3)
- File path is incorrect in SoundConfig.js

### Performance Issues

If the game slows down with audio:
1. Reduce number of looping sounds
2. Lower audio quality/bitrate of files
3. Reduce volume instead of using too many layers
4. Check for too many positional sounds playing simultaneously

## File Format Recommendations

- **Format**: OGG Vorbis (best for web) or MP3
- **Sample Rate**: 44.1kHz
- **Bit Rate**: 128-192kbps (lower for ambience, higher for music)
- **Channels**: Mono for effects, Stereo for music/ambience
- **Looping**: Ensure ambient files loop seamlessly (no clicks/pops)

## Testing Without Sound Files

The game works perfectly without sound files! You'll see console warnings, but the game is fully playable. This lets you:
- Test the game logic first
- Add sounds incrementally
- Develop without worrying about audio initially

## Credits and Attribution

If you use CC-BY licensed sounds, create a `CREDITS.md` file listing:
- Sound name
- Author
- License
- Source URL

Example:
```markdown
# Audio Credits

## Ambience
- "Cave Ambience" by SoundArtist
  - License: CC-BY 3.0
  - Source: https://freesound.org/...
```

## Next Steps

1. **Priority 1**: Add core footstep and combat sounds
2. **Priority 2**: Add ambient atmosphere loops
3. **Priority 3**: Add UI feedback sounds
4. **Priority 4**: Add environmental sounds (torches, etc.)
5. **Optional**: Add low-volume atmospheric music

Enjoy your atmospheric dungeon crawler!
