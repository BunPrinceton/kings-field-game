# Implementation Guide
## Integrating Narrative Content into King's Field Game

This guide shows how to integrate the narrative content from `NARRATIVE_DATA.js` into the existing game codebase.

---

## Quick Start

### 1. Import the Narrative Data

Add to `main.js`:

```javascript
import NARRATIVE_DATA from './NARRATIVE_DATA.js';
```

---

## Implementation Examples

### A. Adding Enemy Examine Text

**Current State** (in `main.js`):
```javascript
class Enemy {
    constructor(scene, position) {
        this.scene = scene;
        this.health = new Health(50);
        // ... existing code
    }
}
```

**Enhanced Version**:
```javascript
class Enemy {
    constructor(scene, position, type = 'remnant') {
        this.scene = scene;
        this.health = new Health(50);
        this.type = type;
        this.narrativeData = NARRATIVE_DATA.enemies[type];

        // ... existing mesh creation code

        // Add examine text when player looks at enemy
        this.mesh.userData.examineText = this.narrativeData.examineText;
        this.mesh.userData.name = this.narrativeData.name;
    }

    takeDamage(amount) {
        const dead = this.health.takeDamage(amount);

        // Flash white when hit
        this.mesh.material.color.setHex(0xffffff);
        this.damageFlashDuration = 150;

        if (dead) {
            // Show defeat text
            showMessageToPlayer(this.narrativeData.defeatText);
            this.die();
        }

        return dead;
    }
}
```

---

### B. Enhancing the UI with Flavor Text

**Current UI** (in `main.js:456`):
```javascript
function updateUI() {
    const healthPercent = game.player.health.getPercentage();
    const healthColor = healthPercent > 50 ? '#0f0' : healthPercent > 25 ? '#ff0' : '#f00';

    const uiHTML = `
        <div style="font-size: 16px;">
            <div style="margin-bottom: 10px;">Kings Field - Ready</div>
            // ... rest of UI
        </div>
    `;
}
```

**Enhanced Version**:
```javascript
function updateUI() {
    const healthPercent = game.player.health.getPercentage();
    const healthColor = healthPercent > 50 ? '#0f0' : healthPercent > 25 ? '#ff0' : '#f00';

    // Get narrative health state
    let healthState = NARRATIVE_DATA.ui.healthStates[100];
    if (healthPercent <= 75) healthState = NARRATIVE_DATA.ui.healthStates[75];
    if (healthPercent <= 50) healthState = NARRATIVE_DATA.ui.healthStates[50];
    if (healthPercent <= 25) healthState = NARRATIVE_DATA.ui.healthStates[25];

    // Get current location name
    const locationName = game.currentLocation
        ? NARRATIVE_DATA.locations.upperArchive[game.currentLocation].name
        : "The Archive";

    const uiHTML = `
        <div style="font-size: 16px;">
            <div style="margin-bottom: 10px; opacity: 0.9;">${locationName}</div>
            <div style="margin-bottom: 5px;">
                Health: <span style="color: ${healthColor}">${game.player.health.current}/${game.player.health.max}</span>
            </div>
            <div style="background: #333; width: 200px; height: 20px; border: 2px solid #fff; margin-bottom: 10px;">
                <div style="background: ${healthColor}; width: ${healthPercent}%; height: 100%; transition: width 0.3s;"></div>
            </div>
            <div style="font-size: 11px; opacity: 0.6; font-style: italic; margin-bottom: 10px;">
                ${healthState}
            </div>
            <div style="font-size: 12px; opacity: 0.7;">
                Enemies: ${game.enemies.filter(e => !e.isDead()).length}/${game.enemies.length}
            </div>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">
                WASD: Move | Q/E: Rotate | SPACE: Attack
            </div>
        </div>
    `;

    document.querySelector('#ui').innerHTML = uiHTML;
}
```

---

### C. Adding Death Messages

