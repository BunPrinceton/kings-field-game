import * as THREE from 'three';
import { DoorTransition } from './DoorTransition.js';
import { FurnitureType } from './FurnitureManager.js';

/**
 * Integration helper for door transitions in the main game
 * Handles the connection between furniture interaction and door animations
 */
export class DoorTransitionIntegration {
    constructor(game) {
        this.game = game;
        this.doorTransition = null;
        this.inputBlocked = false;

        // Initialize door transition system
        if (game.camera && game.audio) {
            this.doorTransition = new DoorTransition(
                game.scene,
                game.camera,
                game.audio
            );
        }
    }

    /**
     * Check if input should be blocked during transition
     */
    isInputBlocked() {
        return this.inputBlocked || (this.doorTransition && this.doorTransition.isTransitionPlaying());
    }

    /**
     * Try to interact with furniture near player
     * Returns interaction result or null
     */
    tryInteractWithNearbyFurniture() {
        if (!this.game.dungeon.furniture) return null;

        const furnitureManager = this.game.dungeon.furniture.getFurnitureManager();
        if (!furnitureManager) return null;

        // Find nearest interactable furniture
        const playerPos = new THREE.Vector3(
            this.game.player.position.x,
            this.game.player.position.y,
            this.game.player.position.z
        );

        let nearestFurniture = null;
        let nearestDistance = 2.5; // Interaction range

        for (const [furniture, data] of furnitureManager.interactables) {
            const furniturePos = furniture.position;
            const distance = playerPos.distanceTo(furniturePos);

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestFurniture = furniture;
            }
        }

        if (!nearestFurniture) return null;

        // Try to interact
        const result = furnitureManager.interact(nearestFurniture);

        // Handle instance door interaction
        if (result && result.type === 'instance_door') {
            this.handleInstanceDoorInteraction(result);
            return result;
        }

