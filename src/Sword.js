/**
 * Sword - Specific implementation for sword-type weapons
 * Extends WeaponItem with sword-specific functionality
 */

import { WeaponItem } from './Item.js';
import * as THREE from 'three';

export class Sword extends WeaponItem {
  constructor(definition) {
    super(definition);

    // Sword-specific properties
    this.bladeLength = definition.bladeLength || 0.6;
    this.bladeWidth = definition.bladeWidth || 0.05;
    this.bladeThickness = definition.bladeThickness || 0.01;
    this.grip = definition.grip || 'one-handed'; // 'one-handed' or 'two-handed'

    // Materials
    this.bladeMaterial = definition.bladeMaterial || 'steel'; // steel, iron, silver, crystal
    this.handleMaterial = definition.handleMaterial || 'wood'; // wood, leather, bone

    // Visual customization
    this.bladeColor = definition.bladeColor || 0xcccccc;
    this.handleColor = definition.handleColor || 0x4a3728;
    this.guardColor = definition.guardColor || 0x8b7355;
    this.hasEnchantment = definition.hasEnchantment || false;
    this.enchantmentColor = definition.enchantmentColor || 0x00ffff;

    // Combat properties
    this.slashBonus = definition.slashBonus || 1.0; // Multiplier for slashing attacks
    this.thrustBonus = definition.thrustBonus || 1.0; // Multiplier for thrusting attacks
    this.parryChance = definition.parryChance || 0.1; // Chance to parry attacks while blocking

    // Special abilities
    this.specialAbility = definition.specialAbility || null;
  }

  /**
   * Create 3D mesh representation of the sword
   */
  createMesh() {
    const sword = new THREE.Group();
    sword.userData.item = this;

    // Blade
    const bladeGeometry = new THREE.BoxGeometry(
      this.bladeWidth,
      this.bladeLength,
      this.bladeThickness
    );
    const bladeMaterial = new THREE.MeshStandardMaterial({
      color: this.bladeColor,
      metalness: 0.9,
      roughness: 0.2,
      emissive: this.hasEnchantment ? this.enchantmentColor : 0x000000,
      emissiveIntensity: this.hasEnchantment ? 0.3 : 0
    });
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.position.y = this.bladeLength / 2;
    blade.castShadow = true;
    blade.receiveShadow = true;
    sword.add(blade);

    // Blade tip (pointed)
    const tipGeometry = new THREE.ConeGeometry(
      this.bladeWidth / 2,
      this.bladeWidth * 1.5,
      4
    );
    const tip = new THREE.Mesh(tipGeometry, bladeMaterial);
    tip.position.y = this.bladeLength + (this.bladeWidth * 0.75);
    tip.castShadow = true;
    sword.add(tip);

    // Crossguard
    const guardWidth = this.grip === 'two-handed' ? 0.25 : 0.2;
    const guardGeometry = new THREE.BoxGeometry(guardWidth, 0.03, 0.03);
    const guardMaterial = new THREE.MeshStandardMaterial({
      color: this.guardColor,
      metalness: 0.5,
      roughness: 0.6,
    });
    const guard = new THREE.Mesh(guardGeometry, guardMaterial);
    guard.castShadow = true;
    sword.add(guard);

    // Handle
    const handleLength = this.grip === 'two-handed' ? 0.25 : 0.15;
    const handleGeometry = new THREE.CylinderGeometry(0.02, 0.02, handleLength, 8);
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: this.handleColor,
      roughness: 0.9,
      metalness: 0.1,
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.y = -(handleLength / 2) - 0.015;
    handle.castShadow = true;
    sword.add(handle);

    // Pommel
    const pommelSize = 0.03;
    const pommelGeometry = new THREE.SphereGeometry(pommelSize, 8, 8);
    const pommel = new THREE.Mesh(pommelGeometry, guardMaterial);
    pommel.position.y = -handleLength - 0.015 - pommelSize;
    pommel.castShadow = true;
    sword.add(pommel);

    // Add glow effect for enchanted swords
    if (this.hasEnchantment) {
      const glowGeometry = new THREE.BoxGeometry(
        this.bladeWidth * 1.1,
        this.bladeLength * 1.05,
        this.bladeThickness * 2
      );
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: this.enchantmentColor,
        transparent: true,
        opacity: 0.2,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.y = this.bladeLength / 2;
      sword.add(glow);
    }

    return sword;
  }

  /**
   * Get weapon stats for combat
   */
  getWeaponStats() {
    return {
      name: this.name,
      damage: this.getEffectiveDamage(),
      attackSpeed: this.attackSpeed,
      range: this.range,
      swingSpeed: this.swingSpeed,
      grip: this.grip,
      slashBonus: this.slashBonus,
      thrustBonus: this.thrustBonus,
      parryChance: this.parryChance,
      critChance: this.critChance,
      critMultiplier: this.critMultiplier,
      elementalDamage: this.elementalDamage
    };
  }

  /**
   * Execute special ability if available
   */
  useSpecialAbility(user, target) {
    if (!this.specialAbility) {
      console.log(`${this.name} has no special ability`);
      return false;
    }

    switch (this.specialAbility.type) {
      case 'fire_slash':
        console.log(`${user.name || 'Player'} unleashes a fiery slash with ${this.name}!`);
        // Apply fire damage to target
        if (target && target.health) {
          const fireDamage = this.damage * this.specialAbility.multiplier;
          target.health.takeDamage(fireDamage);
        }
        return true;

      case 'life_steal':
        console.log(`${user.name || 'Player'} drains life with ${this.name}!`);
        // Steal health from target
        if (target && target.health && user.health) {
          const drainAmount = this.damage * this.specialAbility.multiplier;
          target.health.takeDamage(drainAmount);
          user.health.heal(drainAmount * 0.5);
        }
        return true;

      case 'frost_strike':
        console.log(`${user.name || 'Player'} freezes the enemy with ${this.name}!`);
        // Slow the target
        if (target) {
          target.slowed = true;
          setTimeout(() => {
            target.slowed = false;
          }, this.specialAbility.duration || 3000);
        }
        return true;

      case 'holy_smite':
        console.log(`${user.name || 'Player'} smites with holy power!`);
        // Deal bonus damage to undead
        if (target && target.type === 'undead') {
          const holyDamage = this.damage * this.specialAbility.multiplier * 2;
          target.health.takeDamage(holyDamage);
        } else if (target && target.health) {
          const holyDamage = this.damage * this.specialAbility.multiplier;
          target.health.takeDamage(holyDamage);
        }
        return true;

      default:
        console.warn(`Unknown special ability: ${this.specialAbility.type}`);
        return false;
    }
  }

  /**
   * Get tooltip with sword-specific information
   */
  getTooltip() {
    let tooltip = super.getTooltip();

    tooltip += `\nGrip: ${this.grip}\n`;
    tooltip += `Material: ${this.bladeMaterial}\n`;

    if (this.slashBonus !== 1.0) {
      tooltip += `Slash Bonus: ${(this.slashBonus * 100).toFixed(0)}%\n`;
    }
    if (this.thrustBonus !== 1.0) {
      tooltip += `Thrust Bonus: ${(this.thrustBonus * 100).toFixed(0)}%\n`;
    }
    if (this.parryChance > 0) {
      tooltip += `Parry Chance: ${(this.parryChance * 100).toFixed(0)}%\n`;
    }
    if (this.specialAbility) {
      tooltip += `\nSpecial: ${this.specialAbility.name}\n`;
      tooltip += `${this.specialAbility.description}\n`;
    }

    return tooltip;
  }
}