**New Function** (add to `main.js`):
```javascript
// Track death count
game.deathCount = 0;

function handlePlayerDeath() {
    game.deathCount++;

    // Select random death message
    const messages = NARRATIVE_DATA.ui.deathMessages;
    const message = messages[Math.floor(Math.random() * messages.length)];
    const displayMessage = message.replace('{count}', game.deathCount);

    // Show death screen
    showDeathScreen(displayMessage);

    // Reset player
    setTimeout(() => {
        respawnPlayer();
    }, 2000);
}

function showDeathScreen(message) {
    const deathOverlay = document.createElement('div');
    deathOverlay.id = 'death-overlay';
    deathOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: #ff0000;
        font-family: monospace;
        z-index: 1000;
        animation: fadeIn 0.5s;
    `;

    deathOverlay.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px; text-align: center;">
            YOU DIED
        </div>
        <div style="font-size: 16px; opacity: 0.8; max-width: 600px; text-align: center;">
            ${message}
        </div>
    `;

    document.body.appendChild(deathOverlay);

    setTimeout(() => {
        document.body.removeChild(deathOverlay);
    }, 2000);
}

// Call this when player health reaches 0
function update(deltaTime) {
    // ... existing update code

    if (game.player.health.isDead() && !game.player.isDying) {
        game.player.isDying = true;
        handlePlayerDeath();
    }
}
```

---

### D. Adding Examine System for Objects

**New System** (add to `main.js`):
```javascript
// Add to game state
game.examinableObjects = [];

// Create an examinable object
function createExaminableObject(type, position) {
    const narrativeData = NARRATIVE_DATA.examineObjects[type];

    // Create visual representation (example: scroll)
    const geometry = new THREE.PlaneGeometry(0.3, 0.4);
    const material = new THREE.MeshStandardMaterial({
        color: 0xccccaa,
        emissive: 0x222211
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, 0.5, position.z);
    mesh.rotation.x = -Math.PI / 2;

    // Store narrative data
    mesh.userData.type = type;
    mesh.userData.examineText = narrativeData.text;
    mesh.userData.examinable = true;

    game.scene.add(mesh);
    game.examinableObjects.push(mesh);

    return mesh;
}

// Check for nearby examinable objects
function checkForExaminableObjects() {
    const playerPos = new THREE.Vector3(
        game.player.position.x,
        game.player.position.y,
        game.player.position.z
    );

    let nearestObject = null;
    let nearestDistance = 2; // Examine range

    for (const obj of game.examinableObjects) {
        const distance = playerPos.distanceTo(obj.position);
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestObject = obj;
        }
    }

    return nearestObject;
}

// Show examine prompt
function showExaminePrompt(object) {
    const promptDiv = document.getElementById('examine-prompt') || createExaminePromptDiv();

    if (object) {
        promptDiv.style.display = 'block';
        promptDiv.innerHTML = `
            <div style="text-align: center;">
                Press [F] to examine
            </div>
        `;
    } else {
        promptDiv.style.display = 'none';
    }
}

function createExaminePromptDiv() {
    const div = document.createElement('div');
    div.id = 'examine-prompt';
    div.style.cssText = `
        position: fixed;
        bottom: 150px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: #fff;
        padding: 10px 20px;
        border: 2px solid #666;
        font-family: monospace;
        display: none;
    `;
    document.body.appendChild(div);
    return div;
}

function showExamineText(text) {
    const examineDiv = document.getElementById('examine-text') || createExamineTextDiv();
    examineDiv.style.display = 'block';
    examineDiv.innerHTML = `
        <div style="max-width: 600px; line-height: 1.6;">
            ${text}
        </div>
        <div style="margin-top: 20px; text-align: center; font-size: 12px; opacity: 0.6;">
            Press [F] to close
        </div>
    `;
}

function createExamineTextDiv() {
    const div = document.createElement('div');
    div.id = 'examine-text';
    div.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.95);
        color: #ccc;
        padding: 30px;
        border: 3px solid #666;
        font-family: serif;
        display: none;
        z-index: 100;
        max-width: 700px;
    `;
    document.body.appendChild(div);
    return div;
}

