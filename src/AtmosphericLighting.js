// AtmosphericLighting.js - Manages atmospheric lighting for dark dungeon atmosphere
import * as THREE from 'three';

export class AtmosphericLighting {
    constructor(scene, config = {}) {
        this.scene = scene;

        // Configuration for Kings Field-style atmosphere (brightened)
        this.config = {
            ambientColor: config.ambientColor || 0x404040,
            ambientIntensity: config.ambientIntensity || 0.6,
            fogColor: config.fogColor || 0x111111,
            fogNear: config.fogNear || 0.5,
            fogFar: config.fogFar || 15,
            ...config
        };

        this.lights = {
            ambient: null,
            player: null
        };

        // Base intensity for player light (used by pulse animation)
        this.playerLightBaseIntensity = 1.8;

        this.setupLighting();
    }

    setupLighting() {
        // Brightened ambient light so you can actually see!
        this.lights.ambient = new THREE.AmbientLight(
            this.config.ambientColor,
            this.config.ambientIntensity
        );
        this.scene.add(this.lights.ambient);

        // Stronger player light (follows camera)
        // Intensity set to match the pulsing base value for consistency
        this.lights.player = new THREE.PointLight(0xffffdd, 1.8, 20);
        this.lights.player.position.set(0, 1.6, 0);
        this.scene.add(this.lights.player);

        // Add a directional "skylight" for overall visibility
        this.lights.directional = new THREE.DirectionalLight(0xffffff, 1.2);
        this.lights.directional.position.set(10, 20, 10);
        this.scene.add(this.lights.directional);
    }

    setupFog() {
        // Dense fog for atmosphere
        this.scene.fog = new THREE.Fog(
            this.config.fogColor,
            this.config.fogNear,
            this.config.fogFar
        );

        // Dark background
        this.scene.background = new THREE.Color(this.config.fogColor);
    }

    updatePlayerLight(position) {
        // Update player light position
        if (this.lights.player) {
            this.lights.player.position.set(
                position.x,
                position.y,
                position.z
            );
        }
    }

    createDynamicLight(position, color = 0xffaa00, intensity = 1.5, distance = 10) {
        const light = new THREE.PointLight(color, intensity, distance);
        light.position.copy(position);
        light.castShadow = true;
        light.shadow.bias = -0.001;
        this.scene.add(light);
        return light;
    }

    setTimeOfDay(timeValue) {
        // For future: cycle between day/night or different dungeon depths
        // timeValue: 0 (deepest/darkest) to 1 (lighter areas)
        const intensity = 0.1 + (timeValue * 0.5);
        const fogFar = 10 + (timeValue * 20);

        if (this.lights.ambient) {
            this.lights.ambient.intensity = intensity;
        }

        if (this.scene.fog) {
            this.scene.fog.far = fogFar;
        }
    }

    /**
     * Adjust overall lighting brightness (useful for accessibility)
     * @param {number} multiplier - Brightness multiplier (0.5 = darker, 1.5 = brighter)
     */
    setBrightness(multiplier) {
        multiplier = Math.max(0.1, Math.min(3.0, multiplier)); // Clamp between 0.1 and 3.0

        if (this.lights.ambient) {
            this.lights.ambient.intensity = this.config.ambientIntensity * multiplier;
        }

        if (this.lights.directional) {
            this.lights.directional.intensity = 1.2 * multiplier;
        }

        // Don't adjust player light as much - it should stay consistent
        const playerMultiplier = 0.8 + (multiplier * 0.2);
        if (this.lights.player) {
            // Update the base intensity that the pulse animation uses
            this.playerLightBaseIntensity = 1.8 * playerMultiplier;
        }
    }

    /**
     * Get current lighting statistics for debugging
     */
    getStats() {
        return {
            ambientIntensity: this.lights.ambient?.intensity || 0,
            playerLightIntensity: this.lights.player?.intensity || 0,
            directionalIntensity: this.lights.directional?.intensity || 0,
            fogNear: this.scene.fog?.near || 0,
            fogFar: this.scene.fog?.far || 0
        };
    }

    enableShadows(renderer) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    update(time) {
        // Gentle pulse for player light to simulate torch/lantern flicker
        if (this.lights.player) {
            // More noticeable pulse with multiple frequencies for organic feel
            const pulse = Math.sin(time * 2) * 0.15 + Math.sin(time * 5.3) * 0.08;
            this.lights.player.intensity = this.playerLightBaseIntensity + pulse;
        }
    }
}
