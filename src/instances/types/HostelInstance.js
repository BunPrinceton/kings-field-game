// HostelInstance.js - Inn with traveler beds
import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class HostelInstance extends Instance {
    constructor(definition) {
        super(definition);
    }

    async generateGeometry() {
        await super.generateGeometry();

        const size = this.definition.size;

        // Create rows of beds
        this.createBedsInRows(size.width, size.depth);

        // Create fireplace
        this.createFireplace(size.width, size.depth);

        // Create nightstands and chests
        this.createNightstandsAndChests(size.width, size.depth);
    }

    createBedsInRows(width, depth) {
        // Create 8 beds in 2 rows of 4
        const bedPositions = [
            // First row
            { x: -4, z: -6 },
            { x: -1.5, z: -6 },
            { x: 1.5, z: -6 },
            { x: 4, z: -6 },
            // Second row
            { x: -4, z: 3 },
            { x: -1.5, z: 3 },
            { x: 1.5, z: 3 },
            { x: 4, z: 3 }
        ];

        for (const pos of bedPositions) {
            this.createBed(pos.x, pos.z);
        }
    }

    createBed(x, z) {
        // Bed frame (wood)
        const frameGeometry = new THREE.BoxGeometry(1.2, 0.4, 2);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a3a2a,
            roughness: 0.8
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(x, 0.2, z);
        this.scene.add(frame);
        this.meshes.push(frame);

        // Mattress
        const mattressGeometry = new THREE.BoxGeometry(1, 0.3, 1.8);
        const mattressMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.7
        });
        const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
        mattress.position.set(x, 0.55, z);
        this.scene.add(mattress);
        this.meshes.push(mattress);

        // Pillow
        const pillowGeometry = new THREE.BoxGeometry(0.9, 0.2, 0.5);
        const pillowMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            roughness: 0.6
        });
        const pillow = new THREE.Mesh(pillowGeometry, pillowMaterial);
        pillow.position.set(x, 0.75, z - 0.7);
        this.scene.add(pillow);
        this.meshes.push(pillow);

        // Blanket
        const blanketGeometry = new THREE.BoxGeometry(0.95, 0.15, 1.2);
        const blanketMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a6a4a,
            roughness: 0.8
        });
        const blanket = new THREE.Mesh(blanketGeometry, blanketMaterial);
        blanket.position.set(x, 0.68, z + 0.3);
        this.scene.add(blanket);
        this.meshes.push(blanket);

        // Bed posts (4 corners)
        const postGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.1);
        const postMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a2a1a,
            roughness: 0.7
        });

        const corners = [
            { x: x - 0.55, z: z - 0.9 },
            { x: x + 0.55, z: z - 0.9 },
            { x: x - 0.55, z: z + 0.9 },
            { x: x + 0.55, z: z + 0.9 }
        ];

        for (const corner of corners) {
            const post = new THREE.Mesh(postGeometry, postMaterial);
            post.position.set(corner.x, 0.4, corner.z);
            this.scene.add(post);
            this.meshes.push(post);
        }
    }

    createNightstandsAndChests(width, depth) {
        // Nightstands next to beds
        const nightstandPositions = [
            // First row nightstands
            { x: -5, z: -6 },
            { x: -0.5, z: -6 },
            { x: 2.5, z: -6 },
            { x: 5, z: -6 },
            // Second row nightstands
            { x: -5, z: 3 },
            { x: -0.5, z: 3 },
            { x: 2.5, z: 3 },
            { x: 5, z: 3 }
        ];

        for (const pos of nightstandPositions) {
            this.createNightstand(pos.x, pos.z);
        }

        // Chests at foot of beds
        const chestPositions = [
            // First row
            { x: -4, z: -7.5 },
            { x: -1.5, z: -7.5 },
            { x: 1.5, z: -7.5 },
            { x: 4, z: -7.5 },
            // Second row
            { x: -4, z: 4.5 },
            { x: -1.5, z: 4.5 },
            { x: 1.5, z: 4.5 },
            { x: 4, z: 4.5 }
        ];

        for (const pos of chestPositions) {
            this.createChest(pos.x, pos.z);
        }
    }

    createNightstand(x, z) {
        const standGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.6);
        const standMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a3a2a,
            roughness: 0.8
        });
        const stand = new THREE.Mesh(standGeometry, standMaterial);
        stand.position.set(x, 0.4, z);
        this.scene.add(stand);
        this.meshes.push(stand);

        // Drawer front
        const drawerGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.5);
        const drawerMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2a1a,
            roughness: 0.7
        });
        const drawer = new THREE.Mesh(drawerGeometry, drawerMaterial);
        drawer.position.set(x, 0.5, z + 0.35);
        this.scene.add(drawer);
        this.meshes.push(drawer);
    }

    createChest(x, z) {
        // Chest body
        const chestGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.5);
        const chestMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2a1a,
            roughness: 0.8
        });
        const chest = new THREE.Mesh(chestGeometry, chestMaterial);
        chest.position.set(x, 0.3, z);
        this.scene.add(chest);
        this.meshes.push(chest);

        // Chest lid
        const lidGeometry = new THREE.BoxGeometry(0.8, 0.15, 0.5);
        const lid = new THREE.Mesh(lidGeometry, chestMaterial);
        lid.position.set(x, 0.68, z);
        lid.rotation.z = -0.2;
        this.scene.add(lid);
        this.meshes.push(lid);

        // Metal band around chest
        const bandGeometry = new THREE.BoxGeometry(0.85, 0.1, 0.55);
        const bandMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.8,
            roughness: 0.3
        });
        const band = new THREE.Mesh(bandGeometry, bandMaterial);
        band.position.set(x, 0.3, z);
        this.scene.add(band);
        this.meshes.push(band);
    }

    createFireplace(width, depth) {
        const fireplaceX = width / 2 - 2;
        const fireplaceZ = 0;

        // Fireplace opening (stone frame)
        const openingGeometry = new THREE.BoxGeometry(2, 2.5, 0.3);
        const stoneMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a5a5a,
            roughness: 0.9
        });
        const opening = new THREE.Mesh(openingGeometry, stoneMaterial);
        opening.position.set(fireplaceX, 1.5, fireplaceZ);
        this.scene.add(opening);
        this.meshes.push(opening);

        // Back wall
        const backGeometry = new THREE.BoxGeometry(1.8, 2.3, 0.5);
        const back = new THREE.Mesh(backGeometry, stoneMaterial);
        back.position.set(fireplaceX, 1.5, fireplaceZ + 0.3);
        this.scene.add(back);
        this.meshes.push(back);

        // Fire and light
        const fireGeometry = new THREE.ConeGeometry(0.6, 1, 8);
        const fireMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6600,
            emissive: 0xff6600,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 0.8
        });
        const fire = new THREE.Mesh(fireGeometry, fireMaterial);
        fire.position.set(fireplaceX, 1.2, fireplaceZ + 0.1);
        fire.userData.isFire = true;
        this.scene.add(fire);
        this.meshes.push(fire);

        // Fireplace light
        const fireLight = new THREE.PointLight(0xff8844, 3, 15);
        fireLight.position.set(fireplaceX, 1.5, fireplaceZ);
        this.scene.add(fireLight);
        this.lights.push(fireLight);

        // Logs
        const logGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.5, 8);
        const logMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a2a1a,
            roughness: 0.9
        });

        for (let i = 0; i < 3; i++) {
            const log = new THREE.Mesh(logGeometry, logMaterial);
            log.position.set(fireplaceX - 0.4 + i * 0.4, 0.8, fireplaceZ + 0.1);
            log.rotation.z = Math.PI / 2;
            this.scene.add(log);
            this.meshes.push(log);
        }

        // Hearth
        const hearthGeometry = new THREE.BoxGeometry(2.5, 0.2, 1);
        const hearthMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.8
        });
        const hearth = new THREE.Mesh(hearthGeometry, hearthMaterial);
        hearth.position.set(fireplaceX, 0.1, fireplaceZ + 0.5);
        this.scene.add(hearth);
        this.meshes.push(hearth);
    }

    placeFeatures() {
        const features = this.definition.features;

        if (features.lanterns) {
            this.placeLanterns();
        }
    }

    placeLanterns() {
        // Lanterns hanging from ceiling for cozy lighting
        const lanternPositions = [
            { x: -6, z: -4 },
            { x: 0, z: -4 },
            { x: 6, z: -4 },
            { x: -6, z: 2 },
            { x: 0, z: 2 },
            { x: 6, z: 2 }
        ];

        for (const pos of lanternPositions) {
            const light = new THREE.PointLight(0xffaa66, 1.5, 8);
            light.position.set(pos.x, 3, pos.z);
            this.scene.add(light);
            this.lights.push(light);

            // Lantern visual
            const lanternGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.3);
            const lanternMaterial = new THREE.MeshStandardMaterial({
                color: 0x3a3a3a,
                roughness: 0.8
            });
            const lantern = new THREE.Mesh(lanternGeometry, lanternMaterial);
            lantern.position.set(pos.x, 2.8, pos.z);
            this.scene.add(lantern);
            this.meshes.push(lantern);
        }
    }

    setupLighting() {
        // Warm ambient lighting for cozy inn atmosphere
        const ambientLight = new THREE.AmbientLight(0xffcc99, 0.5);
        this.scene.add(ambientLight);
    }

    update(deltaTime, player) {
        super.update(deltaTime, player);

        // Animate fireplace
        const time = Date.now() * 0.001;
        for (const mesh of this.meshes) {
            if (mesh.userData.isFire) {
                const flicker = Math.sin(time * 6) * 0.15 + 1;
                mesh.scale.set(flicker * 0.9, flicker, flicker * 0.9);
            }
        }
    }
}
