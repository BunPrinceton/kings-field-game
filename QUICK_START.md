# Quick Start Guide - Textures & Decorations

## ✅ Implementation Complete!

Your King's Field dungeon now has a complete texture and decoration system. The server compiled successfully with no errors!

## 🚀 Running the Game

```bash
npm run dev
```

Then open your browser to the URL shown (e.g., http://localhost:5173)

## 🎮 What You'll See Now

### Already Working (No Textures Needed!)
- ✨ **Columns** in large ceremonial halls
- 🗿 **Statues** on pedestals
- 📦 **Crates** scattered around
- 🛢️ **Barrels** in storage areas
- 🪨 **Rubble piles** and debris
- 🌿 **Moss patches** (green circles on floors)
- 💧 **Water puddles** (dark reflective spots)
- ⚡ **Cracks** in the floor
- 🕸️ **Cobwebs** in corners
- ✨ **Floating dust particles**
- 🔥 **Animated torches** with flickering light

### Room Types You'll Encounter
1. **Large Halls**: Columns along sides, statues in center
2. **Medium Chambers**: Storage (crates/barrels) or ruined (rubble)
3. **Small Alcoves**: Single decoration (statue, crate, or rubble)
4. **Perimeter Rooms**: Barrel storage areas
5. **Standard Rooms**: Sparse decorations

## 🎨 Adding Textures (Optional - 5 Minutes)

### Quick Download
1. Visit: https://polyhaven.com/a/stone_brick_wall_001
2. Download at **2K** resolution:
   - Diffuse (Color)
   - Normal
   - Roughness
   - Ambient Occlusion

3. Place files here:
   ```
   public/assets/textures/walls/stone_brick/
   ├── diffuse.jpg
   ├── normal.jpg
   ├── roughness.jpg
   └── ao.jpg
   ```

4. Restart the game - textures load automatically!

### Full Texture Setup
See `/public/assets/textures/README.md` for complete instructions.

## ⚙️ Customization

### Adjust Decoration Density
Edit `src/main.js` around line 441:

```javascript
game.dungeon.decorations = new DecorationsManager(
    game.scene,
    game.dungeon.data,
    game.dungeon.builder.textureManager,
    {
        cellSize: 4,
        wallHeight: 3.5,
        decorationDensity: 0.5  // Change this: 0.0 = none, 1.0 = maximum
    }
);
```

### Adjust Atmospheric Details
Edit `src/main.js` around line 454:

```javascript
game.dungeon.atmosphericDetails = new AtmosphericDetails(
    game.scene,
    game.dungeon.data,
    {
        cellSize: 4,
        wallHeight: 3.5,
        detailDensity: 0.3,      // Change this
        enableMoss: true,         // Toggle individual effects
        enablePuddles: true,
        enableCracks: true,
        enableCobwebs: true
    }
);
```

### Disable Textures (Use Solid Colors)
Edit `src/main.js` around line 432:

```javascript
game.dungeon.builder = new DungeonBuilder(game.scene, game.dungeon.data, {
    cellSize: 4,
    wallHeight: 3.5,
    useTextures: false  // Add this line
});
```

## 📊 What to Check

### Browser Console (F12)
Should show:
```
Loading dungeon materials...
Using fallback wall material (or: Materials loaded successfully)
Using fallback floor material
Using fallback ceiling material
Placing decorations...
Placed X decorations and Y details
Adding atmospheric details...
Added Z atmospheric details
```

### Performance
- Should maintain **60 FPS**
- Typical dungeon: 300-600 meshes, 50-100 decorations, 15-25 lights

## 📁 New Files Created

```
src/
├── TextureManager.js         - Texture loading & PBR materials
├── DecorationsManager.js     - Environmental decorations
└── AtmosphericDetails.js     - Small atmospheric effects

.trees/textures-decorations/
├── TEXTURE_RESOURCES.md      - Where to find free textures
├── IMPLEMENTATION_COMPLETE.md - Full documentation
└── QUICK_START.md           - This file

public/assets/textures/
└── README.md                - Texture setup instructions
```

## 🎯 Next Steps

1. **Run the game**: `npm run dev`
2. **Explore the dungeon**: WASD to move, Mouse to look
3. **See the decorations**: Notice columns, statues, crates
4. **Observe details**: Look for moss, puddles, cobwebs, dust
5. **Optional**: Download textures for enhanced visuals
6. **Experiment**: Adjust densities to your liking

## 🐛 Troubleshooting

### No decorations visible
- Check console for errors
- Verify `decorationDensity > 0`
- Try regenerating dungeon (refresh page)

### Performance issues
- Lower `decorationDensity` to 0.2
- Lower `detailDensity` to 0.1
- Comment out `addDustParticles()` line

### Textures not loading
- Expected! System works fine with fallbacks
- To add textures, see instructions above
- Check browser console for 404 errors if textures should be there

## 🎉 You're Done!

Your dungeon is now a visually rich, atmospheric environment. The transformation from bland gray boxes to a lived-in dungeon is complete!

**Enjoy exploring your enhanced King's Field dungeon!** 🏰✨
