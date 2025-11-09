import * as THREE from 'three';

/**
 * MinimapRenderer - Renders a top-down minimap of the dungeon
 * Shows explored areas, player position, and enemies
 */
export class MinimapRenderer {
  constructor(dungeonData, options = {}) {
    this.dungeonData = dungeonData;
    this.options = {
      size: options.size || 180,
      scale: options.scale || 3, // pixels per grid unit
      fogOfWar: options.fogOfWar !== false, // enabled by default
      ...options
    };

    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.options.size;
    this.canvas.height = this.options.size;
    this.canvas.id = 'minimap-canvas';
    this.ctx = this.canvas.getContext('2d');

    // Fog of war tracking - which cells have been explored
    this.exploredCells = new Set();
    this.lastPlayerGridPos = { x: 0, z: 0 };

    // Cache dungeon grid for faster rendering
    this.buildGridCache();
  }

  /**
   * Build a cache of the dungeon grid for faster rendering
   */
  buildGridCache() {
    this.gridCache = {
      walls: [],
      floors: []
    };

    if (!this.dungeonData || !this.dungeonData.grid) return;

    const grid = this.dungeonData.grid;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] === 1) {
          this.gridCache.floors.push({ x, y });
        } else {
          this.gridCache.walls.push({ x, y });
        }
      }
    }
  }

  /**
   * Update fog of war based on player position
   */
  updateFogOfWar(playerGridX, playerGridZ, viewRadius = 4) {
    // Mark cells in a radius around the player as explored
    for (let dx = -viewRadius; dx <= viewRadius; dx++) {
      for (let dz = -viewRadius; dz <= viewRadius; dz++) {
        const distance = Math.sqrt(dx * dx + dz * dz);
        if (distance <= viewRadius) {
          const cellKey = `${playerGridX + dx},${playerGridZ + dz}`;
          this.exploredCells.add(cellKey);
        }
      }
    }

    this.lastPlayerGridPos = { x: playerGridX, z: playerGridZ };
  }

  /**
   * Check if a cell has been explored
   */
  isCellExplored(gridX, gridZ) {
    if (!this.options.fogOfWar) return true;
    const cellKey = `${gridX},${gridZ}`;
    return this.exploredCells.has(cellKey);
  }

  /**
   * Render the minimap
   */
  render(playerPos, playerRotation, enemies = []) {
    const ctx = this.ctx;
    const canvas = this.canvas;
    const scale = this.options.scale;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center the view on the player
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Convert player world position to grid position
    const playerGridX = Math.round(playerPos.x / 4); // Assuming cellSize = 4
    const playerGridZ = Math.round(playerPos.z / 4);

    // Update fog of war
    this.updateFogOfWar(playerGridX, playerGridZ);

    // Draw dungeon floors (only explored areas)
    ctx.fillStyle = 'rgba(60, 60, 70, 0.8)';
    this.gridCache.floors.forEach(cell => {
      if (this.isCellExplored(cell.x, cell.y)) {
        const screenX = centerX + (cell.x - playerGridX) * scale;
        const screenY = centerY + (cell.y - playerGridZ) * scale;
        ctx.fillRect(screenX, screenY, scale, scale);
      }
    });

    // Draw grid lines for explored areas
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
    ctx.lineWidth = 0.5;
    this.gridCache.floors.forEach(cell => {
      if (this.isCellExplored(cell.x, cell.y)) {
        const screenX = centerX + (cell.x - playerGridX) * scale;
        const screenY = centerY + (cell.y - playerGridZ) * scale;
        ctx.strokeRect(screenX, screenY, scale, scale);
      }
    });

    // Draw walls (darker, only if adjacent cells are explored)
    ctx.fillStyle = 'rgba(20, 20, 25, 0.9)';
    this.gridCache.walls.forEach(cell => {
      // Only draw wall if at least one adjacent cell is explored
      const adjacentExplored =
        this.isCellExplored(cell.x + 1, cell.y) ||
        this.isCellExplored(cell.x - 1, cell.y) ||
        this.isCellExplored(cell.x, cell.y + 1) ||
        this.isCellExplored(cell.x, cell.y - 1);

      if (adjacentExplored) {
        const screenX = centerX + (cell.x - playerGridX) * scale;
        const screenY = centerY + (cell.y - playerGridZ) * scale;
        ctx.fillRect(screenX, screenY, scale, scale);
      }
    });

    // Draw POI markers (if explored)
    if (this.dungeonData.pois) {
      this.dungeonData.pois.forEach((poi, roomId) => {
        const room = this.dungeonData.rooms.find(r => r.id === roomId);
        if (room) {
          const roomGridX = Math.round(room.centerX);
          const roomGridZ = Math.round(room.centerY);

          if (this.isCellExplored(roomGridX, roomGridZ)) {
            const screenX = centerX + (roomGridX - playerGridX) * scale;
            const screenY = centerY + (roomGridZ - playerGridZ) * scale;

            // Different colors for different POI types
            let poiColor = '#ffa500';
            if (poi.type === 'entrance') poiColor = '#4a9d6f';
            else if (poi.type === 'exit') poiColor = '#ff6b6b';
            else if (poi.type === 'treasure') poiColor = '#ffd700';
            else if (poi.type === 'safe') poiColor = '#7a9cc6';

            ctx.fillStyle = poiColor;
            ctx.beginPath();
            ctx.arc(screenX, screenY, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
    }

    // Draw enemies (only if in explored areas)
    if (enemies && enemies.length > 0) {
      ctx.fillStyle = '#c75450';
      enemies.forEach(enemy => {
        if (enemy.isDead && enemy.isDead()) return;

        const enemyGridX = Math.round(enemy.mesh.position.x / 4);
        const enemyGridZ = Math.round(enemy.mesh.position.z / 4);

        if (this.isCellExplored(enemyGridX, enemyGridZ)) {
          const screenX = centerX + (enemyGridX - playerGridX) * scale;
          const screenY = centerY + (enemyGridZ - playerGridZ) * scale;

          ctx.beginPath();
          ctx.arc(screenX, screenY, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Pulsing effect for enemies
          ctx.strokeStyle = 'rgba(199, 84, 80, 0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(screenX, screenY, 3.5 + Math.sin(Date.now() / 200) * 0.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    }

    // Draw player (always at center)
    ctx.fillStyle = '#4a9d6f';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw player direction indicator
    ctx.strokeStyle = '#4a9d6f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    const angle = playerRotation;
    const indicatorLength = 12;
    ctx.lineTo(
      centerX - Math.sin(angle) * indicatorLength,
      centerY - Math.cos(angle) * indicatorLength
    );
    ctx.stroke();

    // Add outer glow to player
    ctx.strokeStyle = 'rgba(74, 157, 111, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Draw compass rose (N/S/E/W)
    this.drawCompassRose(centerX, centerY);
  }

  /**
   * Draw compass rose in the corner
   */
  drawCompassRose(centerX, centerY) {
    const ctx = this.ctx;
    const size = this.options.size;
    const roseSize = 15;
    const roseX = size - roseSize - 5;
    const roseY = roseSize + 5;

    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // N
    ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
    ctx.fillText('N', roseX, roseY - roseSize);

    // S
    ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
    ctx.fillText('S', roseX, roseY + roseSize);

    // E
    ctx.fillText('E', roseX + roseSize, roseY);

    // W
    ctx.fillText('W', roseX - roseSize, roseY);
  }

  /**
   * Get the canvas element
   */
  getCanvas() {
    return this.canvas;
  }

  /**
   * Reset fog of war
   */
  resetFogOfWar() {
    this.exploredCells.clear();
  }

  /**
   * Clean up
   */
  dispose() {
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
  }
}
