// SafeHavenInstance.js - Peaceful rest area with services
import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class SafeHavenInstance extends Instance {
    constructor(definition) {
        super(definition);
    }

    placeFeatures() {
        const features = this.definition.features;

        if (features.healingFountain) {
            this.createHealingFountain();
        }
        if (features.campfire) {
            this.createCampfire();
        }
        if (features.bedrolls) {
            this.placeBedrolls(features.bedrolls);
        }
        if (features.savePoint) {
            this.createSavePoint();
        }
    }

    createHealingFountain() {
        // Fountain base
        const baseGeometry = new THREE.CylinderGeometry(1.2, 1.5, 0.8, 16);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a7a8a,
            roughness: 0.4,
            metalness: 0.6
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(0, 0.4, 0);
        this.scene.add(base);
        this.meshes.push(base);

        // Water
        const waterGeometry = new THREE.CylinderGeometry(1.1, 1.1, 0.2, 16);
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a9aff,
            emissive: 0x4a9aff,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.7
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.position.set(0, 0.85, 0);
        water.userData.isWater = true;
        this.scene.add(water);
        this.meshes.push(water);

        // Light
        const light = new THREE.PointLight(0x4a9aff, 3, 15);
        light.position.set(0, 1.5, 0);
        this.scene.add(light);
        this.lights.push(light);
    }

    createCampfire() {
        // Fire pit
        const pitGeometry = new THREE.CylinderGeometry(0.8, 0.9, 0.2, 16);
        const pitMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.9
        });
        const pit = new THREE.Mesh(pitGeometry, pitMaterial);
        pit.position.set(-5, 0.1, 5);
        this.scene.add(pit);
        this.meshes.push(pit);

        // Logs
        const logGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 8);
        const logMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3020,
            roughness: 0.8
        });

        for (let i = 0; i < 4; i++) {
            const log = new THREE.Mesh(logGeometry, logMaterial);
            const angle = (i / 4) * Math.PI * 2;
            log.position.set(
                -5 + Math.cos(angle) * 0.4,
                0.3,
                5 + Math.sin(angle) * 0.4
            );
            log.rotation.z = Math.PI / 2;
            log.rotation.y = angle;
            this.scene.add(log);
            this.meshes.push(log);
        }

        // Fire
        const fireGeometry = new THREE.ConeGeometry(0.5, 1, 8);
        const fireMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6600,
            emissive: 0xff6600,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 0.8
        });
        const fire = new THREE.Mesh(fireGeometry, fireMaterial);
        fire.position.set(-5, 0.7, 5);
        fire.userData.isFire = true;
        this.scene.add(fire);
        this.meshes.push(fire);

        // Fire light
        const light = new THREE.PointLight(0xff6600, 4, 12);
        light.position.set(-5, 1, 5);
        this.scene.add(light);
        this.lights.push(light);
    }

    placeBedrolls(count) {
        const positions = [
            { x: -7, z: -3 }, { x: -7, z: -5 },
            { x: 7, z: -3 }, { x: 7, z: -5 }
        ];

        for (let i = 0; i < Math.min(count, positions.length); i++) {
            const pos = positions[i];
            this.createBedroll(pos.x, pos.z);
        }
    }

    createBedroll(x, z) {
        const bedGeometry = new THREE.BoxGeometry(0.8, 0.1, 2);
        const bedMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a4a3a,
            roughness: 0.9
        });
        const bed = new THREE.Mesh(bedGeometry, bedMaterial);
        bed.position.set(x, 0.05, z);
        this.scene.add(bed);
        this.meshes.push(bed);

        // Pillow
        const pillowGeometry = new THREE.BoxGeometry(0.6, 0.2, 0.4);
        const pillow = new THREE.Mesh(pillowGeometry, bedMaterial);
        pillow.position.set(x, 0.2, z - 0.7);
        this.scene.add(pillow);
        this.meshes.push(pillow);
    }

    createSavePoint() {
        // Glowing crystal
        const crystalGeometry = new THREE.OctahedronGeometry(0.6);
        const crystalMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.8
        });
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        crystal.position.set(5, 1.2, -5);
        crystal.userData.isCrystal = true;
        this.scene.add(crystal);
        this.meshes.push(crystal);

        // Pedestal
        const pedestalGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1, 8);
        const pedestalMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a5a5a,
            roughness: 0.7
        });
        const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
        pedestal.position.set(5, 0.5, -5);
        this.scene.add(pedestal);
        this.meshes.push(pedestal);

        // Light
        const light = new THREE.PointLight(0x00ff88, 3, 10);
        light.position.set(5, 1.5, -5);
        this.scene.add(light);
        this.lights.push(light);
    }

    update(deltaTime, player) {
        super.update(deltaTime, player);

        const time = Date.now() * 0.001;

        // Animate water
        for (const mesh of this.meshes) {
            if (mesh.userData.isWater) {
                mesh.position.y = 0.85 + Math.sin(time * 2) * 0.03;
            }
            if (mesh.userData.isFire) {
                const flicker = Math.sin(time * 8) * 0.1 + 1;
                mesh.scale.set(flicker, 1 + Math.sin(time * 6) * 0.15, flicker);
            }
            if (mesh.userData.isCrystal) {
                mesh.rotation.y += deltaTime * 0.5;
                mesh.position.y = 1.2 + Math.sin(time * 1.5) * 0.1;
            }
        }
    }
}
