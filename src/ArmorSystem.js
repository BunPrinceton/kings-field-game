import * as THREE from 'three';

// Armor types with their stats
export const ARMOR_STATS = {
  // Light Armor - Low defense, high mobility
  leather: {
    name: 'Leather Armor',
    defense: 5,
    weight: 3,
    durability: 80,
    maxDurability: 80,
    resistances: {
      physical: 0.05,    // 5% damage reduction
      fire: 0.02,
      ice: 0.02,
      lightning: 0.0
    },
    speedModifier: 1.0,  // No speed penalty
    staminaModifier: 0.95, // 5% stamina drain reduction
  },

  // Medium Armor - Balanced defense and mobility
  chainmail: {
    name: 'Chainmail Armor',
    defense: 15,
    weight: 8,
    durability: 150,
    maxDurability: 150,
    resistances: {
      physical: 0.15,    // 15% damage reduction
      fire: 0.05,
      ice: 0.10,
      lightning: -0.10   // 10% increased lightning damage
    },
    speedModifier: 0.9,  // 10% slower movement
    staminaModifier: 0.85, // 15% more stamina drain
  },

  // Heavy Armor - High defense, low mobility
  plate: {
    name: 'Plate Armor',
    defense: 30,
    weight: 15,
    durability: 250,
    maxDurability: 250,
    resistances: {
      physical: 0.30,    // 30% damage reduction
      fire: 0.15,
      ice: 0.20,
      lightning: -0.05   // 5% increased lightning damage
    },
    speedModifier: 0.75, // 25% slower movement
    staminaModifier: 0.7, // 30% more stamina drain
  },

  // Magic Armor - Elemental resistance focus
  mage: {
    name: 'Mage Robes',
    defense: 3,
    weight: 2,
    durability: 60,
    maxDurability: 60,
    resistances: {
      physical: 0.03,    // 3% damage reduction
      fire: 0.25,        // 25% fire resistance
      ice: 0.25,         // 25% ice resistance
      lightning: 0.25    // 25% lightning resistance
    },
    speedModifier: 1.05, // 5% faster movement
    staminaModifier: 1.1, // 10% less stamina drain
  },

  // No armor
  none: {
    name: 'No Armor',
    defense: 0,
    weight: 0,
    durability: 100,
    maxDurability: 100,
    resistances: {
      physical: 0.0,
      fire: 0.0,
      ice: 0.0,
      lightning: 0.0
    },
    speedModifier: 1.0,
    staminaModifier: 1.0,
  }
};

// Helmet/head armor types
export const HELMET_STATS = {
  leatherCap: {
    name: 'Leather Cap',
    defense: 2,
    weight: 1,
    durability: 50,
    maxDurability: 50,
    resistances: { physical: 0.02, fire: 0.01, ice: 0.01, lightning: 0.0 }
  },

  ironHelmet: {
    name: 'Iron Helmet',
    defense: 8,
    weight: 4,
    durability: 120,
    maxDurability: 120,
    resistances: { physical: 0.08, fire: 0.03, ice: 0.05, lightning: -0.05 }
  },

  knightHelmet: {
    name: 'Knight Helmet',
    defense: 12,
    weight: 6,
    durability: 180,
    maxDurability: 180,
    resistances: { physical: 0.12, fire: 0.06, ice: 0.08, lightning: -0.03 }
  },

  wizardHat: {
    name: 'Wizard Hat',
    defense: 1,
    weight: 0.5,
    durability: 40,
    maxDurability: 40,
    resistances: { physical: 0.01, fire: 0.10, ice: 0.10, lightning: 0.10 }
  },

  none: {
    name: 'No Helmet',
    defense: 0,
    weight: 0,
    durability: 100,
    maxDurability: 100,
    resistances: { physical: 0.0, fire: 0.0, ice: 0.0, lightning: 0.0 }
  }
};

