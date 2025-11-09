/**
 * Potion - Consumable potion items with various effects
 * Extends ConsumableItem with potion-specific functionality
 */

import { ConsumableItem } from './Item.js';

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

export class Potion extends ConsumableItem {
  constructor(definition) {
    super(definition);

    // Potion-specific properties
    this.effectType = definition.effectType || PotionEffect.HEAL;
    this.potency = definition.potency || 0;
    this.duration = definition.duration || 0; // 0 for instant effects, >0 for buffs/DoTs
    this.cooldown = definition.cooldown || 1000; // ms before can use another potion

    // Visual properties
    this.liquidColor = definition.liquidColor || 0x00ff00;
    this.bottleColor = definition.bottleColor || 0xccccff;
  }

  /**
   * Use the potion on a target
   * @param {Object} user - The entity using the potion (player)
   * @returns {boolean} - Whether the potion was successfully consumed
   */
  use(user) {
    // Check if user is on potion cooldown
    if (user.potionCooldown && user.potionCooldown > 0) {
      console.log('Cannot use potion yet - still on cooldown');
      return false;
    }

    // Apply the potion effect
    const success = this.applyEffect(user);

    if (success) {
      // Start cooldown
      if (user.potionCooldown !== undefined) {
        user.potionCooldown = this.cooldown;
      }

      console.log(`${user.name || 'Player'} used ${this.name}`);
      return true; // Item is consumed
    }

    return false;
  }

  /**
   * Apply the potion's effect to the user
   */
  applyEffect(user) {
    switch (this.effectType) {
      case PotionEffect.HEAL:
        return this.applyHeal(user);

      case PotionEffect.RESTORE_STAMINA:
        return this.applyStaminaRestore(user);

      case PotionEffect.RESTORE_MANA:
        return this.applyManaRestore(user);

      case PotionEffect.CURE_POISON:
        return this.applyCurePoison(user);

      case PotionEffect.BUFF_STRENGTH:
        return this.applyBuff(user, 'strength', this.potency, this.duration);

      case PotionEffect.BUFF_DEFENSE:
        return this.applyBuff(user, 'defense', this.potency, this.duration);

      case PotionEffect.BUFF_SPEED:
        return this.applyBuff(user, 'speed', this.potency, this.duration);

      case PotionEffect.REGENERATION:
        return this.applyRegeneration(user);

      case PotionEffect.RESISTANCE:
        return this.applyResistance(user);

      default:
        console.warn(`Unknown potion effect: ${this.effectType}`);
        return false;
    }
  }

  /**
   * Heal the user
   */
  applyHeal(user) {
    if (!user.health) {
      console.warn('User has no health property');
      return false;
    }

    // Don't use if already at full health
    if (user.health.current >= user.health.max) {
      console.log('Already at full health');
      return false;
    }

    const healAmount = this.potency;
    user.health.heal(healAmount);

    console.log(`Healed for ${healAmount} HP`);
    return true;
  }

  /**
   * Restore stamina
   */
  applyStaminaRestore(user) {
    if (!user.stamina) {
      console.warn('User has no stamina property');
      return false;
    }

    // Don't use if already at full stamina
    if (user.stamina >= user.maxStamina) {
      console.log('Already at full stamina');
      return false;
    }

    const restoreAmount = this.potency;
    const oldStamina = user.stamina;
    user.stamina = Math.min(user.maxStamina || 100, user.stamina + restoreAmount);

    console.log(`Restored ${user.stamina - oldStamina} stamina`);
    return true;
  }

  /**
   * Restore mana
   */
  applyManaRestore(user) {
    if (!user.mana) {
      console.warn('User has no mana property');
      return false;
    }

    // Don't use if already at full mana
    if (user.mana >= user.maxMana) {
      console.log('Already at full mana');
      return false;
    }

    const restoreAmount = this.potency;
    const oldMana = user.mana;
    user.mana = Math.min(user.maxMana || 100, user.mana + restoreAmount);

    console.log(`Restored ${user.mana - oldMana} mana`);
    return true;
  }

  /**
   * Cure poison status effect
   */
  applyCurePoison(user) {
    if (!user.statusEffects) {
      console.warn('User has no statusEffects');
      return false;
    }

    if (user.statusEffects.poisoned) {
      user.statusEffects.poisoned = false;
      console.log('Cured poison');
      return true;
    }

    console.log('Not poisoned');
    return false;
  }

  /**
   * Apply a temporary buff
   */
  applyBuff(user, buffType, potency, duration) {
    if (!user.buffs) {
      user.buffs = {};
    }

    const buff = {
      type: buffType,
      potency: potency,
      duration: duration,
      startTime: Date.now()
    };

    user.buffs[buffType] = buff;

    console.log(`Applied ${buffType} buff (+${potency}%) for ${duration / 1000}s`);
    return true;
  }

  /**
   * Apply regeneration over time
   */
  applyRegeneration(user) {
    if (!user.statusEffects) {
      user.statusEffects = {};
    }

    user.statusEffects.regeneration = {
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
  applyResistance(user) {
    if (!user.buffs) {
      user.buffs = {};
    }

    user.buffs.resistance = {
      type: 'resistance',
      potency: this.potency, // Damage reduction percentage
      duration: this.duration,
      startTime: Date.now()
    };

    console.log(`Applied resistance: ${this.potency}% damage reduction for ${this.duration / 1000}s`);
    return true;
  }

  /**
   * Get tooltip with potion-specific information
   */
  getTooltip() {
    let tooltip = `${this.description}\n\n`;

    switch (this.effectType) {
      case PotionEffect.HEAL:
        tooltip += `Restores ${this.potency} HP\n`;
        break;
      case PotionEffect.RESTORE_STAMINA:
        tooltip += `Restores ${this.potency} stamina\n`;
        break;
      case PotionEffect.RESTORE_MANA:
        tooltip += `Restores ${this.potency} mana\n`;
        break;
      case PotionEffect.CURE_POISON:
        tooltip += `Cures poison status effect\n`;
        break;
      case PotionEffect.BUFF_STRENGTH:
        tooltip += `+${this.potency}% attack damage for ${this.duration / 1000}s\n`;
        break;
      case PotionEffect.BUFF_DEFENSE:
        tooltip += `-${this.potency}% incoming damage for ${this.duration / 1000}s\n`;
        break;
      case PotionEffect.BUFF_SPEED:
        tooltip += `+${this.potency}% movement speed for ${this.duration / 1000}s\n`;
        break;
      case PotionEffect.REGENERATION:
        tooltip += `Regenerates ${this.potency} HP/second for ${this.duration / 1000}s\n`;
        break;
      case PotionEffect.RESISTANCE:
        tooltip += `${this.potency}% damage reduction for ${this.duration / 1000}s\n`;
        break;
    }

    tooltip += `Cooldown: ${this.cooldown / 1000}s\n`;
    tooltip += `Value: ${this.value} gold\n`;

    return tooltip;
  }

  /**
   * Serialize potion data
   */
  serialize() {
    const data = super.serialize();
    data.effectType = this.effectType;
    data.potency = this.potency;
    data.duration = this.duration;
    return data;
  }
}
