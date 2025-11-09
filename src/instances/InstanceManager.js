// InstanceManager.js - Manages instance loading, unloading, and transitions
import * as THREE from 'three';
import { getInstanceDefinition } from './InstanceDefinitions.js';

// Import instance types (will be created next)
import { BossArenaInstance } from './types/BossArenaInstance.js';
import { GrandLibraryInstance } from './types/GrandLibraryInstance.js';
import { TreasureVaultInstance } from './types/TreasureVaultInstance.js';
import { SafeHavenInstance } from './types/SafeHavenInstance.js';
import { PuzzleChamberInstance } from './types/PuzzleChamberInstance.js';
import { ThroneRoomInstance } from './types/ThroneRoomInstance.js';
import { ChapelInstance } from './types/ChapelInstance.js';
import { WorkshopInstance } from './types/WorkshopInstance.js';

/**
 * Instance Manager - Handles instance lifecycle and transitions
 */
export class InstanceManager {
    constructor(renderer, audioManager) {
        this.renderer = renderer;
        this.audioManager = audioManager;

        // State
        this.currentInstance = null;
        this.currentInstanceId = null;
        this.isInInstance = false;
        this.isTransitioning = false;

        // Instance registry (instanceId -> instance object)
        this.instances = new Map();

        // Dungeon state to restore when exiting instance
        this.dungeonState = null;

        // Transition callbacks
        this.onEnterInstance = null;
        this.onExitInstance = null;
    }

    /**
     * Create an instance from definition ID
     */
    createInstance(instanceId) {
        const definition = getInstanceDefinition(instanceId);
        if (!definition) {
            console.error(`Instance definition not found: ${instanceId}`);
            return null;
        }

        // Add ID to definition
        const defWithId = { ...definition, id: instanceId };

        // Create appropriate instance type
        let instance;
        switch (definition.type) {
            case 'boss_arena':
                instance = new BossArenaInstance(defWithId);
                break;
            case 'grand_library':
                instance = new GrandLibraryInstance(defWithId);
                break;
            case 'treasure_vault':
                instance = new TreasureVaultInstance(defWithId);
                break;
            case 'safe_haven':
                instance = new SafeHavenInstance(defWithId);
                break;
            case 'puzzle_chamber':
                instance = new PuzzleChamberInstance(defWithId);
                break;
            case 'throne_room':
                instance = new ThroneRoomInstance(defWithId);
                break;
            case 'chapel':
                instance = new ChapelInstance(defWithId);
                break;
            case 'workshop':
                instance = new WorkshopInstance(defWithId);
                break;
            default:
                console.error(`Unknown instance type: ${definition.type}`);
                return null;
        }

        this.instances.set(instanceId, instance);
        return instance;
    }

    /**
     * Get or create instance
     */
    getOrCreateInstance(instanceId) {
        if (this.instances.has(instanceId)) {
            return this.instances.get(instanceId);
        }
        return this.createInstance(instanceId);
    }

    /**
     * Enter an instance
     */
    async enterInstance(instanceId, dungeonState, player) {
        if (this.isTransitioning) {
            console.warn('Already transitioning to an instance');
            return false;
        }

        if (this.isInInstance) {
            console.warn('Already in an instance');
            return false;
        }

        this.isTransitioning = true;

        console.log(`Entering instance: ${instanceId}`);

        // Get or create instance
        const instance = this.getOrCreateInstance(instanceId);
        if (!instance) {
            this.isTransitioning = false;
            return false;
        }

        // Check entry requirements
        if (!this.checkEntryRequirements(instance, player)) {
            this.isTransitioning = false;
            return false;
        }

        // Store dungeon state for restoration
        this.dungeonState = {
            scene: dungeonState.scene,
            playerPosition: { ...player.position },
            playerRotation: { ...player.rotation },
            enemies: dungeonState.enemies,
            camera: dungeonState.camera,
            collidableObjects: dungeonState.collidableObjects
        };

        // Show loading screen
        this.showLoadingScreen(instance.definition.name);

        // Load instance
        await instance.load();

        // Setup player in instance
        const spawnPos = instance.getSpawnPosition();
        player.position.x = spawnPos.x;
        player.position.y = spawnPos.y;
        player.position.z = spawnPos.z;
        player.rotation.y = 0; // Face forward

        // Set current instance
        this.currentInstance = instance;
        this.currentInstanceId = instanceId;
        this.isInInstance = true;
        this.isTransitioning = false;

        // Play instance music
        if (this.audioManager && instance.definition.music) {
            this.audioManager.fadeOut('ambience', 'dungeon_base', 1000);
            // Could add instance music here if audio files exist
        }

        // Hide loading screen
        this.hideLoadingScreen();

        // Callback
        if (this.onEnterInstance) {
            this.onEnterInstance(instance);
        }

        console.log(`Entered instance: ${instance.definition.name}`);
        return true;
    }

