/**
 * UIManager - Central controller for all UI elements
 * Coordinates HUD, notifications, menus, and player feedback
 */

export class UIManager {
  constructor() {
    this.container = document.getElementById('ui');
    this.isPaused = false;
    this.notifications = [];
    this.damageNumbers = [];

    // UI State
    this.player = {
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100
    };

    this.hotbar = {
      slots: 5,
      activeSlot: 0,
      items: []
    };

    // Initialize UI components
    this.initializeHUD();
    this.initializeHotbar();
    this.initializeMinimap();
    this.initializeNotifications();
    this.initializeMessages();
    this.initializePauseMenu();

    // Event listeners
    this.setupEventListeners();
  }

  /**
   * Initialize the main HUD (health, stamina, etc.)
   */
  initializeHUD() {
    const hudTopLeft = document.createElement('div');
    hudTopLeft.className = 'hud-top-left';

    // Health bar
    hudTopLeft.innerHTML += `
      <div class="stat-bar-container">
        <div class="stat-label">
          <span>Health</span>
          <span class="stat-value" id="health-value">100 / 100</span>
        </div>
        <div class="stat-bar-bg">
          <div class="stat-bar-fill health" id="health-bar" style="width: 100%"></div>
        </div>
      </div>
    `;

    // Stamina bar
    hudTopLeft.innerHTML += `
      <div class="stat-bar-container">
        <div class="stat-label">
          <span>Stamina</span>
          <span class="stat-value" id="stamina-value">100 / 100</span>
        </div>
        <div class="stat-bar-bg">
          <div class="stat-bar-fill stamina" id="stamina-bar" style="width: 100%"></div>
        </div>
      </div>
    `;

    this.container.appendChild(hudTopLeft);

    // Cache references
    this.healthBar = document.getElementById('health-bar');
    this.healthValue = document.getElementById('health-value');
    this.staminaBar = document.getElementById('stamina-bar');
    this.staminaValue = document.getElementById('stamina-value');
  }

  /**
   * Initialize the hotbar at bottom center
   */
  initializeHotbar() {
    const hudBottomCenter = document.createElement('div');
    hudBottomCenter.className = 'hud-bottom-center';

    // Create hotbar
    const hotbar = document.createElement('div');
    hotbar.className = 'hotbar';

    for (let i = 0; i < this.hotbar.slots; i++) {
      const slot = document.createElement('div');
      slot.className = 'hotbar-slot empty';
      slot.dataset.slot = i;

      if (i === 0) {
        slot.classList.add('active');
        // Add sword icon to first slot
        slot.innerHTML = `
          <div class="hotbar-icon">⚔️</div>
          <div class="hotbar-key">${i + 1}</div>
        `;
        slot.classList.remove('empty');
      } else {
        slot.innerHTML = `
          <div class="hotbar-icon">—</div>
          <div class="hotbar-key">${i + 1}</div>
        `;
      }

      hotbar.appendChild(slot);
    }

    hudBottomCenter.appendChild(hotbar);
    this.container.appendChild(hudBottomCenter);

    this.hotbarElement = hotbar;
    this.hudBottomCenter = hudBottomCenter;
  }

  /**
   * Initialize minimap
   */
  initializeMinimap() {
    const hudTopRight = document.createElement('div');
    hudTopRight.className = 'hud-top-right';

    hudTopRight.innerHTML = `
      <div class="minimap-container">
        <div class="minimap-title">Map</div>
        <canvas id="minimap" width="150" height="150"></canvas>
      </div>
    `;

    this.container.appendChild(hudTopRight);

    this.minimapCanvas = document.getElementById('minimap');
    this.minimapCtx = this.minimapCanvas.getContext('2d');
  }

  /**
   * Initialize notification container
   */
  initializeNotifications() {
    const notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    notificationContainer.id = 'notification-container';
    this.container.appendChild(notificationContainer);
    this.notificationContainer = notificationContainer;
  }

