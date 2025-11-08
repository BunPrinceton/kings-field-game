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
        this.lights.player = new THREE.PointLight(0xffffdd, 2.5, 20);
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
        const intensity = 0.1 + (timeValue * 0.2);
        const fogFar = 10 + (timeValue * 15);

        if (this.lights.ambient) {
            this.lights.ambient.intensity = intensity;
        }

        if (this.scene.fog) {
            this.scene.fog.far = fogFar;
        }
    }

    enableShadows(renderer) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    update(time) {
        // Subtle pulse for player light
        if (this.lights.player) {
            const pulse = Math.sin(time * 2) * 0.05;
            this.lights.player.intensity = 0.8 + pulse;
        }
    }
}
