import * as THREE from 'three';

/**
 * AudioManager - Centralized audio system for the game
 * Handles spatial audio, volume controls, and sound categories
 */
export class AudioManager {
    constructor(camera) {
        // Audio listener attached to camera
        this.listener = new THREE.AudioListener();
        camera.add(this.listener);

        // Audio loader
        this.loader = new THREE.AudioLoader();

        // Sound categories with individual volume controls
        this.categories = {
            ambience: { volume: 0.3, sounds: new Map() },
            footsteps: { volume: 0.4, sounds: new Map() },
            combat: { volume: 0.5, sounds: new Map() },
            environment: { volume: 0.35, sounds: new Map() },
            ui: { volume: 0.6, sounds: new Map() },
            music: { volume: 0.15, sounds: new Map() }
        };

        // Master volume
        this.masterVolume = 1.0;

        // Cooldown tracking to prevent audio spam
        this.cooldowns = new Map();

        // Currently playing positional sounds
        this.positionalSounds = new Map();

        // Audio context state
        this.initialized = false;
        this.audioContext = null;
    }

    /**
     * Initialize audio context (must be called after user interaction)
     */
    async init() {
        if (this.initialized) return;

        // Resume audio context if suspended (browser autoplay policy)
        if (this.listener.context.state === 'suspended') {
            try {
                await this.listener.context.resume();
            } catch (error) {
                console.warn('Failed to resume audio context:', error);
                return false;
            }
        }

        this.audioContext = this.listener.context;
        this.initialized = true;
        return true;
    }

    /**
     * Load a sound file
     * @param {string} category - Sound category
     * @param {string} name - Sound identifier
     * @param {string} url - Path to audio file
     * @param {boolean} loop - Whether sound should loop
     * @param {boolean} positional - Whether sound is 3D positional
     */
    loadSound(category, name, url, loop = false, positional = false) {
        return new Promise((resolve, reject) => {
            if (!this.categories[category]) {
                reject(new Error(`Invalid category: ${category}`));
                return;
            }

            this.loader.load(
                url,
                (buffer) => {
                    const sound = positional
                        ? new THREE.PositionalAudio(this.listener)
                        : new THREE.Audio(this.listener);

                    sound.setBuffer(buffer);
                    sound.setLoop(loop);
                    sound.setVolume(this.categories[category].volume * this.masterVolume);

                    // Configure positional audio
                    if (positional) {
                        sound.setRefDistance(2); // Distance at which volume starts to decrease
                        sound.setMaxDistance(20); // Maximum distance for audibility
                        sound.setRolloffFactor(1); // How quickly volume decreases with distance
                    }

                    this.categories[category].sounds.set(name, sound);
                    resolve(sound);
                },
                undefined,
                (error) => {
                    console.error(`Failed to load sound ${name}:`, error);
                    reject(error);
                }
            );
        });
    }

    /**
     * Load multiple sound variations (for randomization)
     */
    async loadSoundVariations(category, baseName, urls, loop = false, positional = false) {
        const promises = urls.map((url, index) => {
            const name = `${baseName}_${index}`;
            return this.loadSound(category, name, url, loop, positional);
        });
        return Promise.all(promises);
    }

    /**
     * Play a sound
     * @param {string} category - Sound category
     * @param {string} name - Sound identifier
     * @param {number} cooldown - Minimum time (ms) between plays
     */
    play(category, name, cooldown = 0) {
        if (!this.initialized) return null;

        const categoryData = this.categories[category];
        if (!categoryData) {
            console.warn(`Invalid category: ${category}`);
            return null;
        }

        // Check cooldown
        const cooldownKey = `${category}_${name}`;
        if (cooldown > 0 && this.cooldowns.has(cooldownKey)) {
            return null;
        }

        const sound = categoryData.sounds.get(name);
        if (!sound) {
            console.warn(`Sound not found: ${name} in category ${category}`);
            return null;
        }

        // Stop if already playing (unless it's a looping sound)
        if (sound.isPlaying && !sound.getLoop()) {
            sound.stop();
        }

        // Play sound
        if (!sound.isPlaying) {
            sound.play();
        }

        // Set cooldown
        if (cooldown > 0) {
            this.cooldowns.set(cooldownKey, true);
            setTimeout(() => this.cooldowns.delete(cooldownKey), cooldown);
        }

        return sound;
    }

    /**
     * Play a random variation from a set
     * @param {string} category
     * @param {string} baseName
     * @param {number} variationCount - Number of variations
     * @param {number} cooldown
     */
    playRandomVariation(category, baseName, variationCount, cooldown = 0) {
        const index = Math.floor(Math.random() * variationCount);
        const name = `${baseName}_${index}`;
        return this.play(category, name, cooldown);
    }

