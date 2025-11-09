# Manual Download Instructions for Cleaning Props

The cleaning props system works perfectly with **procedural fallback models** (built-in geometric shapes). However, for higher visual quality, you can manually download these CC0/CC-BY licensed models.

## Status: All Models Currently Using Procedural Fallbacks

The system is **fully functional** without any downloads. Follow these instructions only if you want higher-quality models.

---

## Download Instructions

### 1. Poly Pizza Models

Poly Pizza (https://poly.pizza) is a free 3D model repository aggregating Google Poly and other sources.

#### Model 1: Broom by Poly by Google

1. Visit https://poly.pizza
2. Search for "**broom**"
3. Find "**Broom**" by **Poly by Google** (CC-BY 3.0)
4. Click on the model
5. Click the **Download** button
6. Select **GLB** format
7. Save as: `models/broom_poly.glb`

**Alternative Search**: Try "broom google" or browse recent uploads

#### Model 2: Mop & Bucket by J-Toastie

1. Visit https://poly.pizza
2. Search for "**mop bucket**"
3. Find "**Mop & Bucket**" by **J-Toastie**
4. Click on the model
5. Download as **GLB**
6. Save as: `models/mop_bucket.glb`

#### Model 3: Barrel by Quaternius

1. Visit https://poly.pizza
2. Search for "**barrel quaternius**"
3. Find a barrel model by **Quaternius** (CC0)
   - Look for one with ~1,000-2,000 triangles
   - Recommended: Standard wooden barrel
4. Download as **GLB**
5. Save as: `models/barrel_quaternius.glb`

**Alternative**: Visit https://quaternius.com directly and browse their free asset packs

#### Model 4: Barrel by Kenney

1. Visit https://poly.pizza
2. Search for "**barrel kenney**"
3. Find "**Barrel**" or "**Barrel Open**" by **Kenney** (CC0)
   - Look for the smaller barrel variant
4. Download as **GLB**
5. Save as: `models/barrel_kenney.glb`

**Alternative**: Visit https://kenney.nl/assets and download from their 3D asset packs

---

### 2. Poly Haven Bucket (High Quality)

Poly Haven offers high-quality, photorealistic models with PBR textures.

#### Wooden Bucket 01

1. Visit https://polyhaven.com/a/wooden_bucket_01
2. Click **Download**
3. Select format: **glTF**
4. Select resolution: **2K** (good balance of quality/size)
5. Download the ZIP file
6. Extract the contents

**Converting glTF to GLB:**

You'll receive separate files (.gltf + textures + .bin). Convert to single GLB file:

**Option A: Using Blender (Free)**
1. Open Blender
2. File → Import → glTF 2.0
3. Select `wooden_bucket_01_2k.gltf`
4. File → Export → glTF 2.0
5. In export settings:
   - Format: **GLB** (not glTF Separate)
   - Include: **All** (textures embedded)
6. Save as: `bucket.glb`
7. Copy to `models/bucket.glb`

**Option B: Using Online Converter**
1. Visit https://products.aspose.app/3d/conversion/gltf-to-glb
2. Upload `wooden_bucket_01_2k.gltf` and associated files
3. Convert to GLB
4. Download and save as `models/bucket.glb`

**Option C: Use glTF-Transform CLI (Node.js)**
```bash
npm install -g @gltf-transform/cli
gltf-transform merge wooden_bucket_01_2k.gltf bucket.glb
```

---

### 3. Alternative Sources

If Poly Pizza links aren't working, try these direct sources:

#### Quaternius (quaternius.com)

1. Visit https://quaternius.com
2. Browse **Free Game Assets**
3. Look for packs containing:
   - Ultimate Modular Pack
   - Props Pack
   - Medieval Pack
4. Download pack (usually includes .blend, .fbx, .obj, .gltf)
5. Extract GLTF or GLB files
6. Rename appropriately

**Specific Packs to Check:**
- Ultimate Props Pack
- Ultimate Modular Pack
- Medieval Kit

#### Kenney (kenney.nl)

1. Visit https://kenney.nl/assets
2. Filter by **3D**
3. Look for:
   - Furniture Kit
   - Platformer Kit
   - Medieval Kit
4. Download (usually includes .obj, .fbx, .gltf)
5. Convert to GLB if needed (use Blender)

---

## File Structure After Download

Your directory should look like:

```
public/assets/props/cleaning/
├── models/
│   ├── broom_poly.glb          ← Downloaded
│   ├── mop_bucket.glb          ← Downloaded
│   ├── bucket.glb              ← Downloaded or converted
│   ├── barrel_quaternius.glb   ← Downloaded
│   └── barrel_kenney.glb       ← Downloaded
├── manifest.json
├── README.md
└── MANUAL_DOWNLOAD.md (this file)
```

---

## Verification

After downloading, test that models load:

```javascript
import { CleaningPropsManager } from './src/CleaningPropsManager.js';

const propsManager = new CleaningPropsManager(scene);
await propsManager.loadModels();

// Check browser console for:
// "Loaded GLTF model: broom" ← Success!
// "Failed to load GLTF for broom, will use procedural model" ← Fallback
```

---

## Troubleshooting

### Problem: "404 Not Found" when loading GLB

**Cause**: File path incorrect or file not in `models/` folder

**Solution**:
- Check file is in `public/assets/props/cleaning/models/`
- Check exact filename matches manifest.json
- Check file extension is `.glb` (not `.gltf` or `.glb.zip`)

### Problem: Model loads but appears broken/black

**Cause**: Missing textures or incorrect GLB export

**Solution**:
- Re-export from Blender ensuring "Include → All" is checked
- For Poly Haven: Make sure all texture files were included in conversion
- Try using procedural fallback (delete .glb file temporarily)

### Problem: Can't find models on Poly Pizza

**Cause**: Poly Pizza search/availability issues

**Solution**:
1. Try alternative search terms
2. Browse by creator (Quaternius, Kenney, etc.)
3. Go directly to creator's website
4. Use procedural fallbacks (they work great!)

### Problem: Don't want to download models

**Solution**:
- Do nothing! Procedural models are generated automatically
- The system is designed to work without any external models
- Procedural models are low-poly, performant, and stylistically consistent

---

## License Compliance

### CC0 Models (Public Domain)

Models from Quaternius, Kenney, and Poly Haven are CC0. No attribution required, but it's nice to credit:

```
3D Models by Quaternius (quaternius.com)
3D Models by Kenney (kenney.nl)
3D Models by Poly Haven (polyhaven.com)
```

### CC-BY 3.0 Models (Attribution Required)

Models from Poly by Google require attribution:

```
"Broom" by Poly by Google, licensed under CC-BY 3.0
Source: Poly Pizza (poly.pizza)
```

Add to your game's credits or README.

---

## Still Can't Download?

If you're unable to download models:

1. **Use procedural models**: They're built-in and require no downloads
2. **Request help**: Open an issue with details about what's blocking downloads
3. **Alternative models**: Search other CC0 repositories:
   - Sketchfab (filter by CC0/downloadable)
   - CGTrader Free section
   - OpenGameArt.org
   - Itch.io (3D assets, free)

---

## Performance Note

**Procedural models** (0 downloads):
- 100-500 triangles each
- Instant loading
- Low memory footprint
- Great for lots of instances

**Downloaded GLB models**:
- 500-5,000 triangles each
- Require network/disk loading
- Higher quality appearance
- Better for hero props or close-ups

For a dungeon with 50+ props, procedural models are often the better choice for performance.

---

## Summary

| Model | Source | Download Difficulty | Status |
|-------|--------|-------------------|---------|
| Broom | Poly Pizza | Easy | Optional |
| Mop & Bucket | Poly Pizza | Easy | Optional |
| Bucket | Poly Haven | Medium (requires conversion) | Optional |
| Barrel (Large) | Poly Pizza / Quaternius | Easy | Optional |
| Barrel (Small) | Poly Pizza / Kenney | Easy | Optional |
| **All Others** | **Procedural** | **None (automatic)** | **Working** |

**Recommendation**: Start with procedural models. Download GLBs later if you want higher visual quality.