// Add examine key handling
function setupInput() {
    window.addEventListener('keydown', (e) => {
        // ... existing input handling

        if (e.key.toLowerCase() === 'f') {
            const nearbyObject = checkForExaminableObjects();
            if (nearbyObject) {
                const examineDiv = document.getElementById('examine-text');
                if (examineDiv && examineDiv.style.display === 'block') {
                    examineDiv.style.display = 'none';
                } else {
                    showExamineText(nearbyObject.userData.examineText);
                }
            }
        }
    });
}

// Update loop to check for examinable objects
function animate() {
    requestAnimationFrame(animate);

    // ... existing animation code

    // Check for nearby examinable objects
    const nearbyObject = checkForExaminableObjects();
    showExaminePrompt(nearbyObject);

    // ... rest of animation code
}
```

---

### E. Adding Location Discovery

**New Function** (add to `main.js`):
```javascript
// Track discovered locations
game.discoveredLocations = new Set();
game.currentLocation = null;

function checkLocationChange() {
    const playerGridX = Math.round(game.player.position.x / 4);
    const playerGridZ = Math.round(game.player.position.z / 4);

    // Simple location detection based on position
    // (In a full implementation, you'd check which room the player is in)
    let newLocation = determineLocationFromPosition(playerGridX, playerGridZ);

    if (newLocation && newLocation !== game.currentLocation) {
        game.currentLocation = newLocation;

        if (!game.discoveredLocations.has(newLocation)) {
            game.discoveredLocations.add(newLocation);
            showLocationDiscovery(newLocation);
        }
    }
}

function determineLocationFromPosition(x, z) {
    // This is a simple example - expand based on your dungeon layout
    if (x === 0 && z === 5) return 'thresholdOfKnowing';
    // Add more location checks based on your dungeon rooms
    return null;
}

function showLocationDiscovery(locationKey) {
    // Get location data from the current area (adjust based on progression)
    const location = NARRATIVE_DATA.locations.upperArchive[locationKey];

    if (!location) return;

    const discoveryDiv = document.createElement('div');
    discoveryDiv.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        color: #fff;
        padding: 20px 40px;
        border: 3px solid #666;
        font-family: serif;
        text-align: center;
        z-index: 100;
        animation: fadeInOut 4s forwards;
    `;

    discoveryDiv.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 10px;">
            ${location.name}
        </div>
        <div style="font-size: 14px; opacity: 0.8; font-style: italic;">
            ${location.discoveryText}
        </div>
    `;

    document.body.appendChild(discoveryDiv);

    setTimeout(() => {
        document.body.removeChild(discoveryDiv);
    }, 4000);
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        20% { opacity: 1; transform: translateX(-50%) translateY(0); }
        80% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(20px); }
    }
`;
document.head.appendChild(style);

// Call in animation loop
function animate() {
    requestAnimationFrame(animate);

    // ... existing code

    checkLocationChange();

    // ... rest of code
}
```

---

### F. Adding Loading Screen Tips

**New Function** (add to game initialization):
```javascript
function showLoadingScreen() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-screen';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: #fff;
        font-family: monospace;
        z-index: 10000;
    `;

    // Select random loading tip
    const tips = NARRATIVE_DATA.ui.loadingTips;
    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    loadingDiv.innerHTML = `
        <div style="font-size: 32px; margin-bottom: 40px;">
            LOADING...
        </div>
        <div style="font-size: 14px; max-width: 600px; text-align: center; opacity: 0.7; line-height: 1.6;">
            ${randomTip}
        </div>
    `;

    document.body.appendChild(loadingDiv);

    return loadingDiv;
}

