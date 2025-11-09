import * as THREE from 'three';

/**
 * ViewmodelRenderer - Renders first-person viewmodel (hands + weapon)
 * Uses a separate camera and render pass to prevent clipping
 */
export class ViewmodelRenderer {
  constructor(scene, mainCamera, renderer) {
    this.mainScene = scene;
    this.mainCamera = mainCamera;
    this.renderer = renderer;

    // Create separate scene and camera for viewmodel
    this.viewmodelScene = new THREE.Scene();

    // Viewmodel camera - narrow FOV to prevent fisheye distortion
    this.viewmodelCamera = new THREE.PerspectiveCamera(
      50, // Narrower FOV than main camera
      window.innerWidth / window.innerHeight,
      0.01, // Very close near plane
      2 // Short far plane - only render viewmodel
    );

    // Animation state
    this.bobTime = 0;
    this.swayTime = 0;
    this.attackProgress = 0;
    this.isAttacking = false;

    // Create viewmodel group (hands + weapon)
    this.viewmodelGroup = new THREE.Group();
    this.viewmodelScene.add(this.viewmodelGroup);

    // Add lighting for the viewmodel
    this.setupLighting();

    // Create hands and weapon
    this.createHands();
    this.createSword();

    // Position the viewmodel
    this.resetPosition();
  }

  /**
   * Setup lighting for the viewmodel
   */
  setupLighting() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.viewmodelScene.add(ambient);

    // Directional light from upper right
    const directional = new THREE.DirectionalLight(0xffffff, 0.5);
    directional.position.set(1, 1, 0.5);
    this.viewmodelScene.add(directional);

