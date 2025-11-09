# Cleaning Props Visual Reference

## Procedural Models (Built-in)

All models are created using Three.js geometry primitives. No downloads required.

### Cleaning Tools

#### Broom
```
Height: 1.2m
Components:
  - Wooden handle (cylinder, 0.02m radius, brown)
  - Bristles (cone, 0.12m radius, tan)
Placement: Leaning against walls, corners
```

#### Mop
```
Height: 1.1m
Components:
  - Metal handle (cylinder, 0.02m radius, gray)
  - Cloth head (cylinder, 0.1-0.15m radius, beige)
Placement: With buckets, corners
```

#### Brush
```
Size: 0.15m × 0.08m
Components:
  - Wooden handle (box, brown)
  - Bristles (box, tan)
Placement: On floors, near buckets
```

#### Rag Pile
```
Size: ~0.2m × 0.15m
Components:
  - 3 stacked cloth pieces (boxes, beige/gray)
  - Randomly rotated for natural look
Placement: Corners, cleaning stations
```

### Containers

#### Bucket
```
Height: 0.25m
Radius: 0.12-0.15m (tapered)
Components:
  - Metal body (tapered cylinder, gray)
  - Wire handle (ellipse curve)
Placement: Floors, against walls, with mops
```

#### Barrel (Large)
```
Height: 0.6m
Radius: 0.4m
Components:
  - Wooden body (cylinder, brown)
  - 3 metal bands (cylinders, dark gray)
Placement: Corners, storage rooms, clustered
```

#### Barrel (Small)
```
Height: 0.4m
Radius: 0.3m
Components:
  - Wooden body (cylinder, brown)
  - 3 metal bands (cylinders, dark gray)
Placement: Mixed with large barrels, hallways
```

#### Crate
```
Size: 0.4m × 0.3m × 0.4m
Components:
  - Wooden box (cube, brown)
Placement: Storage rooms, stacked
```

#### Sack
```
Size: ~0.2m diameter
Components:
  - Cloth hemisphere (sphere, beige/tan)
Placement: Floors, storage piles
```

---

## Prop Groups

### Janitor's Corner
```
Layout:
  Broom ----+
            |
  Mop ------+--- (corner)
            |
  Bucket ---+
  Rags -----+

Size: ~0.8m × 0.8m
Props: 4
Use: Safe rooms, hub rooms
```

### Storage Pile
```
Layout:
  [Barrel] [Barrel]
     [Bucket]
  [Crate]  [Barrel]

Size: ~1.5m × 1.5m
Props: 5-6
Use: Storage rooms, treasure rooms
```

### Lone Cleaner
```
Layout:
    |  (broom/mop leaning)
   /
  / (wall)

Size: Single prop
Props: 1
Use: Small rooms, hallways
```

### Barrel Cluster
```
Layout:
  [B] [B]
  [B] [B]

Size: ~1m × 1m
Props: 2-4
Use: Storage rooms, large rooms
B = Barrel (mixed large/small)
```

### Cleaning Station
```
Layout:
  | | (broom + mop)

  [B] [B] [brush]

  [rags]

Size: ~1.2m × 1.2m
Props: 6
Use: Safe rooms, organized areas
B = Bucket
```

---

## Color Palette

### Wood
- **Handles**: #8B4513 (saddle brown)
- **Barrels**: #8B7355 (burly wood)
- **Crates**: #8B7355 (burly wood)

### Metal
- **Mop handle**: #696969 (dim gray)
- **Bucket**: #708090 (slate gray)
- **Barrel bands**: #404040 (dark gray)

### Cloth/Bristles
- **Bristles**: #D2B48C (tan)
- **Mop head**: #F5F5DC (beige)
- **Rags**: #F5F5DC, #E0E0E0, #D3D3D3 (beige/gray mix)
- **Sacks**: #BDB76B (dark khaki)

---

## Scale Reference

```
Human (reference): ~1.8m tall

Broom:     1.2m  ||||||||||||
Mop:       1.1m  |||||||||||
Barrel L:  0.6m  ||||||
Barrel S:  0.4m  ||||
Bucket:    0.25m ||
Crate:     0.3m  |||
Brush:     0.08m |
Rags:      0.05m (flat)
Sack:      0.2m  ||
```

---

## Room Placement Examples

### Small Room (3×3 cells)
```
┌─────────┐
│         │
│    [B]  │  ← Single bucket in corner
│         │
└─────────┘

10% placement chance
```

### Medium Room (5×5 cells)
```
┌─────────────┐
│             │
│  |          │  ← Broom leaning in corner
│  /          │
│             │
│             │
└─────────────┘

20% placement chance
```

### Large Room (8×8 cells)
```
┌───────────────────┐
│  |                │
│  / [B]            │  ← Janitor's corner
│  [rags]           │
│                   │
│                   │
│            [B][B] │  ← Barrel cluster
│            [B]    │
└───────────────────┘

40% placement chance
```

### Storage Room
```
┌─────────────────────┐
│ [B][B]      |  [C]  │
│ [B]  [sack] /  [C]  │
│             [rags]  │
│                     │
│  [crate]    [B][B]  │
│  [bucket]   [B]     │
└─────────────────────┘

High density (4-6 groups)
15% of standard rooms
```

### Hallway (1×10 cells)
```
┌─┐
│ │
│ │
│[B]│  ← Bucket against wall
│ │
│ │
│ │
│ │
│ │
│ │
└─┘

8% placement chance
```

---

## Rendering Notes

### Materials
- **MeshStandardMaterial** used for all props
- **Roughness**: 0.6-0.95 (most are matte/worn)
- **Metalness**: 0.1-0.6 (only metal parts)
- No emissive (props don't glow)

### Lighting Interaction
- Props cast shadows (if shadow mapping enabled)
- Props receive shadows from walls/furniture
- Props react to ambient/directional lighting
- Suitable for dark dungeon atmosphere

### Performance
- **Triangle count**: 100-500 per prop
- **Draw calls**: 1 per instance (can be batched)
- **Texture memory**: 0 (procedural colors only)
- **Recommended max**: 100+ props per scene

---

## ASCII Art Examples

### Broom
```
    |
    |
    |
   /|\
  / | \
```

### Bucket
```
  ___
 /   \
|     |
|     |
 \___/
```

### Barrel
```
  _____
 /=====\
|       |
|-------|
|       |
|-------|
|       |
 \_____/
```

### Crate
```
 _______
|       |
|       |
|_______|
```

### Prop Group (Janitor's Corner)
```
  |  /     ← Broom + Mop
  | /
  |/

 _____     ← Bucket
/     \
\_____/

[rags]     ← Rag pile
```
