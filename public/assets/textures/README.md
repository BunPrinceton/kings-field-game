# Texture Setup Guide

The texture system is ready to use. Download free CC0 textures and place them in the appropriate folders.

## Quick Start

### 1. Download Textures from Poly Haven

Visit https://polyhaven.com/textures and download these recommended textures at 2K resolution:

#### Walls
- **Stone Brick Wall 001**: https://polyhaven.com/a/stone_brick_wall_001
  - Download: Diffuse, Normal, Roughness, AO maps
  - Extract to: `walls/stone_brick/`
  - Rename files to: `diffuse.jpg`, `normal.jpg`, `roughness.jpg`, `ao.jpg`

#### Floors
- **Stone Floor** (any variant from Poly Haven)
  - Download: Diffuse, Normal, Roughness, AO maps
  - Extract to: `floors/stone_floor/`
  - Rename files to: `diffuse.jpg`, `normal.jpg`, `roughness.jpg`, `ao.jpg`

#### Ceilings
- **Rough Stone** (any dark variant)
  - Download: Diffuse, Normal, Roughness, AO maps
  - Extract to: `ceilings/rough_stone/`
  - Rename files to: `diffuse.jpg`, `normal.jpg`, `roughness.jpg`, `ao.jpg`

#### Props (Optional)
- **Weathered Wood Planks**
  - Extract to: `props/wood_weathered/`
- **Rusty Metal**
  - Extract to: `props/metal_rust/`

### 2. File Naming Convention

Each texture set should contain these files:
```
texture_name/
  ├── diffuse.jpg     (Base color - required)
  ├── normal.jpg      (Bump details - required)
  ├── roughness.jpg   (Surface shininess - optional)
  ├── ao.jpg          (Ambient occlusion - optional)
  └── displacement.jpg (Geometry displacement - optional)
```

### 3. Texture Settings

- **Resolution**: 1K-2K (1024x1024 to 2048x2048)
- **Format**: JPG for diffuse/AO, PNG for normal/roughness
- **Compression**: Medium quality (80-90%)

## Directory Structure

```
/assets/textures/
  ├── walls/
  │   └── stone_brick/
  │       ├── diffuse.jpg
  │       ├── normal.jpg
  │       ├── roughness.jpg
  │       └── ao.jpg
  ├── floors/
  │   └── stone_floor/
  │       ├── diffuse.jpg
  │       ├── normal.jpg
  │       ├── roughness.jpg
  │       └── ao.jpg
  ├── ceilings/
  │   └── rough_stone/
  │       ├── diffuse.jpg
  │       ├── normal.jpg
  │       ├── roughness.jpg
  │       └── ao.jpg
  └── props/
      ├── wood_weathered/
      │   └── [texture files]
      └── metal_rust/
          └── [texture files]
```

## Fallback Behavior

If texture files are not found, the game will automatically fall back to solid colors:
- Walls: Dark gray (0x3a3a3a)
- Floors: Darker gray (0x2a2a2a)
- Ceilings: Very dark gray (0x1a1a1a)

## Disable Textures

To disable texture loading entirely, modify `DungeonBuilder` initialization in `main.js`:

```javascript
game.dungeon.builder = new DungeonBuilder(game.scene, game.dungeon.data, {
    cellSize: 4,
    wallHeight: 3.5,
    useTextures: false  // Add this line
});
```

## Adding New Textures

1. Create a new folder in the appropriate category
2. Add texture files with correct naming
3. Update `TextureManager.js` to add new material presets if needed

## Resources

- Poly Haven: https://polyhaven.com/textures (CC0)
- ambientCG: https://ambientcg.com/ (CC0)
- CC0Textures: https://cc0textures.com/ (CC0)

See `TEXTURE_RESOURCES.md` in the project root for detailed recommendations.
