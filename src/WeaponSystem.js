import * as THREE from 'three';
import { Sword } from './Sword.js';

// Weapon types with their stats (kept for backward compatibility with axes, maces, daggers)
const WEAPON_STATS = {
  sword: {
    name: 'Sword',
    damage: 25,
    attackSpeed: 500,  // ms between attacks
    range: 2.5,
    swingSpeed: 0.3,   // animation duration in seconds
  },
  axe: {
    name: 'Axe',
    damage: 40,
    attackSpeed: 800,
    range: 2.2,
    swingSpeed: 0.5,
  },
  mace: {
    name: 'Mace',
    damage: 35,
    attackSpeed: 650,
    range: 2.0,
    swingSpeed: 0.4,
  },
  dagger: {
    name: 'Dagger',
    damage: 15,
    attackSpeed: 300,
    range: 1.8,
    swingSpeed: 0.2,
  }
};

export class WeaponSystem {
  constructor(camera, scene, itemManager = null) {
    this.camera = camera;
    this.scene = scene;
    this.itemManager = itemManager;

    // Weapon container (attached to camera for first-person view)
    this.weaponContainer = new THREE.Group();
    this.camera.add(this.weaponContainer);

    // Position weapon in front of camera (bottom right of screen)
    this.weaponContainer.position.set(0.3, -0.4, -0.8);

    // Animation state
    this.time = 0;
    this.isAttacking = false;
    this.attackProgress = 0;
    this.movementBobOffset = 0;

    // Weapon management
    this.weapons = {};
    this.currentWeapon = null;
    this.currentWeaponType = 'sword';
    this.currentWeaponItem = null; // New: Sword item instance

    // Create all weapons
    this.createWeapons();
    this.switchWeapon('sword');
  }

  createWeapons() {
    this.weapons.sword = this.createSword();
    this.weapons.axe = this.createAxe();
    this.weapons.mace = this.createMace();
    this.weapons.dagger = this.createDagger();

    // Create hands that will be visible for all weapons
    this.hands = this.createHands();
  }