    /**
     * Play a positional sound at a specific location
     * @param {string} category
     * @param {string} name
     * @param {THREE.Vector3} position
     * @param {THREE.Object3D} parent - Optional parent object
     */
    playPositional(category, name, position, parent = null) {
        const sound = this.play(category, name);
        if (!sound) return null;

        // Create a temporary object to hold the sound
        const soundObject = new THREE.Object3D();
        soundObject.position.copy(position);
        soundObject.add(sound);

        if (parent) {
            parent.add(soundObject);
        }

        // Track positional sound
        const key = `${category}_${name}_${Date.now()}`;
        this.positionalSounds.set(key, soundObject);

        // Remove when done (if not looping)
        if (!sound.getLoop()) {
            sound.onEnded = () => {
                this.positionalSounds.delete(key);
                if (parent) {
                    parent.remove(soundObject);
                }
            };
        }

        return soundObject;
    }

    /**
     * Stop a sound
     */
    stop(category, name) {
        const sound = this.categories[category]?.sounds.get(name);
        if (sound && sound.isPlaying) {
            sound.stop();
        }
    }

    /**
     * Stop all sounds in a category
     */
    stopCategory(category) {
        const categoryData = this.categories[category];
        if (!categoryData) return;

        categoryData.sounds.forEach(sound => {
            if (sound.isPlaying) {
                sound.stop();
            }
        });
    }

    /**
     * Stop all sounds
     */
    stopAll() {
        Object.keys(this.categories).forEach(category => {
            this.stopCategory(category);
        });
    }

    /**
     * Set volume for a category
     */
    setCategoryVolume(category, volume) {
        const categoryData = this.categories[category];
        if (!categoryData) return;

        categoryData.volume = Math.max(0, Math.min(1, volume));

        // Update all sounds in category
        categoryData.sounds.forEach(sound => {
            sound.setVolume(categoryData.volume * this.masterVolume);
        });
    }

    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));

        // Update all sounds
        Object.values(this.categories).forEach(categoryData => {
            categoryData.sounds.forEach(sound => {
                sound.setVolume(categoryData.volume * this.masterVolume);
            });
        });
    }

    /**
     * Get volume for a category
     */
    getCategoryVolume(category) {
        return this.categories[category]?.volume ?? 0;
    }

    /**
     * Duck other sounds (reduce volume) when important sound plays
     * @param {number} duckAmount - Amount to reduce (0-1)
     * @param {Array<string>} excludeCategories - Categories to not duck
     */
    duck(duckAmount = 0.5, excludeCategories = []) {
        Object.entries(this.categories).forEach(([category, categoryData]) => {
            if (excludeCategories.includes(category)) return;

            categoryData.sounds.forEach(sound => {
                if (sound.isPlaying) {
                    const targetVolume = categoryData.volume * this.masterVolume * (1 - duckAmount);
                    sound.setVolume(targetVolume);
                }
            });
        });
    }

    /**
     * Restore volume after ducking
     */
    unduck() {
        Object.values(this.categories).forEach(categoryData => {
            categoryData.sounds.forEach(sound => {
                if (sound.isPlaying) {
                    sound.setVolume(categoryData.volume * this.masterVolume);
                }
            });
        });
    }

    /**
     * Fade in a sound
     */
    fadeIn(category, name, duration = 1000) {
        const sound = this.categories[category]?.sounds.get(name);
        if (!sound) return;

        const targetVolume = this.categories[category].volume * this.masterVolume;
        const startTime = Date.now();
        sound.setVolume(0);

        if (!sound.isPlaying) {
            sound.play();
        }

        const fade = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            sound.setVolume(targetVolume * progress);

            if (progress < 1) {
                requestAnimationFrame(fade);
            }
        };

        fade();
    }

    /**
     * Fade out a sound
     */
    fadeOut(category, name, duration = 1000) {
        const sound = this.categories[category]?.sounds.get(name);
        if (!sound || !sound.isPlaying) return;

        const startVolume = sound.getVolume();
        const startTime = Date.now();

        const fade = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            sound.setVolume(startVolume * (1 - progress));

            if (progress < 1) {
                requestAnimationFrame(fade);
            } else {
                sound.stop();
            }
        };

        fade();
    }

    /**
     * Update (call each frame if needed for dynamic effects)
     */
    update(deltaTime) {
        // Can be used for dynamic volume adjustments, 3D sound updates, etc.
        // Currently placeholder for future features
    }

    /**
     * Get debug info
     */
    getDebugInfo() {
        const info = {
            initialized: this.initialized,
            masterVolume: this.masterVolume,
            categories: {}
        };

        Object.entries(this.categories).forEach(([name, data]) => {
            info.categories[name] = {
                volume: data.volume,
                soundCount: data.sounds.size,
                playing: Array.from(data.sounds.entries())
                    .filter(([_, sound]) => sound.isPlaying)
                    .map(([name, _]) => name)
            };
        });

        return info;
    }
}