    // Rim light from behind for edge highlighting
    const rim = new THREE.DirectionalLight(0xccddff, 0.3);
    rim.position.set(-0.5, 0, -1);
    this.viewmodelScene.add(rim);
  }

  /**
   * Create player hands
   */
  createHands() {
    this.hands = new THREE.Group();

    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4a574,
      roughness: 0.7,
      metalness: 0.0
    });

    // Right forearm (visible at bottom of screen)
    const rightArmGeometry = new THREE.CylinderGeometry(0.03, 0.035, 0.25, 8);
    const rightArm = new THREE.Mesh(rightArmGeometry, skinMaterial);
    rightArm.position.set(0.12, -0.18, -0.15);
    rightArm.rotation.z = -0.3;
    rightArm.rotation.x = 0.2;
    this.hands.add(rightArm);

    // Right hand
    const rightHandGeometry = new THREE.BoxGeometry(0.045, 0.08, 0.06);
    const rightHand = new THREE.Mesh(rightHandGeometry, skinMaterial);
    rightHand.position.set(0.15, -0.08, -0.08);
    rightHand.rotation.z = -0.2;
    rightHand.rotation.x = 0.3;
    this.hands.add(rightHand);

    // Left forearm
    const leftArmGeometry = new THREE.CylinderGeometry(0.028, 0.033, 0.22, 8);
    const leftArm = new THREE.Mesh(leftArmGeometry, skinMaterial);
    leftArm.position.set(-0.08, -0.15, -0.1);
    leftArm.rotation.z = 0.4;
    leftArm.rotation.x = 0.3;
    this.hands.add(leftArm);

    // Left hand (supporting weapon)
    const leftHandGeometry = new THREE.BoxGeometry(0.04, 0.07, 0.055);
    const leftHand = new THREE.Mesh(leftHandGeometry, skinMaterial);
    leftHand.position.set(-0.05, -0.05, -0.05);
    leftHand.rotation.z = 0.3;
    leftHand.rotation.x = 0.4;
    this.hands.add(leftHand);

    // Add some simple fingers to right hand
    const fingerGeometry = new THREE.BoxGeometry(0.008, 0.03, 0.008);
    for (let i = 0; i < 3; i++) {
      const finger = new THREE.Mesh(fingerGeometry, skinMaterial);
      finger.position.set(0.15 + (i - 1) * 0.012, -0.05, -0.05);
      finger.rotation.x = 0.5;
      this.hands.add(finger);
    }

    this.viewmodelGroup.add(this.hands);
  }

  /**
   * Create sword for viewmodel
   */
  createSword() {
    this.sword = new THREE.Group();

    // Blade
    const bladeGeometry = new THREE.BoxGeometry(0.03, 0.4, 0.008);
    const bladeMaterial = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0x222222,
      emissiveIntensity: 0.1
    });
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.position.y = 0.15;
    this.sword.add(blade);

    // Blade edge (brighter line down the center)
    const edgeGeometry = new THREE.BoxGeometry(0.005, 0.38, 0.001);
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.1,
      emissive: 0x444444
    });
    const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    edge.position.set(0, 0.15, 0.005);
    this.sword.add(edge);

    // Crossguard
    const guardGeometry = new THREE.BoxGeometry(0.12, 0.02, 0.02);
    const guardMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      metalness: 0.6,
      roughness: 0.4
    });
    const guard = new THREE.Mesh(guardGeometry, guardMaterial);
    guard.position.y = -0.05;
    this.sword.add(guard);

    // Handle (wrapped grip)
    const handleGeometry = new THREE.CylinderGeometry(0.015, 0.018, 0.12, 8);
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a2820,
      roughness: 0.9,
      metalness: 0.0
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.y = -0.12;
    this.sword.add(handle);

    // Grip wrapping detail (small rings)
    for (let i = 0; i < 4; i++) {
      const wrapGeometry = new THREE.TorusGeometry(0.019, 0.003, 6, 8);
      const wrapMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a1810,
        roughness: 0.8
      });
      const wrap = new THREE.Mesh(wrapGeometry, wrapMaterial);
      wrap.position.y = -0.08 - i * 0.03;
      wrap.rotation.x = Math.PI / 2;
      this.sword.add(wrap);
    }

    // Pommel
    const pommelGeometry = new THREE.SphereGeometry(0.022, 8, 8);
    const pommel = new THREE.Mesh(pommelGeometry, guardMaterial);
    pommel.position.y = -0.19;
    pommel.scale.y = 0.7;
    this.sword.add(pommel);

    // Position sword in hand
    this.sword.position.set(0.08, -0.1, -0.12);
    this.sword.rotation.z = -0.5;
    this.sword.rotation.x = 0.6;
    this.sword.rotation.y = -0.2;

    this.viewmodelGroup.add(this.sword);
  }

  /**
   * Reset viewmodel to default position
   */
  resetPosition() {
    this.viewmodelGroup.position.set(0.15, -0.25, -0.4);
    this.viewmodelGroup.rotation.set(0, 0, 0);
  }

  /**
   * Start attack animation
   */
  startAttack() {
    if (this.isAttacking) return;
    this.isAttacking = true;
    this.attackProgress = 0;
  }

  /**
   * Update viewmodel animations
   */
  update(deltaTime, isMoving = false) {
    // Synchronize viewmodel camera with main camera
    this.viewmodelCamera.rotation.copy(this.mainCamera.rotation);
    this.viewmodelCamera.position.copy(this.mainCamera.position);

    // Update window aspect ratio
    this.viewmodelCamera.aspect = window.innerWidth / window.innerHeight;
    this.viewmodelCamera.updateProjectionMatrix();

    // Movement bob animation
    if (isMoving) {
      this.bobTime += deltaTime * 8; // Bob speed
    } else {
      this.bobTime += deltaTime * 2; // Slower idle breathing
    }

    const bobAmount = isMoving ? 0.015 : 0.005;
    const bobSpeed = isMoving ? 10 : 3;
    const bobY = Math.sin(this.bobTime * bobSpeed) * bobAmount;
    const bobX = Math.sin(this.bobTime * bobSpeed * 0.5) * bobAmount * 0.5;

    // Idle sway
    this.swayTime += deltaTime;
    const swayX = Math.sin(this.swayTime * 1.5) * 0.01;
    const swayY = Math.cos(this.swayTime * 1.2) * 0.008;

    // Attack animation
    if (this.isAttacking) {
      this.attackProgress += deltaTime * 3.5; // Attack speed

      if (this.attackProgress >= 1.0) {
        this.attackProgress = 1.0;
        this.isAttacking = false;
      }

      // Swing arc animation
      const swingCurve = this.attackProgress < 0.5
        ? this.attackProgress * 2 // Wind up
        : 2 - this.attackProgress * 2; // Follow through

      const attackRotationZ = swingCurve * 1.2;
      const attackRotationX = swingCurve * 0.4;
      const attackPositionY = -swingCurve * 0.1;
      const attackPositionX = swingCurve * 0.15;

      this.sword.rotation.z = -0.5 + attackRotationZ;
      this.sword.rotation.x = 0.6 - attackRotationX;
      this.sword.position.x = 0.08 - attackPositionX;
      this.sword.position.y = -0.1 + attackPositionY;
    } else {
      // Smoothly return to idle position
      this.sword.rotation.z += (-0.5 - this.sword.rotation.z) * deltaTime * 8;
      this.sword.rotation.x += (0.6 - this.sword.rotation.x) * deltaTime * 8;
      this.sword.position.x += (0.08 - this.sword.position.x) * deltaTime * 8;
      this.sword.position.y += (-0.1 - this.sword.position.y) * deltaTime * 8;
    }

    // Apply all animations to viewmodel group
    this.viewmodelGroup.position.x = 0.15 + bobX + swayX;
    this.viewmodelGroup.position.y = -0.25 + bobY + swayY;
    this.viewmodelGroup.position.z = -0.4;
  }

  /**
   * Render the viewmodel
   * Should be called after main scene render with depth clear
   */
  render() {
    // Store main camera state
    const originalAutoClear = this.renderer.autoClear;

    // Render viewmodel on top without clearing color buffer
    this.renderer.autoClear = false;
    this.renderer.clearDepth(); // Only clear depth buffer
    this.renderer.render(this.viewmodelScene, this.viewmodelCamera);

    // Restore renderer state
    this.renderer.autoClear = originalAutoClear;
  }

  /**
   * Check if attack is in progress
   */
  getIsAttacking() {
    return this.isAttacking;
  }

  /**
   * Get attack progress (0-1)
   */
  getAttackProgress() {
    return this.attackProgress;
  }

  /**
   * Handle window resize
   */
  onWindowResize() {
    this.viewmodelCamera.aspect = window.innerWidth / window.innerHeight;
    this.viewmodelCamera.updateProjectionMatrix();
  }

  /**
   * Clean up
   */
  dispose() {
    // Dispose geometries and materials
    this.viewmodelGroup.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
}
