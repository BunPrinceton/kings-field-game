// GrandLibraryInstance.js - Large library with many bookshelves
import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class GrandLibraryInstance extends Instance {
    constructor(definition) {
        super(definition);
    }

    placeFeatures() {
        const features = this.definition.features;

        // Place bookshelves
        if (features.bookshelves) {
            this.placeBookshelves();
        }

        // Place reading tables
        if (features.readingTables) {
            this.placeReadingTables(features.readingTables);
        }

        // Place ladders
        if (features.ladders) {
            this.placeLadders(features.ladders);
        }

        // Place chandelier
        if (features.chandelier) {
            this.createChandelier();
        }

        // Place scroll racks
        if (features.scrollRacks) {
            this.placeScrollRacks(features.scrollRacks);
        }
    }

    placeBookshelves() {
        const rows = 6;
        const shelvesPerRow = 8;
        const shelfSpacing = 4;
        const rowSpacing = 6;

        const startX = -15;
        const startZ = -20;

        for (let row = 0; row < rows; row++) {
            for (let shelf = 0; shelf < shelvesPerRow; shelf++) {
                const x = startX + shelf * shelfSpacing;
                const z = startZ + row * rowSpacing;

                this.createBookshelf(x, z);
            }
        }
    }

    createBookshelf(x, z) {
        // Bookshelf frame
        const shelfGeometry = new THREE.BoxGeometry(2, 3, 0.5);
        const shelfMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3020,
            roughness: 0.8,
            metalness: 0.1
        });
        const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
        shelf.position.set(x, 1.5, z);
        this.scene.add(shelf);
        this.meshes.push(shelf);

        // Books on shelves (colorful)
        const bookColors = [0x8b4513, 0x654321, 0x3a2a1a, 0x5a4a3a, 0x2a4a3a, 0x4a2a3a];
        const booksPerShelf = 4;
        const shelvesVertical = 4;

        for (let shelfLevel = 0; shelfLevel < shelvesVertical; shelfLevel++) {
            for (let book = 0; book < booksPerShelf; book++) {
                const bookGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.15);
                const bookColor = bookColors[Math.floor(Math.random() * bookColors.length)];
                const bookMaterial = new THREE.MeshStandardMaterial({
                    color: bookColor,
                    roughness: 0.7,
                    metalness: 0.2
                });
                const bookMesh = new THREE.Mesh(bookGeometry, bookMaterial);
                bookMesh.position.set(
                    x - 0.8 + book * 0.45,
                    0.5 + shelfLevel * 0.75,
                    z + 0.15
                );
                this.scene.add(bookMesh);
                this.meshes.push(bookMesh);
            }
        }
    }

    placeReadingTables(count) {
        const positions = [
            { x: -8, z: 0 }, { x: 8, z: 0 },
            { x: -8, z: 10 }, { x: 8, z: 10 },
            { x: 0, z: -8 }, { x: 0, z: 5 }
        ];

        for (let i = 0; i < Math.min(count, positions.length); i++) {
            const pos = positions[i];
            this.createReadingTable(pos.x, pos.z);
        }
    }

    createReadingTable(x, z) {
        // Table top
        const tableGeometry = new THREE.BoxGeometry(3, 0.1, 1.5);
        const tableMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.6,
            metalness: 0.2
        });
        const table = new THREE.Mesh(tableGeometry, tableMaterial);
        table.position.set(x, 0.75, z);
        this.scene.add(table);
        this.meshes.push(table);

        // Table legs
        const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8);
        const legPositions = [
            { x: x - 1.3, z: z - 0.6 },
            { x: x + 1.3, z: z - 0.6 },
            { x: x - 1.3, z: z + 0.6 },
            { x: x + 1.3, z: z + 0.6 }
        ];

        for (const legPos of legPositions) {
            const leg = new THREE.Mesh(legGeometry, tableMaterial);
            leg.position.set(legPos.x, 0.35, legPos.z);
            this.scene.add(leg);
            this.meshes.push(leg);
        }

        // Book on table
        const bookGeometry = new THREE.BoxGeometry(0.6, 0.08, 0.9);
        const bookMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.7
        });
        const book = new THREE.Mesh(bookGeometry, bookMaterial);
        book.position.set(x - 0.5, 0.84, z);
        book.rotation.y = Math.random() * 0.5;
        this.scene.add(book);
        this.meshes.push(book);

        // Candle
        const candleGeometry = new THREE.CylinderGeometry(0.05, 0.06, 0.3, 8);
        const candleMaterial = new THREE.MeshStandardMaterial({
            color: 0xfff8dc,
            roughness: 0.5
        });
        const candle = new THREE.Mesh(candleGeometry, candleMaterial);
        candle.position.set(x + 1, 0.95, z);
        this.scene.add(candle);
        this.meshes.push(candle);

        // Candle flame
        const flameGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const flameMaterial = new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            emissive: 0xffaa00,
            emissiveIntensity: 1
        });
        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.position.set(x + 1, 1.15, z);
        flame.userData.isCandle = true;
        this.scene.add(flame);
        this.meshes.push(flame);

        // Candle light
        const light = new THREE.PointLight(0xffaa00, 1.5, 6);
        light.position.set(x + 1, 1.15, z);
        this.scene.add(light);
        this.lights.push(light);
    }

    placeLadders(count) {
        const positions = [
            { x: -16, z: -18 }, { x: -16, z: -6 },
            { x: 16, z: -18 }, { x: 16, z: -6 }
        ];

        for (let i = 0; i < Math.min(count, positions.length); i++) {
            const pos = positions[i];
            this.createLadder(pos.x, pos.z);
        }
    }

    createLadder(x, z) {
        const ladderMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.8
        });

        // Ladder sides
        const sideGeometry = new THREE.BoxGeometry(0.1, 4, 0.1);
        const leftSide = new THREE.Mesh(sideGeometry, ladderMaterial);
        leftSide.position.set(x - 0.3, 2, z);
        this.scene.add(leftSide);
        this.meshes.push(leftSide);

        const rightSide = new THREE.Mesh(sideGeometry, ladderMaterial);
        rightSide.position.set(x + 0.3, 2, z);
        this.scene.add(rightSide);
        this.meshes.push(rightSide);

        // Rungs
        const rungGeometry = new THREE.BoxGeometry(0.7, 0.08, 0.08);
        for (let i = 0; i < 8; i++) {
            const rung = new THREE.Mesh(rungGeometry, ladderMaterial);
            rung.position.set(x, 0.5 + i * 0.5, z);
            this.scene.add(rung);
            this.meshes.push(rung);
        }
    }

    placeScrollRacks(count) {
        const positions = [
            { x: -12, z: 15 }, { x: -4, z: 15 },
            { x: 4, z: 15 }, { x: 12, z: 15 },
            { x: -12, z: -15 }, { x: -4, z: -15 },
            { x: 4, z: -15 }, { x: 12, z: -15 }
        ];

        for (let i = 0; i < Math.min(count, positions.length); i++) {
            const pos = positions[i];
            this.createScrollRack(pos.x, pos.z);
        }
    }

    createScrollRack(x, z) {
        const rackGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 12);
        const rackMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3020,
            roughness: 0.8
        });
        const rack = new THREE.Mesh(rackGeometry, rackMaterial);
        rack.position.set(x, 0.75, z);
        this.scene.add(rack);
        this.meshes.push(rack);

        // Scrolls
        const scrollCount = 8;
        for (let i = 0; i < scrollCount; i++) {
            const scrollGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
            const scrollMaterial = new THREE.MeshStandardMaterial({
                color: 0xfff8dc,
                roughness: 0.6
            });
            const scroll = new THREE.Mesh(scrollGeometry, scrollMaterial);
            const angle = (i / scrollCount) * Math.PI * 2;
            scroll.position.set(
                x + Math.cos(angle) * 0.3,
                1 + Math.random() * 0.3,
                z + Math.sin(angle) * 0.3
            );
            scroll.rotation.z = Math.PI / 2;
            scroll.rotation.y = angle;
            this.scene.add(scroll);
            this.meshes.push(scroll);
        }
    }

    createChandelier() {
        const chandelier = new THREE.Group();

        // Central rod
        const rodGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a7a5a,
            roughness: 0.4,
            metalness: 0.8
        });
        const rod = new THREE.Mesh(rodGeometry, metalMaterial);
        chandelier.add(rod);

        // Arms
        const armCount = 6;
        const angleStep = (Math.PI * 2) / armCount;

        for (let i = 0; i < armCount; i++) {
            const angle = angleStep * i;
            const armLength = 1.5;

            // Arm
            const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, armLength, 8);
            const arm = new THREE.Mesh(armGeometry, metalMaterial);
            arm.position.set(
                Math.cos(angle) * armLength / 2,
                -0.5,
                Math.sin(angle) * armLength / 2
            );
            arm.rotation.z = Math.PI / 2;
            arm.rotation.y = angle;
            chandelier.add(arm);

            // Candle at end
            const candlePos = new THREE.Vector3(
                Math.cos(angle) * armLength,
                -0.5,
                Math.sin(angle) * armLength
            );

            const candleGeometry = new THREE.CylinderGeometry(0.06, 0.08, 0.3, 8);
            const candleMaterial = new THREE.MeshStandardMaterial({
                color: 0xfff8dc
            });
            const candle = new THREE.Mesh(candleGeometry, candleMaterial);
            candle.position.copy(candlePos);
            chandelier.add(candle);

            // Flame
            const flameGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const flameMaterial = new THREE.MeshStandardMaterial({
                color: 0xffaa00,
                emissive: 0xffaa00,
                emissiveIntensity: 1
            });
            const flame = new THREE.Mesh(flameGeometry, flameMaterial);
            flame.position.copy(candlePos);
            flame.position.y += 0.2;
            flame.userData.isCandle = true;
            chandelier.add(flame);

            // Light
            const light = new THREE.PointLight(0xffaa00, 2, 15);
            light.position.copy(candlePos);
            light.position.y += 0.2;
            chandelier.add(light);
            this.lights.push(light);
        }

        chandelier.position.set(0, this.definition.size.height - 1.5, 0);
        this.scene.add(chandelier);
        this.meshes.push(chandelier);
    }

    update(deltaTime, player) {
        super.update(deltaTime, player);

        // Animate candles
        const time = Date.now() * 0.001;
        for (const mesh of this.meshes) {
            if (mesh.userData.isCandle) {
                const flicker = Math.sin(time * 6 + mesh.position.x) * 0.05 + 1;
                mesh.scale.set(flicker, flicker, flicker);
            }
        }
    }
}
