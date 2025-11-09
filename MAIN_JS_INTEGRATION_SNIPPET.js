/**
 * Door Transition System - Integration Code for main.js
 *
 * Copy and paste these code snippets into the appropriate locations in main.js
 */

// ============================================================================
// 1. ADD IMPORT (add this at the top with other imports, around line 19)
// ============================================================================

import { DoorTransitionIntegration } from './DoorTransitionIntegration.js';


// ============================================================================
// 2. ADD TO GAME STATE (add this property around line 292)
// ============================================================================

const game = {
    // ... existing properties ...
    doorTransition: null, // DoorTransitionIntegration instance
};


// ============================================================================
// 3. INITIALIZE DOOR TRANSITION SYSTEM (add after furniture initialization, around line 920)
// ============================================================================

// Initialize door transition system
if (game.dungeon.furniture) {
    game.doorTransition = new DoorTransitionIntegration(game);
    console.log('Door transition system initialized');

    // Add test instance doors for demonstration
    game.doorTransition.addTestInstanceDoors();
}


// ============================================================================
// 4. REPLACE tryInteractWithFurniture FUNCTION (around line 488)
// ============================================================================

// REMOVE the existing tryInteractWithFurniture function and REPLACE with:

function tryInteractWithFurniture() {
    if (!game.doorTransition) {
        // Fallback to old method if door transition not initialized
        if (game.dungeon.furniture) {
            const furnitureManager = game.dungeon.furniture.getFurnitureManager();
            if (!furnitureManager) return;

            const playerPos = new THREE.Vector3(
                game.player.position.x,
                game.player.position.y,
                game.player.position.z
            );

            let nearestFurniture = null;
            let nearestDistance = 2.5;

            for (const [furniture, data] of furnitureManager.interactables) {
                const distance = playerPos.distanceTo(furniture.position);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestFurniture = furniture;
                }
            }

            if (nearestFurniture) {
                furnitureManager.interact(nearestFurniture);
                console.log('Interacted with furniture (old method)');
            }
        }
        return;
    }

    // Check if transition is playing
    if (game.doorTransition.isInputBlocked()) {
        console.log('Input blocked during transition');
        return;
    }

    // Try to interact with new method
    const result = game.doorTransition.tryInteractWithNearbyFurniture();

    if (result) {
        console.log('Furniture interaction:', result.type);
    }
}


// ============================================================================
// 5. BLOCK MOVEMENT DURING TRANSITIONS (add at start of updateMovement function, around line 667)
// ============================================================================

function updateMovement(deltaTime) {
    // Block movement during door transitions
    if (game.doorTransition && game.doorTransition.isInputBlocked()) {
        game.movement.velocity.x = 0;
        game.movement.velocity.z = 0;
        return;
    }

    // ... rest of existing updateMovement code ...
}


// ============================================================================
// 6. UPDATE UI WITH INTERACTION PROMPTS (add to animate function, around line 1100)
// ============================================================================

function animate() {
    requestAnimationFrame(animate);

    // ... existing animation code ...

    // Update interaction UI (add this before or after updateUI call)
    if (game.doorTransition) {
        game.doorTransition.updateInteractionUI();
    }

    // ... rest of existing animate code ...
}


// ============================================================================
// 7. BLOCK ATTACK DURING TRANSITIONS (modify attack processing in animate, around line 1150)
// ============================================================================

// Find where attacks are processed and modify like this:

if (game.input.attack && !game.player.isAttacking) {
    // Block attack during door transitions
    if (game.doorTransition && game.doorTransition.isInputBlocked()) {
        // Don't attack during transition
        game.input.attack = false;
    } else {
        // ... existing attack code ...
        const targetEnemy = game.player.attack(game.enemies, weaponStats);
        // ... rest of attack handling ...
    }
}


// ============================================================================
// 8. CLEANUP ON DISPOSE (if you have a cleanup function)
// ============================================================================

function cleanup() {
    // ... existing cleanup code ...

    if (game.doorTransition) {
        game.doorTransition.dispose();
        game.doorTransition = null;
    }
}


// ============================================================================
// OPTIONAL: MANUAL INSTANCE DOOR CREATION
// ============================================================================

// If you want to manually create instance doors at specific locations:

function createCustomInstanceDoor() {
    if (!game.dungeon.furniture) return;

    const furnitureManager = game.dungeon.furniture.getFurnitureManager();

    // Create an ornate door at specific position
    furnitureManager.createFurniture(
        FurnitureType.ORNATE_DOOR,
        { x: 20, y: 0, z: 20 },
        {
            rotation: Math.PI / 2,
            interactable: true,
            isInstanceDoor: true,
            instanceTarget: 'secret_room_1'
        }
    );

    console.log('Created custom instance door at (20, 0, 20)');
}

// Call this function after dungeon generation to add custom doors
// createCustomInstanceDoor();


// ============================================================================
// COMPLETE MINIMAL INTEGRATION (if you prefer to see it all at once)
// ============================================================================

/*

// At top of file:
import { DoorTransitionIntegration } from './DoorTransitionIntegration.js';

// In game object:
const game = {
    // ... all existing properties ...
    doorTransition: null,
};

// In init() function, after furniture initialization:
if (game.dungeon.furniture) {
    game.doorTransition = new DoorTransitionIntegration(game);
    game.doorTransition.addTestInstanceDoors();
}

// Replace tryInteractWithFurniture():
function tryInteractWithFurniture() {
    if (!game.doorTransition) return;
    if (game.doorTransition.isInputBlocked()) return;
    game.doorTransition.tryInteractWithNearbyFurniture();
}

// At start of updateMovement():
if (game.doorTransition && game.doorTransition.isInputBlocked()) {
    game.movement.velocity.x = 0;
    game.movement.velocity.z = 0;
    return;
}

// In animate():
if (game.doorTransition) {
    game.doorTransition.updateInteractionUI();
}

// In attack handling:
if (game.input.attack && !game.player.isAttacking) {
    if (game.doorTransition && game.doorTransition.isInputBlocked()) {
        game.input.attack = false;
    } else {
        // normal attack code
    }
}

*/
