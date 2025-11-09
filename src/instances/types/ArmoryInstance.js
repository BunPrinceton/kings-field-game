import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class ArmoryInstance extends Instance {
    constructor(id, config, scene) {
        super(id, 'armory', config, scene);
    }

    generateGeometry() {
        const { width, depth, height } = this.config.size;

        // Stone floor
        const floorGeometry = new THREE.PlaneGeometry(width, depth);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a5a5a,
            roughness: 0.9
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Walls
        this.createWall(-width/2, 0, 0, 0, depth, height);
        this.createWall(width/2, 0, 0, 0, depth, height);
        this.createWall(0, 0, -depth/2, Math.PI/2, width, height);
        this.createWall(0, 0, depth/2, Math.PI/2, width, height);

        // Ceiling
        const ceilingGeometry = new THREE.PlaneGeometry(width, depth);
        const ceilingMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.8
        });
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.position.y = height;
        ceiling.rotation.x = Math.PI / 2;
        this.scene.add(ceiling);

        // Weapon racks on walls (swords, axes, spears)
        this.createSwordRack(-width/2 + 0.3, -depth/3, -Math.PI/2);
        this.createSwordRack(-width/2 + 0.3, depth/3, -Math.PI/2);
        this.createAxeRack(width/2 - 0.3, -depth/3, Math.PI/2);
        this.createSpearRack(width/2 - 0.3, depth/3, Math.PI/2);

        // Armor stands (4 corners)
        this.createArmorStand(-width/3, -depth/3);
        this.createArmorStand(width/3, -depth/3);
        this.createArmorStand(-width/3, depth/3);
        this.createArmorStand(width/3, depth/3);

        // Shield wall display
        this.createShieldWall(0, -depth/2 + 0.3, 0);

        // Training dummies (center area)
        this.createTrainingDummy(-width/4, 0);
        this.createTrainingDummy(width/4, 0);

        // Weapon repair table
        this.createRepairTable(0, depth/3);

        // Weapon crates
        this.createWeaponCrate(-width/2 + 1.5, depth/2 - 1.5);
        this.createWeaponCrate(width/2 - 1.5, depth/2 - 1.5);

        // Grindstone
        this.createGrindstone(width/3, -depth/2 + 1.5);

        // Target practice (archery target)
        this.createArcheryTarget(0, depth/2 - 0.5);

        // Torches for lighting
        for (const [x, z] of [
            [-width/2 + 1, -depth/2 + 1],
            [width/2 - 1, -depth/2 + 1],
            [-width/2 + 1, depth/2 - 1],
            [width/2 - 1, depth/2 - 1]
        ]) {
            this.createWallTorch(x, z);
        }
    }

    createWall(x, y, z, rotation, length, height) {
        const wallGeometry = new THREE.PlaneGeometry(length, height);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a6a6a,
            roughness: 0.9
        });
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(x, y + height/2, z);
        wall.rotation.y = rotation;
        wall.receiveShadow = true;
        this.scene.add(wall);
    }

    createSwordRack(x, z, rotation) {
        // Rack board
        const rackGeometry = new THREE.BoxGeometry(0.1, 2, 1.5);
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2a1a,
            roughness: 0.8
        });
        const rack = new THREE.Mesh(rackGeometry, woodMaterial);
        rack.position.set(x, 1.5, z);
        rack.rotation.y = rotation;
        this.scene.add(rack);

        // Swords (6 different)
        const swordMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            metalness: 0.9,
            roughness: 0.2
        });

        for (let i = 0; i < 6; i++) {
            const row = Math.floor(i / 3);
            const col = i % 3;

            // Blade
            const bladeGeometry = new THREE.BoxGeometry(0.05, 1, 0.1);
            const blade = new THREE.Mesh(bladeGeometry, swordMaterial);
            blade.position.set(
                x + Math.cos(rotation) * 0.1,
                0.7 + row * 0.8,
                z - Math.sin(rotation) * 0.1 + (col - 1) * 0.4
            );
            blade.rotation.y = rotation;
            this.scene.add(blade);

            // Hilt
            const hiltGeometry = new THREE.BoxGeometry(0.05, 0.3, 0.05);
            const hiltMaterial = new THREE.MeshStandardMaterial({
                color: 0x4a2a1a,
                roughness: 0.7
            });
            const hilt = new THREE.Mesh(hiltGeometry, hiltMaterial);
            hilt.position.set(
                x + Math.cos(rotation) * 0.1,
                0.2 + row * 0.8,
                z - Math.sin(rotation) * 0.1 + (col - 1) * 0.4
            );
            hilt.rotation.y = rotation;
            this.scene.add(hilt);
        }
    }

    createAxeRack(x, z, rotation) {
        const rackGeometry = new THREE.BoxGeometry(0.1, 1.5, 1.2);
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2a1a,
            roughness: 0.8
        });
        const rack = new THREE.Mesh(rackGeometry, woodMaterial);
        rack.position.set(x, 1.2, z);
        rack.rotation.y = rotation;
        this.scene.add(rack);

        // Axes (4)
        for (let i = 0; i < 4; i++) {
            // Handle
            const handleGeometry = new THREE.CylinderGeometry(0.03, 0.04, 0.8, 8);
            const handleMaterial = new THREE.MeshStandardMaterial({
                color: 0x5a3a2a,
                roughness: 0.8
            });
            const handle = new THREE.Mesh(handleGeometry, handleMaterial);
            handle.position.set(
                x + Math.cos(rotation) * 0.1,
                1.2,
                z - Math.sin(rotation) * 0.1 + (i - 1.5) * 0.35
            );
            handle.rotation.y = rotation;
            handle.rotation.z = Math.PI / 2;
            this.scene.add(handle);

            // Axe head
            const headGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.1);
            const headMaterial = new THREE.MeshStandardMaterial({
                color: 0x888888,
                metalness: 0.8,
                roughness: 0.3
            });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.set(
                x + Math.cos(rotation) * 0.5,
                1.2,
                z - Math.sin(rotation) * 0.5 + (i - 1.5) * 0.35
            );
            head.rotation.y = rotation;
            this.scene.add(head);
        }
    }

    createSpearRack(x, z, rotation) {
        const rackGeometry = new THREE.BoxGeometry(0.1, 2.5, 1);
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2a1a,
            roughness: 0.8
        });
        const rack = new THREE.Mesh(rackGeometry, woodMaterial);
        rack.position.set(x, 1.8, z);
        rack.rotation.y = rotation;
        this.scene.add(rack);

        // Spears (5)
        for (let i = 0; i < 5; i++) {
            // Shaft
            const shaftGeometry = new THREE.CylinderGeometry(0.03, 0.03, 2, 8);
            const shaftMaterial = new THREE.MeshStandardMaterial({
                color: 0x5a3a2a,
                roughness: 0.8
            });
            const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
            shaft.position.set(
                x + Math.cos(rotation) * 0.1,
                2,
                z - Math.sin(rotation) * 0.1 + (i - 2) * 0.25
            );
            shaft.rotation.y = rotation;
            this.scene.add(shaft);

            // Spearhead
            const headGeometry = new THREE.ConeGeometry(0.05, 0.3, 6);
            const headMaterial = new THREE.MeshStandardMaterial({
                color: 0xaaaaaa,
                metalness: 0.9,
                roughness: 0.2
            });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.set(
                x + Math.cos(rotation) * 0.1,
                3.15,
                z - Math.sin(rotation) * 0.1 + (i - 2) * 0.25
            );
            head.rotation.y = rotation;
            this.scene.add(head);
        }
    }

    createArmorStand(x, z) {
        // Stand base
        const baseGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.1, 12);
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2a1a,
            roughness: 0.8
        });
        const base = new THREE.Mesh(baseGeometry, woodMaterial);
        base.position.set(x, 0.05, z);
        this.scene.add(base);

        // Stand pole
        const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
        const pole = new THREE.Mesh(poleGeometry, woodMaterial);
        pole.position.set(x, 0.85, z);
        this.scene.add(pole);

        // Chest plate
        const chestGeometry = new THREE.BoxGeometry(0.6, 0.7, 0.3);
        const armorMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.8,
            roughness: 0.3
        });
        const chest = new THREE.Mesh(chestGeometry, armorMaterial);
        chest.position.set(x, 1.3, z);
        this.scene.add(chest);

        // Helmet
        const helmetGeometry = new THREE.SphereGeometry(0.2, 12, 12);
        const helmet = new THREE.Mesh(helmetGeometry, armorMaterial);
        helmet.position.set(x, 1.8, z);
        helmet.scale.set(1, 1.2, 1);
        this.scene.add(helmet);

        // Shoulders
        for (let sx of [-0.35, 0.35]) {
            const shoulderGeometry = new THREE.SphereGeometry(0.15, 8, 8);
            const shoulder = new THREE.Mesh(shoulderGeometry, armorMaterial);
            shoulder.position.set(x + sx, 1.5, z);
            this.scene.add(shoulder);
        }
    }

    createShieldWall(x, z, rotation) {
        // Display 6 shields in 2 rows
        const shieldColors = [0x8a1a1a, 0x1a1a8a, 0x1a8a1a, 0xffd700, 0x6a6a6a, 0x8a4a1a];

        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {
                const index = row * 3 + col;
                const shieldGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
                const shieldMaterial = new THREE.MeshStandardMaterial({
                    color: shieldColors[index],
                    metalness: 0.6,
                    roughness: 0.4
                });
                const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
                shield.position.set(x + (col - 1) * 0.9, 1.5 + row * 0.9, z + 0.1);
                shield.rotation.x = Math.PI / 2;
                this.scene.add(shield);

                // Shield boss (center)
                const bossGeometry = new THREE.SphereGeometry(0.1, 8, 8);
                const bossMaterial = new THREE.MeshStandardMaterial({
                    color: 0xffd700,
                    metalness: 0.9,
                    roughness: 0.2
                });
                const boss = new THREE.Mesh(bossGeometry, bossMaterial);
                boss.position.set(x + (col - 1) * 0.9, 1.5 + row * 0.9, z + 0.15);
                this.scene.add(boss);
            }
        }
    }

    createTrainingDummy(x, z) {
        // Post
        const postGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.8, 12);
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a3a2a,
            roughness: 0.9
        });
        const post = new THREE.Mesh(postGeometry, woodMaterial);
        post.position.set(x, 0.9, z);
        this.scene.add(post);

        // Crossbar (arms)
        const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
        const arm = new THREE.Mesh(armGeometry, woodMaterial);
        arm.position.set(x, 1.3, z);
        arm.rotation.z = Math.PI / 2;
        this.scene.add(arm);

        // Padding (burlap sacks)
        const paddingGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.3);
        const paddingMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a7a5a,
            roughness: 0.9
        });
        const padding = new THREE.Mesh(paddingGeometry, paddingMaterial);
        padding.position.set(x, 1.3, z);
        this.scene.add(padding);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.2, 12, 12);
        const head = new THREE.Mesh(headGeometry, paddingMaterial);
        head.position.set(x, 1.9, z);
        this.scene.add(head);

        // Sword marks (slashes on padding)
        for (let i = 0; i < 3; i++) {
            const slashGeometry = new THREE.PlaneGeometry(0.3, 0.05);
            const slashMaterial = new THREE.MeshBasicMaterial({
                color: 0x2a2a2a,
                side: THREE.DoubleSide
            });
            const slash = new THREE.Mesh(slashGeometry, slashMaterial);
            slash.position.set(x, 1.2 + i * 0.15, z + 0.16);
            slash.rotation.z = (Math.random() - 0.5) * Math.PI / 4;
            this.scene.add(slash);
        }
    }

    createRepairTable(x, z) {
        // Table
        const tableGeometry = new THREE.BoxGeometry(2, 0.1, 1);
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a3a2a,
            roughness: 0.8
        });
        const table = new THREE.Mesh(tableGeometry, woodMaterial);
        table.position.set(x, 0.8, z);
        this.scene.add(table);

        // Legs
        for (let lx of [-0.8, 0.8]) {
            for (let lz of [-0.4, 0.4]) {
                const legGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.1);
                const leg = new THREE.Mesh(legGeometry, woodMaterial);
                leg.position.set(x + lx, 0.4, z + lz);
                this.scene.add(leg);
            }
        }

        // Hammer
        this.createHammer(x - 0.4, z + 0.2);

        // Damaged sword
        const swordGeometry = new THREE.BoxGeometry(0.05, 0.8, 0.08);
        const swordMaterial = new THREE.MeshStandardMaterial({
            color: 0x777777,
            metalness: 0.7,
            roughness: 0.5
        });
        const sword = new THREE.Mesh(swordGeometry, swordMaterial);
        sword.position.set(x + 0.2, 0.86, z);
        this.scene.add(sword);
    }

    createHammer(x, z) {
        // Handle
        const handleGeometry = new THREE.CylinderGeometry(0.03, 0.04, 0.4, 8);
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2a1a,
            roughness: 0.8
        });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(x, 0.85, z);
        this.scene.add(handle);

        // Hammerhead
        const headGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.08);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            metalness: 0.8,
            roughness: 0.4
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(x, 0.9, z);
        this.scene.add(head);
    }

    createWeaponCrate(x, z) {
        const crateGeometry = new THREE.BoxGeometry(1, 0.8, 0.8);
        const crateMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.9
        });
        const crate = new THREE.Mesh(crateGeometry, crateMaterial);
        crate.position.set(x, 0.4, z);
        this.scene.add(crate);

        // Weapons sticking out
        const swordGeometry = new THREE.BoxGeometry(0.05, 0.6, 0.05);
        const swordMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.9,
            roughness: 0.3
        });
        const sword = new THREE.Mesh(swordGeometry, swordMaterial);
        sword.position.set(x, 0.9, z);
        sword.rotation.z = Math.PI / 6;
        this.scene.add(sword);
    }

    createGrindstone(x, z) {
        // Stone wheel
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 24);
        const stoneMateria = new THREE.MeshStandardMaterial({
            color: 0x6a6a6a,
            roughness: 0.9
        });
        const wheel = new THREE.Mesh(wheelGeometry, stoneMaterial);
        wheel.position.set(x, 0.6, z);
        wheel.rotation.z = Math.PI / 2;
        this.scene.add(wheel);

        // Frame
        const frameGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2a1a,
            roughness: 0.8
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(x, 0.6, z);
        this.scene.add(frame);
    }

    createArcheryTarget(x, z) {
        // Target board (circular)
        const targetGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 24);
        const targetMaterial = new THREE.MeshStandardMaterial({
            color: 0xeeeecc,
            roughness: 0.9
        });
        const target = new THREE.Mesh(targetGeometry, targetMaterial);
        target.position.set(x, 1.2, z);
        target.rotation.x = Math.PI / 2;
        this.scene.add(target);

        // Bullseye rings
        for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.TorusGeometry(0.15 * (i + 1), 0.02, 8, 16);
            const ringColor = i % 2 === 0 ? 0xff0000 : 0xffffff;
            const ringMaterial = new THREE.MeshBasicMaterial({ color: ringColor });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.set(x, 1.2, z + 0.06);
            ring.rotation.x = Math.PI / 2;
            this.scene.add(ring);
        }

        // Arrows stuck in target
        for (let i = 0; i < 4; i++) {
            const arrowGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 6);
            const arrowMaterial = new THREE.MeshStandardMaterial({
                color: 0x5a3a2a,
                roughness: 0.8
            });
            const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
            const angle = (i / 4) * Math.PI * 2;
            const dist = Math.random() * 0.3;
            arrow.position.set(
                x + Math.cos(angle) * dist,
                1.2 + Math.sin(angle) * dist,
                z + 0.1
            );
            arrow.rotation.x = Math.PI / 2;
            this.scene.add(arrow);
        }
    }

    createWallTorch(x, z) {
        const torchGeometry = new THREE.CylinderGeometry(0.04, 0.05, 0.4, 8);
        const torchMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2a1a,
            roughness: 0.9
        });
        const torch = new THREE.Mesh(torchGeometry, torchMaterial);
        torch.position.set(x, 1.5, z);
        this.scene.add(torch);

        // Flame
        const flameGeometry = new THREE.ConeGeometry(0.08, 0.2, 4);
        const flameMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            emissive: 0xff4400,
            emissiveIntensity: 1
        });
        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.position.set(x, 1.75, z);
        this.scene.add(flame);

        // Light
        const light = new THREE.PointLight(0xff8844, 1.0, 6);
        light.position.set(x, 1.75, z);
        this.scene.add(light);
    }

    setupLighting() {
        // Dim ambient
        const ambientLight = new THREE.AmbientLight(0x4a4a4a, 0.4);
        this.scene.add(ambientLight);

        // Torches provide main lighting (added in createWallTorch)
    }
}