// Shield types
export const SHIELD_STATS = {
  woodenShield: {
    name: 'Wooden Shield',
    defense: 5,
    blockChance: 0.15,    // 15% chance to block attack
    weight: 3,
    durability: 70,
    maxDurability: 70,
    resistances: { physical: 0.10, fire: -0.10, ice: 0.05, lightning: 0.0 }
  },

  ironShield: {
    name: 'Iron Shield',
    defense: 10,
    blockChance: 0.25,    // 25% chance to block
    weight: 6,
    durability: 150,
    maxDurability: 150,
    resistances: { physical: 0.15, fire: 0.05, ice: 0.10, lightning: -0.05 }
  },

  towerShield: {
    name: 'Tower Shield',
    defense: 18,
    blockChance: 0.35,    // 35% chance to block
    weight: 12,
    durability: 250,
    maxDurability: 250,
    resistances: { physical: 0.25, fire: 0.10, ice: 0.15, lightning: -0.03 },
    speedModifier: 0.8    // 20% slower when equipped
  },

  magicShield: {
    name: 'Magic Shield',
    defense: 6,
    blockChance: 0.20,    // 20% chance to block
    weight: 2,
    durability: 100,
    maxDurability: 100,
    resistances: { physical: 0.08, fire: 0.15, ice: 0.15, lightning: 0.15 }
  },

  none: {
    name: 'No Shield',
    defense: 0,
    blockChance: 0.0,
    weight: 0,
    durability: 100,
    maxDurability: 100,
    resistances: { physical: 0.0, fire: 0.0, ice: 0.0, lightning: 0.0 }
  }
};

export class ArmorSystem {
  constructor(scene) {
    this.scene = scene;

    // Current equipment
    this.currentArmor = 'none';
    this.currentHelmet = 'none';
    this.currentShield = 'none';

    // Armor instances (for durability tracking)
    this.armorInstances = {
      armor: { ...ARMOR_STATS.none },
      helmet: { ...HELMET_STATS.none },
      shield: { ...SHIELD_STATS.none }
    };

    // Total stats cache (recalculated on equipment change)
    this.totalDefense = 0;
    this.totalWeight = 0;
    this.totalResistances = { physical: 0, fire: 0, ice: 0, lightning: 0 };
    this.speedModifier = 1.0;
    this.staminaModifier = 1.0;
    this.blockChance = 0.0;

    this.updateTotalStats();
  }

  /**
   * Equip armor piece
   */
  equipArmor(armorType) {
    if (!ARMOR_STATS[armorType]) {
      console.warn(`Unknown armor type: ${armorType}`);
      return false;
    }

    this.currentArmor = armorType;
    // Create a fresh copy of the armor stats for durability tracking
    this.armorInstances.armor = JSON.parse(JSON.stringify(ARMOR_STATS[armorType]));
    this.updateTotalStats();
    return true;
  }

  /**
   * Equip helmet
   */
  equipHelmet(helmetType) {
    if (!HELMET_STATS[helmetType]) {
      console.warn(`Unknown helmet type: ${helmetType}`);
      return false;
    }

    this.currentHelmet = helmetType;
    this.armorInstances.helmet = JSON.parse(JSON.stringify(HELMET_STATS[helmetType]));
    this.updateTotalStats();
    return true;
  }

  /**
   * Equip shield
   */
  equipShield(shieldType) {
    if (!SHIELD_STATS[shieldType]) {
      console.warn(`Unknown shield type: ${shieldType}`);
      return false;
    }

    this.currentShield = shieldType;
    this.armorInstances.shield = JSON.parse(JSON.stringify(SHIELD_STATS[shieldType]));
    this.updateTotalStats();
    return true;
  }

  /**
   * Recalculate total armor stats
   */
  updateTotalStats() {
    const armor = this.armorInstances.armor;
    const helmet = this.armorInstances.helmet;
    const shield = this.armorInstances.shield;

    // Sum defense and weight
    this.totalDefense = armor.defense + helmet.defense + shield.defense;
    this.totalWeight = armor.weight + helmet.weight + shield.weight;

    // Combine resistances (additive)
    this.totalResistances = {
      physical: this.clampResistance(
        armor.resistances.physical +
        helmet.resistances.physical +
        shield.resistances.physical
      ),
      fire: this.clampResistance(
        armor.resistances.fire +
        helmet.resistances.fire +
        shield.resistances.fire
      ),
      ice: this.clampResistance(
        armor.resistances.ice +
        helmet.resistances.ice +
        shield.resistances.ice
      ),
      lightning: this.clampResistance(
        armor.resistances.lightning +
        helmet.resistances.lightning +
        shield.resistances.lightning
      )
    };

    // Calculate speed modifier (multiplicative)
    this.speedModifier = (armor.speedModifier || 1.0) * (shield.speedModifier || 1.0);

    // Calculate stamina modifier (multiplicative)
    this.staminaModifier = (armor.staminaModifier || 1.0);

    // Block chance from shield
    this.blockChance = shield.blockChance || 0.0;
  }

