# Cleaning Props Asset Pack

Low-poly cleaning supplies and maintenance props for atmospheric dungeon decoration.

## Features

- **9 Procedural Models**: Automatically generated geometric models (no download required)
- **5 Optional GLB Models**: Higher-quality models from CC0/CC-BY sources
- **5 Prop Groups**: Pre-configured clusters for natural placement
- **Smart Decoration**: Context-aware room decoration system

## Current Status

All models are using **procedural fallbacks** (simple geometric shapes). The system is fully functional without downloading any external models.

## Optional: Download High-Quality Models

For better visual quality, you can manually download these CC0/CC-BY models:

### 1. Poly Pizza Models (CC0 / CC-BY 3.0)

Visit https://poly.pizza and search for:

- **Broom** by Poly by Google → Save as `models/broom_poly.glb`
- **Mop & Bucket** by J-Toastie → Save as `models/mop_bucket.glb`
- **Barrel** by Quaternius → Save as `models/barrel_quaternius.glb`
- **Barrel** by Kenney → Save as `models/barrel_kenney.glb`

**Download Instructions:**
1. Click on the model
2. Click "Download"
3. Select "GLB" format
4. Save to the `models/` folder with the filename above

### 2. Poly Haven Bucket (CC0)

Visit https://polyhaven.com/a/wooden_bucket_01

**Download Instructions:**
1. Click "Download"
2. Select "glTF" format, "2K" resolution
3. Extract the .gltf and textures
4. Convert to GLB using Blender or online converter
5. Save as `models/bucket.glb`

**Quick GLB Conversion (Blender):**
```
1. File → Import → glTF 2.0
2. Select wooden_bucket_01_2k.gltf
3. File → Export → glTF 2.0
4. Set format to "GLB"
5. Export as bucket.glb
```

### 3. Alternative: Quaternius/Kenney Direct Sites

- **Quaternius**: https://quaternius.com
- **Kenney**: https://kenney.nl/assets

Browse their collections for barrel, bucket, and other prop models.

## Procedural Models (Built-in)

The following models are procedurally generated and require no downloads:

- Broom (wooden handle + bristles)
- Mop (metal handle + cloth head)
- Bucket (tapered metal cylinder + handle)
- Barrel (large, wooden with metal bands)
- Barrel Small (smaller variant)
- Crate (wooden box)
- Sack (cloth bag)
- Brush (hand brush)
- Rag Pile (stacked cloths)

## Usage

### Basic Integration

```javascript
import { CleaningPropsDecorator } from './src/CleaningPropsDecorator.js';

const decorator = new CleaningPropsDecorator(scene, dungeonData, {
    cellSize: 4,
    propDensity: 0.25  // 0-1, how many rooms get props
});

// Load models (GLB or procedural fallbacks)
await decorator.loadModels();

// Decorate all rooms
decorator.decorateRooms();
```

### Prop Groups

Pre-configured groups for natural-looking clusters:

- **Janitor's Corner**: Broom + Bucket + Mop + Rags
- **Storage Pile**: 2-3 Barrels + Bucket + Crate
- **Lone Cleaner**: Single broom or mop leaning on wall
- **Barrel Cluster**: 2-4 barrels grouped together
- **Cleaning Station**: Full organized cleaning area

### Room Distribution

The decorator automatically places props based on room type:

- **Storage Rooms** (15% of standard rooms): 4-6 props, high density
- **Large Rooms** (>36 cells): 1-2 prop groups in corners (40% chance)
- **Medium Rooms** (16-36 cells): Single prop or small group (20% chance)
- **Small Rooms** (9-16 cells): Single prop (10% chance)
- **Hallways** (1-cell width): Bucket against wall (8% chance)
- **Safe Rooms**: Organized cleaning station
- **Hub Rooms**: Janitor's corner + barrel cluster
- **Entrance Rooms**: Minimal props

## Customization

### Adjust Prop Density

```javascript
const decorator = new CleaningPropsDecorator(scene, dungeonData, {
    propDensity: 0.5  // More props
});
```

### Place Individual Props

```javascript
const propsManager = decorator.getPropsManager();

propsManager.createProp(CleaningPropType.BROOM,
    { x: 10, y: 0, z: 5 },
    {
        rotation: Math.PI / 4,
        randomRotation: true
    }
);
```

### Place Custom Groups

```javascript
decorator.placeGroup(PropGroups.STORAGE_PILE, x, z);
```

## File Structure

```
public/assets/props/cleaning/
├── models/               (Place downloaded GLB files here)
│   ├── broom_poly.glb           (optional)
│   ├── mop_bucket.glb           (optional)
│   ├── bucket.glb               (optional)
│   ├── barrel_quaternius.glb    (optional)
│   └── barrel_kenney.glb        (optional)
├── manifest.json         (Model metadata)
└── README.md            (This file)

src/
├── CleaningPropsManager.js      (Model loading + procedural generation)
└── CleaningPropsDecorator.js    (Room decoration logic)
```

## Technical Details

### Model Loading

1. Attempts to load GLB files from `models/` folder
2. Falls back to procedural models if GLB not found
3. All procedural models are created on the fly
4. No external dependencies required for basic functionality

### Performance

- Procedural models: ~100-500 triangles each
- Low overhead, suitable for many instances
- Models are cloned from templates (efficient)

## Licenses

- **Procedural Models**: No license needed (generated code)
- **Poly Pizza Models**: CC0 or CC-BY 3.0 (attribution required for CC-BY)
- **Poly Haven Models**: CC0 (public domain)
- **Quaternius Models**: CC0 (public domain)
- **Kenney Models**: CC0 (public domain)

### CC-BY Attribution

If using CC-BY models, add to your credits:

```
"Broom" by Poly by Google, licensed under CC-BY 3.0
Models sourced from Poly Pizza (poly.pizza)
```

## Troubleshooting

**Q: Props aren't showing up**
- Check that `await decorator.loadModels()` is called before `decorateRooms()`
- Check browser console for loading errors
- Verify scene and dungeonData are valid

**Q: Want to disable procedural fallbacks?**
```javascript
const decorator = new CleaningPropsDecorator(scene, dungeonData, {
    useGLTF: true  // Only use GLB files, don't fallback
});
```

**Q: How do I remove all props?**
```javascript
decorator.dispose();
```

## Future Enhancements

- Torch sconces for walls
- Lanterns and candles
- Pottery and jars
- Tool racks
- Shelf systems
- Water effects for buckets
- Dust particle effects
