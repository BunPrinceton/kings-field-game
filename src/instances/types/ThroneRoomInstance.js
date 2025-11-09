// ThroneRoomInstance.js - Grand throne room
import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class ThroneRoomInstance extends Instance {
    constructor(definition) {
        super(definition);
    }

    placeFeatures() {
        const features = this.definition.features;

        if (features.throne) {
            this.createThrone();
        }
        if (features.pillars) {
            this.placePillars(features.pillars);
        }
        if (features.redCarpet) {
            this.createRedCarpet();
        }
        if (features.banners) {
            this.placeBanners(features.banners);
        }
    }

    createThrone() {
        // Throne base
        const baseGeometry = new THREE.BoxGeometry(2, 2.5, 2);
        const throneMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3a2a,
            roughness: 0.6,
            metalness: 0.4
        });
        const base = new THREE.Mesh(baseGeometry, throneMaterial);
        base.position.set(0, 1.25, -this.definition.size.depth / 2 + 5);
        this.scene.add(base);
        this.meshes.push(base);

        // Gold accents
        const goldMaterial = new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            roughness: 0.3,
            metalness: 0.9
        });

        // Armrests
        const armGeometry = new THREE.BoxGeometry(0.3, 0.8, 1.5);
        [-1, 1].forEach(side => {
            const arm = new THREE.Mesh(armGeometry, goldMaterial);
            arm.position.set(side * 0.85, 1.9, base.position.z);
            this.scene.add(arm);
            this.meshes.push(arm);
        });

        // Crown decoration
        const crownGeometry = new THREE.ConeGeometry(0.5, 0.8, 8);
        const crown = new THREE.Mesh(crownGeometry, goldMaterial);
        crown.position.set(0, 3.2, base.position.z - 0.5);
        this.scene.add(crown);
        this.meshes.push(crown);
    }

    createRedCarpet() {
        const carpetGeometry = new THREE.PlaneGeometry(4, this.definition.size.depth - 10);
        const carpetMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a2a2a,
            roughness: 0.9
        });
        const carpet = new THREE.Mesh(carpetGeometry, carpetMaterial);
        carpet.rotation.x = -Math.PI / 2;
        carpet.position.y = 0.02;
        this.scene.add(carpet);
        this.meshes.push(carpet);
    }

    placePillars(count) {
        const pillarsPerSide = count / 2;
        const spacing = this.definition.size.depth / (pillarsPerSide + 1);

        for (let i = 0; i < pillarsPerSide; i++) {
            const z = -this.definition.size.depth / 2 + (i + 1) * spacing;
            this.createPillar(-10, z);
            this.createPillar(10, z);
        }
    }

    createPillar(x, z) {
        const pillarGeometry = new THREE.CylinderGeometry(0.8, 1, this.definition.size.height, 12);
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a5a5a,
            roughness: 0.8,
            metalness: 0.2
        });
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.set(x, this.definition.size.height / 2, z);
        this.scene.add(pillar);
        this.meshes.push(pillar);
    }

    placeBanners(count) {
        const spacing = this.definition.size.depth / (count / 2);

        for (let i = 0; i < count / 2; i++) {
            const z = -this.definition.size.depth / 2 + i * spacing;
            this.createBanner(-this.definition.size.width / 2 + 2, z);
            this.createBanner(this.definition.size.width / 2 - 2, z);
        }
    }

    createBanner(x, z) {
        const bannerGeometry = new THREE.PlaneGeometry(1.5, 3);
        const bannerMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a3a3a,
            roughness: 0.8,
            side: THREE.DoubleSide
        });
        const banner = new THREE.Mesh(bannerGeometry, bannerMaterial);
        banner.position.set(x, 5, z);
        banner.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
        this.scene.add(banner);
        this.meshes.push(banner);
    }
}
