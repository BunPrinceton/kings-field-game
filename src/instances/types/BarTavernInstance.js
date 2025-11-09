// BarTavernInstance.js - Drinking establishment with bar counter
import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class BarTavernInstance extends Instance {
    constructor(definition) {
        super(definition);
    }

    async generateGeometry() {
        await super.generateGeometry();

        const size = this.definition.size;

        // Create the bar counter
        this.createBarCounter(size.width, size.depth);

        // Create tables and chairs
        this.createTables(size.width, size.depth);

        // Create dartboard
        this.createDartboard(size.width, size.depth);

        // Create barkeep area
        this.createBarkeepArea(size.width, size.depth);
    }

    createBarCounter(width, depth) {
        // Main counter
        const counterGeometry = new THREE.BoxGeometry(6, 0.8, 1);
        const counterMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a3a2a,
            roughness: 0.6
        });
        const counter = new THREE.Mesh(counterGeometry, counterMaterial);
        counter.position.set(-width / 2 + 3.5, 0.4, 0);
        this.scene.add(counter);
        this.meshes.push(counter);

        // Counter top (polished wood)
        const topGeometry = new THREE.BoxGeometry(6, 0.15, 0.95);
        const topMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a5a3a,
            roughness: 0.3,
            metalness: 0.1
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.set(-width / 2 + 3.5, 0.9, 0);
        this.scene.add(top);
        this.meshes.push(top);

        // Bar stools (8 along counter)
        for (let i = 0; i < 8; i++) {
            this.createBarStool(-width / 2 + 0.5 + i * 0.75, 0.35, -0.7);
        }
    }

    createBarStool(x, y, z) {
        // Stool seat
        const seatGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 16);
        const seatMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2a1a,
            roughness: 0.7
        });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.set(x, y + 0.4, z);
        this.scene.add(seat);
        this.meshes.push(seat);

        // Stool legs
        const legGeometry = new THREE.CylinderGeometry(0.04, 0.06, 0.4, 6);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.8
        });

        for (let lx of [-0.15, 0.15]) {
            for (let lz of [-0.15, 0.15]) {
                const leg = new THREE.Mesh(legGeometry, legMaterial);
                leg.position.set(x + lx, y, z + lz);
                this.scene.add(leg);
                this.meshes.push(leg);
            }
        }
    }

    createBarkeepArea(width, depth) {
        const barX = -width / 2 + 3.5;
        const barZ = 0.8;

        // Shelf behind counter with bottles
        const shelfGeometry = new THREE.BoxGeometry(6, 0.15, 0.8);
        const shelfMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2a1a,
            roughness: 0.8
        });

        // Three shelves
        for (let shelf = 0; shelf < 3; shelf++) {
            const s = new THREE.Mesh(shelfGeometry, shelfMaterial);
            s.position.set(barX, 1.2 + shelf * 0.8, barZ);
            this.scene.add(s);
            this.meshes.push(s);

            // Bottles on shelf
            for (let i = 0; i < 10; i++) {
                this.createBottle(
                    barX - 2.5 + i * 0.55,
                    1.4 + shelf * 0.8,
                    barZ + 0.2
                );
            }
        }

        // Kegs under bar
        for (let i = 0; i < 3; i++) {
            const kegGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.5, 16);
            const kegMaterial = new THREE.MeshStandardMaterial({
                color: 0x4a3a2a,
                roughness: 0.9
            });
            const keg = new THREE.Mesh(kegGeometry, kegMaterial);
            keg.position.set(barX - 1.5 + i * 1.5, 0.25, barZ);
            this.scene.add(keg);
            this.meshes.push(keg);
        }
    }

    createBottle(x, y, z) {
        const bottleGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.3, 8);
        const colors = [0x2a2a5a, 0x5a2a2a, 0x2a5a2a, 0x8a5a2a, 0x5a5a2a];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const bottleMaterial = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.2,
            roughness: 0.4,
            transparent: true,
            opacity: 0.8
        });
        const bottle = new THREE.Mesh(bottleGeometry, bottleMaterial);
        bottle.position.set(x, y, z);
        this.scene.add(bottle);
        this.meshes.push(bottle);

        // Bottle neck
        const neckGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.1, 8);
        const neck = new THREE.Mesh(neckGeometry, bottleMaterial);
        neck.position.set(x, y + 0.2, z);
        this.scene.add(neck);
        this.meshes.push(neck);
    }

    createTables(width, depth) {
        // 5-6 small tables scattered around
        const tablePositions = [
            { x: 4, z: -5 },
            { x: 4, z: 0 },
            { x: 4, z: 5 },
            { x: -4, z: -5 },
            { x: -4, z: 0 },
            { x: -4, z: 5 }
        ];

        for (const pos of tablePositions) {
            this.createTable(pos.x, pos.z);
        }
    }

    createTable(x, z) {
        // Table top
        const tableGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.05, 16);
        const tableMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a3a2a,
            roughness: 0.6
        });
        const table = new THREE.Mesh(tableGeometry, tableMaterial);
        table.position.set(x, 0.75, z);
        this.scene.add(table);
        this.meshes.push(table);

        // Table leg
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.7, 12);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a2a1a,
            roughness: 0.8
        });
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(x, 0.35, z);
        this.scene.add(leg);
        this.meshes.push(leg);

        // 4 chairs around table
        const chairOffsets = [
            { x: 1, z: 0 },
            { x: -1, z: 0 },
            { x: 0, z: 1 },
            { x: 0, z: -1 }
        ];

        for (const offset of chairOffsets) {
            this.createChair(x + offset.x, z + offset.z);
        }

        // Spilled drink
        const spillGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.02, 16);
        const spillMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2a2a,
            roughness: 0.5
        });
        const spill = new THREE.Mesh(spillGeometry, spillMaterial);
        spill.position.set(x + 0.3, 0.76, z - 0.3);
        this.scene.add(spill);
        this.meshes.push(spill);
    }

    createChair(x, z) {
        // Seat
        const seatGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.5);
        const seatMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2a1a,
            roughness: 0.7
        });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.set(x, 0.5, z);
        this.scene.add(seat);
        this.meshes.push(seat);

        // Back
        const backGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.05);
        const back = new THREE.Mesh(backGeometry, seatMaterial);
        back.position.set(x, 0.75, z - 0.25);
        this.scene.add(back);
        this.meshes.push(back);

        // Front legs
        const legGeometry = new THREE.BoxGeometry(0.06, 0.5, 0.06);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a2a1a,
            roughness: 0.8
        });

        for (let lx of [-0.2, 0.2]) {
            for (let lz of [-0.2, 0.2]) {
                const leg = new THREE.Mesh(legGeometry, legMaterial);
                leg.position.set(x + lx, 0.25, z + lz);
                this.scene.add(leg);
                this.meshes.push(leg);
            }
        }
    }

    createDartboard(width, depth) {
        // Dartboard on wall
        const boardX = width / 2 - 1;
        const boardY = 1.5;
        const boardZ = -depth / 2 + 1;

        // Board backing
        const backingGeometry = new THREE.CircleGeometry(0.5, 32);
        const backingMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a2a1a,
            roughness: 0.8
        });
        const backing = new THREE.Mesh(backingGeometry, backingMaterial);
        backing.position.set(boardX, boardY, boardZ);
        backing.rotation.y = Math.PI / 2;
        this.scene.add(backing);
        this.meshes.push(backing);

        // Dartboard face with rings
        const rings = [
            { radius: 0.45, color: 0xeeeecc },
            { radius: 0.37, color: 0x1a1a1a },
            { radius: 0.3, color: 0xeeeecc },
            { radius: 0.22, color: 0x1a1a1a },
            { radius: 0.15, color: 0xaa0000 }
        ];

        for (const ring of rings) {
            const ringGeometry = new THREE.CircleGeometry(ring.radius, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({ color: ring.color });
            const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
            ringMesh.position.set(boardX, boardY, boardZ + 0.02);
            ringMesh.rotation.y = Math.PI / 2;
            this.scene.add(ringMesh);
            this.meshes.push(ringMesh);
        }

        // Darts stuck in board
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const distance = 0.25 + Math.random() * 0.1;
            const dartX = boardX + Math.cos(angle) * distance;
            const dartZ = boardZ + Math.sin(angle) * distance;

            this.createDart(dartX, boardY + (Math.random() - 0.5) * 0.2, dartZ);
        }
    }

    createDart(x, y, z) {
        // Dart shaft
        const shaftGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.15, 6);
        const shaftMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a5a5a,
            roughness: 0.7
        });
        const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
        shaft.position.set(x, y, z);
        shaft.rotation.z = Math.PI / 2;
        this.scene.add(shaft);
        this.meshes.push(shaft);

        // Dart point
        const pointGeometry = new THREE.ConeGeometry(0.008, 0.08, 6);
        const pointMaterial = new THREE.MeshStandardMaterial({
            color: 0xccaa44,
            metalness: 0.8,
            roughness: 0.2
        });
        const point = new THREE.Mesh(pointGeometry, pointMaterial);
        point.position.set(x + 0.08, y, z);
        point.rotation.z = Math.PI / 2;
        this.scene.add(point);
        this.meshes.push(point);
    }

    placeFeatures() {
        const features = this.definition.features;

        if (features.lanterns) {
            this.placeLanterns();
        }
    }

    placeLanterns() {
        // Warm lantern lighting throughout tavern
        const lanternPositions = [
            { x: -6, z: -6 },
            { x: 6, z: -6 },
            { x: -6, z: 6 },
            { x: 6, z: 6 },
            { x: 0, z: -8 },
            { x: 0, z: 8 }
        ];

        for (const pos of lanternPositions) {
            const light = new THREE.PointLight(0xffaa44, 1.8, 10);
            light.position.set(pos.x, 2.5, pos.z);
            this.scene.add(light);
            this.lights.push(light);
        }
    }

    setupLighting() {
        // Warm, dim lighting for tavern atmosphere
        const ambientLight = new THREE.AmbientLight(0xddaa66, 0.4);
        this.scene.add(ambientLight);
    }

    update(deltaTime, player) {
        super.update(deltaTime, player);
    }
}