  /**
   * Clamp resistance values between -0.5 and 0.75
   */
  clampResistance(value) {
    return Math.max(-0.5, Math.min(0.75, value));
  }

  /**
   * Calculate damage after armor reduction
   */
  calculateDamageReduction(incomingDamage, damageType = 'physical') {
    // Base defense reduction
    const defenseReduction = Math.min(this.totalDefense * 0.5, incomingDamage * 0.5);

    // Resistance multiplier
    const resistance = this.totalResistances[damageType] || 0;
    const resistanceMultiplier = 1.0 - resistance;

    // Calculate final damage
    let finalDamage = (incomingDamage - defenseReduction) * resistanceMultiplier;

    // Block chance
    if (this.blockChance > 0 && Math.random() < this.blockChance) {
      finalDamage *= 0.5; // Blocked attacks deal 50% damage
      return { damage: finalDamage, blocked: true };
    }

    return { damage: Math.max(0, finalDamage), blocked: false };
  }

  /**
   * Damage armor durability
   */
  damageArmor(amount = 1) {
    // Distribute damage across all equipped pieces
    const pieces = ['armor', 'helmet', 'shield'].filter(
      piece => this.armorInstances[piece].defense > 0
    );

    if (pieces.length === 0) return;

    const damagePerPiece = amount / pieces.length;

    pieces.forEach(piece => {
      const armorPiece = this.armorInstances[piece];
      armorPiece.durability = Math.max(0, armorPiece.durability - damagePerPiece);

      // Warn if armor is about to break
      if (armorPiece.durability <= 0 && armorPiece.defense > 0) {
        console.log(`${armorPiece.name} has broken!`);
        // Set defense to 0 but keep the item equipped (broken state)
        armorPiece.defense = 0;
        armorPiece.resistances = { physical: 0, fire: 0, ice: 0, lightning: 0 };
      }
    });

    // Recalculate stats after durability change
    this.updateTotalStats();
  }

  /**
   * Repair armor
   */
  repairArmor(piece, amount = 100) {
    if (!this.armorInstances[piece]) return false;

    const armorPiece = this.armorInstances[piece];
    armorPiece.durability = Math.min(armorPiece.maxDurability, armorPiece.durability + amount);

    // Restore stats if fully repaired
    if (armorPiece.durability > 0) {
      const baseStats = this.getBaseStats(piece);
      if (baseStats) {
        armorPiece.defense = baseStats.defense;
        armorPiece.resistances = { ...baseStats.resistances };
      }
    }

    this.updateTotalStats();
    return true;
  }

  /**
   * Get base stats for a piece type
   */
  getBaseStats(piece) {
    switch(piece) {
      case 'armor':
        return ARMOR_STATS[this.currentArmor];
      case 'helmet':
        return HELMET_STATS[this.currentHelmet];
      case 'shield':
        return SHIELD_STATS[this.currentShield];
      default:
        return null;
    }
  }

  /**
   * Get current equipment summary
   */
  getEquipmentSummary() {
    return {
      armor: {
        type: this.currentArmor,
        stats: this.armorInstances.armor
      },
      helmet: {
        type: this.currentHelmet,
        stats: this.armorInstances.helmet
      },
      shield: {
        type: this.currentShield,
        stats: this.armorInstances.shield
      },
      total: {
        defense: this.totalDefense,
        weight: this.totalWeight,
        resistances: this.totalResistances,
        speedModifier: this.speedModifier,
        staminaModifier: this.staminaModifier,
        blockChance: this.blockChance
      }
    };
  }

  /**
   * Get durability percentages for UI
   */
  getDurabilityInfo() {
    return {
      armor: {
        current: this.armorInstances.armor.durability,
        max: this.armorInstances.armor.maxDurability,
        percentage: (this.armorInstances.armor.durability / this.armorInstances.armor.maxDurability) * 100
      },
      helmet: {
        current: this.armorInstances.helmet.durability,
        max: this.armorInstances.helmet.maxDurability,
        percentage: (this.armorInstances.helmet.durability / this.armorInstances.helmet.maxDurability) * 100
      },
      shield: {
        current: this.armorInstances.shield.durability,
        max: this.armorInstances.shield.maxDurability,
        percentage: (this.armorInstances.shield.durability / this.armorInstances.shield.maxDurability) * 100
      }
    };
  }

  /**
   * Update system (for future animations, etc.)
   */
  update(deltaTime) {
    // Future: Add visual armor wear effects, shield bash animations, etc.
  }
}