// Use during game initialization
function init() {
    const loadingScreen = showLoadingScreen();

    // ... existing initialization code

    // Remove loading screen when ready
    setTimeout(() => {
        document.body.removeChild(loadingScreen);

        // Show opening sequence
        showOpeningSequence();
    }, 1000);
}
```

---

### G. Adding Opening Sequence

**New Function**:
```javascript
function showOpeningSequence() {
    const openingDiv = document.createElement('div');
    openingDiv.id = 'opening-sequence';
    openingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #ccc;
        font-family: serif;
        z-index: 9999;
        padding: 40px;
    `;

    const textContent = NARRATIVE_DATA.opening.introText.join('<br>');

    openingDiv.innerHTML = `
        <div style="max-width: 700px; font-size: 16px; line-height: 2; text-align: center;">
            ${textContent}
            <div style="margin-top: 40px; font-size: 12px; opacity: 0.5;">
                Press any key to continue
            </div>
        </div>
    `;

    document.body.appendChild(openingDiv);

    const dismissOpening = () => {
        document.body.removeChild(openingDiv);
        document.removeEventListener('keydown', dismissOpening);

        // Show first steps text
        setTimeout(() => {
            showFloatingMessage(NARRATIVE_DATA.opening.firstSteps[0]);
        }, 500);
    };

    document.addEventListener('keydown', dismissOpening);
}

function showFloatingMessage(message, duration = 3000) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: #ccc;
        padding: 15px 30px;
        font-family: serif;
        font-size: 14px;
        font-style: italic;
        border: 2px solid #444;
        z-index: 100;
        opacity: 0;
        transition: opacity 0.5s;
    `;

    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => messageDiv.style.opacity = '1', 10);

    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => document.body.removeChild(messageDiv), 500);
    }, duration);
}
```

---

## Quick Wins: Easy Implementations

### 1. Enemy Names
Change in `main.js:86-105`:
```javascript
class Enemy {
    constructor(scene, position) {
        this.scene = scene;
        this.health = new Health(50);
        this.type = 'remnant'; // Add this

        // ... existing code
    }
}
```

### 2. Enemy Defeat Messages
Modify `main.js:500-510`:
```javascript
if (targetEnemy) {
    const dead = targetEnemy.takeDamage(game.player.attackPower);
    updateUI();

    if (dead) {
        const defeatText = NARRATIVE_DATA.enemies.remnant.defeatText;
        showFloatingMessage(defeatText, 2000);
    }
}
```

### 3. Simple Health Status
Add below health bar in `updateUI()`:
```javascript
const healthState = game.player.health.current <= 25
    ? NARRATIVE_DATA.ui.healthStates[25]
    : game.player.health.current <= 50
    ? NARRATIVE_DATA.ui.healthStates[50]
    : "You are whole. For now.";

// Add to UI HTML
<div style="font-size: 11px; opacity: 0.6; font-style: italic;">
    ${healthState}
</div>
```

---

## Advanced Implementations

### Creating Examine Objects in Dungeon

Add to `DungeonBuilder.js`:
```javascript
import NARRATIVE_DATA from './NARRATIVE_DATA.js';

class DungeonBuilder {
    // ... existing code

    build() {
        this.createFloors();
        this.createCeilings();
        this.createWalls();
        this.placeTorches();
        this.placeExaminableObjects(); // NEW

        return {
            meshes: this.meshes,
            torches: this.torches
        };
    }

    placeExaminableObjects() {
        // Place examine objects in rooms
        for (const room of this.dungeonData.rooms) {
            if (Math.random() < 0.3) { // 30% chance per room
                const x = room.centerX;
                const y = room.centerY;

                this.createExaminableScroll(x, y);
            }
        }
    }