        return result;
    }

    /**
     * Handle instance door interaction with transition
     */
    handleInstanceDoorInteraction(interactionResult) {
        if (!this.doorTransition) {
            console.warn('Door transition system not initialized');
            return;
        }

        // Block input during transition
        this.inputBlocked = true;

        console.log('Starting door transition:', interactionResult.doorType);

        // Play door transition
        this.doorTransition.playTransition(
            interactionResult.furnitureObject,
            interactionResult.doorType,
            () => {
                // This callback is called during the fade to black
                // Here you would load the new instance/room
                console.log('Loading instance:', interactionResult.instanceTarget);

                // TODO: Implement actual instance loading here
                // For now, just teleport the player slightly forward
                this.teleportPlayerThroughDoor();

                // Unblock input after transition completes
                setTimeout(() => {
                    this.inputBlocked = false;
                }, 500);
            }
        );
    }

    /**
     * Teleport player through door (temporary placeholder for instance loading)
     */
    teleportPlayerThroughDoor() {
        // Move player forward through the door
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(this.game.camera.quaternion);

        this.game.player.position.x += forward.x * 3;
        this.game.player.position.z += forward.z * 3;

        console.log('Player teleported through door');
    }

    /**
     * Create an example instance door for testing
     */
    createExampleInstanceDoor(position, rotation = 0) {
        if (!this.game.dungeon.furniture) {
            console.warn('Furniture system not initialized');
            return;
        }

        const furnitureManager = this.game.dungeon.furniture.getFurnitureManager();

        // Create a glowing ornate door as an instance portal
        const door = furnitureManager.createFurniture(
            FurnitureType.ORNATE_DOOR,
            position,
            {
                rotation: rotation,
                interactable: true,
                isInstanceDoor: true,
                instanceTarget: 'test_instance_room_1'
            }
        );

        console.log('Created instance door at', position);
        return door;
    }

    /**
     * Add multiple test instance doors to the dungeon
     */
    addTestInstanceDoors() {
        if (!this.game.dungeon.data || !this.game.dungeon.data.rooms) {
            console.warn('Dungeon not generated');
            return;
        }

        const rooms = this.game.dungeon.data.rooms;
        const cellSize = 4;

        // Add instance doors to a few random rooms
        const numTestDoors = Math.min(3, rooms.length);
        const selectedRooms = [];

        for (let i = 0; i < numTestDoors; i++) {
            const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
            if (selectedRooms.includes(randomRoom)) continue;

            selectedRooms.push(randomRoom);

            // Place door at room center
            const centerX = (randomRoom.x + randomRoom.width / 2) * cellSize;
            const centerZ = (randomRoom.y + randomRoom.height / 2) * cellSize;

            // Choose a random door type
            const doorTypes = [
                FurnitureType.WOODEN_DOOR,
                FurnitureType.IRON_DOOR,
                FurnitureType.ORNATE_DOOR
            ];
            const doorType = doorTypes[i % doorTypes.length];

            this.createExampleInstanceDoor(
                { x: centerX, y: 0, z: centerZ },
                Math.random() * Math.PI * 2
            );

            console.log(`Added test instance door ${i + 1}/${numTestDoors} in room at (${centerX}, ${centerZ})`);
        }

        console.log(`Added ${numTestDoors} test instance doors to dungeon`);
    }

    /**
     * Get UI prompt text for nearest interactable
     */
    getInteractionPrompt() {
        if (!this.game.dungeon.furniture) return null;

        const furnitureManager = this.game.dungeon.furniture.getFurnitureManager();
        if (!furnitureManager) return null;

        // Find nearest interactable furniture
        const playerPos = new THREE.Vector3(
            this.game.player.position.x,
            this.game.player.position.y,
            this.game.player.position.z
        );

        let nearestFurniture = null;
        let nearestDistance = 2.5;

        for (const [furniture, data] of furnitureManager.interactables) {
            const furniturePos = furniture.position;
            const distance = playerPos.distanceTo(furniturePos);

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestFurniture = furniture;
            }
        }

        if (!nearestFurniture) return null;

        // Check if it's an instance door
        if (furnitureManager.isInstanceDoor(nearestFurniture)) {
            return 'Press E to Enter';
        }

        // Regular furniture
        const type = nearestFurniture.userData.furnitureType;
        if (type === FurnitureType.WOODEN_DOOR ||
            type === FurnitureType.IRON_DOOR ||
            type === FurnitureType.ORNATE_DOOR ||
            type === FurnitureType.REINFORCED_DOOR) {
            return 'Press E to Open';
        }

        return 'Press E';
    }

    /**
     * Update interaction prompt display
     */
    updateInteractionUI() {
        const prompt = this.getInteractionPrompt();

        // Find or create interaction prompt element
        let promptElement = document.getElementById('interaction-prompt');

        if (!promptElement) {
            promptElement = document.createElement('div');
            promptElement.id = 'interaction-prompt';
            promptElement.style.position = 'fixed';
            promptElement.style.bottom = '150px';
            promptElement.style.left = '50%';
            promptElement.style.transform = 'translateX(-50%)';
            promptElement.style.color = 'white';
            promptElement.style.fontSize = '18px';
            promptElement.style.fontFamily = 'monospace';
            promptElement.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
            promptElement.style.pointerEvents = 'none';
            promptElement.style.zIndex = '1000';
            promptElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            promptElement.style.padding = '10px 20px';
            promptElement.style.borderRadius = '5px';
            document.body.appendChild(promptElement);
        }

        if (prompt) {
            promptElement.textContent = prompt;
            promptElement.style.display = 'block';
        } else {
            promptElement.style.display = 'none';
        }
    }

    /**
     * Dispose of door transition system
     */
    dispose() {
        if (this.doorTransition) {
            this.doorTransition.dispose();
            this.doorTransition = null;
        }

        const promptElement = document.getElementById('interaction-prompt');
        if (promptElement) {
            promptElement.remove();
        }
    }
}
