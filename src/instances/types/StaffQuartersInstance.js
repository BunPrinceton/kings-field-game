// StaffQuartersInstance.js - Simple castle staff living quarters
import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class StaffQuartersInstance extends Instance {
    constructor(definition) {
        super(definition);
    }

    async generateGeometry() {
        await super.generateGeometry();

        const size = this.definition.size;

        // Create beds
        this.createStaffBeds(size.width, size.depth);

        // Create storage chests
        this.createStorageChests(size.width, size.depth);

        // Create work area with desk/table
        this.createWorkDesk(size.width, size.depth);

        // Create laundry line
        this.createLaundryLine(size.width, size.depth);
    }

    createStaffBeds(width, depth) {
        // 4-6 simple beds in utilitarian arrangement
        const bedPositions = [
            { x: -5, z: -4 },
            { x: -5, z: 0 },
            { x: -5, z: 4 },
            { x: 5, z: -4 },
            { x: 5, z: 0 },
            { x: 5, z: 4 }
        ];

        for (const pos of bedPositions) {
            this.createSimpleBed(pos.x, pos.z);
        }
    }

    createSimpleBed(x, z) {
        // Bed frame (simple wood)
        const frameGeometry = new THREE.BoxGeometry(1, 0.35, 1.8);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.85
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(x, 0.18, z);
        this.scene.add(frame);
        this.meshes.push(frame);

        // Straw mattress
        const mattressGeometry = new THREE.BoxGeometry(0.95, 0.25, 1.75);
        const mattressMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a7a5a,
            roughness: 0.95
        });
        const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
        mattress.position.set(x, 0.5, z);
        this.scene.add(mattress);
        this.meshes.push(mattress);

        // Thin blanket
        const blanketGeometry = new THREE.BoxGeometry(0.9, 0.1, 1.3);
        const blanketMaterial = new THREE.MeshStandardMaterial({
            color: 0x7a6a5a,
            roughness: 0.9
        });
        const blanket = new THREE.Mesh(blanketGeometry, blanketMaterial);
        blanket.position.set(x, 0.6, z);
        this.scene.add(blanket);
        this.meshes.push(blanket);
    }

    createStorageChests(width, depth) {
        // Personal storage under or next to beds
        const chestPositions = [
            { x: -6.5, z: -4 },
            { x: -6.5, z: 0 },
            { x: -6.5, z: 4 },
            { x: 6.5, z: -4 },
            { x: 6.5, z: 0 },
            { x: 6.5, z: 4 }
        ];

        for (const pos of chestPositions) {
            this.createStorageChest(pos.x, pos.z);
        }
    }

    createStorageChest(x, z) {
        // Simple wooden chest
        const chestGeometry = new THREE.BoxGeometry(0.7, 0.5, 0.5);
        const chestMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3a2a,
            roughness: 0.85
        });
        const chest = new THREE.Mesh(chestGeometry, chestMaterial);
        chest.position.set(x, 0.25, z);
        this.scene.add(chest);
        this.meshes.push(chest);

        // Lid
        const lidGeometry = new THREE.BoxGeometry(0.7, 0.12, 0.5);
        const lid = new THREE.Mesh(lidGeometry, chestMaterial);
        lid.position.set(x, 0.55, z);
        lid.rotation.z = -0.15;
        this.scene.add(lid);
        this.meshes.push(lid);
    }

    createWorkDesk(width, depth) {
        const deskX = -width / 2 + 2;
        const deskZ = -depth / 2 + 3;

        // Work table/desk
        const deskGeometry = new THREE.BoxGeometry(2, 0.1, 1);
        const deskMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a3a2a,
            roughness: 0.8
        });
        const desk = new THREE.Mesh(deskGeometry, deskMaterial);
        desk.position.set(deskX, 0.75, deskZ);
        this.scene.add(desk);
        this.meshes.push(desk);

        // Desk legs (simple)
        const legGeometry = new THREE.BoxGeometry(0.08, 0.75, 0.08);
        const corners = [
            { x: deskX - 0.9, z: deskZ - 0.4 },
            { x: deskX + 0.9, z: deskZ - 0.4 },
            { x: deskX - 0.9, z: deskZ + 0.4 },
            { x: deskX + 0.9, z: deskZ + 0.4 }
        ];

        for (const corner of corners) {
            const leg = new THREE.Mesh(legGeometry, deskMaterial);
            leg.position.set(corner.x, 0.375, corner.z);
            this.scene.add(leg);
            this.meshes.push(leg);
        }

        // Small shelf above desk
        const shelfGeometry = new THREE.BoxGeometry(2, 0.15, 0.8);
        const shelf = new THREE.Mesh(shelfGeometry, deskMaterial);
        shelf.position.set(deskX, 1.5, deskZ);
        this.scene.add(shelf);
        this.meshes.push(shelf);

        // Work schedule board on wall
        this.createScheduleBoard(deskX, deskZ + 0.55);
    }

    createScheduleBoard(x, z) {
        // Board backing
        const boardGeometry = new THREE.BoxGeometry(1.5, 1.5, 0.05);
        const boardMaterial = new THREE.MeshStandardMaterial({
            color: 0x7a6a5a,
            roughness: 0.8
        });
        const board = new THREE.Mesh(boardGeometry, boardMaterial);
        board.position.set(x, 1.5, z);
        this.scene.add(board);
        this.meshes.push(board);

        // Schedule paper (white area)
        const paperGeometry = new THREE.PlaneGeometry(1.3, 1.3);
        const paperMaterial = new THREE.MeshBasicMaterial({
            color: 0xeeeeee
        });
        const paper = new THREE.Mesh(paperGeometry, paperMaterial);
        paper.position.set(x, 1.5, z + 0.03);
        this.scene.add(paper);
        this.meshes.push(paper);

        // Frame
        const frameGeometry = new THREE.BoxGeometry(1.6, 1.6, 0.08);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3a2a,
            roughness: 0.7
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(x, 1.5, z - 0.02);
        this.scene.add(frame);
        this.meshes.push(frame);
    }

    createLaundryLine(width, depth) {
        const lineX = 0;
        const lineZ = depth / 2 - 2;
        const lineStart = -3;
        const lineEnd = 3;

        // Laundry line rope/cord
        const ropeGeometry = new THREE.CylinderGeometry(0.02, 0.02, lineEnd - lineStart, 8);
        const ropeMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a5a5a,
            roughness: 0.9
        });
        const rope = new THREE.Mesh(ropeGeometry, ropeMaterial);
        rope.position.set(lineX, 2, lineZ);
        rope.rotation.z = Math.PI / 2;
        this.scene.add(rope);
        this.meshes.push(rope);

        // Support posts
        for (let px of [lineStart, lineEnd]) {
            const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
            const postMaterial = new THREE.MeshStandardMaterial({
                color: 0x4a3a2a,
                roughness: 0.85
            });
            const post = new THREE.Mesh(postGeometry, postMaterial);
            post.position.set(px, 1, lineZ);
            this.scene.add(post);
            this.meshes.push(post);
        }

        // Hanging clothes/laundry
        for (let i = 0; i < 8; i++) {
            const clothX = lineStart + (i / 8) * (lineEnd - lineStart);
            this.createClothOnLine(clothX, 1.8, lineZ);
        }
    }

    createClothOnLine(x, y, z) {
        // Simple cloth hanging
        const clothGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.05);
        const clothMaterial = new THREE.MeshStandardMaterial({
            color: Math.random() > 0.5 ? 0xcccccc : 0x8a8a8a,
            roughness: 0.8
        });
        const cloth = new THREE.Mesh(clothGeometry, clothMaterial);
        cloth.position.set(x, y, z);
        cloth.rotation.x = (Math.random() - 0.5) * 0.3;
        this.scene.add(cloth);
        this.meshes.push(cloth);
    }

    placeFeatures() {
        const features = this.definition.features;

        if (features.candles) {
            this.placeCandles();
        }
    }

    placeCandles() {
        // Candles in corners for modest lighting
        const candlePositions = [
            { x: -6, z: -6 },
            { x: 6, z: -6 },
            { x: -6, z: 6 },
            { x: 6, z: 6 },
            { x: 0, z: -7 }
        ];

        for (const pos of candlePositions) {
            const light = new THREE.PointLight(0xffaa88, 0.8, 6);
            light.position.set(pos.x, 1.5, pos.z);
            this.scene.add(light);
            this.lights.push(light);

            // Candle visual
            const candleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.2, 8);
            const candleMaterial = new THREE.MeshStandardMaterial({
                color: 0x8a8a5a,
                roughness: 0.9
            });
            const candle = new THREE.Mesh(candleGeometry, candleMaterial);
            candle.position.set(pos.x, 1.3, pos.z);
            this.scene.add(candle);
            this.meshes.push(candle);

            // Flame
            const flameGeometry = new THREE.ConeGeometry(0.03, 0.1, 6);
            const flameMaterial = new THREE.MeshStandardMaterial({
                color: 0xffaa44,
                emissive: 0xffaa44,
                emissiveIntensity: 0.8
            });
            const flame = new THREE.Mesh(flameGeometry, flameMaterial);
            flame.position.set(pos.x, 1.5, pos.z);
            flame.userData.isCandle = true;
            this.scene.add(flame);
            this.meshes.push(flame);
        }
    }

    setupLighting() {
        // Dim, utilitarian lighting
        const ambientLight = new THREE.AmbientLight(0x9a8a7a, 0.35);
        this.scene.add(ambientLight);
    }

    update(deltaTime, player) {
        super.update(deltaTime, player);

        // Animate candle flames slightly
        const time = Date.now() * 0.001;
        for (const mesh of this.meshes) {
            if (mesh.userData.isCandle) {
                const flicker = Math.sin(time * 5) * 0.08 + 1;
                mesh.scale.set(flicker * 0.95, flicker, flicker * 0.95);
            }
        }
    }
}
