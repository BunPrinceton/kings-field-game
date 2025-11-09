// ChapelInstance.js - Holy chapel
import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class ChapelInstance extends Instance {
    constructor(definition) {
        super(definition);
    }

    placeFeatures() {
        const features = this.definition.features;

        if (features.altar) {
            this.createAltar();
        }
        if (features.pews) {
            this.placePews(features.pews);
        }
        if (features.candles) {
            this.placeCandles(features.candles);
        }
    }

    createAltar() {
        const altarGeometry = new THREE.BoxGeometry(3, 1.2, 1.5);
        const altarMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.4,
            metalness: 0.6
        });
        const altar = new THREE.Mesh(altarGeometry, altarMaterial);
        altar.position.set(0, 0.6, -this.definition.size.depth / 2 + 5);
        this.scene.add(altar);
        this.meshes.push(altar);

        // Holy light above altar
        const light = new THREE.PointLight(0xffffff, 4, 15);
        light.position.set(0, 5, altar.position.z);
        this.scene.add(light);
        this.lights.push(light);
    }

    placePews(count) {
        const pewsPerSide = count / 2;
        const spacing = 3;

        for (let i = 0; i < pewsPerSide; i++) {
            const z = -5 + i * spacing;
            this.createPew(-3, z);
            this.createPew(3, z);
        }
    }

    createPew(x, z) {
        const pewGeometry = new THREE.BoxGeometry(2, 0.8, 0.4);
        const pewMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3a2a,
            roughness: 0.8
        });
        const pew = new THREE.Mesh(pewGeometry, pewMaterial);
        pew.position.set(x, 0.4, z);
        this.scene.add(pew);
        this.meshes.push(pew);
    }

    placeCandles(count) {
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 18;
            const z = (Math.random() - 0.5) * 25;
            this.createCandle(x, z);
        }
    }

    createCandle(x, z) {
        const candleGeometry = new THREE.CylinderGeometry(0.05, 0.06, 0.4, 8);
        const candleMaterial = new THREE.MeshStandardMaterial({
            color: 0xfff8dc
        });
        const candle = new THREE.Mesh(candleGeometry, candleMaterial);
        candle.position.set(x, 0.2, z);
        this.scene.add(candle);
        this.meshes.push(candle);

        // Flame
        const flameGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const flameMaterial = new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            emissive: 0xffaa00,
            emissiveIntensity: 1
        });
        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.position.set(x, 0.48, z);
        flame.userData.isCandle = true;
        this.scene.add(flame);
        this.meshes.push(flame);

        // Light
        const light = new THREE.PointLight(0xffaa00, 1, 4);
        light.position.set(x, 0.5, z);
        this.scene.add(light);
        this.lights.push(light);
    }

    update(deltaTime, player) {
        super.update(deltaTime, player);

        const time = Date.now() * 0.001;
        for (const mesh of this.meshes) {
            if (mesh.userData.isCandle) {
                const flicker = Math.sin(time * 6 + mesh.position.x) * 0.05 + 1;
                mesh.scale.set(flicker, flicker, flicker);
            }
        }
    }
}
