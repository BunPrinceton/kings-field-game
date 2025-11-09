import * as THREE from 'three';

/**
 * TapestryDecorator - Wall hanging system for medieval tapestries and banners
 * Places heraldic tapestries on dungeon walls with procedural generation
 */
export class TapestryDecorator {
  constructor(scene) {
    this.scene = scene;
    this.tapestries = [];
    this.manifest = null;
    this.heraldicsLoaded = new Map();
    this.fabricsLoaded = new Map();
    this.textureLoader = new THREE.TextureLoader();
  }

  /**
   * Load tapestry assets from manifest
   */
  async loadAssets() {
    try {
      const response = await fetch('/assets/tapestries/manifest.json');
      this.manifest = await response.json();

      // Preload heraldic designs
      for (const heraldic of this.manifest.heraldics) {
        try {
          const texture = await this.loadSVGTexture(heraldic.path);
          this.heraldicsLoaded.set(heraldic.id, {
            texture,
            theme: heraldic.theme,
            colors: heraldic.colors
          });
        } catch (error) {
          console.warn(`Failed to load heraldic ${heraldic.id}:`, error);
        }
      }

      // Preload fabric textures
      for (const fabric of this.manifest.fabrics) {
        try {
          const texture = await this.loadSVGTexture(fabric.path);
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          this.fabricsLoaded.set(fabric.id, {
            texture,
            quality: fabric.quality,
            color: fabric.color
          });
        } catch (error) {
          console.warn(`Failed to load fabric ${fabric.id}:`, error);
        }
      }

      console.log(`Loaded ${this.heraldicsLoaded.size} heraldic designs and ${this.fabricsLoaded.size} fabrics`);
      return true;
    } catch (error) {
      console.error('Failed to load tapestry assets:', error);
      return false;
    }
  }

  /**
   * Load SVG texture (for now, will use as-is; can convert to PNG later)
   */
  async loadSVGTexture(path) {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        `/assets/tapestries/${path}`,
        (texture) => {
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  /**
   * Create a procedural tapestry with fabric base and heraldic overlay
   * @param {string} heraldic - Heraldic design ID
   * @param {string} fabric - Fabric texture ID
   * @param {Array} size - [width, height] in units
   * @returns {THREE.Mesh} Tapestry mesh
   */
  createTapestry(heraldic, fabric, size = [2, 2]) {
    const [width, height] = size;

    // Create cloth plane
    const geometry = new THREE.PlaneGeometry(width, height, 10, 15);

    // Add slight cloth deformation for realism
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);

      // Gentle wave effect
      const wave = Math.sin(x * 2) * 0.02 + Math.sin(y * 3) * 0.015;
      positions.setZ(i, wave);

      // Slight sagging in the middle
      const sag = (1 - Math.abs(x / (width / 2))) * (y / height) * 0.05;
      positions.setZ(i, positions.getZ(i) - sag);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();

    // Get fabric texture
    const fabricData = this.fabricsLoaded.get(fabric) || this.fabricsLoaded.values().next().value;

    // Create material with fabric base
    const material = new THREE.MeshStandardMaterial({
      map: fabricData.texture.clone(),
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    // Adjust fabric texture repeat based on size
    material.map.repeat.set(width * 2, height * 2);

    // If heraldic design provided, create overlay
    if (heraldic && this.heraldicsLoaded.has(heraldic)) {
      const heraldicData = this.heraldicsLoaded.get(heraldic);

      // Create canvas to combine fabric and heraldic
      const canvas = document.createElement('canvas');
      const size = 1024;
      canvas.width = size;
      canvas.height = size * (height / width);
      const ctx = canvas.getContext('2d');

      // Draw fabric pattern
      const fabricImg = new Image();
      fabricImg.src = fabricData.texture.image.currentSrc || fabricData.texture.image.src;
      fabricImg.onload = () => {
        // Fill with fabric pattern
        const pattern = ctx.createPattern(fabricImg, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw heraldic in center
        const heraldicImg = new Image();
        heraldicImg.src = heraldicData.texture.image.currentSrc || heraldicData.texture.image.src;
        heraldicImg.onload = () => {
          const heraldicSize = Math.min(canvas.width, canvas.height) * 0.7;
          const x = (canvas.width - heraldicSize) / 2;
          const y = (canvas.height - heraldicSize) / 2;

          // Add slight fade/aging to heraldic
          ctx.globalAlpha = 0.85;
          ctx.drawImage(heraldicImg, x, y, heraldicSize, heraldicSize);
          ctx.globalAlpha = 1.0;

          // Add wear and tear
          this.addWearEffects(ctx, canvas.width, canvas.height);

          // Update material with combined texture
          const combinedTexture = new THREE.CanvasTexture(canvas);
          combinedTexture.minFilter = THREE.LinearFilter;
          combinedTexture.magFilter = THREE.LinearFilter;
          material.map = combinedTexture;
          material.needsUpdate = true;
        };
      };
    }

    const tapestry = new THREE.Mesh(geometry, material);
    tapestry.castShadow = true;
    tapestry.receiveShadow = true;
    tapestry.userData.isTapestry = true;
    tapestry.userData.size = size;

    return tapestry;
  }

  /**
   * Add wear and aging effects to tapestry canvas
   */
  addWearEffects(ctx, width, height) {
    // Add random dark spots (stains)
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 50 + 20;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, 'rgba(20, 20, 20, 0.15)');
      gradient.addColorStop(1, 'rgba(20, 20, 20, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
    }

    // Add edge fraying effect
    ctx.strokeStyle = 'rgba(40, 30, 20, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
      const x = Math.random() < 0.5 ? Math.random() * 10 : width - Math.random() * 10;
      const y = Math.random() * height;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 10, y + Math.random() * 15);
      ctx.stroke();
    }
  }

  /**
   * Place tapestry on wall at specified position and orientation
   * @param {THREE.Vector3} position - World position
   * @param {THREE.Vector3} normal - Wall normal vector
   * @param {Array} size - [width, height] of tapestry
   * @param {string} heraldic - Heraldic design ID
   * @param {string} fabric - Fabric texture ID
   */
  placeOnWall(position, normal, size, heraldic, fabric) {
    const tapestry = this.createTapestry(heraldic, fabric, size);

    // Position tapestry
    tapestry.position.copy(position);

    // Offset slightly from wall to prevent z-fighting
    const offset = this.manifest.placement_rules.wall_offset;
    tapestry.position.add(normal.clone().multiplyScalar(offset));

    // Orient tapestry to face away from wall
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal.clone().negate());
    tapestry.quaternion.copy(quaternion);

    this.scene.add(tapestry);
    this.tapestries.push(tapestry);

    return tapestry;
  }

