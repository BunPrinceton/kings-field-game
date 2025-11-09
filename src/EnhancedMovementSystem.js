/**
 * Enhanced Movement System
 * Provides modern first-person movement with improved feel and polish
 */

import * as THREE from 'three';

export class EnhancedMovementSystem {
    constructor(camera, player, config = {}) {
        this.camera = camera;
        this.player = player;

        // Movement configuration - tweaked for better feel
        this.config = {
            // Base movement
            walkSpeed: config.walkSpeed || 4.0,
            sprintSpeed: config.sprintSpeed || 7.0,
            crouchSpeed: config.crouchSpeed || 2.0,

            // Acceleration curves for weightier feel
            acceleration: config.acceleration || 8.0,  // Faster acceleration
            deceleration: config.deceleration || 12.0, // Faster stop
            airAcceleration: config.airAcceleration || 2.0, // For future jumping

            // Advanced movement
            dashSpeed: config.dashSpeed || 15.0,
            dashDuration: config.dashDuration || 0.25,
            dashCooldown: config.dashCooldown || 1.0,
            slideSpeed: config.slideSpeed || 10.0,
            slideDuration: config.slideDuration || 0.8,

            // Camera effects
            headBobIntensity: config.headBobIntensity || 0.02,
            headBobSpeed: config.headBobSpeed || 10,
            strafeTilt: config.strafeTilt || 0.03, // Camera tilt when strafing
            landingBob: config.landingBob || 0.1,

            // Mouse sensitivity
            mouseSensitivity: config.mouseSensitivity || 0.002,
            aimDownSightsSensitivity: config.aimDownSightsSensitivity || 0.001,
            smoothing: config.smoothing || 0.15, // Mouse smoothing factor

            // Physical properties
            mass: config.mass || 1.0, // Affects momentum
            groundFriction: config.groundFriction || 0.9,
            airFriction: config.airFriction || 0.98,

            ...config
        };

        // State tracking
        this.state = {
            // Velocity and position
            velocity: new THREE.Vector3(0, 0, 0),
            targetVelocity: new THREE.Vector3(0, 0, 0),

            // Movement flags
            isMoving: false,
            isSprinting: false,
            isCrouching: false,
            isDashing: false,
            isSliding: false,
            isAiming: false,

            // Timers
            dashTimer: 0,
            dashCooldownTimer: 0,
            slideTimer: 0,
            footstepTimer: 0,

            // Camera effects
            headBobPhase: 0,
            currentTilt: 0,
            targetTilt: 0,
            cameraShakeAmount: 0,

            // Input smoothing
            smoothedMouseX: 0,
            smoothedMouseY: 0,
            lastMouseX: 0,
            lastMouseY: 0,

            // Double tap detection
            lastShiftPress: 0,
            lastCtrlPress: 0
        };

        // Movement curve for better feel
        this.movementCurve = {
            evaluate: (t) => {
                // Smooth ease-in-out curve
                return t * t * (3.0 - 2.0 * t);
            }
        };
    }

    /**
     * Update movement system
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {Object} input - Input state object
     */
    update(deltaTime, input) {
        // Update timers
        this.updateTimers(deltaTime);

        // Calculate desired movement
        const moveInput = this.calculateMoveInput(input);

        // Apply movement modifiers (sprint, crouch, dash, etc.)
        const speed = this.calculateCurrentSpeed();

        // Calculate target velocity based on input
        this.calculateTargetVelocity(moveInput, speed);

        // Apply acceleration/deceleration with momentum
        this.applyAcceleration(deltaTime);

        // Apply special movement (dash, slide)
        this.applySpecialMovement(deltaTime);

        // Update camera effects
        this.updateCameraEffects(deltaTime, moveInput);

        // Check if moving for other systems
        this.state.isMoving = this.velocity.length() > 0.1;

        return this.velocity;
    }

    /**
     * Calculate movement input from keyboard
     */
    calculateMoveInput(input) {
        const moveInput = new THREE.Vector3();

        // Forward/backward
        if (input.forward) moveInput.z -= 1;
        if (input.backward) moveInput.z += 1;

        // Strafe left/right
        if (input.left) moveInput.x -= 1;
        if (input.right) moveInput.x += 1;

        // Normalize diagonal movement
        if (moveInput.length() > 1) {
            moveInput.normalize();
        }

        return moveInput;
    }

