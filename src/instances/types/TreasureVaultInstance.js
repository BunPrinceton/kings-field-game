// TreasureVaultInstance.js - Treasure vault with gold and gems
import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class TreasureVaultInstance extends Instance {
    constructor(definition) {
        super(definition);
    }

    placeFeatures() {
        const features = this.definition.features;

        if (features.goldPiles) {
            this.placeGoldPiles(features.goldPiles);
        }
        if (features.gemstones) {
            this.placeGemstones(features.gemstones);
        }
        if (features.chests) {
            this.placeChests(features.chests);
        }
        if (features.pedestals) {
            this.placePedestals(features.pedestals);
        }
    }

    placeGoldPiles(count) {
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 18;
            const z = (Math.random() - 0.5) * 18;
            this.createGoldPile(x, z);
        }
    }

    createGoldPile(x, z) {
        const pileGroup = new THREE.Group();
        const coinCount = 15;

        for (let i = 0; i < coinCount; i++) {
            const coinGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.03, 16);
            const coinMaterial = new THREE.MeshStandardMaterial({
                color: 0xffaa00,
                roughness: 0.3,
                metalness: 0.8
            });
            const coin = new THREE.Mesh(coinGeometry, coinMaterial);
            coin.position.set(
                x + (Math.random() - 0.5) * 0.8,
                0.02 + i * 0.04,
                z + (Math.random() - 0.5) * 0.8
            );
            coin.rotation.y = Math.random() * Math.PI;
            pileGroup.add(coin);
        }

        this.scene.add(pileGroup);
        this.meshes.push(pileGroup);
    }

    placeGemstones(count) {
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 20;
            const color = [0xff0000, 0x0000ff, 0x00ff00, 0xff00ff, 0x00ffff][Math.floor(Math.random() * 5)];
            this.createGemstone(x, z, color);
        }
    }

    createGemstone(x, z, color) {
        const gemGeometry = new THREE.OctahedronGeometry(0.2);
        const gemMaterial = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.4,
            roughness: 0.2,
            metalness: 0.8,
            transparent: true,
            opacity: 0.9
        });
        const gem = new THREE.Mesh(gemGeometry, gemMaterial);
        gem.position.set(x, 0.2, z);
        gem.rotation.y = Math.random() * Math.PI;
        gem.userData.isGem = true;
        this.scene.add(gem);
        this.meshes.push(gem);

        // Gem light
        const light = new THREE.PointLight(color, 1, 4);
        light.position.set(x, 0.3, z);
        this.scene.add(light);
        this.lights.push(light);
    }

    placeChests(count) {
        const positions = [];
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = 8;
            positions.push({
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius
            });
        }

        for (const pos of positions) {
            this.createChest(pos.x, pos.z);
        }
    }

    createChest(x, z) {
        const chestGeometry = new THREE.BoxGeometry(1.2, 1, 0.8);
        const chestMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.7,
            metalness: 0.3
        });
        const chest = new THREE.Mesh(chestGeometry, chestMaterial);
        chest.position.set(x, 0.5, z);
        this.scene.add(chest);
        this.meshes.push(chest);

        // Gold bands
        const bandMaterial = new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            roughness: 0.3,
            metalness: 0.9
        });
        const bandGeometry = new THREE.BoxGeometry(1.3, 0.1, 0.85);
        const band = new THREE.Mesh(bandGeometry, bandMaterial);
        band.position.set(x, 0.5, z);
        this.scene.add(band);
        this.meshes.push(band);
    }

    placePedestals(count) {
        const positions = [
            { x: -6, z: -6 }, { x: 6, z: -6 },
            { x: -6, z: 6 }, { x: 6, z: 6 }
        ];

        for (let i = 0; i < Math.min(count, positions.length); i++) {
            const pos = positions[i];
            this.createPedestal(pos.x, pos.z);
        }
    }

    createPedestal(x, z) {
        const pedestalGeometry = new THREE.CylinderGeometry(0.6, 0.8, 1.5, 12);
        const pedestalMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a5a4a,
            roughness: 0.8,
            metalness: 0.2
        });
        const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
        pedestal.position.set(x, 0.75, z);
        this.scene.add(pedestal);
        this.meshes.push(pedestal);

        // Glowing orb on top
        const orbGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const orbMaterial = new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            emissive: 0xffaa00,
            emissiveIntensity: 0.8
        });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(x, 1.8, z);
        orb.userData.isOrb = true;
        this.scene.add(orb);
        this.meshes.push(orb);

        // Light
        const light = new THREE.PointLight(0xffaa00, 2, 8);
        light.position.set(x, 1.8, z);
        this.scene.add(light);
        this.lights.push(light);
    }

    update(deltaTime, player) {
        super.update(deltaTime, player);

        const time = Date.now() * 0.001;

        // Rotate gems
        for (const mesh of this.meshes) {
            if (mesh.userData.isGem) {
                mesh.rotation.y += deltaTime * 0.5;
                mesh.position.y = 0.2 + Math.sin(time * 2 + mesh.position.x) * 0.05;
            }
            if (mesh.userData.isOrb) {
                mesh.rotation.y += deltaTime * 0.3;
                mesh.position.y = 1.8 + Math.sin(time + mesh.position.x) * 0.1;
            }
        }
    }
}