  createHands() {
    const hands = new THREE.Group();

    // Simple hand representation - two cylindrical arms/hands
    const handGeometry = new THREE.BoxGeometry(0.08, 0.15, 0.08);
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4a574,  // Skin tone
      roughness: 0.8,
      metalness: 0.1,
    });

    // Right hand (holds weapon)
    const rightHand = new THREE.Mesh(handGeometry, skinMaterial);
    rightHand.position.set(0.05, -0.1, 0.1);
    rightHand.rotation.z = -0.2;
    rightHand.castShadow = true;
    hands.add(rightHand);

    // Left hand (support)
    const leftHand = new THREE.Mesh(handGeometry, skinMaterial);
    leftHand.position.set(-0.15, -0.05, 0.15);
    leftHand.rotation.z = 0.3;
    leftHand.castShadow = true;
    hands.add(leftHand);

    return hands;
  }

  createSword() {
    const sword = new THREE.Group();

    // Blade
    const bladeGeometry = new THREE.BoxGeometry(0.05, 0.6, 0.01);
    const bladeMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.9,
      roughness: 0.2,
    });
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.position.y = 0.3;
    blade.castShadow = true;
    sword.add(blade);

    // Crossguard
    const guardGeometry = new THREE.BoxGeometry(0.2, 0.03, 0.03);
    const guardMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      metalness: 0.5,
      roughness: 0.6,
    });
    const guard = new THREE.Mesh(guardGeometry, guardMaterial);
    guard.castShadow = true;
    sword.add(guard);

    // Handle
    const handleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8);
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a3728,
      roughness: 0.9,
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.y = -0.08;
    handle.castShadow = true;
    sword.add(handle);

    // Pommel
    const pommelGeometry = new THREE.SphereGeometry(0.03, 8, 8);
    const pommel = new THREE.Mesh(pommelGeometry, guardMaterial);
    pommel.position.y = -0.16;
    pommel.castShadow = true;
    sword.add(pommel);

    return sword;
  }

  createAxe() {
    const axe = new THREE.Group();

    // Handle (longer than sword)
    const handleGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.5, 8);
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a3728,
      roughness: 0.9,
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.y = 0.05;
    handle.castShadow = true;
    axe.add(handle);

    // Axe head
    const headGeometry = new THREE.BoxGeometry(0.25, 0.15, 0.05);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.8,
      roughness: 0.3,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.3;
    head.castShadow = true;
    axe.add(head);

    // Blade edge (darker for contrast)
    const edgeGeometry = new THREE.BoxGeometry(0.25, 0.02, 0.01);
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.9,
      roughness: 0.1,
    });
    const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    edge.position.set(0, 0.375, 0);
    edge.castShadow = true;
    axe.add(edge);

    return axe;
  }

  createMace() {
    const mace = new THREE.Group();

    // Handle
    const handleGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8);
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a3728,
      roughness: 0.9,
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.y = 0;
    handle.castShadow = true;
    mace.add(handle);

    // Mace head (spiked ball)
    const headGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.7,
      roughness: 0.4,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.25;
    head.castShadow = true;
    mace.add(head);

    // Spikes (4 small pyramids)
    const spikeGeometry = new THREE.ConeGeometry(0.02, 0.06, 4);
    const spikeMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.8,
      roughness: 0.3,
    });

    const positions = [
      { x: 0.08, y: 0.25, z: 0 },
      { x: -0.08, y: 0.25, z: 0 },
      { x: 0, y: 0.25, z: 0.08 },
      { x: 0, y: 0.25, z: -0.08 },
    ];

    positions.forEach(pos => {
      const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
      spike.position.set(pos.x, pos.y, pos.z);
      spike.lookAt(new THREE.Vector3(pos.x * 2, pos.y, pos.z * 2));
      spike.castShadow = true;
      mace.add(spike);
    });

    return mace;
  }

  createDagger() {
    const dagger = new THREE.Group();

    // Blade (shorter and wider than sword)
    const bladeGeometry = new THREE.BoxGeometry(0.04, 0.25, 0.015);
    const bladeMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.9,
      roughness: 0.2,
    });
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.position.y = 0.15;
    blade.castShadow = true;
    dagger.add(blade);

    // Guard
    const guardGeometry = new THREE.BoxGeometry(0.1, 0.02, 0.02);
    const guardMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      metalness: 0.5,
      roughness: 0.6,
    });
    const guard = new THREE.Mesh(guardGeometry, guardMaterial);
    guard.position.y = 0.02;
    guard.castShadow = true;
    dagger.add(guard);

    // Handle
    const handleGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.1, 8);
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a1f1a,
      roughness: 0.9,
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.y = -0.04;
    handle.castShadow = true;
    dagger.add(handle);

    return dagger;
  }

  switchWeapon(weaponType) {
    // Remove current weapon from container
    if (this.currentWeapon) {
      this.weaponContainer.remove(this.currentWeapon);
      this.weaponContainer.remove(this.hands);
    }

    // Add new weapon
    this.currentWeapon = this.weapons[weaponType];
    this.currentWeaponType = weaponType;

    if (this.currentWeapon) {
      this.weaponContainer.add(this.hands);
      this.weaponContainer.add(this.currentWeapon);
    }
  }

  /**
   * Equip a sword item from the item system
   */
  equipSwordItem(swordItem) {
    if (!(swordItem instanceof Sword)) {
      console.error('Can only equip Sword items');
      return false;
    }

    // Remove current weapon
    if (this.currentWeapon) {
      this.weaponContainer.remove(this.currentWeapon);
      this.weaponContainer.remove(this.hands);
    }

    // Create mesh from sword item
    this.currentWeapon = swordItem.createMesh();
    this.currentWeaponType = 'sword';
    this.currentWeaponItem = swordItem;

    // Add to weapon container
    this.weaponContainer.add(this.hands);
    this.weaponContainer.add(this.currentWeapon);

    return true;
  }

  /**
   * Unequip current weapon
   */
  unequipWeapon() {
    if (this.currentWeapon) {
      this.weaponContainer.remove(this.currentWeapon);
      this.weaponContainer.remove(this.hands);
    }
    this.currentWeapon = null;
    this.currentWeaponItem = null;
  }

  getWeaponStats() {
    // If we have a sword item equipped, use its stats
    if (this.currentWeaponItem instanceof Sword) {
      return this.currentWeaponItem.getWeaponStats();
    }
    // Otherwise, use default stats
    return WEAPON_STATS[this.currentWeaponType];
  }

  /**
   * Get the current weapon item
   */
  getCurrentWeaponItem() {
    return this.currentWeaponItem;
  }

  startAttack() {
    if (!this.isAttacking) {
      this.isAttacking = true;
      this.attackProgress = 0;
    }
  }

  isAttackComplete() {
    return this.attackProgress >= 1.0;
  }

  update(deltaTime, isMoving = false) {
    this.time += deltaTime;

    // Reset weapon position/rotation
    this.weaponContainer.rotation.set(0, 0, 0);
    this.weaponContainer.position.set(0.3, -0.4, -0.8);

    // Apply idle animation (breathing/sway)
    if (!this.isAttacking) {
      const breathe = Math.sin(this.time * 2) * 0.01;
      const sway = Math.sin(this.time * 1.5) * 0.005;

      this.weaponContainer.position.y += breathe;
      this.weaponContainer.rotation.z += sway;
    }

    // Apply movement bob
    if (isMoving) {
      this.movementBobOffset += deltaTime * 8;
      const bobY = Math.sin(this.movementBobOffset) * 0.03;
      const bobX = Math.sin(this.movementBobOffset * 0.5) * 0.015;

      this.weaponContainer.position.y += bobY;
      this.weaponContainer.position.x += bobX;
      this.weaponContainer.rotation.z += bobX * 0.5;
    } else {
      this.movementBobOffset = 0;
    }

    // Apply attack animation
    if (this.isAttacking) {
      const stats = this.getWeaponStats();
      this.attackProgress += deltaTime / stats.swingSpeed;

      if (this.attackProgress >= 1.0) {
        this.attackProgress = 1.0;
        this.isAttacking = false;
      }

      // Attack animation curve (swing down and forward, then return)
      const t = this.attackProgress;
      const swing = t < 0.5 ? t * 2 : 2 - t * 2;  // 0 -> 1 -> 0

      // Different attack patterns for different weapons
      if (this.currentWeaponType === 'sword' || this.currentWeaponType === 'dagger') {
        // Diagonal slash
        this.weaponContainer.rotation.x = -swing * Math.PI * 0.4;
        this.weaponContainer.rotation.z = -swing * Math.PI * 0.3;
        this.weaponContainer.position.z += swing * 0.3;
      } else if (this.currentWeaponType === 'axe') {
        // Overhead chop
        this.weaponContainer.rotation.x = -swing * Math.PI * 0.5;
        this.weaponContainer.position.y += swing * 0.2;
        this.weaponContainer.position.z += swing * 0.4;
      } else if (this.currentWeaponType === 'mace') {
        // Side swing
        this.weaponContainer.rotation.y = swing * Math.PI * 0.4;
        this.weaponContainer.rotation.z = -swing * Math.PI * 0.2;
        this.weaponContainer.position.z += swing * 0.25;
      }
    }
  }

  // Get attack hit timing (when damage should be applied)
  getAttackHitTiming() {
    // Hit occurs at 40-60% through the animation
    return this.attackProgress >= 0.4 && this.attackProgress <= 0.6;
  }
}