    /**
     * Calculate current movement speed based on state
     */
    calculateCurrentSpeed() {
        if (this.state.isDashing) return this.config.dashSpeed;
        if (this.state.isSliding) return this.config.slideSpeed;
        if (this.state.isCrouching) return this.config.crouchSpeed;
        if (this.state.isSprinting) return this.config.sprintSpeed;
        return this.config.walkSpeed;
    }

    /**
     * Calculate target velocity based on input and camera direction
     */
    calculateTargetVelocity(moveInput, speed) {
        if (moveInput.length() === 0) {
            this.state.targetVelocity.set(0, 0, 0);
            return;
        }

        // Get camera forward and right vectors (yaw only, no pitch)
        const yaw = this.camera.rotation.y;
        const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
        const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

        // Calculate world-space movement direction
        this.state.targetVelocity.copy(forward).multiplyScalar(-moveInput.z);
        this.state.targetVelocity.add(right.multiplyScalar(moveInput.x));
        this.state.targetVelocity.multiplyScalar(speed);
    }

    /**
     * Apply smooth acceleration/deceleration with momentum
     */
    applyAcceleration(deltaTime) {
        const targetSpeed = this.state.targetVelocity.length();
        const currentSpeed = this.velocity.length();

        if (targetSpeed > 0.01) {
            // Accelerating - use acceleration curve for better feel
            const accelRate = this.config.acceleration;
            const t = Math.min(deltaTime * accelRate, 1.0);
            const smoothT = this.movementCurve.evaluate(t);

            this.velocity.lerp(this.state.targetVelocity, smoothT);
        } else {
            // Decelerating - apply friction
            const friction = this.config.groundFriction;
            const decelRate = this.config.deceleration;

            // Combine friction and active deceleration
            const frictionFactor = Math.pow(friction, deltaTime * 60);
            const decelFactor = Math.max(0, 1 - decelRate * deltaTime);

            this.velocity.multiplyScalar(frictionFactor * decelFactor);

            // Stop completely when very slow
            if (this.velocity.length() < 0.01) {
                this.velocity.set(0, 0, 0);
            }
        }
    }

    /**
     * Handle special movement abilities (dash, slide)
     */
    applySpecialMovement(deltaTime) {
        // Dash movement
        if (this.state.isDashing && this.state.dashTimer > 0) {
            // Override velocity with dash direction
            const dashDirection = this.state.targetVelocity.clone().normalize();
            if (dashDirection.length() > 0) {
                this.velocity.copy(dashDirection).multiplyScalar(this.config.dashSpeed);
            }
        }

        // Slide movement (crouch while sprinting)
        if (this.state.isSliding && this.state.slideTimer > 0) {
            // Maintain momentum while sliding
            const slideFriction = 0.95;
            this.velocity.multiplyScalar(Math.pow(slideFriction, deltaTime * 60));
        }
    }

    /**
     * Update camera effects for immersion
     */
    updateCameraEffects(deltaTime, moveInput) {
        // Head bob while moving
        if (this.state.isMoving && !this.state.isDashing) {
            const bobSpeed = this.config.headBobSpeed * (this.state.isSprinting ? 1.3 : 1.0);
            this.state.headBobPhase += bobSpeed * deltaTime;

            const bobX = Math.sin(this.state.headBobPhase) * this.config.headBobIntensity;
            const bobY = Math.abs(Math.cos(this.state.headBobPhase * 2)) * this.config.headBobIntensity;

            // Apply head bob to camera
            this.camera.position.y = this.player.position.y + bobY;

            // Subtle weapon sway
            if (this.onHeadBob) {
                this.onHeadBob(bobX, bobY);
            }
        } else {
            // Return to neutral position
            this.state.headBobPhase *= 0.9;
        }

        // Camera tilt when strafing
        this.state.targetTilt = -moveInput.x * this.config.strafeTilt;
        this.state.currentTilt = THREE.MathUtils.lerp(
            this.state.currentTilt,
            this.state.targetTilt,
            10 * deltaTime
        );
        this.camera.rotation.z = this.state.currentTilt;

        // Camera shake (if any)
        if (this.state.cameraShakeAmount > 0) {
            const shake = new THREE.Vector3(
                (Math.random() - 0.5) * this.state.cameraShakeAmount,
                (Math.random() - 0.5) * this.state.cameraShakeAmount,
                (Math.random() - 0.5) * this.state.cameraShakeAmount
            );
            this.camera.position.add(shake);
            this.state.cameraShakeAmount *= 0.9; // Decay shake
        }
    }

