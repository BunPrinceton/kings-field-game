import * as THREE from 'three';

/**
 * HitEffects - Manages visual effects for combat hits
 * Handles particle effects and screen shake
 */
export class HitEffects {
  /**
   * Create a new HitEffects instance
   * @param {THREE.Scene} scene - The Three.js scene
   */
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.screenShake = {
      active: false,
      intensity: 0,
      duration: 0,
      elapsed: 0,
      offset: new THREE.Vector3(0, 0, 0)
    };
  }

  /**
   * Create particle burst at hit location
   * @param {THREE.Vector3} position - World position for particles
   * @param {number} color - Hex color for particles (default: 0xff0000)
   */
  createHitParticles(position, color = 0xff0000) {
    const particleCount = 12;
    const particleGeometry = new THREE.SphereGeometry(0.05, 4, 4);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 1.0
    });

    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(particleGeometry.clone(), particleMaterial.clone());

      // Position at hit location
      particle.position.copy(position);

      // Random velocity
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 1.5 + Math.random() * 1;
      particle.userData.velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.random() * 2 + 1,  // Upward bias
        Math.sin(angle) * speed
      );

      particle.userData.lifetime = 0.5;  // seconds
      particle.userData.age = 0;

      this.scene.add(particle);
      this.particles.push(particle);
    }
  }

  /**
   * Trigger screen shake effect
   * @param {number} intensity - Shake intensity (default: 0.1)
   * @param {number} duration - Shake duration in seconds (default: 0.15)
   */
  triggerScreenShake(intensity = 0.1, duration = 0.15) {
    this.screenShake.active = true;
    this.screenShake.intensity = intensity;
    this.screenShake.duration = duration;
    this.screenShake.elapsed = 0;
  }

  /**
   * Update particles and screen shake effects
   * @param {number} deltaTime - Time elapsed since last update in seconds
   * @param {THREE.Camera} camera - Camera object (currently unused but kept for compatibility)
   */
  update(deltaTime, camera) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.userData.age += deltaTime;

      // Move particle
      particle.position.x += particle.userData.velocity.x * deltaTime;
      particle.position.y += particle.userData.velocity.y * deltaTime;
      particle.position.z += particle.userData.velocity.z * deltaTime;

      // Apply gravity
      particle.userData.velocity.y -= 5 * deltaTime;

      // Fade out
      const lifeRatio = particle.userData.age / particle.userData.lifetime;
      particle.material.opacity = 1 - lifeRatio;
      particle.scale.setScalar(1 - lifeRatio * 0.5);

      // Remove dead particles
      if (particle.userData.age >= particle.userData.lifetime) {
        this.scene.remove(particle);
        particle.geometry.dispose();
        particle.material.dispose();
        this.particles.splice(i, 1);
      }
    }

    // Update screen shake
    if (this.screenShake.active) {
      this.screenShake.elapsed += deltaTime;

      if (this.screenShake.elapsed >= this.screenShake.duration) {
        // End shake
        this.screenShake.active = false;
        this.screenShake.offset.set(0, 0, 0);
      } else {
        // Calculate shake intensity (fade out over time)
        const progress = this.screenShake.elapsed / this.screenShake.duration;
        const currentIntensity = this.screenShake.intensity * (1 - progress);

        // Random offset
        this.screenShake.offset.set(
          (Math.random() - 0.5) * currentIntensity * 2,
          (Math.random() - 0.5) * currentIntensity * 2,
          0
        );
      }
    }
  }

  /**
   * Get current shake offset for camera
   * @returns {THREE.Vector3} Current shake offset vector
   */
  getShakeOffset() {
    return this.screenShake.offset;
  }

  /**
   * Clear all effects and cleanup resources
   */
  clear() {
    // Remove all particles
    for (const particle of this.particles) {
      this.scene.remove(particle);
      particle.geometry.dispose();
      particle.material.dispose();
    }
    this.particles = [];

    // Reset shake
    this.screenShake.active = false;
    this.screenShake.offset.set(0, 0, 0);
  }
}
