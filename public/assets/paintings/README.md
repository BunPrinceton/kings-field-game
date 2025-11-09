# Paintings Collection

This directory contains a curated collection of fantasy artwork for the Kings Field game project.

## Directory Structure

```
paintings/
├── portraits/       - Character portraits (82 images, 200x200)
├── landscapes/      - Environmental scenes and backgrounds (60 images, various sizes)
├── creatures/       - Bestiary art (empty - ready for expansion)
├── abstract/        - Pixel art and misc (empty - ready for expansion)
├── downloads/       - Original downloaded archives
├── manifest.json    - Complete metadata for all paintings
└── README.md        - This file
```

## Collection Summary

- **Total Paintings**: 142
- **Portraits**: 82 (200x200 PNG)
- **Landscapes**: 60 (various formats: JPG, PNG, GIF)

## Sources and Licenses

All artwork in this collection is available under **CC0 (Creative Commons Zero)** or similar public domain licenses, making them freely usable for commercial and non-commercial projects.

### 1. 30 Medieval Paintings Pack
- **Source**: [OpenGameArt.org - 30 Public Domain Paintings](https://opengameart.org/content/30-public-domain-paintings)
- **File**: `30-paintings.zip` (9.1 MB)
- **Format**: JPG, 512x512
- **Count**: 30 paintings
- **License**: CC0 / Public Domain
- **Description**: Medieval and Renaissance paintings suitable for fantasy game environments
- **Location**: `landscapes/painting-*.jpg`

### 2. PS1 RPG Backgrounds (20 pack)
- **Source**: [OpenGameArt.org - PS1 Pre-rendered Backgrounds](https://opengameart.org/content/ps1-pre-rendered-backgrounds)
- **File**: `ps1_pre_rendered_backgrounds.zip` (6.7 MB)
- **Format**: PNG
- **Count**: 28 images
- **License**: CC0
- **Description**: Final Fantasy Tactics-style pre-rendered backgrounds with fantasy ruins, mountains, and dungeons
- **Location**: `landscapes/dragon*.png`, `landscapes/mountain*.png`

### 3. Public Domain Portraits (200x200)
- **Source**: [OpenGameArt.org - PD 200x200 Portraits](https://opengameart.org/content/pd-200x200-portraits)
- **File**: `pd-portraits-200x200.7z` (6.6 MB)
- **Format**: PNG, 200x200
- **Count**: 82 portraits
- **License**: CC0 / Public Domain
- **Description**: Classical portraits from famous painters, perfect for NPC and character portraits
- **Artists Include**: Adelaide Hanscom, Alessandro Allori, Alexandre Cabanel, Alexei Harlamov, and many more
- **Location**: `portraits/*.png`

### 4. Fantasy RPG Background
- **Source**: [OpenGameArt.org](https://opengameart.org/sites/default/files/rpg_background.png)
- **File**: `rpg_background.png` (3.4 MB)
- **Format**: PNG
- **License**: CC0
- **Location**: `landscapes/rpg_background.png`

### 5. Castle in the Dark
- **Source**: [OpenGameArt.org](https://opengameart.org/sites/default/files/castleinthedark.gif)
- **File**: `castleinthedark.gif` (24 KB)
- **Format**: GIF
- **License**: CC0
- **Location**: `landscapes/castleinthedark.gif`

## Usage

### Loading the Manifest

```javascript
// Load the complete painting collection
const paintingsManifest = await fetch('/assets/paintings/manifest.json').then(r => r.json());

// Get all portraits
const portraits = paintingsManifest.paintings.filter(p => p.category === 'portrait');

// Get all landscapes
const landscapes = paintingsManifest.paintings.filter(p => p.category === 'landscape');

// Get paintings by style
const ps1Backgrounds = paintingsManifest.paintings.filter(p => p.style === 'ps1_rpg');
const medievalPaintings = paintingsManifest.paintings.filter(p => p.style === 'medieval');
```

### Loading Individual Images

```javascript
// Load a specific portrait
const portraitPath = '/assets/paintings/portraits/adelaide_hanscom1.png';

// Load a specific landscape
const landscapePath = '/assets/paintings/landscapes/painting-01.jpg';
```

## Image Specifications

### Portraits
- **Dimensions**: 200x200 pixels
- **Format**: PNG with transparency support
- **Use Cases**:
  - NPC dialogue portraits
  - Character selection screens
  - Inventory avatars
  - Quest giver portraits

### Landscapes
- **Dimensions**: Various (ranging from 512x512 to 1920x1080)
- **Formats**: JPG, PNG, GIF
- **Use Cases**:
  - Background scenes
  - Loading screens
  - Environmental art
  - Dungeon/castle decorations
  - In-game paintings on walls

## Future Expansion

The following directories are prepared for future additions:

- **creatures/** - For bestiary artwork, monster portraits, and creature designs
- **abstract/** - For pixel art, abstract designs, and miscellaneous decorative elements

## License Notice

All images in this collection are either in the public domain or licensed under CC0 (Creative Commons Zero), which means:

- No attribution required (though appreciated)
- Free for commercial and non-commercial use
- Can be modified and redistributed
- No warranty provided

For specific artist attributions, see the `.license` files included with the public domain portraits in the `downloads/pd-portraits/` directory.

## Attribution (Optional)

While not required, if you wish to credit the sources:

```
Art assets from:
- OpenGameArt.org - 30 Public Domain Paintings
- OpenGameArt.org - PS1 Pre-rendered Backgrounds
- OpenGameArt.org - Public Domain Portraits Collection
All assets licensed under CC0/Public Domain
```

## Technical Notes

- All images have been verified for integrity
- Total collection size: ~25 MB
- Manifest file includes dimensions for all images
- Images maintain their original quality and resolution
- No watermarks or restrictions

## Download Information

**Download Date**: November 9, 2025
**Downloaded By**: Automated script
**Verification**: All checksums verified, no corrupted files detected

---

For questions or additions to this collection, refer to the original sources on OpenGameArt.org.
