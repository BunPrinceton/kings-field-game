// MeditationRoomInstance.js - Zen meditation and contemplation space
import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class MeditationRoomInstance extends Instance {
    constructor(definition) {
        super(definition);
    }

    async generateGeometry() {
        await super.generateGeometry();

        const size = this.definition.size;

        // Create meditation circle with cushions
        this.createMeditationCircle(size.width, size.depth);

        // Create zen garden
        this.createZenGarden(size.width, size.depth);

        // Create water feature (small fountain)
        this.createWaterFountain(size.width, size.depth);

        // Create incense burners
        this.createIncenseBurners(size.width, size.depth);
    }

    createMeditationCircle(width, depth) {
        // Floor circle for meditation area
        const circleGeometry = new THREE.CylinderGeometry(6, 6, 0.1, 32);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a5a4a,
            roughness: 0.95
        });
        const floor = new THREE.Mesh(circleGeometry, floorMaterial);
        floor.position.set(0, 0.05, 0);
        this.scene.add(floor);
        this.meshes.push(floor);

        // 8 meditation cushions arranged in circle
        const cushionCount = 8;
        const radius = 4.5;
        const angleStep = (Math.PI * 2) / cushionCount;

        for (let i = 0; i < cushionCount; i++) {
            const angle = angleStep * i;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            this.createMeditationCushion(x, z, angle);
        }
    }

    createMeditationCushion(x, z, rotation) {
        // Cushion base
        const cushionGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.25, 16);
        const cushionMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a7a6a,
            roughness: 0.8
        });
        const cushion = new THREE.Mesh(cushionGeometry, cushionMaterial);
        cushion.position.set(x, 0.125, z);
        this.scene.add(cushion);
        this.meshes.push(cushion);

        // Top dome of cushion
        const topGeometry = new THREE.SphereGeometry(0.58, 16, 8);
        const top = new THREE.Mesh(topGeometry, cushionMaterial);
        top.position.set(x, 0.3, z);
        top.scale.set(1, 0.35, 1);
        this.scene.add(top);
        this.meshes.push(top);
    }

    createZenGarden(width, depth) {
        const gardenX = -width / 2 + 4;
        const gardenZ = -depth / 2 + 4;

        // Sand area
        const sandGeometry = new THREE.PlaneGeometry(4, 4);
        const sandMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4c5a9,
            roughness: 0.95
        });
        const sand = new THREE.Mesh(sandGeometry, sandMaterial);
        sand.rotation.x = -Math.PI / 2;
        sand.position.set(gardenX, 0.05, gardenZ);
        this.scene.add(sand);
        this.meshes.push(sand);

        // Garden border (wooden frame)
        const borderGeometry = new THREE.BoxGeometry(4.2, 0.3, 0.3);
        const borderMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.85
        });

        // North and South borders
        const northBorder = new THREE.Mesh(borderGeometry, borderMaterial);
        northBorder.position.set(gardenX, 0.15, gardenZ - 2.15);
        this.scene.add(northBorder);
        this.meshes.push(northBorder);

        const southBorder = new THREE.Mesh(borderGeometry, borderMaterial);
        southBorder.position.set(gardenX, 0.15, gardenZ + 2.15);
        this.scene.add(southBorder);
        this.meshes.push(southBorder);

        // East and West borders
        const sideBorderGeometry = new THREE.BoxGeometry(0.3, 0.3, 4.2);
        const westBorder = new THREE.Mesh(sideBorderGeometry, borderMaterial);
        westBorder.position.set(gardenX - 2.15, 0.15, gardenZ);
        this.scene.add(westBorder);
        this.meshes.push(westBorder);

        const eastBorder = new THREE.Mesh(sideBorderGeometry, borderMaterial);
        eastBorder.position.set(gardenX + 2.15, 0.15, gardenZ);
        this.scene.add(eastBorder);
        this.meshes.push(eastBorder);

        // Rocks in zen garden
        const rockPositions = [
            { x: gardenX - 1.5, z: gardenZ - 1.5 },
            { x: gardenX + 1.5, z: gardenZ - 1.5 },
            { x: gardenX - 1.5, z: gardenZ + 1.5 },
            { x: gardenX + 1.5, z: gardenZ + 1.5 },
            { x: gardenX, z: gardenZ }
        ];

        for (const pos of rockPositions) {
            this.createZenRock(pos.x, pos.z);
        }
    }

    createZenRock(x, z) {
        // Rock shape - irregular
        const rockGeometry = new THREE.SphereGeometry(0.35, 8, 6);
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x7a7a7a,
            roughness: 0.95
        });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.scale.set(0.8 + Math.random() * 0.4, 0.6, 1 + Math.random() * 0.3);
        rock.position.set(x, 0.25, z);
        this.scene.add(rock);
        this.meshes.push(rock);
    }

    createWaterFountain(width, depth) {
        const fountainX = width / 2 - 3;
        const fountainZ = -depth / 2 + 3;

        // Base/pool
        const baseGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.5, 16);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a7a8a,
            roughness: 0.7
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(fountainX, 0.25, fountainZ);
        this.scene.add(base);
        this.meshes.push(base);

        // Water surface
        const waterGeometry = new THREE.CylinderGeometry(1.15, 1.15, 0.05, 16);
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a8aaa,
            metalness: 0.3,
            roughness: 0.2,
            transparent: true,
            opacity: 0.7
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.position.set(fountainX, 0.5, fountainZ);
        water.userData.isWater = true;
        this.scene.add(water);
        this.meshes.push(water);

        // Center spout/pillar
        const spoutGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.8, 12);
        const spoutMaterial = new THREE.MeshStandardMaterial({
            color: 0x7a7a7a,
            roughness: 0.8
        });
        const spout = new THREE.Mesh(spoutGeometry, spoutMaterial);
        spout.position.set(fountainX, 0.7, fountainZ);
        this.scene.add(spout);
        this.meshes.push(spout);

        // Water flow visual (simple)
        const flowGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.4, 8);
        const flowMaterial = new THREE.MeshStandardMaterial({
            color: 0x6abaaa,
            metalness: 0.1,
            roughness: 0.3,
            transparent: true,
            opacity: 0.6
        });
        const flow = new THREE.Mesh(flowGeometry, flowMaterial);
        flow.position.set(fountainX, 0.85, fountainZ);
        this.scene.add(flow);
        this.meshes.push(flow);

        // Fountain light (soft glow)
        const fountainLight = new THREE.PointLight(0x8abaaa, 1.5, 8);
        fountainLight.position.set(fountainX, 1.2, fountainZ);
        this.scene.add(fountainLight);
        this.lights.push(fountainLight);
    }

    createIncenseBurners(width, depth) {
        // Incense burners in corners and edges
        const burnerPositions = [
            { x: -6, z: -6 },
            { x: 6, z: -6 },
            { x: -6, z: 6 },
            { x: 6, z: 6 },
            { x: 0, z: -7 }
        ];

        for (const pos of burnerPositions) {
            this.createIncenseBurner(pos.x, pos.z);
        }
    }

    createIncenseBurner(x, z) {
        // Burner bowl
        const bowlGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.3, 12);
        const bowlMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a5a3a,
            roughness: 0.8
        });
        const bowl = new THREE.Mesh(bowlGeometry, bowlMaterial);
        bowl.position.set(x, 0.15, z);
        this.scene.add(bowl);
        this.meshes.push(bowl);

        // Support stand
        const standGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.8, 8);
        const standMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.85
        });
        const stand = new THREE.Mesh(standGeometry, standMaterial);
        stand.position.set(x, 0.4, z);
        this.scene.add(stand);
        this.meshes.push(stand);

        // Incense smoke (glowing particles effect)
        const smokeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const smokeMaterial = new THREE.MeshStandardMaterial({
            color: 0xaa9a8a,
            emissive: 0x8a7a6a,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.5
        });
        const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
        smoke.position.set(x, 0.6, z);
        smoke.userData.isSmoke = true;
        this.scene.add(smoke);
        this.meshes.push(smoke);

        // Incense light
        const incenseLight = new THREE.PointLight(0xaa8a6a, 1, 5);
        incenseLight.position.set(x, 0.8, z);
        this.scene.add(incenseLight);
        this.lights.push(incenseLight);
    }

    placeFeatures() {
        const features = this.definition.features;

        if (features.candles) {
            this.placeCandles();
        }

        if (features.gong) {
            this.createGong();
        }
    }

    placeCandles() {
        // Many candles throughout space for soft lighting
        const candlePositions = [
            { x: -7, z: 0 },
            { x: 7, z: 0 },
            { x: 0, z: -7 },
            { x: -4, z: -4 },
            { x: 4, z: -4 },
            { x: -4, z: 4 },
            { x: 4, z: 4 }
        ];

        for (const pos of candlePositions) {
            const light = new THREE.PointLight(0xffcc99, 1, 7);
            light.position.set(pos.x, 1.2, pos.z);
            this.scene.add(light);
            this.lights.push(light);

            // Candle visual
            const candleGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.25, 8);
            const candleMaterial = new THREE.MeshStandardMaterial({
                color: 0xffeeaa,
                roughness: 0.9
            });
            const candle = new THREE.Mesh(candleGeometry, candleMaterial);
            candle.position.set(pos.x, 0.95, pos.z);
            this.scene.add(candle);
            this.meshes.push(candle);

            // Flame
            const flameGeometry = new THREE.ConeGeometry(0.04, 0.15, 6);
            const flameMaterial = new THREE.MeshStandardMaterial({
                color: 0xffaa66,
                emissive: 0xffaa66,
                emissiveIntensity: 0.8
            });
            const flame = new THREE.Mesh(flameGeometry, flameMaterial);
            flame.position.set(pos.x, 1.2, pos.z);
            flame.userData.isCandle = true;
            this.scene.add(flame);
            this.meshes.push(flame);
        }
    }

    createGong(x = 0, z = 6) {
        // Gong frame
        const frameGeometry = new THREE.BoxGeometry(0.3, 1.5, 0.3);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3a2a,
            roughness: 0.8
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(x, 0.75, z);
        this.scene.add(frame);
        this.meshes.push(frame);

        // Gong disk
        const gongGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 32);
        const gongMaterial = new THREE.MeshStandardMaterial({
            color: 0xddaa44,
            metalness: 0.8,
            roughness: 0.3
        });
        const gong = new THREE.Mesh(gongGeometry, gongMaterial);
        gong.position.set(x, 1.2, z);
        gong.rotation.x = Math.PI / 2;
        this.scene.add(gong);
        this.meshes.push(gong);

        // Gong center decoration
        const centerGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.12, 16);
        const centerMaterial = new THREE.MeshStandardMaterial({
            color: 0xffdd88,
            metalness: 0.9,
            roughness: 0.2
        });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.set(x, 1.2, z);
        center.rotation.x = Math.PI / 2;
        this.scene.add(center);
        this.meshes.push(center);

        // Mallet
        const malletHandleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6);
        const malletMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.8
        });
        const malletHandle = new THREE.Mesh(malletHandleGeometry, malletMaterial);
        malletHandle.position.set(x + 1, 0.8, z);
        malletHandle.rotation.z = Math.PI / 4;
        this.scene.add(malletHandle);
        this.meshes.push(malletHandle);

        // Mallet head
        const malletHeadGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const malletHeadMaterial = new THREE.MeshStandardMaterial({
            color: 0xaa8a6a,
            roughness: 0.7
        });
        const malletHead = new THREE.Mesh(malletHeadGeometry, malletHeadMaterial);
        malletHead.position.set(x + 1.2, 0.6, z);
        this.scene.add(malletHead);
        this.meshes.push(malletHead);
    }

    setupLighting() {
        // Soft, peaceful purple/blue ambient lighting
        const ambientLight = new THREE.AmbientLight(0x9a9aaa, 0.4);
        this.scene.add(ambientLight);

        // Add soft blue directional light for peaceful feeling
        const blueLight = new THREE.DirectionalLight(0x6a8aaa, 0.3);
        blueLight.position.set(5, 3, 5);
        this.scene.add(blueLight);
    }

    update(deltaTime, player) {
        super.update(deltaTime, player);

        // Animate candle flames
        const time = Date.now() * 0.001;
        for (const mesh of this.meshes) {
            if (mesh.userData.isCandle) {
                const flicker = Math.sin(time * 4) * 0.06 + 1;
                mesh.scale.set(flicker * 0.9, flicker, flicker * 0.9);
            }

            // Gentle water movement
            if (mesh.userData.isWater) {
                mesh.position.y = 0.5 + Math.sin(time * 1.5) * 0.02;
            }

            // Incense smoke drifting
            if (mesh.userData.isSmoke) {
                mesh.position.y += Math.sin(time * 2) * 0.01;
            }
        }
    }
}
