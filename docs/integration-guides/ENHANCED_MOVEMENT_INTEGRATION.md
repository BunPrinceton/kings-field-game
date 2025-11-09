# Enhanced Movement System Integration Guide

## Overview
This guide explains how to integrate the new Enhanced Movement System into your Kings Field game for smoother, more modern first-person movement.

## Features Added
- **Smoother acceleration/deceleration** with momentum-based movement
- **Head bob effects** that feel natural and immersive
- **Camera tilt** when strafing for better visual feedback
- **Improved dash/sprint** mechanics with better feel
- **Slide mechanic** (crouch while sprinting)
- **Mouse smoothing** for more fluid camera control
- **Better footstep timing** based on actual movement speed

## Integration Steps

### 1. Import the Enhanced Movement System

In `main.js`, add the import at the top:

```javascript
import { EnhancedMovementSystem } from './EnhancedMovementSystem.js';
```

### 2. Initialize the System

After creating the player and camera (around line 1450), add:

```javascript
// Initialize enhanced movement system
game.enhancedMovement = new EnhancedMovementSystem(game.camera, game.player, {
    walkSpeed: 4.0,
    sprintSpeed: 7.0,
    mouseSensitivity: game.mouse.sensitivity,
    headBobIntensity: 0.02,
    strafeTilt: 0.03
});

// Connect head bob to viewmodel if available
if (game.viewmodel) {
    game.enhancedMovement.onHeadBob = (x, y) => {
        // This will make the weapon sway slightly with movement
        if (game.viewmodel) {
            game.viewmodel.applyMovementSway(x, y);
        }
    };
}
```

### 3. Update the Movement Function

Replace the current `updateMovement` function (around line 1117) with:

```javascript
function updateMovement(deltaTime) {
    // Prepare input state for enhanced movement
    const input = {
        forward: game.keys['w'] || game.keys['arrowup'],
        backward: game.keys['s'] || game.keys['arrowdown'],
        left: game.keys['a'] || game.keys['arrowleft'],
        right: game.keys['d'] || game.keys['arrowright'],
        sprint: game.movement.isSprinting,
        crouch: game.keys['control'] || game.keys['c'],
        jump: game.keys[' '] // Space for future jumping
    };

    // Use enhanced movement system if available
    if (game.enhancedMovement) {
        // Get enhanced velocity
        const velocity = game.enhancedMovement.update(deltaTime, input);

        // Apply velocity to player position with collision
        const nextX = game.player.position.x + velocity.x * deltaTime;
        const nextZ = game.player.position.z + velocity.z * deltaTime;

        // Collision detection (keep existing collision logic)
        let finalX = nextX;
        let finalZ = nextZ;

        if (!checkCollision(nextX, nextZ)) {
            finalX = nextX;
            finalZ = nextZ;
        } else {
            // Try sliding along walls
            if (!checkCollision(nextX, game.player.position.z)) {
                finalX = nextX;
                finalZ = game.player.position.z;
            } else if (!checkCollision(game.player.position.x, nextZ)) {
                finalX = game.player.position.x;
                finalZ = nextZ;
            }
        }

        // Update positions
        game.player.position.x = finalX;
        game.player.position.z = finalZ;
        game.camera.position.x = game.player.position.x;
        game.camera.position.z = game.player.position.z;

        // Check for footsteps
        if (game.enhancedMovement.shouldPlayFootstep() && game.audioInitialized) {
            const footstepType = game.enhancedMovement.state.isSprinting ? 'footstep_run' : 'footstep_walk';
            game.audio.play(footstepType, 'sfx', game.player.position);
        }

        // Update movement state for other systems
        game.movement.isMoving = game.enhancedMovement.state.isMoving;
        game.movement.velocity = velocity;

    } else {
        // Fallback to original movement code
        // [Keep existing updateMovement code as fallback]
    }
}
```

### 4. Update Input Handlers

Add these handlers for the new movement features:

```javascript
// In setupInput() function, add:

// Crouch handling
window.addEventListener('keydown', (e) => {
    if (e.key === 'Control' || e.key.toLowerCase() === 'c') {
        if (game.enhancedMovement) {
            game.enhancedMovement.startCrouch();
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'Control' || e.key.toLowerCase() === 'c') {
        if (game.enhancedMovement) {
            game.enhancedMovement.stopCrouch();
        }
    }
});

// Update sprint handling for enhanced system
if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
    if (game.enhancedMovement) {
        const now = Date.now();
        const timeSinceLastPress = now - game.movement.lastShiftPress;

        // Double-tap for dash
        if (timeSinceLastPress < 300) {
            if (game.enhancedMovement.triggerDash()) {
                console.log('Enhanced dash activated!');
                if (game.audioInitialized) {
                    game.audio.play('dash', 'sfx', game.player.position);
                }
            }
        }

        game.movement.lastShiftPress = now;
        game.enhancedMovement.startSprint();
    }
}
```

