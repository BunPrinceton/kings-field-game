/**
 * Potion.js - Consumable potion items with various effects
 */

import { Item, ItemType } from './Item.js';

export const PotionEffect = {
  HEAL: 'heal',
  RESTORE_STAMINA: 'restore_stamina',
  RESTORE_MANA: 'restore_mana',
  CURE_POISON: 'cure_poison',
  BUFF_STRENGTH: 'buff_strength',
  BUFF_DEFENSE: 'buff_defense',
  BUFF_SPEED: 'buff_speed',
  REGENERATION: 'regeneration',
  RESISTANCE: 'resistance'
};

export class Potion extends Item {
  constructor(config) {
    super({
      ...config,
      type: ItemType.CONSUMABLE,
      stackable: true,
      maxStackSize: config.maxStackSize || 99
    });

    this.effectType = config.effectType || PotionEffect.HEAL;
    this.potency = config.potency || 0;
    this.duration = config.duration || 0; // 0 for instant effects
    this.cooldown = config.cooldown || 1000; // ms before can use another
  }

  /**
   * Use the potion on a target
   * @param {Object} target - The entity using the potion (player)
   * @returns {boolean} - Whether the potion was successfully used
   */
  use(target) {
    // Check if target is on potion cooldown
    if (target.potionCooldown && target.potionCooldown > 0) {
      console.log('Cannot use potion yet - still on cooldown');
      return false;
    }

    // Apply the potion effect
    const success = this.applyEffect(target);

    if (success) {
      // Start cooldown
      if (target.potionCooldown !== undefined) {
        target.potionCooldown = this.cooldown;
      }

      // Decrease quantity
      this.quantity--;

      // Return true to indicate item was consumed
      return true;
    }

    return false;
  }

  /**
   * Apply the potion's effect to the target
   */
  applyEffect(target) {
    switch (this.effectType) {
      case PotionEffect.HEAL:
        return this.applyHeal(target);

      case PotionEffect.RESTORE_STAMINA:
        return this.applyStaminaRestore(target);

      case PotionEffect.RESTORE_MANA:
        return this.applyManaRestore(target);

      case PotionEffect.CURE_POISON:
        return this.applyCurePoison(target);

      case PotionEffect.BUFF_STRENGTH:
        return this.applyBuff(target, 'strength', this.potency, this.duration);

      case PotionEffect.BUFF_DEFENSE:
        return this.applyBuff(target, 'defense', this.potency, this.duration);

      case PotionEffect.BUFF_SPEED:
        return this.applyBuff(target, 'speed', this.potency, this.duration);

      case PotionEffect.REGENERATION:
        return this.applyRegeneration(target);

      case PotionEffect.RESISTANCE:
        return this.applyResistance(target);

      default:
        console.warn(`Unknown potion effect: ${this.effectType}`);
        return false;
    }
  }

  /**
   * Heal the target
   */
  applyHeal(target) {
    if (!target.health) {
      console.warn('Target has no health property');
      return false;
    }

    // Don't use if already at full health
    if (target.health.current >= target.health.max) {
      console.log('Already at full health');
      return false;
    }

    const healAmount = this.potency;
    target.health.heal(healAmount);

    console.log(`Healed for ${healAmount} HP`);
    return true;
  }

  /**
   * Restore stamina
   */
  applyStaminaRestore(target) {
    if (!target.stamina) {
      console.warn('Target has no stamina property');
      return false;
    }

    const restoreAmount = this.potency;
    const oldStamina = target.stamina.current;
    target.stamina.current = Math.min(target.stamina.max, target.stamina.current + restoreAmount);

    console.log(`Restored ${target.stamina.current - oldStamina} stamina`);
    return true;
  }

  /**
   * Restore mana
   */
  applyManaRestore(target) {
    if (!target.mana) {
      console.warn('Target has no mana property');
      return false;
    }

    const restoreAmount = this.potency;
    const oldMana = target.mana.current;
    target.mana.current = Math.min(target.mana.max, target.mana.current + restoreAmount);

    console.log(`Restored ${target.mana.current - oldMana} mana`);
    return true;
  }

  /**
   * Cure poison status effect
   */
  applyCurePoison(target) {
    if (!target.statusEffects) {
      console.warn('Target has no statusEffects');
      return false;
    }

    if (target.statusEffects.poisoned) {
      target.statusEffects.poisoned = false;
      console.log('Cured poison');
      return true;
    }

    console.log('Not poisoned');
    return false;
  }

  /**
   * Apply a temporary buff
   */
  applyBuff(target, buffType, potency, duration) {
    if (!target.buffs) {
      target.buffs = {};
    }

    const buff = {
      type: buffType,
      potency: potency,
      duration: duration,
      startTime: Date.now()
    };

    target.buffs[buffType] = buff;

    console.log(`Applied ${buffType} buff (+${potency}) for ${duration}ms`);
    return true;
  }

  /**
   * Apply regeneration over time
   */
  applyRegeneration(target) {
    if (!target.statusEffects) {
      target.statusEffects = {};
    }

    target.statusEffects.regeneration = {
      tickAmount: this.potency,
      duration: this.duration,
      tickInterval: 1000, // Heal every second
      lastTick: Date.now(),
      startTime: Date.now()
    };

    console.log(`Applied regeneration: ${this.potency} HP per second for ${this.duration / 1000}s`);
    return true;
  }

  /**
   * Apply damage resistance
   */
  applyResistance(target) {
    if (!target.buffs) {
      target.buffs = {};
    }

    target.buffs.resistance = {
      type: 'resistance',
      potency: this.potency, // Damage reduction percentage
      duration: this.duration,
      startTime: Date.now()
    };

    console.log(`Applied resistance: ${this.potency}% damage reduction for ${this.duration / 1000}s`);
    return true;
  }

  /**
   * Clone the potion
   */
  clone() {
    return new Potion({
      id: this.id,
      name: this.name,
      description: this.description,
      rarity: this.rarity,
      quantity: this.quantity,
      icon: this.icon,
      value: this.value,
      effectType: this.effectType,
      potency: this.potency,
      duration: this.duration,
      cooldown: this.cooldown,
      maxStackSize: this.maxStackSize
    });
  }
}
