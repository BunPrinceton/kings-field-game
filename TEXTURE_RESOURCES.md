# Free Texture Resources for Kings Field Dungeon

## Best CC0 Sources (No Attribution Required)

### 1. Poly Haven (polyhaven.com)
**Best for:** High-quality PBR dungeon textures
- **URL:** https://polyhaven.com/textures
- **License:** CC0 (Public Domain)
- **Format:** PBR sets (Diffuse, Normal, Roughness, AO, Displacement)
- **Resolutions:** Up to 8K (use 2K for performance)

**Recommended Textures:**
- Stone Brick Wall 001: https://polyhaven.com/a/stone_brick_wall_001 (100k+ downloads, dungeon-tagged)
- Browse brick category: https://polyhaven.com/textures/brick
- Browse stone category: https://polyhaven.com/textures/stone

### 2. ambientCG (ambientcg.com)
**Best for:** Massive variety (2000+ PBR materials)
- **URL:** https://ambientcg.com/
- **License:** CC0 (Public Domain)
- **Format:** Full PBR sets
- **Categories:** Tiles, Bricks, Stone, Wood, Metal, Ground

**Search for:**
- Medieval stone floors
- Castle walls
- Worn bricks
- Cobblestone

### 3. CC0Textures.com
**Best for:** Quick downloads, no registration
- **URL:** https://cc0textures.com/
- **License:** CC0
- **Format:** PBR materials
- **Feature:** Multiple resolutions available

### 4. OpenGameArt.org
**Best for:** Game-ready assets and 3D models
- **URL:** https://opengameart.org/
- **License:** Mixed (filter by CC0)
- **Content:** Textures, sprites, 3D models, sounds
- **Note:** Always verify individual asset licenses

## Recommended Textures for Kings Field Aesthetic

### Walls (Dark, Ancient Stone)
1. **Stone Brick Wall 001** (Poly Haven) - Main dungeon walls
2. **Rough Stone** (ambientCG) - Natural cave sections
3. **Medieval Brick** (CC0Textures) - Constructed areas

### Floors (Worn, Lived-in)
1. **Stone Floor** variations (Poly Haven) - Main walkways
2. **Cobblestone** (ambientCG) - Room centers
3. **Dirt Ground** (CC0Textures) - Abandoned areas
4. **Mossy Stone** - Damp/water areas

### Ceilings
1. **Rough Stone** (darker variants) - Cave-like ceilings
2. **Stone Vaulted** - Constructed room ceilings

### Decoration Materials
1. **Wood Planks** (aged/weathered) - Crates, barrels, doors
2. **Metal Rusty** - Braziers, chains, fixtures
3. **Stone Carved** - Columns, statues, altars

## PBR Texture Maps Needed

For Three.js MeshStandardMaterial, download these maps:

1. **map** (Diffuse/Albedo) - Base color
2. **normalMap** - Surface detail bumps
3. **roughnessMap** - Shininess variation
4. **aoMap** (Ambient Occlusion) - Shadow detail in crevices
5. **displacementMap** (optional) - Actual geometry displacement

## Texture Optimization Guidelines

### File Sizes
- **Walls/Floors:** 1K-2K resolution (1024x1024 to 2048x2048)
- **Small props:** 512x512 or 1K
- **Detail textures:** 1K maximum

### Performance Tips
1. Use texture atlasing for small decorations
2. Compress textures (JPG for diffuse, PNG for normal/roughness)
3. Reuse textures across similar surfaces
4. Use tiling textures for large surfaces
5. Consider texture arrays for variations

### Dark Atmosphere Considerations
- Choose textures that work well in low light
- Prioritize normal maps (they show up well in dim lighting)
- Use roughness variations for visual interest
- Avoid overly bright/saturated diffuse colors

## Download Checklist

- [ ] Wall texture set (stone brick) - 2K
- [ ] Floor texture set (worn stone) - 2K
- [ ] Ceiling texture (rough stone) - 1K
- [ ] Wood planks texture (weathered) - 1K
- [ ] Metal rust texture - 1K
- [ ] Dirt ground texture - 1K
- [ ] Moss overlay texture - 512px

## Next Steps

1. Download recommended textures from Poly Haven
2. Organize in `/assets/textures/` folder:
   ```
   /assets/textures/
     /walls/
       stone_brick/
         diffuse.jpg
         normal.jpg
         roughness.jpg
         ao.jpg
     /floors/
     /ceilings/
     /props/
   ```
3. Implement TextureManager class
4. Integrate with DungeonBuilder.js