  /**
   * Initialize message/lore display
   */
  initializeMessages() {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container hidden';
    messageContainer.id = 'message-container';

    messageContainer.innerHTML = `
      <div class="message-box">
        <div class="message-speaker" id="message-speaker"></div>
        <div class="message-text" id="message-text"></div>
        <div class="message-continue">Press ENTER to continue...</div>
      </div>
    `;

    this.container.appendChild(messageContainer);
    this.messageContainer = messageContainer;
  }

  /**
   * Initialize pause menu
   */
  initializePauseMenu() {
    const pauseMenu = document.createElement('div');
    pauseMenu.className = 'pause-menu hidden';
    pauseMenu.id = 'pause-menu';

    pauseMenu.innerHTML = `
      <div class="pause-menu-content">
        <h1 class="pause-menu-title">King's Field</h1>

        <div class="pause-menu-section">
          <h2 class="pause-menu-section-title">Controls</h2>
          <div class="controls-list">
            <div class="control-key">W/A/S/D</div>
            <div>Move Forward/Left/Back/Right</div>

            <div class="control-key">Q / E</div>
            <div>Turn Left / Right</div>

            <div class="control-key">SPACE</div>
            <div>Attack</div>

            <div class="control-key">SHIFT</div>
            <div>Sprint (uses stamina)</div>

            <div class="control-key">1-5</div>
            <div>Select Hotbar Item</div>

            <div class="control-key">ESC</div>
            <div>Pause Menu</div>
          </div>
        </div>

        <div class="pause-menu-section">
          <h2 class="pause-menu-section-title">Settings</h2>
          <p style="color: var(--kf-text-dim); font-size: 12px;">Settings panel coming soon...</p>
        </div>

        <button class="menu-button" id="resume-button">Resume Game</button>
        <button class="menu-button" id="restart-button">Restart Level</button>
      </div>
    `;

    this.container.appendChild(pauseMenu);
    this.pauseMenu = pauseMenu;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Pause menu
    document.getElementById('resume-button').addEventListener('click', () => {
      this.togglePause();
    });

    document.getElementById('restart-button').addEventListener('click', () => {
      this.showNotification('Level restart coming soon!', 'info');
      this.togglePause();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // ESC - Toggle pause
      if (e.key === 'Escape') {
        e.preventDefault();
        this.togglePause();
      }

      // 1-5 - Hotbar selection
      if (e.key >= '1' && e.key <= '5') {
        this.selectHotbarSlot(parseInt(e.key) - 1);
      }

      // ENTER - Dismiss message
      if (e.key === 'Enter' && !this.messageContainer.classList.contains('hidden')) {
        this.hideMessage();
      }
    });
  }

  /**
   * Update player health
   */
  updateHealth(current, max) {
    this.player.health = current;
    this.player.maxHealth = max;

    const percentage = (current / max) * 100;
    this.healthBar.style.width = percentage + '%';
    this.healthValue.textContent = `${Math.ceil(current)} / ${max}`;

    // Update color based on health percentage
    this.healthBar.classList.remove('warning', 'danger');
    if (percentage <= 25) {
      this.healthBar.classList.add('danger');
    } else if (percentage <= 50) {
      this.healthBar.classList.add('warning');
    }
  }

  /**
   * Update player stamina
   */
  updateStamina(current, max) {
    this.player.stamina = current;
    this.player.maxStamina = max;

    const percentage = (current / max) * 100;
    this.staminaBar.style.width = percentage + '%';
    this.staminaValue.textContent = `${Math.ceil(current)} / ${max}`;
  }

