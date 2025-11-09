/**
 * Sound Configuration
 * Define all sound files and their properties here
 *
 * Note: Sound files should be downloaded from free sources (see AUDIO_RESOURCES.md)
 * and placed in the public/sounds/ directory
 */

export const SOUND_CONFIG = {
    // Ambient background sounds (looping)
    ambience: {
        dungeon_base: {
            files: ['sounds/ambience/dungeon_ambient.ogg'],
            loop: true,
            volume: 0.3,
            positional: false
        },
        water_drips: {
            files: ['sounds/ambience/water_drips.ogg'],
            loop: true,
            volume: 0.2,
            positional: false
        },
        wind_echo: {
            files: ['sounds/ambience/wind_echo.ogg'],
            loop: true,
            volume: 0.15,
            positional: false
        }
    },

    // Footstep sounds (variations for randomness)
    footsteps: {
        stone: {
            files: [
                'sounds/footsteps/stone_step_1.ogg',
                'sounds/footsteps/stone_step_2.ogg',
                'sounds/footsteps/stone_step_3.ogg',
                'sounds/footsteps/stone_step_4.ogg'
            ],
            loop: false,
            volume: 0.4,
            positional: false,
            cooldown: 100 // Minimum ms between plays
        }
    },

    // Combat sounds
    combat: {
        sword_swing: {
            files: [
                'sounds/combat/sword_swing_1.ogg',
                'sounds/combat/sword_swing_2.ogg',
                'sounds/combat/sword_swing_3.ogg'
            ],
            loop: false,
            volume: 0.5,
            positional: false,
            cooldown: 100
        },
        sword_hit: {
            files: [
                'sounds/combat/sword_hit_1.ogg',
                'sounds/combat/sword_hit_2.ogg'
            ],
            loop: false,
            volume: 0.6,
            positional: true, // Should sound from enemy position
            cooldown: 50
        },
        enemy_death: {
            files: [
                'sounds/combat/enemy_death_1.ogg',
                'sounds/combat/enemy_death_2.ogg'
            ],
            loop: false,
            volume: 0.5,
            positional: true,
            cooldown: 100
        },
        player_hit: {
            files: ['sounds/combat/player_hurt.ogg'],
            loop: false,
            volume: 0.7,
            positional: false,
            cooldown: 200
        },
        // Trap sounds
        trap_spike: {
            files: ['sounds/combat/trap_spike.ogg'],
            loop: false,
            volume: 0.6,
            positional: true,
            cooldown: 200
        },
        trap_arrow: {
            files: ['sounds/combat/trap_arrow.ogg'],
            loop: false,
            volume: 0.6,
            positional: true,
            cooldown: 200
        },
        trap_blade: {
            files: ['sounds/combat/trap_blade.ogg'],
            loop: false,
            volume: 0.7,
            positional: true,
            cooldown: 200
        },
        trap_pit: {
            files: ['sounds/combat/trap_pit.ogg'],
            loop: false,
            volume: 0.6,
            positional: true,
            cooldown: 200
        },
        trap_fire: {
            files: ['sounds/combat/trap_fire.ogg'],
            loop: false,
            volume: 0.6,
            positional: true,
            cooldown: 200
        },
        trap_boulder: {
            files: ['sounds/combat/trap_boulder.ogg'],
            loop: false,
            volume: 0.7,
            positional: true,
            cooldown: 200
        }
    },

    // Environmental sounds
    environment: {
        torch_crackle: {
            files: ['sounds/environment/torch_crackle.ogg'],
            loop: true,
            volume: 0.25,
            positional: true, // Each torch has its own sound
            cooldown: 0
        },
        distant_groan: {
            files: [
                'sounds/environment/distant_groan_1.ogg',
                'sounds/environment/distant_groan_2.ogg'
            ],
            loop: false,
            volume: 0.3,
            positional: true,
            cooldown: 5000 // Only play occasionally
        },
        // Door transition sounds (Resident Evil style)
        door_handle_wood: {
            files: ['sounds/environment/door_handle_wood.ogg'],
            loop: false,
            volume: 0.5,
            positional: false,
            cooldown: 100
        },
        door_handle_metal: {
            files: ['sounds/environment/door_handle_metal.ogg'],
            loop: false,
            volume: 0.6,
            positional: false,
            cooldown: 100
        },
        door_handle_ornate: {
            files: ['sounds/environment/door_handle_ornate.ogg'],
            loop: false,
            volume: 0.5,
            positional: false,
            cooldown: 100
        },
        door_creak_wood: {
            files: ['sounds/environment/door_creak_wood.ogg'],
            loop: false,
            volume: 0.6,
            positional: false,
            cooldown: 200
        },
        door_creak_metal: {
            files: ['sounds/environment/door_creak_metal.ogg'],
            loop: false,
            volume: 0.7,
            positional: false,
            cooldown: 200
        },
        door_creak_ornate: {
            files: ['sounds/environment/door_creak_ornate.ogg'],
            loop: false,
            volume: 0.6,
            positional: false,
            cooldown: 200
        },
        door_open_wood: {
            files: ['sounds/environment/door_open_wood.ogg'],
            loop: false,
            volume: 0.5,
            positional: false,
            cooldown: 100
        },
        door_open_heavy: {
            files: ['sounds/environment/door_open_heavy.ogg'],
            loop: false,
            volume: 0.7,
            positional: false,
            cooldown: 100
        },
        door_open_grand: {
            files: ['sounds/environment/door_open_grand.ogg'],
            loop: false,
            volume: 0.6,
            positional: false,
            cooldown: 100
        },
        door_footstep: {
            files: ['sounds/environment/door_footstep.ogg'],
            loop: false,
            volume: 0.5,
            positional: false,
            cooldown: 200
        },
        door_footstep_slow: {
            files: ['sounds/environment/door_footstep_slow.ogg'],
            loop: false,
            volume: 0.5,
            positional: false,
            cooldown: 200
        },
        door_footstep_confident: {
            files: ['sounds/environment/door_footstep_confident.ogg'],
            loop: false,
            volume: 0.5,
            positional: false,
            cooldown: 200
        }
    },

    // UI sounds
    ui: {
        menu_click: {
            files: ['sounds/ui/menu_click.ogg'],
            loop: false,
            volume: 0.6,
            positional: false,
            cooldown: 50
        },
        attack_failed: {
            files: ['sounds/ui/attack_cooldown.ogg'],
            loop: false,
            volume: 0.4,
            positional: false,
            cooldown: 100
        },
        chest_open: {
            files: ['sounds/ui/chest_open.ogg'],
            loop: false,
            volume: 0.6,
            positional: true,
            cooldown: 200
        },
        chest_locked: {
            files: ['sounds/ui/chest_locked.ogg'],
            loop: false,
            volume: 0.5,
            positional: true,
            cooldown: 200
        }
    },

    // Background music (optional, atmospheric only)
    music: {
        ambient_track: {
            files: ['sounds/music/dark_ambient.ogg'],
            loop: true,
            volume: 0.15,
            positional: false
        }
    }
};

