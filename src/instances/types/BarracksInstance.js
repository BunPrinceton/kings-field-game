// BarracksInstance.js - Military sleeping quarters
import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class BarracksInstance extends Instance {
    constructor(definition) {
        super(definition);
    }

    async generateGeometry() {
        await super.generateGeometry();

        const size = this.definition.size;

        // Create bunk beds in rows
        this.createBunkBeds(size.width, size.depth);

        // Create footlockers
        this.createFootlockers(size.width, size.depth);

        // Create weapon storage area
        this.createWeaponStorage(size.width, size.depth);

        // Create training schedule board
        this.createScheduleBoard(size.width, size.depth);
    }

    createBunkBeds(width, depth) {
        // 12 bunk beds (6 pairs) arranged in 2 rows
        const bedPositions = [
            // First row (left side)
            { x: -6, z: -7, hasUpper: true },
            { x: -3, z: -7, hasUpper: true },
            { x: 0, z: -7, hasUpper: true },
            { x: 3, z: -7, hasUpper: true },
            { x: 6, z: -7, hasUpper: true },
            // Second row (right side)
            { x: -6, z: 5, hasUpper: true },
            { x: -3, z: 5, hasUpper: true },
            { x: 0, z: 5, hasUpper: true },
            { x: 3, z: 5, hasUpper: true },
            { x: 6, z: 5, hasUpper: true }
        ];

        for (const pos of bedPositions) {
            this.createBunkBed(pos.x, pos.z, pos.hasUpper);
        }
    }

    createBunkBed(x, z, hasUpper) {
        // Lower bed
        const lowerFrameGeometry = new THREE.BoxGeometry(0.9, 0.3, 1.8);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.85
        });
        const lowerFrame = new THREE.Mesh(lowerFrameGeometry, frameMaterial);
        lowerFrame.position.set(x, 0.15, z);
        this.scene.add(lowerFrame);
        this.meshes.push(lowerFrame);

        // Lower mattress
        const mattressGeometry = new THREE.BoxGeometry(0.85, 0.2, 1.75);
        const mattressMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.9
        });
        const lowerMattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
        lowerMattress.position.set(x, 0.4, z);
        this.scene.add(lowerMattress);
        this.meshes.push(lowerMattress);

        // Lower blanket
        const blanketGeometry = new THREE.BoxGeometry(0.8, 0.1, 1.4);
        const blanketMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a5a5a,
            roughness: 0.9
        });
        const lowerBlanket = new THREE.Mesh(blanketGeometry, blanketMaterial);
        lowerBlanket.position.set(x, 0.55, z);
        this.scene.add(lowerBlanket);
        this.meshes.push(lowerBlanket);

        if (hasUpper) {
            // Upper bed (bunk)
            const upperFrameGeometry = new THREE.BoxGeometry(0.9, 0.3, 1.8);
            const upperFrame = new THREE.Mesh(upperFrameGeometry, frameMaterial);
            upperFrame.position.set(x, 1.45, z);
            this.scene.add(upperFrame);
            this.meshes.push(upperFrame);

            // Upper mattress
            const upperMattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
            upperMattress.position.set(x, 1.7, z);
            this.scene.add(upperMattress);
            this.meshes.push(upperMattress);

            // Upper blanket
            const upperBlanket = new THREE.Mesh(blanketGeometry, blanketMaterial);
            upperBlanket.position.set(x, 1.85, z);
            this.scene.add(upperBlanket);
            this.meshes.push(upperBlanket);

            // Support posts (4)
            const postGeometry = new THREE.BoxGeometry(0.08, 1.3, 0.08);
            const postMaterial = new THREE.MeshStandardMaterial({
                color: 0x3a2a1a,
                roughness: 0.8
            });

            const corners = [
                { x: x - 0.42, z: z - 0.85 },
                { x: x + 0.42, z: z - 0.85 },
                { x: x - 0.42, z: z + 0.85 },
                { x: x + 0.42, z: z + 0.85 }
            ];

            for (const corner of corners) {
                const post = new THREE.Mesh(postGeometry, postMaterial);
                post.position.set(corner.x, 0.75, corner.z);
                this.scene.add(post);
                this.meshes.push(post);
            }
        }
    }

    createFootlockers(width, depth) {
        // Footlocker at end of each bunk
        const lockerPositions = [
            // First row lockers
            { x: -6, z: -8.5 },
            { x: -3, z: -8.5 },
            { x: 0, z: -8.5 },
            { x: 3, z: -8.5 },
            { x: 6, z: -8.5 },
            // Second row lockers
            { x: -6, z: 6.5 },
            { x: -3, z: 6.5 },
            { x: 0, z: 6.5 },
            { x: 3, z: 6.5 },
            { x: 6, z: 6.5 }
        ];

        for (const pos of lockerPositions) {
            this.createFootlocker(pos.x, pos.z);
        }
    }

    createFootlocker(x, z) {
        // Metal footlocker
        const lockerGeometry = new THREE.BoxGeometry(0.8, 0.5, 0.4);
        const lockerMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a6a6a,
            metalness: 0.6,
            roughness: 0.5
        });
        const locker = new THREE.Mesh(lockerGeometry, lockerMaterial);
        locker.position.set(x, 0.25, z);
        this.scene.add(locker);
        this.meshes.push(locker);

        // Locker handle
        const handleGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.9,
            roughness: 0.2
        });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(x, 0.4, z);
        handle.rotation.z = Math.PI / 2;
        this.scene.add(handle);
        this.meshes.push(handle);
    }

    createWeaponStorage(width, depth) {
        const storageX = width / 2 - 3;
        const storageZ = 0;

        // Weapon rack/storage area - large wooden structure
        const rackGeometry = new THREE.BoxGeometry(3, 2.5, 1.5);
        const rackMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3a2a,
            roughness: 0.85
        });
        const rack = new THREE.Mesh(rackGeometry, rackMaterial);
        rack.position.set(storageX, 1.25, storageZ);
        this.scene.add(rack);
        this.meshes.push(rack);

        // Spears on rack
        for (let i = 0; i < 6; i++) {
            const spearGeometry = new THREE.CylinderGeometry(0.03, 0.03, 2.2, 8);
            const spearMaterial = new THREE.MeshStandardMaterial({
                color: 0x5a4a3a,
                roughness: 0.9
            });
            const spear = new THREE.Mesh(spearGeometry, spearMaterial);
            spear.position.set(
                storageX - 1.2 + i * 0.4,
                1.8,
                storageZ
            );
            this.scene.add(spear);
            this.meshes.push(spear);

            // Spear point
            const pointGeometry = new THREE.ConeGeometry(0.05, 0.25, 6);
            const pointMaterial = new THREE.MeshStandardMaterial({
                color: 0x888888,
                metalness: 0.9,
                roughness: 0.2
            });
            const point = new THREE.Mesh(pointGeometry, pointMaterial);
            point.position.set(spear.position.x, spear.position.y + 1.25, spear.position.z);
            this.scene.add(point);
            this.meshes.push(point);
        }

        // Shields stacked below
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {
                const shieldGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 16);
                const shieldMaterial = new THREE.MeshStandardMaterial({
                    color: 0x6a6a6a,
                    metalness: 0.7,
                    roughness: 0.4
                });
                const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
                shield.position.set(
                    storageX - 1 + col * 0.8,
                    0.6 + row * 0.5,
                    storageZ
                );
                shield.rotation.x = Math.PI / 2;
                this.scene.add(shield);
                this.meshes.push(shield);
            }
        }
    }

    createScheduleBoard(width, depth) {
        const boardX = -width / 2 + 2;
        const boardY = 1.5;
        const boardZ = depth / 2 - 1;

        // Board backing
        const boardGeometry = new THREE.BoxGeometry(2, 2, 0.08);
        const boardMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3a2a,
            roughness: 0.85
        });
        const board = new THREE.Mesh(boardGeometry, boardMaterial);
        board.position.set(boardX, boardY, boardZ);
        this.scene.add(board);
        this.meshes.push(board);

        // Training schedule area (white parchment)
        const scheduleGeometry = new THREE.PlaneGeometry(1.8, 1.8);
        const scheduleMaterial = new THREE.MeshBasicMaterial({
            color: 0xdddddd
        });
        const schedule = new THREE.Mesh(scheduleGeometry, scheduleMaterial);
        schedule.position.set(boardX, boardY, boardZ + 0.05);
        this.scene.add(schedule);
        this.meshes.push(schedule);

        // Military banner decoration
        this.createMilitaryBanner(boardX + 1.5, boardY + 1.5, boardZ);
    }

    createMilitaryBanner(x, y, z) {
        // Banner pole
        const poleGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 12);
        const poleMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a2a1a,
            roughness: 0.8
        });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(x, y, z);
        this.scene.add(pole);
        this.meshes.push(pole);

        // Banner cloth
        const bannerGeometry = new THREE.PlaneGeometry(0.8, 0.6);
        const bannerMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a1a1a,
            roughness: 0.7,
            side: THREE.DoubleSide
        });
        const banner = new THREE.Mesh(bannerGeometry, bannerMaterial);
        banner.position.set(x + 0.4, y, z);
        this.scene.add(banner);
        this.meshes.push(banner);

        // Banner emblem/crest (circle in center)
        const emblemGeometry = new THREE.CircleGeometry(0.15, 16);
        const emblemMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd700
        });
        const emblem = new THREE.Mesh(emblemGeometry, emblemMaterial);
        emblem.position.set(x + 0.4, y, z + 0.01);
        this.scene.add(emblem);
        this.meshes.push(emblem);
    }

    placeFeatures() {
        const features = this.definition.features;

        if (features.torches) {
            this.placeTorches();
        }
    }

    placeTorches() {
        // Military style torch lighting - organized
        const torchPositions = [
            { x: -7, z: -8 },
            { x: 7, z: -8 },
            { x: -7, z: 7 },
            { x: 7, z: 7 }
        ];

        for (const pos of torchPositions) {
            const light = new THREE.PointLight(0xff8844, 2, 12);
            light.position.set(pos.x, 2.2, pos.z);
            this.scene.add(light);
            this.lights.push(light);

            // Torch visual
            const torchGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.3, 8);
            const torchMaterial = new THREE.MeshStandardMaterial({
                color: 0x3a2a1a,
                roughness: 0.9
            });
            const torch = new THREE.Mesh(torchGeometry, torchMaterial);
            torch.position.set(pos.x, 2, pos.z);
            this.scene.add(torch);
            this.meshes.push(torch);

            // Flame
            const flameGeometry = new THREE.ConeGeometry(0.1, 0.25, 8);
            const flameMaterial = new THREE.MeshStandardMaterial({
                color: 0xff6600,
                emissive: 0xff6600,
                emissiveIntensity: 1
            });
            const flame = new THREE.Mesh(flameGeometry, flameMaterial);
            flame.position.set(pos.x, 2.25, pos.z);
            flame.userData.isTorch = true;
            this.scene.add(flame);
            this.meshes.push(flame);
        }
    }

    setupLighting() {
        // Practical military lighting - bright and organized
        const ambientLight = new THREE.AmbientLight(0x9a8a7a, 0.45);
        this.scene.add(ambientLight);
    }

    update(deltaTime, player) {
        super.update(deltaTime, player);

        // Animate torches
        const time = Date.now() * 0.001;
        for (const mesh of this.meshes) {
            if (mesh.userData.isTorch) {
                const flicker = Math.sin(time * 7) * 0.1 + 1;
                mesh.scale.set(flicker * 0.95, flicker, flicker * 0.95);
            }
        }
    }
}