  /**
   * Analyze wall segment to determine if suitable for tapestry
   */
  isWallSuitable(wall, minWidth, minHeight) {
    const width = wall.width || 1;
    const height = wall.height || 3;

    return width >= minWidth && height >= minHeight && wall.isInterior && !wall.isCorner;
  }

  /**
   * Get appropriate tapestry type for location
   */
  getTapestryType(roomType) {
    if (!this.manifest) return null;

    const types = this.manifest.tapestry_types.filter(type =>
      type.locations.includes(roomType)
    );

    if (types.length === 0) {
      // Default to small banner
      return this.manifest.tapestry_types.find(t => t.name === 'small_banner');
    }

    // Weighted random selection based on rarity
    const totalRarity = types.reduce((sum, type) => sum + type.rarity, 0);
    let random = Math.random() * totalRarity;

    for (const type of types) {
      random -= type.rarity;
      if (random <= 0) return type;
    }

    return types[0];
  }

  /**
   * Select heraldic design based on room importance/theme
   */
  selectHeraldic(roomType, roomImportance = 0.5) {
    const heraldics = Array.from(this.heraldicsLoaded.keys());
    if (heraldics.length === 0) return null;

    // Royal rooms get royal heraldics
    if (roomType.includes('throne') || roomType.includes('royal') || roomImportance > 0.8) {
      const royalHeraldics = this.manifest.heraldics.filter(h => h.theme === 'royal');
      if (royalHeraldics.length > 0) {
        return royalHeraldics[Math.floor(Math.random() * royalHeraldics.length)].id;
      }
    }

    // Military rooms get military heraldics
    if (roomType.includes('barracks') || roomType.includes('armory')) {
      const militaryHeraldics = this.manifest.heraldics.filter(h => h.theme === 'military');
      if (militaryHeraldics.length > 0) {
        return militaryHeraldics[Math.floor(Math.random() * militaryHeraldics.length)].id;
      }
    }

    // Random selection for other rooms
    return heraldics[Math.floor(Math.random() * heraldics.length)];
  }