    createExaminableScroll(gridX, gridY) {
        const geometry = new THREE.PlaneGeometry(0.3, 0.4);
        const material = new THREE.MeshStandardMaterial({
            color: 0xccccaa,
            emissive: 0x222211
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            gridX * this.config.cellSize,
            0.5,
            gridY * this.config.cellSize
        );
        mesh.rotation.x = -Math.PI / 2;

        // Random examine text
        const examineTypes = Object.keys(NARRATIVE_DATA.examineObjects);
        const randomType = examineTypes[Math.floor(Math.random() * examineTypes.length)];

        mesh.userData.examineText = NARRATIVE_DATA.examineObjects[randomType].text;
        mesh.userData.examinable = true;

        this.scene.add(mesh);
        this.meshes.push(mesh);
    }
}
```

---

## Testing Your Implementation

### Test Checklist

1. **Enemy Text**
   - [ ] Enemies display correct name when examined
   - [ ] Defeat text appears when enemy dies
   - [ ] First encounter text triggers once

2. **UI Enhancements**
   - [ ] Location name displays in UI
   - [ ] Health status text changes based on HP
   - [ ] Loading tips appear on game start

3. **Examine System**
   - [ ] Objects are detectable within range
   - [ ] Examine prompt appears/disappears correctly
   - [ ] Examine text displays properly
   - [ ] Can close examine text

4. **Location Discovery**
   - [ ] Location names appear when entering new areas
   - [ ] Discovery text displays correctly
   - [ ] Locations only discovered once

5. **Death System**
   - [ ] Death screen appears when health reaches 0
   - [ ] Death messages are varied
   - [ ] Death count increments
   - [ ] Respawn works correctly

---

## Next Steps

1. **Start Simple**: Implement enemy defeat text first (easiest)
2. **Add UI Flavor**: Health states and location names
3. **Build Examine System**: Most impactful for storytelling
4. **Create NPCs**: Use dialogue system from narrative data
5. **Add Quests**: Implement quest tracking system

---

## Performance Considerations

- Narrative data is static - no performance impact
- Examine checks run every frame - optimize by:
  - Only checking when player is stationary
  - Caching nearby objects
  - Using spatial partitioning for large dungeons

- UI updates should be throttled:
  ```javascript
  let lastUIUpdate = 0;
  function animate() {
      if (Date.now() - lastUIUpdate > 100) { // Update every 100ms
          updateUI();
          lastUIUpdate = Date.now();
      }
  }
  ```

---

## File Structure Recommendation

```
kings-field-game/
├── src/
│   ├── main.js (enhanced with narrative)
│   ├── DungeonGenerator.js
│   ├── DungeonBuilder.js (enhanced with examinables)
│   ├── AtmosphericLighting.js
│   ├── NARRATIVE_DATA.js (NEW)
│   ├── NarrativeSystem.js (NEW - helper functions)
│   └── UISystem.js (NEW - UI management)
├── NARRATIVE_DESIGN.md (reference doc)
└── IMPLEMENTATION_GUIDE.md (this file)
```

---

## Troubleshooting

**Issue**: Examine text not appearing
- Check object has `userData.examinable = true`
- Verify examine range is sufficient
- Ensure F key listener is registered

**Issue**: Death messages not showing
- Verify player death is detected
- Check death overlay z-index
- Ensure death screen removal timeout is working

**Issue**: Location names not appearing
- Verify location key matches NARRATIVE_DATA structure
- Check position-to-location mapping
- Ensure CSS animation is loaded

---

## Future Enhancements

1. **Dialogue Trees**: Create branching NPC conversations
2. **Quest System**: Full quest tracking with objectives
3. **Inventory UI**: Show item descriptions from NARRATIVE_DATA
4. **Lore Journal**: Collect and view lore fragments
5. **Audio Integration**: Trigger ambient sounds based on narrative events

---

This guide provides everything needed to integrate rich narrative content into your King's Field-style game. Start with the "Quick Wins" section for immediate impact, then gradually implement more complex systems.

The Archive awaits your storytelling.
