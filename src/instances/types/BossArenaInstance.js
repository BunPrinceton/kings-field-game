// BossArenaInstance.js - Boss battle arena with dramatic features
import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class BossArenaInstance extends Instance {
    constructor(definition) {
        super(definition);
        this.bossDefeated = false;
    }

    async generateGeometry() {
        await super.generateGeometry();

        // Customize floor with pattern
        const size = this.definition.size;
        this.createArenaFloorPattern(size.width, size.depth);
    }

    createArenaFloorPattern(width, depth) {
        // Create circular platform in center
        const platformGeometry = new THREE.CylinderGeometry(8, 8, 0.3, 32);
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2a2a,
            roughness: 0.8,
            metalness: 0.2
        });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.set(0, 0.15, 0);
        this.scene.add(platform);
        this.meshes.push(platform);
    }

    placeFeatures() {
        const features = this.definition.features;

        // Place pillars around the arena
        if (features.pillars) {
            this.placePillars();
        }

        // Place torches
        if (features.torches) {
            this.placeTorches();
        }

        // Center platform
        if (features.centerPlatform) {
            this.createCenterPlatform();
        }
    }

    placePillars() {
        const pillarCount = 8;
        const radius = 15;
        const angleStep = (Math.PI * 2) / pillarCount;

        for (let i = 0; i < pillarCount; i++) {
            const angle = angleStep * i;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            const pillarGeometry = new THREE.CylinderGeometry(0.8, 1.0, this.definition.size.height, 8);
            const pillarMaterial = new THREE.MeshStandardMaterial({
                color: 0x2a1a1a,
                roughness: 0.9,
                metalness: 0.2
            });
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(x, this.definition.size.height / 2, z);
            this.scene.add(pillar);
            this.meshes.push(pillar);

            // Add red torch on each pillar
            const torchLight = new THREE.PointLight(0xaa0000, 2, 10);
            torchLight.position.set(x, this.definition.size.height * 0.8, z);
            this.scene.add(torchLight);
            this.lights.push(torchLight);

            // Torch flame
            const flameGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const flameMaterial = new THREE.MeshStandardMaterial({
                color: 0xff3300,
                emissive: 0xff3300,
                emissiveIntensity: 1
            });
            const flame = new THREE.Mesh(flameGeometry, flameMaterial);
            flame.position.set(x, this.definition.size.height * 0.8, z);
            flame.userData.isTorch = true;
            this.scene.add(flame);
            this.meshes.push(flame);
        }
    }

    placeTorches() {
        // Additional wall torches
        const torchPositions = [
            { x: -this.definition.size.width / 2 + 2, z: 0 },
            { x: this.definition.size.width / 2 - 2, z: 0 },
            { x: 0, z: -this.definition.size.depth / 2 + 2 },
            { x: 0, z: this.definition.size.depth / 2 - 2 }
        ];

        for (const pos of torchPositions) {
            const light = new THREE.PointLight(0xff4400, 2.5, 12);
            light.position.set(pos.x, 2.5, pos.z);
            this.scene.add(light);
            this.lights.push(light);
        }
    }

    createCenterPlatform() {
        // Raised platform for dramatic effect
        const platformGeometry = new THREE.CylinderGeometry(10, 11, 0.5, 32);
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a2a2a,
            roughness: 0.7,
            metalness: 0.3
        });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.set(0, 0.25, 0);
        this.scene.add(platform);
        this.meshes.push(platform);

        // Add glowing runes on platform edge
        const runeCount = 12;
        const runeRadius = 9.5;
        const angleStep = (Math.PI * 2) / runeCount;

        for (let i = 0; i < runeCount; i++) {
            const angle = angleStep * i;
            const x = Math.cos(angle) * runeRadius;
            const z = Math.sin(angle) * runeRadius;

            const runeGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 6);
            const runeMaterial = new THREE.MeshStandardMaterial({
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 0.8
            });
            const rune = new THREE.Mesh(runeGeometry, runeMaterial);
            rune.position.set(x, 0.55, z);
            this.scene.add(rune);
            this.meshes.push(rune);
        }
    }

    spawnEntities() {
        // Boss spawn would go here
        console.log(`Boss arena ready for: ${this.definition.spawns?.boss || 'unknown boss'}`);
    }

    update(deltaTime, player) {
        super.update(deltaTime, player);

        // Animate torches
        const time = Date.now() * 0.001;
        for (const mesh of this.meshes) {
            if (mesh.userData.isTorch) {
                const flicker = Math.sin(time * 8) * 0.1 + 1;
                mesh.scale.set(flicker, flicker, flicker);
            }
        }
    }

    // Called when boss is defeated
    onBossDefeated() {
        this.bossDefeated = true;
        this.complete();

        // Spawn reward chest
        console.log('Boss defeated! Rewards unlocked!');
    }
}