  /**
   * Show notification
   */
  showNotification(text, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = text;

    this.notificationContainer.appendChild(notification);
    this.notifications.push(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.remove();
      this.notifications = this.notifications.filter(n => n !== notification);
    }, 3000);
  }

  /**
   * Show floating damage number
   */
  showDamageNumber(amount, x, y, isHeal = false) {
    const damageNum = document.createElement('div');
    damageNum.className = `damage-number ${isHeal ? 'heal' : ''}`;
    damageNum.textContent = isHeal ? `+${amount}` : `-${amount}`;
    damageNum.style.left = x + 'px';
    damageNum.style.top = y + 'px';

    this.container.appendChild(damageNum);
    this.damageNumbers.push(damageNum);

    // Remove after animation
    setTimeout(() => {
      damageNum.remove();
      this.damageNumbers = this.damageNumbers.filter(d => d !== damageNum);
    }, 1000);
  }

  /**
   * Show interaction prompt
   */
  showInteractionPrompt(text, key = 'E') {
    // Remove existing prompt if any
    this.hideInteractionPrompt();

    const prompt = document.createElement('div');
    prompt.className = 'interaction-prompt';
    prompt.id = 'interaction-prompt';
    prompt.innerHTML = `Press <span class="interaction-key">${key}</span> ${text}`;

    this.hudBottomCenter.insertBefore(prompt, this.hotbarElement);
  }

  /**
   * Hide interaction prompt
   */
  hideInteractionPrompt() {
    const existing = document.getElementById('interaction-prompt');
    if (existing) {
      existing.remove();
    }
  }

  /**
   * Show message/lore text
   */
  showMessage(speaker, text) {
    document.getElementById('message-speaker').textContent = speaker;
    document.getElementById('message-text').textContent = text;
    this.messageContainer.classList.remove('hidden');
  }

  /**
   * Hide message
   */
  hideMessage() {
    this.messageContainer.classList.add('hidden');
  }

  /**
   * Select hotbar slot
   */
  selectHotbarSlot(index) {
    if (index < 0 || index >= this.hotbar.slots) return;

    // Remove active from all slots
    const slots = this.hotbarElement.querySelectorAll('.hotbar-slot');
    slots.forEach(slot => slot.classList.remove('active'));

    // Add active to selected slot
    slots[index].classList.add('active');
    this.hotbar.activeSlot = index;
  }

  /**
   * Toggle pause menu
   */
  togglePause() {
    this.isPaused = !this.isPaused;
    this.pauseMenu.classList.toggle('hidden');

    // Dispatch event for game loop to listen to
    window.dispatchEvent(new CustomEvent('game-pause', { detail: { paused: this.isPaused } }));
  }

  /**
   * Update minimap
   */
  updateMinimap(playerPos, dungeonData, enemies) {
    const ctx = this.minimapCtx;
    const canvas = this.minimapCanvas;
    const scale = 6; // pixels per grid unit

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center the view on the player
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw dungeon rooms
    if (dungeonData && dungeonData.rooms) {
      ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
      dungeonData.rooms.forEach(room => {
        const x = centerX + (room.x - playerPos.x) * scale;
        const y = centerY + (room.z - playerPos.z) * scale;
        ctx.fillRect(x, y, room.width * scale, room.height * scale);
      });
    }

    // Draw enemies
    if (enemies && enemies.length > 0) {
      ctx.fillStyle = '#c75450';
      enemies.forEach(enemy => {
        if (enemy.health > 0) {
          const x = centerX + (enemy.position.x - playerPos.x) * scale;
          const y = centerY + (enemy.position.z - playerPos.z) * scale;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
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
    const angle = -playerPos.rotationY; // Negative because canvas Y is inverted
    ctx.lineTo(
      centerX + Math.sin(angle) * 10,
      centerY + Math.cos(angle) * 10
    );
    ctx.stroke();
  }

  /**
   * Get pause state
   */
  isPausedState() {
    return this.isPaused;
  }

  /**
   * Clean up
   */
  destroy() {
    // Remove all notifications and damage numbers
    this.notifications.forEach(n => n.remove());
    this.damageNumbers.forEach(d => d.remove());
  }
}
