import * as THREE from 'three';
import { FurnitureType } from './FurnitureManager.js';

/**
 * DoorTransition - Resident Evil style door opening transitions
 * Creates cinematic first-person door opening animations with camera movement
 * Supports different door types with unique animations and sounds
 */
export class DoorTransition {
    constructor(scene, camera, audioManager) {
        this.scene = scene;
        this.camera = camera;
        this.audioManager = audioManager;

        // Animation state
        this.isPlaying = false;
        this.currentAnimation = null;
        this.onCompleteCallback = null;
        this.originalCameraRotation = null;

        // Transition overlay for fade effects
        this.overlay = this.createOverlay();

        // Door animation objects (will be created during animation)
        this.doorGroup = null;
        this.doorMesh = null;
        this.handleMesh = null;
    }

    /**
     * Create fullscreen overlay for fade effects
     */
    createOverlay() {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'black';
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '9999';
        overlay.style.transition = 'opacity 0.5s';
        document.body.appendChild(overlay);
        return overlay;
    }

    /**
     * Check if a transition is currently playing
     */
    isTransitionPlaying() {
        return this.isPlaying;
    }

    /**
     * Play door transition animation
     * @param {THREE.Object3D} doorObject - The door furniture object
     * @param {string} doorType - Type of door (wooden_door, iron_door, ornate_door)
     * @param {Function} onComplete - Callback when animation completes
     */
    playTransition(doorObject, doorType, onComplete) {
        if (this.isPlaying) {
            console.warn('Door transition already playing');
            return;
        }

        this.isPlaying = true;
        this.onCompleteCallback = onComplete;
        this.originalCameraRotation = {
            x: this.camera.rotation.x,
            y: this.camera.rotation.y,
            z: this.camera.rotation.z
        };

        // Get door animation configuration
        const config = this.getDoorConfig(doorType);

        // Create door animation objects in camera space
        this.createDoorAnimationObjects(doorObject, config);

        // Play the animation sequence
        this.playAnimationSequence(config);
    }

    /**
     * Get animation configuration for door type
     */
    getDoorConfig(doorType) {
        const configs = {
            [FurnitureType.WOODEN_DOOR]: {
                handleTurnDuration: 400,
                doorSwingDuration: 1200,
                cameraMoveDuration: 800,
                handleTurnAngle: Math.PI / 4,
                doorSwingAngle: Math.PI / 2,
                cameraForwardDistance: 2.5,
                sounds: {
                    handleTurn: 'door_handle_wood',
                    doorCreak: 'door_creak_wood',
                    doorOpen: 'door_open_wood',
                    footstep: 'door_footstep'
                },
                doorColor: 0x4a3020,
                handleColor: 0x5a5a5a
            },
            [FurnitureType.IRON_DOOR]: {
                handleTurnDuration: 600,
                doorSwingDuration: 1600,
                cameraMoveDuration: 1000,
                handleTurnAngle: Math.PI / 6,
                doorSwingAngle: Math.PI / 2.5,
                cameraForwardDistance: 2.8,
                sounds: {
                    handleTurn: 'door_handle_metal',
                    doorCreak: 'door_creak_metal',
                    doorOpen: 'door_open_heavy',
                    footstep: 'door_footstep_slow'
                },
                doorColor: 0x3a3a3a,
                handleColor: 0x2a2a2a
            },
            [FurnitureType.ORNATE_DOOR]: {
                handleTurnDuration: 500,
                doorSwingDuration: 1400,
                cameraMoveDuration: 900,
                handleTurnAngle: Math.PI / 3,
                doorSwingAngle: Math.PI / 1.8,
                cameraForwardDistance: 3.0,
                sounds: {
                    handleTurn: 'door_handle_ornate',
                    doorCreak: 'door_creak_ornate',
                    doorOpen: 'door_open_grand',
                    footstep: 'door_footstep_confident'
                },
                doorColor: 0x6a4a2a,
                handleColor: 0xffaa00
            },
            [FurnitureType.REINFORCED_DOOR]: {
                handleTurnDuration: 700,
                doorSwingDuration: 1800,
                cameraMoveDuration: 1100,
                handleTurnAngle: Math.PI / 8,
                doorSwingAngle: Math.PI / 3,
                cameraForwardDistance: 2.6,
                sounds: {
                    handleTurn: 'door_handle_metal',
                    doorCreak: 'door_creak_metal',
                    doorOpen: 'door_open_heavy',
                    footstep: 'door_footstep_slow'
                },
                doorColor: 0x3a2a1a,
                handleColor: 0x4a4a4a
            }
        };

        return configs[doorType] || configs[FurnitureType.WOODEN_DOOR];
    }

