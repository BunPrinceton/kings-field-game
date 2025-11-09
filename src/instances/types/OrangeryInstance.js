import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class OrangeryInstance extends Instance {
    constructor(id, config, scene) {
        super(id, 'orangery', config, scene);
    }

    generateGeometry() {
        const { width, depth, height } = this.config.size;

        // Cobblestone floor
        const floorGeometry = new THREE.PlaneGeometry(width, depth);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a7a6a,
            roughness: 0.9
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Glass walls (transparent)
        this.createGlassWall(-width/2, 0, depth/2, 0, width, height);
        this.createGlassWall(width/2, 0, depth/2, 0, width, height);
        this.createGlassWall(0, 0, -depth/2, Math.PI/2, depth, height);
        this.createGlassWall(0, 0, depth/2, Math.PI/2, depth, height);

        // Glass ceiling
        const ceilingGeometry = new THREE.PlaneGeometry(width, depth);
        const ceilingMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaccff,
            transparent: true,
            opacity: 0.3,
            roughness: 0.1,
            metalness: 0.5
        });
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.position.y = height;
        ceiling.rotation.x = Math.PI / 2;
        this.scene.add(ceiling);

        // Wooden frame supports
        for (let x of [-width/2 + 2, 0, width/2 - 2]) {
            const beamGeometry = new THREE.BoxGeometry(0.2, height, 0.2);
            const beamMaterial = new THREE.MeshStandardMaterial({
                color: 0x4a3a2a,
                roughness: 0.8
            });
            const beam = new THREE.Mesh(beamGeometry, beamMaterial);
            beam.position.set(x, height/2, 0);
            this.scene.add(beam);
        }

        // Orange trees in pots
        const treePositions = [
            [-width/3, -depth/3], [-width/3, 0], [-width/3, depth/3],
            [0, -depth/3], [0, depth/3],
            [width/3, -depth/3], [width/3, 0], [width/3, depth/3]
        ];

        for (const [x, z] of treePositions) {
            this.createOrangeTree(x, z);
        }

        // Garden benches
        this.createBench(-width/2 + 1.5, -depth/2 + 1.5, 0);
        this.createBench(width/2 - 1.5, -depth/2 + 1.5, Math.PI);

        // Watering cans
        this.createWateringCan(width/2 - 2, depth/2 - 2);
        this.createWateringCan(-width/2 + 2, depth/2 - 2);

        // Gardening tools on wall
        this.createToolRack(0, -depth/2 + 0.3);

        // Flower pots
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const dist = Math.min(width, depth) / 2 - 1.5;
            this.createFlowerPot(
                Math.cos(angle) * dist,
                Math.sin(angle) * dist
            );
        }
    }

    createGlassWall(x, y, z, rotation, length, height) {
        const wallGeometry = new THREE.PlaneGeometry(length, height);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0xccddff,
            transparent: true,
            opacity: 0.2,
            roughness: 0.1,
            metalness: 0.5,
            side: THREE.DoubleSide
        });
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(x, y + height/2, z);
        wall.rotation.y = rotation;
        this.scene.add(wall);
    }

    createOrangeTree(x, z) {
        // Terracotta pot
        const potGeometry = new THREE.CylinderGeometry(0.5, 0.4, 0.6, 12);
        const potMaterial = new THREE.MeshStandardMaterial({
            color: 0xc85a3a,
            roughness: 0.9
        });
        const pot = new THREE.Mesh(potGeometry, potMaterial);
        pot.position.set(x, 0.3, z);
        this.scene.add(pot);

        // Soil
        const soilGeometry = new THREE.CylinderGeometry(0.48, 0.48, 0.05, 12);
        const soilMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a2a1a,
            roughness: 1.0
        });
        const soil = new THREE.Mesh(soilGeometry, soilMaterial);
        soil.position.set(x, 0.625, z);
        this.scene.add(soil);

        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1.5, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3a2a,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, 1.35, z);
        this.scene.add(trunk);

        // Foliage (spherical green crown)
        const foliageGeometry = new THREE.SphereGeometry(0.8, 8, 8);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a5a1a,
            roughness: 0.8
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.set(x, 2.3, z);
        this.scene.add(foliage);

        // Oranges
        for (let i = 0; i < 6; i++) {
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI / 2 + Math.PI / 4;
            const orangeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
            const orangeMaterial = new THREE.MeshStandardMaterial({
                color: 0xff8800,
                roughness: 0.6,
                emissive: 0xff6600,
                emissiveIntensity: 0.2
            });
            const orange = new THREE.Mesh(orangeGeometry, orangeMaterial);
            orange.position.set(
                x + 0.7 * Math.sin(theta) * Math.cos(phi),
                2.3 + 0.7 * Math.cos(theta),
                z + 0.7 * Math.sin(theta) * Math.sin(phi)
            );
            this.scene.add(orange);
        }
    }

    createBench(x, z, rotation) {
        // Seat
        const seatGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.5);
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a4a2a,
            roughness: 0.8
        });
        const seat = new THREE.Mesh(seatGeometry, woodMaterial);
        seat.position.set(x, 0.5, z);
        seat.rotation.y = rotation;
        this.scene.add(seat);

        // Back
        const backGeometry = new THREE.BoxGeometry(1.5, 0.8, 0.1);
        const back = new THREE.Mesh(backGeometry, woodMaterial);
        back.position.set(x, 0.9, z - 0.25);
        back.rotation.y = rotation;
        this.scene.add(back);

        // Legs
        for (let lx of [-0.6, 0.6]) {
            const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6);
            const leg = new THREE.Mesh(legGeometry, woodMaterial);
            leg.position.set(x + lx * Math.cos(rotation), 0.25, z + lx * Math.sin(rotation));
            this.scene.add(leg);
        }
    }

    createWateringCan(x, z) {
        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.3, 12);
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x7a7a8a,
            metalness: 0.7,
            roughness: 0.4
        });
        const body = new THREE.Mesh(bodyGeometry, metalMaterial);
        body.position.set(x, 0.15, z);
        this.scene.add(body);

        // Spout
        const spoutGeometry = new THREE.CylinderGeometry(0.03, 0.05, 0.4, 8);
        const spout = new THREE.Mesh(spoutGeometry, metalMaterial);
        spout.position.set(x + 0.25, 0.2, z);
        spout.rotation.z = Math.PI / 3;
        this.scene.add(spout);

        // Handle
        const handleGeometry = new THREE.TorusGeometry(0.15, 0.02, 8, 12, Math.PI);
        const handle = new THREE.Mesh(handleGeometry, metalMaterial);
        handle.position.set(x, 0.25, z);
        handle.rotation.x = Math.PI / 2;
        this.scene.add(handle);
    }

    createToolRack(x, z) {
        // Rack
        const rackGeometry = new THREE.BoxGeometry(2, 0.5, 0.1);
        const rackMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.8
        });
        const rack = new THREE.Mesh(rackGeometry, rackMaterial);
        rack.position.set(x, 1.5, z);
        this.scene.add(rack);

        // Tools
        const toolPositions = [-0.7, -0.3, 0.1, 0.5];
        for (const px of toolPositions) {
            const toolGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1, 6);
            const toolMaterial = new THREE.MeshStandardMaterial({
                color: 0x8a7a6a,
                roughness: 0.7
            });
            const tool = new THREE.Mesh(toolGeometry, toolMaterial);
            tool.position.set(x + px, 1.0, z + 0.1);
            this.scene.add(tool);
        }
    }

    createFlowerPot(x, z) {
        // Small pot
        const potGeometry = new THREE.CylinderGeometry(0.15, 0.12, 0.25, 12);
        const potMaterial = new THREE.MeshStandardMaterial({
            color: 0xc85a3a,
            roughness: 0.9
        });
        const pot = new THREE.Mesh(potGeometry, potMaterial);
        pot.position.set(x, 0.125, z);
        this.scene.add(pot);

        // Flowers
        for (let i = 0; i < 3; i++) {
            const stemGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 4);
            const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x2a5a1a });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.set(x + (i - 1) * 0.05, 0.4, z);
            this.scene.add(stem);

            // Flower bloom
            const bloomGeometry = new THREE.SphereGeometry(0.04, 6, 6);
            const bloomColors = [0xff4466, 0xff8844, 0xffaa22, 0xff66aa, 0xaa44ff];
            const bloomMaterial = new THREE.MeshStandardMaterial({
                color: bloomColors[Math.floor(Math.random() * bloomColors.length)],
                emissive: bloomColors[Math.floor(Math.random() * bloomColors.length)],
                emissiveIntensity: 0.3
            });
            const bloom = new THREE.Mesh(bloomGeometry, bloomMaterial);
            bloom.position.set(x + (i - 1) * 0.05, 0.55, z);
            this.scene.add(bloom);
        }
    }

    setupLighting() {
        // Bright ambient light (sunlight through glass)
        const ambientLight = new THREE.AmbientLight(0xffffee, 0.8);
        this.scene.add(ambientLight);

        // Strong directional light (sun)
        const sunlight = new THREE.DirectionalLight(0xffffdd, 1.2);
        sunlight.position.set(5, 10, 5);
        sunlight.castShadow = true;
        this.scene.add(sunlight);

        // Secondary light from opposite side
        const fillLight = new THREE.DirectionalLight(0xaaccff, 0.4);
        fillLight.position.set(-5, 8, -5);
        this.scene.add(fillLight);
    }
}
