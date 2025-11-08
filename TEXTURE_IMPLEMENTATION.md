# Texture Implementation Guide

## Current State

**Status**: Textures are currently DISABLED to avoid WebGL MAX_TEXTURE_IMAGE_UNITS limit (16 textures max).

The game currently uses simple color-based materials without any texture maps. This approach:
- ✅ Avoids WebGL shader errors
- ✅ Allows decorations and atmospheric details to work
- ✅ Maintains good performance
- ❌ Less visual detail than PBR textures would provide

## WebGL Texture Limit Issue

WebGL has a limit of 16 texture image units (`MAX_TEXTURE_IMAGE_UNITS`). The previous implementation used PBR materials with up to 5 textures each:
- Diffuse/Albedo map
- Normal map
- Roughness map
- Ambient Occlusion (AO) map
- Displacement/Height map

With multiple objects in the scene (walls, floors, ceilings, decorations, atmospheric details), we would quickly exceed this limit, causing shader errors:
```
THREE.WebGLProgram: Shader Error 0 - VALIDATE_STATUS false
Program Info Log: FRAGMENT shader texture image units count exceeds MAX_TEXTURE_IMAGE_UNITS(16)
```

## Future Implementation Options

### Option 1: Texture Atlas (Recommended)
Create a single large texture atlas that combines multiple textures into one image:
- All wall textures in one atlas
- All floor textures in one atlas
- All prop textures in one atlas
- Use UV offset/scaling to select the correct sub-texture
- Reduces texture units from N×5 to ~3-5 total

### Option 2: Simplified Materials
Use only 1-2 textures per material instead of full PBR:
- Diffuse map only (most important for visual detail)
- Optional: Normal map for depth
- Skip roughness, AO, and displacement maps
- This reduces texture usage by 60-80%

### Option 3: Texture Sharing
Share textures between similar objects:
- All stone walls use the same material instance
- All wooden objects share one wood material
- This is already implemented via material caching

## Expected Texture Directory Structure

When textures are re-enabled, they should be placed in:

```
/public/assets/textures/
├── walls/
│   ├── stone_brick/
│   │   ├── diffuse.jpg
│   │   ├── normal.jpg
│   │   ├── roughness.jpg
│   │   ├── ao.jpg
│   │   └── displacement.jpg
│   └── rough_stone/
│       └── ...
├── floors/
│   ├── stone_floor/
│   │   └── ...
│   └── wood_planks/
│       └── ...
├── ceilings/
│   ├── rough_stone/
│   │   └── ...
│   └── ...
├── props/
│   ├── wood_weathered/
│   │   └── ...
│   ├── wood_planks/
│   │   └── ...
│   ├── metal_rust/
│   │   └── ...
│   └── metal_iron/
│       └── ...
```

## Re-enabling Textures

When ready to add textures back:

1. **Update TextureManager.js** - Remove the fallback-only approach in material creation methods
2. **Implement texture atlas** - Combine textures to reduce texture units
3. **Test WebGL limits** - Monitor the browser console for shader errors
4. **Update main.js** - Set `useTextures: true` in DungeonBuilder config
5. **Add texture files** - Place actual texture images in the directory structure above

## Current Material Colors

The fallback materials use these colors:
- Walls: `0x3a3a3a` (dark gray)
- Floors: `0x2a2a2a` (darker gray)
- Ceilings: `0x1a1a1a` (very dark gray)
- Wood (aged): `0x4a3020` (brown)
- Wood (fresh): `0x6a4a2a` (lighter brown)
- Metal (rusty): `0x6a5a4a` (rust brown)
- Metal (clean): `0x8a8a8a` (light gray)
- Stone: `0x4a4a4a` (medium gray)
- Columns: `0x5a5a5a` (lighter gray)

These colors work well with the atmospheric lighting system and provide good contrast between different surface types.

## Performance Considerations

Current settings for optimal performance:
- `decorationDensity: 0.2` (20% chance of decorations in rooms)
- `detailDensity: 0.15` (15% chance of atmospheric details per cell)

These can be adjusted in `main.js` if more or fewer decorations are desired.