    /**
     * Create 3D door objects in camera space for animation
     */
    createDoorAnimationObjects(doorObject, config) {
        // Remove any existing door animation objects
        if (this.doorGroup) {
            this.camera.remove(this.doorGroup);
        }

        // Create a group to hold the door in camera space
        this.doorGroup = new THREE.Group();

        // Position the door slightly in front of camera
        this.doorGroup.position.set(0, -0.5, -1.5);

        // Create door panel
        const doorGeometry = new THREE.BoxGeometry(1.6, 2.4, 0.1);
        const doorMaterial = new THREE.MeshStandardMaterial({
            color: config.doorColor,
            roughness: 0.8,
            metalness: 0.1
        });
        this.doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);

        // Door pivot point is at the left edge for opening
        this.doorMesh.position.x = 0.8; // Offset so pivot is at left edge
        this.doorGroup.add(this.doorMesh);

        // Create door handle
        const handleGeometry = new THREE.SphereGeometry(0.06, 16, 16);
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: config.handleColor,
            roughness: 0.4,
            metalness: 0.8
        });
        this.handleMesh = new THREE.Mesh(handleGeometry, handleMaterial);
        this.handleMesh.position.set(1.2, 0, 0.08);
        this.doorGroup.add(this.handleMesh);

        // Add handle shaft
        const shaftGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8);
        const shaft = new THREE.Mesh(shaftGeometry, handleMaterial);
        shaft.rotation.z = Math.PI / 2;
        shaft.position.set(1.1, 0, 0.08);
        this.doorGroup.add(shaft);

        // Add some detail based on door type
        this.addDoorDetails(config);

        // Add to camera
        this.camera.add(this.doorGroup);

        // Add lighting for the door
        const doorLight = new THREE.PointLight(0xffffff, 0.5, 3);
        doorLight.position.set(0, 0, -1);
        this.camera.add(doorLight);

        // Store light for cleanup
        this.doorLight = doorLight;
    }

    /**
     * Add decorative details to door based on type
     */
    addDoorDetails(config) {
        // Add cross beams for wooden/reinforced doors
        if (config.doorColor === 0x4a3020 || config.doorColor === 0x3a2a1a) {
            const beamGeometry = new THREE.BoxGeometry(1.4, 0.08, 0.12);
            const beamMaterial = new THREE.MeshStandardMaterial({
                color: config.doorColor,
                roughness: 0.9
            });

            const topBeam = new THREE.Mesh(beamGeometry, beamMaterial);
            topBeam.position.set(0.8, 0.8, 0);
            this.doorGroup.add(topBeam);

            const bottomBeam = new THREE.Mesh(beamGeometry, beamMaterial);
            bottomBeam.position.set(0.8, -0.8, 0);
            this.doorGroup.add(bottomBeam);
        }

        // Add decorative elements for ornate door
        if (config.doorColor === 0x6a4a2a) {
            const ornamentGeometry = new THREE.SphereGeometry(0.08, 16, 16);
            const ornamentMaterial = new THREE.MeshStandardMaterial({
                color: 0xffaa00,
                roughness: 0.3,
                metalness: 0.9
            });

            const ornament = new THREE.Mesh(ornamentGeometry, ornamentMaterial);
            ornament.position.set(0.8, 1.0, 0.08);
            this.doorGroup.add(ornament);
        }
    }

    /**
     * Play the complete animation sequence
     */
    async playAnimationSequence(config) {
        try {
            // Phase 1: Handle turn
            this.playSound(config.sounds.handleTurn);
            await this.animateHandleTurn(config);

            // Small pause
            await this.wait(100);

            // Phase 2: Door swing
            this.playSound(config.sounds.doorCreak);
            await this.animateDoorSwing(config);

            // Phase 3: Camera move through door
            this.playSound(config.sounds.footstep);
            await this.animateCameraForward(config);

            // Phase 4: Fade to black
            await this.fadeToBlack();

            // Cleanup door objects
            this.cleanupDoorObjects();

            // Phase 5: Call completion callback (instance load happens here)
            if (this.onCompleteCallback) {
                this.onCompleteCallback();
            }

            // Phase 6: Fade from black
            await this.fadeFromBlack();

            // Reset state
            this.isPlaying = false;
            this.currentAnimation = null;
            this.onCompleteCallback = null;

        } catch (error) {
            console.error('Door transition error:', error);
            this.isPlaying = false;
            this.cleanupDoorObjects();
        }
    }

    /**
     * Animate handle turning
     */
    animateHandleTurn(config) {
        return new Promise(resolve => {
            const startTime = Date.now();
            const duration = config.handleTurnDuration;
            const startRotation = this.handleMesh.rotation.z;
            const targetRotation = startRotation + config.handleTurnAngle;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = this.easeInOutQuad(progress);

                this.handleMesh.rotation.z = startRotation + (targetRotation - startRotation) * eased;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            animate();
        });
    }

    /**
     * Animate door swinging open
     */
    animateDoorSwing(config) {
        return new Promise(resolve => {
            const startTime = Date.now();
            const duration = config.doorSwingDuration;
            const startRotation = this.doorGroup.rotation.y;
            const targetRotation = startRotation - config.doorSwingAngle;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = this.easeInOutCubic(progress);

                this.doorGroup.rotation.y = startRotation + (targetRotation - startRotation) * eased;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            animate();
        });
    }

    /**
     * Animate camera moving forward through doorway
     */
    animateCameraForward(config) {
        return new Promise(resolve => {
            const startTime = Date.now();
            const duration = config.cameraMoveDuration;
            const startZ = this.doorGroup.position.z;
            const targetZ = startZ + config.cameraForwardDistance;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = this.easeInOutQuad(progress);

                this.doorGroup.position.z = startZ + (targetZ - startZ) * eased;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            animate();
        });
    }

    /**
     * Fade screen to black
     */
    fadeToBlack() {
        return new Promise(resolve => {
            this.overlay.style.opacity = '1';
            setTimeout(resolve, 500);
        });
    }

    /**
     * Fade screen from black
     */
    fadeFromBlack() {
        return new Promise(resolve => {
            this.overlay.style.opacity = '0';
            setTimeout(resolve, 500);
        });
    }

    /**
     * Cleanup door animation objects
     */
    cleanupDoorObjects() {
        if (this.doorGroup) {
            this.camera.remove(this.doorGroup);

            // Dispose geometries and materials
            this.doorGroup.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });

            this.doorGroup = null;
            this.doorMesh = null;
            this.handleMesh = null;
        }

        if (this.doorLight) {
            this.camera.remove(this.doorLight);
            this.doorLight = null;
        }
    }

    /**
     * Play sound through audio manager
     */
    playSound(soundName) {
        if (this.audioManager && this.audioManager.initialized) {
            // Try to play the sound, fallback to generic if not found
            this.audioManager.play('environment', soundName, 0);
        }
    }

    /**
     * Wait utility
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Easing functions
     */
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    /**
     * Dispose of transition system
     */
    dispose() {
        this.cleanupDoorObjects();

        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
    }
}
