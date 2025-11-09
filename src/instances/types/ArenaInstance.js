// ArenaInstance.js - Gladiator combat arena with spectator seating
import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class ArenaInstance extends Instance {
    constructor(definition) {
        super(definition);
    }

    async generateGeometry() {
        await super.generateGeometry();

        const size = this.definition.size;

        // Create the main arena floor
        this.createArenaFloor(size.width, size.depth);

        // Create spectator stands
        this.createSpectatorStands(size.width, size.depth);

        // Create gates for gladiator entry
        this.createGladiatorGates(size.width, size.depth);

        // Create weapon racks
        this.createWeaponRacks(size.width, size.depth);

        // Create emperor's viewing box
        this.createEmperorsBox(size.width, size.depth);
    }

    createArenaFloor(width, depth) {
        // Sand floor with oval shape
        const arenaGeometry = new THREE.CylinderGeometry(depth / 2.2, width / 2.2, 0.3, 32);
        const arenaMaterial = new THREE.MeshStandardMaterial({
            color: 0xc9a961,
            roughness: 0.95,
            metalness: 0
        });
        const arena = new THREE.Mesh(arenaGeometry, arenaMaterial);
        arena.position.set(0, 0.15, 0);
        this.scene.add(arena);
        this.meshes.push(arena);

        // Blood stains on floor
        const stainCount = 8;
        for (let i = 0; i < stainCount; i++) {
            const angle = (i / stainCount) * Math.PI * 2;
            const radius = Math.random() * 5 + 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            const stainGeometry = new THREE.CylinderGeometry(
                Math.random() * 0.5 + 0.3,
                Math.random() * 0.5 + 0.3,
                0.01,
                16
            );
            const stainMaterial = new THREE.MeshStandardMaterial({
                color: 0x4a1a1a,
                roughness: 0.9
            });
            const stain = new THREE.Mesh(stainGeometry, stainMaterial);
            stain.position.set(x, 0.31, z);
            this.scene.add(stain);
            this.meshes.push(stain);
        }
    }

    createSpectatorStands(width, depth) {
        // Create bleachers around the arena perimeter
        const standPositions = [
            // North side
            { x: 0, z: -depth / 2 - 2, rotation: 0 },
            // South side
            { x: 0, z: depth / 2 + 2, rotation: Math.PI },
            // East side
            { x: width / 2 + 2, z: 0, rotation: Math.PI / 2 },
            // West side
            { x: -width / 2 - 2, z: 0, rotation: -Math.PI / 2 }
        ];

        for (const pos of standPositions) {
            this.createBleachers(pos.x, pos.z, pos.rotation);
        }
    }

    createBleachers(x, z, rotation) {
        const levels = 4;
        const levelHeight = 1.2;
        const benchLength = 8;

        for (let level = 0; level < levels; level++) {
            const benchGeometry = new THREE.BoxGeometry(benchLength, 0.4, 0.8);
            const benchMaterial = new THREE.MeshStandardMaterial({
                color: 0x8b6f47,
                roughness: 0.7
            });
            const bench = new THREE.Mesh(benchGeometry, benchMaterial);
            bench.position.set(x, 0.2 + level * levelHeight, z);
            bench.rotation.y = rotation;
            this.scene.add(bench);
            this.meshes.push(bench);

            // Back support for bench
            const backGeometry = new THREE.BoxGeometry(benchLength, 0.8, 0.2);
            const back = new THREE.Mesh(backGeometry, benchMaterial);
            back.position.set(x, 0.5 + level * levelHeight, z - 0.5);
            back.rotation.y = rotation;
            this.scene.add(back);
            this.meshes.push(back);
        }
    }

    createGladiatorGates(width, depth) {
        // North gate
        this.createGate(0, -width / 2.5, 0);
        // South gate
        this.createGate(0, width / 2.5, 0);
    }

    createGate(x, z, rotation) {
        // Gate frame (vertical posts)
        const postGeometry = new THREE.BoxGeometry(0.3, 2.5, 0.3);
        const postMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a2a1a,
            roughness: 0.8,
            metalness: 0.3
        });

        const leftPost = new THREE.Mesh(postGeometry, postMaterial);
        leftPost.position.set(x - 1, 1.25, z);
        this.scene.add(leftPost);
        this.meshes.push(leftPost);

        const rightPost = new THREE.Mesh(postGeometry, postMaterial);
        rightPost.position.set(x + 1, 1.25, z);
        this.scene.add(rightPost);
        this.meshes.push(rightPost);

        // Top frame
        const topGeometry = new THREE.BoxGeometry(2.6, 0.3, 0.3);
        const top = new THREE.Mesh(topGeometry, postMaterial);
        top.position.set(x, 2.5, z);
        this.scene.add(top);
        this.meshes.push(top);

        // Metal bars
        for (let i = 0; i < 5; i++) {
            const barGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
            const barMaterial = new THREE.MeshStandardMaterial({
                color: 0x666666,
                metalness: 0.9,
                roughness: 0.2
            });
            const bar = new THREE.Mesh(barGeometry, barMaterial);
            bar.position.set(x - 0.8 + i * 0.4, 1.25, z);
            bar.rotation.z = Math.PI / 2;
            this.scene.add(bar);
            this.meshes.push(bar);
        }
    }

    createWeaponRacks(width, depth) {
        // Weapon racks in corners
        const corners = [
            { x: -width / 2.5 - 3, z: -depth / 2.5 - 3 },
            { x: width / 2.5 + 3, z: -depth / 2.5 - 3 },
            { x: -width / 2.5 - 3, z: depth / 2.5 + 3 },
            { x: width / 2.5 + 3, z: depth / 2.5 + 3 }
        ];

        for (const corner of corners) {
            this.createWeaponRack(corner.x, corner.z);
        }
    }

    createWeaponRack(x, z) {
        // Rack frame
        const rackGeometry = new THREE.BoxGeometry(1.5, 2, 0.5);
        const rackMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2a1a,
            roughness: 0.8
        });
        const rack = new THREE.Mesh(rackGeometry, rackMaterial);
        rack.position.set(x, 1, z);
        this.scene.add(rack);
        this.meshes.push(rack);

        // Swords on rack
        for (let i = 0; i < 4; i++) {
            const swordGeometry = new THREE.BoxGeometry(0.08, 1.2, 0.1);
            const swordMaterial = new THREE.MeshStandardMaterial({
                color: 0xaaaaaa,
                metalness: 0.9,
                roughness: 0.2
            });
            const sword = new THREE.Mesh(swordGeometry, swordMaterial);
            sword.position.set(
                x - 0.4 + i * 0.3,
                1.2,
                z + 0.15
            );
            this.scene.add(sword);
            this.meshes.push(sword);
        }

        // Shields on bottom
        const shieldGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
        const shieldMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a4a1a,
            metalness: 0.6,
            roughness: 0.4
        });

        for (let i = 0; i < 3; i++) {
            const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
            shield.position.set(
                x - 0.3 + i * 0.4,
                0.4,
                z + 0.15
            );
            shield.rotation.x = Math.PI / 2;
            this.scene.add(shield);
            this.meshes.push(shield);
        }
    }

    createEmperorsBox(width, depth) {
        const boxX = width / 2.5 + 4;
        const boxZ = -depth / 2.5 - 3;

        // Platform
        const platformGeometry = new THREE.BoxGeometry(4, 0.3, 3);
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.6
        });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.set(boxX, 3.5, boxZ);
        this.scene.add(platform);
        this.meshes.push(platform);

        // Support pillars
        const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3.2, 12);
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a1a1a,
            roughness: 0.9,
            metalness: 0.2
        });

        for (let px of [-1.5, 1.5]) {
            for (let pz of [-1, 1]) {
                const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
                pillar.position.set(boxX + px, 1.6, boxZ + pz);
                this.scene.add(pillar);
                this.meshes.push(pillar);
            }
        }

        // Throne
        this.createThrone(boxX, boxZ);

        // Canopy frame
        const canopyGeometry = new THREE.BoxGeometry(4.5, 0.3, 3.5);
        const canopyMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b1a1a,
            roughness: 0.5
        });
        const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
        canopy.position.set(boxX, 3.8, boxZ);
        this.scene.add(canopy);
        this.meshes.push(canopy);
    }

    createThrone(x, z) {
        // Seat
        const seatGeometry = new THREE.BoxGeometry(1.5, 0.5, 1.5);
        const seatMaterial = new THREE.MeshStandardMaterial({
            color: 0xdaa520,
            metalness: 0.7,
            roughness: 0.3
        });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.set(x, 3.7, z);
        this.scene.add(seat);
        this.meshes.push(seat);

        // Backrest
        const backGeometry = new THREE.BoxGeometry(1.5, 1.5, 0.3);
        const back = new THREE.Mesh(backGeometry, seatMaterial);
        back.position.set(x, 4.3, z - 0.7);
        this.scene.add(back);
        this.meshes.push(back);

        // Armrests
        const armGeometry = new THREE.BoxGeometry(0.3, 1, 1.5);
        for (let ax of [-0.8, 0.8]) {
            const arm = new THREE.Mesh(armGeometry, seatMaterial);
            arm.position.set(x + ax, 4.1, z);
            this.scene.add(arm);
            this.meshes.push(arm);
        }
    }

    placeFeatures() {
        const features = this.definition.features;

        if (features.torches) {
            this.placeTorches();
        }
    }

    placeTorches() {
        // Torches around perimeter
        const torchPositions = [
            { x: -this.definition.size.width / 2.5, z: 0, y: 2.5 },
            { x: this.definition.size.width / 2.5, z: 0, y: 2.5 },
            { x: 0, z: -this.definition.size.depth / 2.5, y: 2.5 },
            { x: 0, z: this.definition.size.depth / 2.5, y: 2.5 },
            { x: -this.definition.size.width / 3, z: -this.definition.size.depth / 3, y: 2.5 },
            { x: this.definition.size.width / 3, z: -this.definition.size.depth / 3, y: 2.5 },
            { x: -this.definition.size.width / 3, z: this.definition.size.depth / 3, y: 2.5 },
            { x: this.definition.size.width / 3, z: this.definition.size.depth / 3, y: 2.5 }
        ];

        for (const pos of torchPositions) {
            const light = new THREE.PointLight(0xff8844, 2, 12);
            light.position.set(pos.x, pos.y, pos.z);
            this.scene.add(light);
            this.lights.push(light);

            // Torch flame visual
            const flameGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
            const flameMaterial = new THREE.MeshStandardMaterial({
                color: 0xff6600,
                emissive: 0xff6600,
                emissiveIntensity: 1
            });
            const flame = new THREE.Mesh(flameGeometry, flameMaterial);
            flame.position.set(pos.x, pos.y + 0.3, pos.z);
            flame.userData.isTorch = true;
            this.scene.add(flame);
            this.meshes.push(flame);
        }
    }

    setupLighting() {
        // Dim ambient for dramatic arena lighting
        const ambientLight = new THREE.AmbientLight(0x8a7a6a, 0.3);
        this.scene.add(ambientLight);
    }

    update(deltaTime, player) {
        super.update(deltaTime, player);

        // Animate torch flames
        const time = Date.now() * 0.001;
        for (const mesh of this.meshes) {
            if (mesh.userData.isTorch) {
                const flicker = Math.sin(time * 8) * 0.1 + 1;
                mesh.scale.set(flicker * 0.9, flicker, flicker * 0.9);
            }
        }
    }
}
