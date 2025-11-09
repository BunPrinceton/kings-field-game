import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class HotSpringsInstance extends Instance {
    constructor(id, config, scene) {
        super(id, 'hot_springs', config, scene);
    }

    generateGeometry() {
        const { width, depth, height } = this.config.size;

        // Rocky cavern floor
        const floorGeometry = new THREE.PlaneGeometry(width, depth);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3a2a,
            roughness: 0.9
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Rock walls (natural cavern)
        this.createRockWall(-width/2, 0, 0, 0, depth, height);
        this.createRockWall(width/2, 0, 0, 0, depth, height);
        this.createRockWall(0, 0, -depth/2, Math.PI/2, width, height);
        this.createRockWall(0, 0, depth/2, Math.PI/2, width, height);

        // Cavern ceiling with stalactites
        const ceilingGeometry = new THREE.PlaneGeometry(width, depth);
        const ceilingMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a2a1a,
            roughness: 0.95
        });
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.position.y = height;
        ceiling.rotation.x = Math.PI / 2;
        this.scene.add(ceiling);

        // Stalactites
        for (let i = 0; i < 12; i++) {
            this.createStalactite(
                (Math.random() - 0.5) * width * 0.8,
                (Math.random() - 0.5) * depth * 0.8
            );
        }

        // Hot spring pools (glowing blue water)
        this.createSpringPool(0, 0, 4, 3.5);
        this.createSpringPool(-width/3, depth/4, 2.5, 2);
        this.createSpringPool(width/3, -depth/4, 2, 1.8);

        // Steam particles
        for (let i = 0; i < 20; i++) {
            this.createSteam(
                (Math.random() - 0.5) * width * 0.6,
                (Math.random() - 0.5) * depth * 0.6
            );
        }

        // Rocks around pools
        for (let i = 0; i < 15; i++) {
            this.createRock(
                (Math.random() - 0.5) * width * 0.9,
                (Math.random() - 0.5) * depth * 0.9
            );
        }

        // Wooden benches for relaxation
        this.createBench(-width/2 + 2, -depth/2 + 2, Math.PI / 4);
        this.createBench(width/2 - 2, -depth/2 + 2, -Math.PI / 4);

        // Towels on benches
        this.createTowel(-width/2 + 2, -depth/2 + 2);
        this.createTowel(width/2 - 2, -depth/2 + 2);

        // Crystal formations (glowing)
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const dist = Math.min(width, depth) / 2 - 1.5;
            this.createCrystal(
                Math.cos(angle) * dist,
                Math.sin(angle) * dist
            );
        }

        // Healing plants
        for (let i = 0; i < 6; i++) {
            this.createHealingPlant(
                (Math.random() - 0.5) * width * 0.8,
                (Math.random() - 0.5) * depth * 0.8
            );
        }
    }

    createRockWall(x, y, z, rotation, length, height) {
        const wallGeometry = new THREE.PlaneGeometry(length, height);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3a2a,
            roughness: 0.95
        });
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(x, y + height/2, z);
        wall.rotation.y = rotation;
        wall.receiveShadow = true;
        this.scene.add(wall);
    }

    createStalactite(x, z) {
        const coneGeometry = new THREE.ConeGeometry(
            Math.random() * 0.2 + 0.1,
            Math.random() * 1.5 + 0.5,
            8
        );
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.9
        });
        const stalactite = new THREE.Mesh(coneGeometry, rockMaterial);
        stalactite.position.set(x, this.config.size.height - 0.2, z);
        stalactite.rotation.x = Math.PI;
        this.scene.add(stalactite);
    }

    createSpringPool(x, z, radiusX, radiusZ) {
        // Water surface (glowing blue)
        const poolGeometry = new THREE.CircleGeometry(Math.max(radiusX, radiusZ), 32);
        const poolMaterial = new THREE.MeshStandardMaterial({
            color: 0x3388ff,
            emissive: 0x1166cc,
            emissiveIntensity: 0.4,
            roughness: 0.1,
            metalness: 0.8,
            transparent: true,
            opacity: 0.8
        });
        const pool = new THREE.Mesh(poolGeometry, poolMaterial);
        pool.position.set(x, 0.05, z);
        pool.rotation.x = -Math.PI / 2;
        pool.scale.set(radiusX / Math.max(radiusX, radiusZ), 1, radiusZ / Math.max(radiusX, radiusZ));
        this.scene.add(pool);

        // Pool edge (rocks)
        const edgeCount = 16;
        for (let i = 0; i < edgeCount; i++) {
            const angle = (i / edgeCount) * Math.PI * 2;
            const rx = radiusX * (1 + Math.random() * 0.1);
            const rz = radiusZ * (1 + Math.random() * 0.1);
            const rock = this.createRock(
                x + Math.cos(angle) * rx,
                z + Math.sin(angle) * rz,
                0.3
            );
        }

        // Underwater light
        const underwaterLight = new THREE.PointLight(0x3388ff, 1.5, radiusX * 3);
        underwaterLight.position.set(x, 0.1, z);
        this.scene.add(underwaterLight);
    }

    createSteam(x, z) {
        const steamGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const steamMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3
        });
        const steam = new THREE.Mesh(steamGeometry, steamMaterial);
        steam.position.set(x, Math.random() * 2 + 0.2, z);
        steam.userData.isAnimated = true;
        steam.userData.velocity = (Math.random() - 0.5) * 0.02;
        this.scene.add(steam);
    }

    createRock(x, z, baseSize = 0.5) {
        const rockGeometry = new THREE.DodecahedronGeometry(baseSize * (Math.random() * 0.5 + 0.5), 0);
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a5a4a,
            roughness: 0.95
        });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(x, baseSize / 2, z);
        rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        this.scene.add(rock);
        return rock;
    }

    createBench(x, z, rotation) {
        // Wooden seat
        const seatGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.5);
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a4a2a,
            roughness: 0.8
        });
        const seat = new THREE.Mesh(seatGeometry, woodMaterial);
        seat.position.set(x, 0.4, z);
        seat.rotation.y = rotation;
        this.scene.add(seat);

        // Legs
        for (let lx of [-0.6, 0.6]) {
            for (let lz of [-0.2, 0.2]) {
                const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 6);
                const leg = new THREE.Mesh(legGeometry, woodMaterial);
                leg.position.set(
                    x + lx * Math.cos(rotation) - lz * Math.sin(rotation),
                    0.2,
                    z + lx * Math.sin(rotation) + lz * Math.cos(rotation)
                );
                this.scene.add(leg);
            }
        }
    }

    createTowel(x, z) {
        const towelGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.4);
        const towelMaterial = new THREE.MeshStandardMaterial({
            color: 0xeeeeee,
            roughness: 0.9
        });
        const towel = new THREE.Mesh(towelGeometry, towelMaterial);
        towel.position.set(x, 0.5, z);
        this.scene.add(towel);
    }

    createCrystal(x, z) {
        const crystalGeometry = new THREE.OctahedronGeometry(0.3, 0);
        const crystalMaterial = new THREE.MeshStandardMaterial({
            color: 0x88aaff,
            emissive: 0x4466cc,
            emissiveIntensity: 0.6,
            roughness: 0.2,
            metalness: 0.8,
            transparent: true,
            opacity: 0.7
        });
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        crystal.position.set(x, 0.3, z);
        crystal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        this.scene.add(crystal);

        // Crystal light
        const crystalLight = new THREE.PointLight(0x88aaff, 0.5, 2);
        crystalLight.position.set(x, 0.4, z);
        this.scene.add(crystalLight);
    }

    createHealingPlant(x, z) {
        // Stem
        const stemGeometry = new THREE.CylinderGeometry(0.02, 0.03, 0.4, 6);
        const stemMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a5a3a,
            roughness: 0.8
        });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.set(x, 0.2, z);
        this.scene.add(stem);

        // Leaves
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const leafGeometry = new THREE.CircleGeometry(0.1, 8);
            const leafMaterial = new THREE.MeshStandardMaterial({
                color: 0x3a7a4a,
                roughness: 0.7,
                side: THREE.DoubleSide
            });
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            leaf.position.set(
                x + Math.cos(angle) * 0.08,
                0.25 + i * 0.05,
                z + Math.sin(angle) * 0.08
            );
            leaf.rotation.z = angle;
            this.scene.add(leaf);
        }

        // Healing bloom (glowing)
        const bloomGeometry = new THREE.SphereGeometry(0.06, 8, 8);
        const bloomMaterial = new THREE.MeshStandardMaterial({
            color: 0xffaa66,
            emissive: 0xff8844,
            emissiveIntensity: 0.8
        });
        const bloom = new THREE.Mesh(bloomGeometry, bloomMaterial);
        bloom.position.set(x, 0.45, z);
        this.scene.add(bloom);
    }

    setupLighting() {
        // Warm ambient light (steam-filled cavern)
        const ambientLight = new THREE.AmbientLight(0x4466aa, 0.5);
        this.scene.add(ambientLight);

        // Blue glow from hot springs (added in createSpringPool)

        // Warm torch light
        const torchLight = new THREE.PointLight(0xffaa66, 1.0, 12);
        torchLight.position.set(
            -this.config.size.width / 2 + 2,
            2,
            -this.config.size.depth / 2 + 2
        );
        this.scene.add(torchLight);

        // Crystal lights (added in createCrystal)

        // Fog for atmosphere
        this.scene.fog = new THREE.FogExp2(0x3366aa, 0.05);
    }
}