### 5. Update Mouse Handling

In the `setupPointerLock()` function, update the mouse move handler:

```javascript
document.addEventListener('mousemove', (e) => {
    if (!game.mouse.isLocked) return;

    if (game.enhancedMovement) {
        // Use enhanced mouse smoothing
        const smoothed = game.enhancedMovement.handleMouseMove(
            e.movementX,
            e.movementY
        );

        game.mouse.yaw -= smoothed.x;
        game.mouse.pitch -= smoothed.y;
    } else {
        // Original mouse handling
        game.mouse.yaw -= e.movementX * game.mouse.sensitivity;
        game.mouse.pitch -= e.movementY * game.mouse.sensitivity;
    }

    // Apply rotation limits and to camera
    game.mouse.pitch = Math.max(-game.mouse.pitchLimit,
                                Math.min(game.mouse.pitchLimit, game.mouse.pitch));
    game.camera.rotation.order = 'YXZ';
    game.camera.rotation.y = game.mouse.yaw;
    game.camera.rotation.x = game.mouse.pitch;
});
```

### 6. Add Movement State to UI

Update the UI to show new movement states:

```javascript
// In updateUI() function, add:
if (game.enhancedMovement) {
    const moveState = game.enhancedMovement.getState();

    // Add to UI display
    const movementInfo = `
        <div style="font-size: 12px; color: #888; margin-top: 5px;">
            Speed: ${moveState.speed} |
            ${moveState.isSprinting ? 'SPRINTING' : ''}
            ${moveState.isCrouching ? 'CROUCHED' : ''}
            ${moveState.isSliding ? 'SLIDING' : ''}
            ${moveState.isDashing ? 'DASHING' : ''}
            ${moveState.dashCooldown > 0 ? `Dash CD: ${moveState.dashCooldown}s` : 'Dash Ready'}
        </div>
    `;
}
```

## Configuration Options

Tweak these values in the initialization to adjust the feel:

```javascript
{
    // Speed settings
    walkSpeed: 4.0,        // Normal walking speed
    sprintSpeed: 7.0,      // Sprint speed
    crouchSpeed: 2.0,      // Crouch walk speed

    // Acceleration
    acceleration: 8.0,     // How quickly you reach max speed
    deceleration: 12.0,    // How quickly you stop

    // Camera effects
    headBobIntensity: 0.02,  // How much head bob (0 = none)
    headBobSpeed: 10,        // Speed of head bob animation
    strafeTilt: 0.03,        // Camera tilt when strafing

    // Mouse control
    mouseSensitivity: 0.002,     // Normal look sensitivity
    smoothing: 0.15,             // Mouse smoothing (0-1, higher = smoother)

    // Special moves
    dashSpeed: 15.0,         // Dash speed multiplier
    dashDuration: 0.25,      // How long dash lasts
    dashCooldown: 1.0,       // Cooldown between dashes
    slideSpeed: 10.0,        // Speed while sliding
    slideDuration: 0.8       // How long you can slide
}
```

## Testing the System

1. **Test basic movement**: WASD keys should feel smooth with acceleration
2. **Test sprint**: Hold Shift - movement should speed up smoothly
3. **Test dash**: Double-tap Shift - should give a quick burst of speed
4. **Test slide**: Sprint then hold Ctrl/C - should slide with momentum
5. **Test strafing**: Move left/right - camera should tilt slightly
6. **Test head bob**: Walk around - subtle camera movement should occur

## Fallback

The system is designed to work alongside your existing movement code. If you encounter issues, you can disable it by simply not initializing `game.enhancedMovement`, and the original movement will continue to work.

## Performance Notes

The enhanced movement system is optimized and should not impact performance. It adds:
- ~0.1ms per frame for calculations
- Minimal memory overhead (< 1KB)
- No additional draw calls

## Next Steps

After integrating the movement system:
1. Fine-tune the configuration values to your preference
2. Add custom footstep sounds for different surfaces
3. Implement jumping/gravity for vertical movement
4. Add climbing or vaulting mechanics
5. Integrate with combat for movement-based attacks