/**
 * Placeholder sound generator
 * Generates simple sine wave sounds for testing when actual sound files aren't available
 */
export class PlaceholderSoundGenerator {
    constructor(audioContext) {
        this.audioContext = audioContext;
    }

    /**
     * Generate a simple tone buffer for testing
     */
    generateTone(frequency, duration, type = 'sine') {
        const sampleRate = this.audioContext.sampleRate;
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 2); // Decay envelope

            if (type === 'sine') {
                data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
            } else if (type === 'noise') {
                data[i] = (Math.random() * 2 - 1) * envelope * 0.1;
            }
        }

        return buffer;
    }

    /**
     * Create placeholder sounds for testing
     */
    createPlaceholderSounds() {
        return {
            footstep: this.generateTone(100, 0.1, 'noise'),
            sword_swing: this.generateTone(200, 0.2, 'sine'),
            hit: this.generateTone(150, 0.15, 'noise'),
            ui_click: this.generateTone(800, 0.05, 'sine')
        };
    }
}

/**
 * Get all sound files that need to be loaded
 */
export function getAllSoundFiles() {
    const files = new Set();

    Object.values(SOUND_CONFIG).forEach(category => {
        Object.values(category).forEach(sound => {
            sound.files.forEach(file => files.add(file));
        });
    });

    return Array.from(files);
}

/**
 * Check if sound files exist (for development)
 */
export function getSoundLoadingStatus() {
    const status = {
        total: 0,
        categories: {}
    };

    Object.entries(SOUND_CONFIG).forEach(([categoryName, category]) => {
        status.categories[categoryName] = {
            sounds: Object.keys(category).length,
            files: 0
        };

        Object.values(category).forEach(sound => {
            status.categories[categoryName].files += sound.files.length;
            status.total += sound.files.length;
        });
    });

    return status;
}