    /**
     * Exit current instance and return to dungeon
     */
    async exitInstance(player) {
        if (this.isTransitioning) {
            console.warn('Already transitioning from instance');
            return false;
        }

        if (!this.isInInstance || !this.currentInstance) {
            console.warn('Not in an instance');
            return false;
        }

        this.isTransitioning = true;

        console.log(`Exiting instance: ${this.currentInstance.definition.name}`);

        // Show loading screen
        this.showLoadingScreen('Returning to dungeon');

        // Unload instance
        this.currentInstance.unload();

        // Restore dungeon state
        if (this.dungeonState) {
            player.position.x = this.dungeonState.playerPosition.x;
            player.position.y = this.dungeonState.playerPosition.y;
            player.position.z = this.dungeonState.playerPosition.z;
            player.rotation.y = this.dungeonState.playerRotation.y;
            player.rotation.x = this.dungeonState.playerRotation.x;
        }

        // Clear current instance
        const exitedInstance = this.currentInstance;
        this.currentInstance = null;
        this.currentInstanceId = null;
        this.isInInstance = false;
        this.isTransitioning = false;

        // Restore dungeon music
        if (this.audioManager) {
            this.audioManager.fadeIn('ambience', 'dungeon_base', 2000);
        }

        // Hide loading screen
        this.hideLoadingScreen();

        // Callback
        if (this.onExitInstance) {
            this.onExitInstance(exitedInstance);
        }

        console.log('Returned to dungeon');
        return true;
    }

    /**
     * Check if player meets entry requirements
     */
    checkEntryRequirements(instance, player) {
        const requirements = instance.definition.entryRequirements;
        if (!requirements) return true;

        // Check minimum level
        if (requirements.minLevel && player.level < requirements.minLevel) {
            console.log(`Requires level ${requirements.minLevel}`);
            return false;
        }

        // Check quest flags
        if (requirements.questFlag && !player.hasQuestFlag?.(requirements.questFlag)) {
            console.log(`Requires quest: ${requirements.questFlag}`);
            return false;
        }

        return true;
    }

    /**
     * Update current instance
     */
    update(deltaTime, player) {
        if (this.isInInstance && this.currentInstance) {
            this.currentInstance.update(deltaTime, player);
        }
    }

    /**
     * Get current scene (dungeon or instance)
     */
    getCurrentScene(dungeonScene) {
        if (this.isInInstance && this.currentInstance) {
            return this.currentInstance.scene;
        }
        return dungeonScene;
    }

    /**
     * Check if player can exit instance
     */
    canExitInstance(player) {
        if (!this.isInInstance || !this.currentInstance) return false;

        // Check if instance is locked
        if (this.currentInstance.isLocked) {
            console.log('Instance is locked - complete objectives to unlock exit');
            return false;
        }

        // Check if player is near exit portal
        return this.currentInstance.isPlayerNearExit(player.position);
    }

    /**
     * Show loading screen
     */
    showLoadingScreen(text) {
        let loadingDiv = document.getElementById('instance-loading');
        if (!loadingDiv) {
            loadingDiv = document.createElement('div');
            loadingDiv.id = 'instance-loading';
            loadingDiv.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                font-family: 'Courier New', monospace;
                font-size: 24px;
                color: #fff;
            `;
            document.body.appendChild(loadingDiv);
        }
        loadingDiv.textContent = text || 'Loading...';
        loadingDiv.style.display = 'flex';
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingDiv = document.getElementById('instance-loading');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
    }

    /**
     * Serialize instance states for saving
     */
    serializeStates() {
        const states = {};
        for (const [id, instance] of this.instances) {
            states[id] = instance.serialize();
        }
        return {
            instanceStates: states,
            currentInstanceId: this.currentInstanceId,
            isInInstance: this.isInInstance
        };
    }

    /**
     * Restore instance states from save
     */
    deserializeStates(data) {
        if (!data || !data.instanceStates) return;

        for (const [id, state] of Object.entries(data.instanceStates)) {
            const instance = this.getOrCreateInstance(id);
            if (instance) {
                instance.deserialize(state);
            }
        }
    }

    /**
     * Get instance metadata
     */
    getInstanceMetadata(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            const definition = getInstanceDefinition(instanceId);
            return definition ? {
                name: definition.name,
                description: definition.description,
                type: definition.type,
                isCompleted: false,
                visitCount: 0
            } : null;
        }

        return {
            name: instance.definition.name,
            description: instance.definition.description,
            type: instance.definition.type,
            isCompleted: instance.isCompleted,
            visitCount: instance.visitCount,
            isLocked: instance.isLocked
        };
    }

    /**
     * Cleanup
     */
    cleanup() {
        // Unload all instances
        for (const instance of this.instances.values()) {
            if (instance.isLoaded) {
                instance.unload();
            }
        }
        this.instances.clear();
        this.currentInstance = null;
        this.currentInstanceId = null;
        this.isInInstance = false;
    }
}