    /**
     * Update various timers
     */
    updateTimers(deltaTime) {
        // Dash timers
        if (this.state.dashTimer > 0) {
            this.state.dashTimer -= deltaTime;
            if (this.state.dashTimer <= 0) {
                this.state.isDashing = false;
            }
        }
        if (this.state.dashCooldownTimer > 0) {
            this.state.dashCooldownTimer -= deltaTime;
        }

        // Slide timer
        if (this.state.slideTimer > 0) {
            this.state.slideTimer -= deltaTime;
            if (this.state.slideTimer <= 0) {
                this.state.isSliding = false;
            }
        }

        // Footstep timer
        if (this.state.footstepTimer > 0) {
            this.state.footstepTimer -= deltaTime;
        }
    }

    /**
     * Handle sprint input
     */
    startSprint() {
        this.state.isSprinting = true;
    }

    stopSprint() {
        this.state.isSprinting = false;
    }

    /**
     * Handle crouch input
     */
    startCrouch() {
        if (this.state.isSprinting && this.velocity.length() > 5) {
            // Start sliding if sprinting fast enough
            this.state.isSliding = true;
            this.state.slideTimer = this.config.slideDuration;
        }
        this.state.isCrouching = true;
    }

    stopCrouch() {
        this.state.isCrouching = false;
        this.state.isSliding = false;
    }

    /**
     * Trigger dash ability
     */
    triggerDash() {
        if (this.state.dashCooldownTimer <= 0) {
            this.state.isDashing = true;
            this.state.dashTimer = this.config.dashDuration;
            this.state.dashCooldownTimer = this.config.dashCooldown;

            // Add camera shake for impact
            this.addCameraShake(0.05);

            return true;
        }
        return false;
    }

    /**
     * Add camera shake effect
     */
    addCameraShake(amount) {
        this.state.cameraShakeAmount = Math.min(this.state.cameraShakeAmount + amount, 0.2);
    }

    /**
     * Handle mouse movement with smoothing
     */
    handleMouseMove(deltaX, deltaY) {
        // Apply smoothing for more fluid camera movement
        this.state.smoothedMouseX = THREE.MathUtils.lerp(
            this.state.smoothedMouseX,
            deltaX,
            this.config.smoothing
        );
        this.state.smoothedMouseY = THREE.MathUtils.lerp(
            this.state.smoothedMouseY,
            deltaY,
            this.config.smoothing
        );

        // Apply sensitivity
        const sensitivity = this.state.isAiming ?
            this.config.aimDownSightsSensitivity :
            this.config.mouseSensitivity;

        return {
            x: this.state.smoothedMouseX * sensitivity,
            y: this.state.smoothedMouseY * sensitivity
        };
    }

    /**
     * Check if footstep sound should play
     */
    shouldPlayFootstep() {
        if (!this.state.isMoving || this.state.footstepTimer > 0) {
            return false;
        }

        // Calculate footstep interval based on speed
        const baseInterval = this.state.isSprinting ? 0.3 : 0.45;
        const speedFactor = this.velocity.length() / this.config.walkSpeed;
        const interval = baseInterval / Math.max(speedFactor, 0.5);

        this.state.footstepTimer = interval;
        return true;
    }

    /**
     * Get current movement state for UI/debugging
     */
    getState() {
        return {
            speed: this.velocity.length().toFixed(1),
            isSprinting: this.state.isSprinting,
            isCrouching: this.state.isCrouching,
            isDashing: this.state.isDashing,
            isSliding: this.state.isSliding,
            dashCooldown: Math.max(0, this.state.dashCooldownTimer).toFixed(1)
        };
    }
}