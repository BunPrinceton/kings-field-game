# Sound Assets Directory

This directory contains all audio files for the King's Field game.

## Directory Structure

```
sounds/
├── ambience/      - Background ambient loops
├── footsteps/     - Footstep sound variations
├── combat/        - Combat sounds (swings, hits, death)
├── environment/   - Environmental sounds (torches, distant sounds)
├── ui/            - UI interaction sounds
└── music/         - Background music (optional)
```

## Required Sound Files

See `src/SoundConfig.js` for the complete list of required files.

### Quick Reference

**Ambience** (looping OGG files):
- `dungeon_ambient.ogg` - Base dungeon atmosphere
- `water_drips.ogg` - Occasional water drips
- `wind_echo.ogg` - Subtle wind/echo effect

**Footsteps** (OGG files):
- `stone_step_1.ogg` through `stone_step_4.ogg` - Stone footstep variations

**Combat** (OGG files):
- `sword_swing_1.ogg` through `sword_swing_3.ogg` - Sword swing variations
- `sword_hit_1.ogg` through `sword_hit_2.ogg` - Hit impact sounds
- `enemy_death_1.ogg` through `enemy_death_2.ogg` - Enemy death sounds
- `player_hurt.ogg` - Player damage sound

**Environment** (OGG files):
- `torch_crackle.ogg` - Looping torch fire sound
- `distant_groan_1.ogg` through `distant_groan_2.ogg` - Atmospheric distant sounds

**UI** (OGG files):
- `menu_click.ogg` - Menu/UI interaction sound
- `attack_cooldown.ogg` - Attack on cooldown sound

**Music** (optional, OGG file):
- `dark_ambient.ogg` - Low-volume atmospheric music track

## Finding Free Sounds

See `AUDIO_RESOURCES.md` in the root directory for detailed information on where to find free, high-quality game audio.

### Quick Sources:
1. **Freesound.org** - Filter by CC0 license
2. **OpenGameArt.org** - Game-focused sounds
3. **Sonniss GDC Bundles** - Professional quality game audio

## File Format

- **Format**: OGG Vorbis (preferred for web) or MP3
- **Sample Rate**: 44.1kHz
- **Bit Rate**: 128-192kbps
- **Looping**: Ambient sounds should loop seamlessly

## Testing Without Sound Files

The game will still run without sound files. You can test the audio system with placeholder sounds by checking the browser console for loading errors and using the audio debug panel.

## License Compliance

If using CC-BY licensed sounds, add attributions to the CREDITS.md file in the root directory.

Example:
```
"Sound Name" by Author Name
Licensed under CC-BY 3.0
Source: https://freesound.org/...
```
