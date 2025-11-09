import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class MeadHallInstance extends Instance {
    constructor(id, config, scene) {
        super(id, 'mead_hall', config, scene);
    }

    generateGeometry() {
        const { width, depth, height } = this.config.size;

        // Wooden floor
        const floorGeometry = new THREE.PlaneGeometry(width, depth);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a3a2a,
            roughness: 0.8
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Long tables (3 rows)
        for (let i = 0; i < 3; i++) {
            this.createLongTable(0, -depth/3 + i * depth/3);
        }

        // Ale barrels along walls
        for (let z = -depth/2 + 2; z < depth/2; z += 3) {
            this.createAleBarrel(-width/2 + 1, z);
            this.createAleBarrel(width/2 - 1, z);
        }

        // Firepit in center
        this.createFirepit(0, 0);

        // Viking shields on walls
        for (let i = 0; i < 6; i++) {
            this.createVikingShield(-width/2 + 0.1, 2, -depth/2 + (i + 1) * depth/7, -Math.PI/2);
            this.createVikingShield(width/2 - 0.1, 2, -depth/2 + (i + 1) * depth/7, Math.PI/2);
        }

        // Hanging banners
        this.createBanner(-width/4, height - 0.5, 0);
        this.createBanner(width/4, height - 0.5, 0);

        // Mead horns on tables
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                this.createMeadHorn((j - 1.5) * 1.5, 0.96, -depth/3 + i * depth/3);
            }
        }
    }

    createLongTable(x, z) {
        // Table top
        const tableGeometry = new THREE.BoxGeometry(6, 0.15, 1.2);
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2a1a,
            roughness: 0.8
        });
        const table = new THREE.Mesh(tableGeometry, woodMaterial);
        table.position.set(x, 0.85, z);
        this.scene.add(table);

        // Legs
        for (let lx of [-2.5, -1, 1, 2.5]) {
            for (let lz of [-0.5, 0.5]) {
                const legGeometry = new THREE.BoxGeometry(0.15, 0.85, 0.15);
                const leg = new THREE.Mesh(legGeometry, woodMaterial);
                leg.position.set(x + lx, 0.425, z + lz);
                this.scene.add(leg);
            }
        }

        // Benches on both sides
        for (let side of [-1, 1]) {
            const benchGeometry = new THREE.BoxGeometry(5.5, 0.1, 0.4);
            const bench = new THREE.Mesh(benchGeometry, woodMaterial);
            bench.position.set(x, 0.4, z + side * 0.9);
            this.scene.add(bench);

            // Bench legs
            for (let bx of [-2.5, 0, 2.5]) {
                const blegGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.1);
                const bleg = new THREE.Mesh(blegGeometry, woodMaterial);
                bleg.position.set(x + bx, 0.2, z + side * 0.9);
                this.scene.add(bleg);
            }
        }

        // Plates and food
        for (let i = 0; i < 8; i++) {
            const plateGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.02, 16);
            const plateMaterial = new THREE.MeshStandardMaterial({
                color: 0x8a7a6a,
                roughness: 0.6,
                metalness: 0.3
            });
            const plate = new THREE.Mesh(plateGeometry, plateMaterial);
            plate.position.set(x + (i - 3.5) * 0.7, 0.94, z + (i % 2 === 0 ? -0.3 : 0.3));
            this.scene.add(plate);
        }
    }

    createAleBarrel(x, z) {
        const barrelGeometry = new THREE.CylinderGeometry(0.4, 0.45, 1, 16);
        const barrelMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a3a1a,
            roughness: 0.9
        });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.position.set(x, 0.5, z);
        this.scene.add(barrel);

        // Metal bands
        for (let i of [-0.3, 0, 0.3]) {
            const bandGeometry = new THREE.TorusGeometry(0.42, 0.03, 8, 16);
            const bandMaterial = new THREE.MeshStandardMaterial({
                color: 0x3a3a3a,
                metalness: 0.8,
                roughness: 0.4
            });
            const band = new THREE.Mesh(bandGeometry, bandMaterial);
            band.position.set(x, 0.5 + i, z);
            this.scene.add(band);
        }

        // Tap
        const tapGeometry = new THREE.CylinderGeometry(0.02, 0.03, 0.15, 8);
        const tapMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a5a3a,
            roughness: 0.7
        });
        const tap = new THREE.Mesh(tapGeometry, tapMaterial);
        tap.position.set(x, 0.3, z + 0.45);
        tap.rotation.x = Math.PI / 2;
        this.scene.add(tap);
    }

    createFirepit(x, z) {
        // Stone ring
        const ringGeometry = new THREE.TorusGeometry(1, 0.2, 8, 16);
        const stoneMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.95
        });
        const ring = new THREE.Mesh(ringGeometry, stoneMaterial);
        ring.position.set(x, 0.1, z);
        ring.rotation.x = Math.PI / 2;
        this.scene.add(ring);

        // Fire
        const fireGeometry = new THREE.ConeGeometry(0.5, 1.2, 6);
        const fireMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            emissive: 0xff4400,
            emissiveIntensity: 1
        });
        const fire = new THREE.Mesh(fireGeometry, fireMaterial);
        fire.position.set(x, 0.6, z);
        this.scene.add(fire);

        // Light
        const fireLight = new THREE.PointLight(0xff6600, 2, 10);
        fireLight.position.set(x, 0.8, z);
        this.scene.add(fireLight);

        // Logs
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const logGeometry = new THREE.CylinderGeometry(0.1, 0.12, 1, 8);
            const logMaterial = new THREE.MeshStandardMaterial({
                color: 0x3a2a1a,
                roughness: 0.9
            });
            const log = new THREE.Mesh(logGeometry, logMaterial);
            log.position.set(x + Math.cos(angle) * 0.7, 0.1, z + Math.sin(angle) * 0.7);
            log.rotation.set(0, 0, Math.PI / 2);
            log.rotation.y = angle;
            this.scene.add(log);
        }
    }

    createVikingShield(x, y, z, rotation) {
        const shieldGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
        const shieldColors = [0x8a1a1a, 0x1a1a8a, 0x1a8a1a, 0xffd700, 0x8a4a1a, 0x6a6a6a];
        const shieldMaterial = new THREE.MeshStandardMaterial({
            color: shieldColors[Math.floor(Math.random() * shieldColors.length)],
            roughness: 0.7,
            metalness: 0.3
        });
        const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
        shield.position.set(x, y, z);
        shield.rotation.y = rotation;
        shield.rotation.z = Math.PI / 2;
        this.scene.add(shield);

        // Boss (center metal piece)
        const bossGeometry = new THREE.SphereGeometry(0.12, 12, 12);
        const bossMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.9,
            roughness: 0.2
        });
        const boss = new THREE.Mesh(bossGeometry, bossMaterial);
        boss.position.set(x + Math.cos(rotation) * 0.06, y, z - Math.sin(rotation) * 0.06);
        this.scene.add(boss);
    }

    createBanner(x, y, z) {
        const bannerGeometry = new THREE.PlaneGeometry(1.5, 2);
        const bannerMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a1a1a,
            roughness: 0.9,
            side: THREE.DoubleSide
        });
        const banner = new THREE.Mesh(bannerGeometry, bannerMaterial);
        banner.position.set(x, y, z);
        this.scene.add(banner);

        // Viking rune symbol (simplified)
        const runeGeometry = new THREE.BoxGeometry(0.6, 0.1, 0.05);
        const runeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            emissive: 0xffaa00,
            emissiveIntensity: 0.3
        });
        const rune = new THREE.Mesh(runeGeometry, runeMaterial);
        rune.position.set(x, y, z + 0.02);
        this.scene.add(rune);
    }

    createMeadHorn(x, y, z) {
        const hornGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.25, 8);
        const hornMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a7a5a,
            roughness: 0.7
        });
        const horn = new THREE.Mesh(hornGeometry, hornMaterial);
        horn.position.set(x, y, z);
        horn.rotation.z = Math.PI / 6;
        this.scene.add(horn);

        // Mead (liquid inside)
        const meadGeometry = new THREE.CylinderGeometry(0.04, 0.06, 0.15, 8);
        const meadMaterial = new THREE.MeshStandardMaterial({
            color: 0xcc8800,
            emissive: 0x885500,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.8
        });
        const mead = new THREE.Mesh(meadGeometry, meadMaterial);
        mead.position.set(x, y - 0.05, z);
        mead.rotation.z = Math.PI / 6;
        this.scene.add(mead);
    }

    setupLighting() {
        // Warm ambient
        const ambientLight = new THREE.AmbientLight(0xff8844, 0.4);
        this.scene.add(ambientLight);

        // Firepit light (added in createFirepit)

        // Additional warm lights on walls
        for (const [x, z] of [
            [-this.config.size.width/2 + 1, -this.config.size.depth/2 + 1],
            [this.config.size.width/2 - 1, -this.config.size.depth/2 + 1],
            [-this.config.size.width/2 + 1, this.config.size.depth/2 - 1],
            [this.config.size.width/2 - 1, this.config.size.depth/2 - 1]
        ]) {
            const torchLight = new THREE.PointLight(0xff8844, 0.8, 5);
            torchLight.position.set(x, 2, z);
            this.scene.add(torchLight);
        }
    }
}