  /**
   * Select fabric based on room quality
   */
  selectFabric(roomImportance = 0.5) {
    const fabrics = Array.from(this.fabricsLoaded.keys());
    if (fabrics.length === 0) return null;

    // High importance rooms get royal fabrics
    if (roomImportance > 0.8) {
      const royalFabrics = this.manifest.fabrics.filter(f => f.quality === 'royal');
      if (royalFabrics.length > 0) {
        return royalFabrics[Math.floor(Math.random() * royalFabrics.length)].id;
      }
    }

    // Medium importance get noble fabrics
    if (roomImportance > 0.5) {
      const nobleFabrics = this.manifest.fabrics.filter(f => f.quality === 'noble');
      if (nobleFabrics.length > 0) {
        return nobleFabrics[Math.floor(Math.random() * nobleFabrics.length)].id;
      }
    }

    // Random selection
    return fabrics[Math.floor(Math.random() * fabrics.length)];
  }

  /**
   * Decorate dungeon walls with tapestries
   * @param {Object} dungeonData - Dungeon generation data with room and wall info
   */
  decorateWalls(dungeonData) {
    if (!this.manifest) {
      console.warn('Manifest not loaded. Call loadAssets() first.');
      return;
    }

    const rules = this.manifest.placement_rules;
    const [minCoverage, maxCoverage] = rules.wall_coverage;
    const targetCoverage = minCoverage + Math.random() * (maxCoverage - minCoverage);

    let wallsDecorated = 0;
    const totalWalls = dungeonData.walls ? dungeonData.walls.length : 0;
    const targetWalls = Math.floor(totalWalls * targetCoverage);

    console.log(`Target: ${targetWalls} tapestries (${(targetCoverage * 100).toFixed(1)}% coverage)`);

    // Process each room
    if (dungeonData.rooms) {
      for (const room of dungeonData.rooms) {
        if (wallsDecorated >= targetWalls) break;

        const roomType = room.type || 'room';
        const roomImportance = room.importance || 0.5;

        // Get suitable walls in this room
        const roomWalls = (room.walls || []).filter(wall =>
          this.isWallSuitable(wall, rules.min_wall_width, rules.min_wall_height)
        );

        // Determine how many tapestries for this room
        const roomTapestryCount = Math.min(
          Math.floor(roomWalls.length * 0.3), // Max 30% of room walls
          targetWalls - wallsDecorated
        );

        // Place tapestries
        for (let i = 0; i < roomTapestryCount && roomWalls.length > 0; i++) {
          // Select random wall
          const wallIndex = Math.floor(Math.random() * roomWalls.length);
          const wall = roomWalls.splice(wallIndex, 1)[0];

          // Get tapestry type for this location
          const tapestryType = this.getTapestryType(roomType);
          if (!tapestryType) continue;

          // Select design and fabric
          const heraldic = this.selectHeraldic(roomType, roomImportance);
          const fabric = this.selectFabric(roomImportance);

          // Calculate position (center of wall)
          const position = wall.position || new THREE.Vector3(
            room.x + room.width / 2,
            room.height / 2,
            room.z
          );

          const normal = wall.normal || new THREE.Vector3(0, 0, 1);

          // Place tapestry
          this.placeOnWall(
            position,
            normal,
            tapestryType.size,
            heraldic,
            fabric
          );

          wallsDecorated++;
        }
      }
    }

    console.log(`Placed ${wallsDecorated} tapestries in dungeon`);
    return wallsDecorated;
  }

  /**
   * Add subtle animation to tapestries (gentle swaying)
   */
  animate(deltaTime) {
    const time = Date.now() * 0.0005;

    for (const tapestry of this.tapestries) {
      const geometry = tapestry.geometry;
      const positions = geometry.attributes.position;
      const originalPositions = geometry.userData.originalPositions;

      // Store original positions on first run
      if (!originalPositions) {
        geometry.userData.originalPositions = positions.array.slice();
        continue;
      }

      // Apply gentle wave animation
      for (let i = 0; i < positions.count; i++) {
        const x = originalPositions[i * 3];
        const y = originalPositions[i * 3 + 1];

        // Gentle wave based on position and time
        const wave = Math.sin(time + y * 2) * 0.01 * (1 + y / 2);

        positions.setZ(i, originalPositions[i * 3 + 2] + wave);
      }

      positions.needsUpdate = true;
    }
  }

  /**
   * Clean up all tapestries
   */
  dispose() {
    for (const tapestry of this.tapestries) {
      tapestry.geometry.dispose();
      tapestry.material.dispose();
      if (tapestry.material.map) tapestry.material.map.dispose();
      this.scene.remove(tapestry);
    }

    this.tapestries = [];

    // Dispose loaded textures
    for (const [, data] of this.heraldicsLoaded) {
      data.texture.dispose();
    }
    for (const [, data] of this.fabricsLoaded) {
      data.texture.dispose();
    }

    this.heraldicsLoaded.clear();
    this.fabricsLoaded.clear();
  }
}

export default TapestryDecorator;
