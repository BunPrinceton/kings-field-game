import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class DingyBasementInstance extends Instance {
    constructor(id, config, scene) {
        super(id, 'dingy_basement', config, scene);
    }

    generateGeometry() {
        const { width, depth, height } = this.config.size;

        // Damp stone floor with puddles
        const floorGeometry = new THREE.PlaneGeometry(width, depth);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.95,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Water puddles (reflective)
        for (let i = 0; i < 8; i++) {
            const puddleGeometry = new THREE.CircleGeometry(Math.random() * 0.5 + 0.3, 16);
            const puddleMaterial = new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                roughness: 0.1,
                metalness: 0.9
            });
            const puddle = new THREE.Mesh(puddleGeometry, puddleMaterial);
            puddle.position.set(
                (Math.random() - 0.5) * (width - 2),
                0.01,
                (Math.random() - 0.5) * (depth - 2)
            );
            puddle.rotation.x = -Math.PI / 2;
            this.scene.add(puddle);
        }

        // Moldy stone walls
        this.createWall(-width/2, 0, 0, 0, depth, height);
        this.createWall(width/2, 0, 0, 0, depth, height);
        this.createWall(0, 0, -depth/2, Math.PI/2, width, height);
        this.createWall(0, 0, depth/2, Math.PI/2, width, height);

        // Low ceiling with pipes
        const ceilingGeometry = new THREE.PlaneGeometry(width, depth);
        const ceilingMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.9
        });
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.position.y = height;
        ceiling.rotation.x = Math.PI / 2;
        this.scene.add(ceiling);

        // Rusty pipes on ceiling
        for (let i = 0; i < 5; i++) {
            this.createPipe(
                (Math.random() - 0.5) * (width - 2),
                height - 0.2,
                (Math.random() - 0.5) * (depth - 2),
                Math.random() < 0.5 ? 0 : Math.PI / 2
            );
        }

        // Wooden crates (old and broken)
        for (let i = 0; i < 8; i++) {
            this.createCrate(
                (Math.random() - 0.5) * (width - 3),
                (Math.random() - 0.5) * (depth - 3)
            );
        }

        // Barrels (some tipped over)
        for (let i = 0; i < 6; i++) {
            this.createBarrel(
                (Math.random() - 0.5) * (width - 3),
                (Math.random() - 0.5) * (depth - 3),
                Math.random() < 0.3
            );
        }

        // Rats (small dark spheres that move)
        for (let i = 0; i < 5; i++) {
            this.createRat(
                (Math.random() - 0.5) * (width - 2),
                (Math.random() - 0.5) * (depth - 2)
            );
        }

        // Cobwebs in corners
        for (const corner of [
            [-width/2 + 0.5, -depth/2 + 0.5],
            [width/2 - 0.5, -depth/2 + 0.5],
            [-width/2 + 0.5, depth/2 - 0.5],
            [width/2 - 0.5, depth/2 - 0.5]
        ]) {
            this.createCobweb(corner[0], corner[1]);
        }

        // Mold patches on walls
        for (let i = 0; i < 12; i++) {
            this.createMoldPatch();
        }

        // Old shelves with junk
        this.createShelf(-width/2 + 1, -depth/2 + 2, 0);
        this.createShelf(width/2 - 1, -depth/2 + 2, Math.PI);

        // Single flickering lamp
        this.createHangingLamp(0, height - 1);

        // Dripping water (particles)
        for (let i = 0; i < 3; i++) {
            this.createDrip(
                (Math.random() - 0.5) * width * 0.8,
                height - 0.3,
                (Math.random() - 0.5) * depth * 0.8
            );
        }
    }

    createWall(x, y, z, rotation, length, height) {
        const wallGeometry = new THREE.PlaneGeometry(length, height);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a2a,
            roughness: 0.95
        });
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(x, y + height/2, z);
        wall.rotation.y = rotation;
        wall.receiveShadow = true;
        this.scene.add(wall);
    }

    createPipe(x, y, z, rotation) {
        const pipeGeometry = new THREE.CylinderGeometry(0.08, 0.08, 3, 8);
        const pipeMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a4a2a,
            roughness: 0.8,
            metalness: 0.4
        });
        const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
        pipe.position.set(x, y, z);
        pipe.rotation.z = Math.PI / 2;
        pipe.rotation.y = rotation;
        this.scene.add(pipe);
    }

    createCrate(x, z) {
        const crateGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const crateMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.9
        });
        const crate = new THREE.Mesh(crateGeometry, crateMaterial);
        crate.position.set(x, 0.4, z);
        crate.rotation.y = Math.random() * Math.PI;
        this.scene.add(crate);

        // Slats
        for (let i = 0; i < 3; i++) {
            const slatGeometry = new THREE.BoxGeometry(0.85, 0.05, 0.1);
            const slat = new THREE.Mesh(slatGeometry, crateMaterial);
            slat.position.set(x, 0.4 + (i - 1) * 0.25, z + 0.41);
            this.scene.add(slat);
        }
    }

    createBarrel(x, z, tipped) {
        const barrelGeometry = new THREE.CylinderGeometry(0.4, 0.45, 0.9, 12);
        const barrelMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3a2a,
            roughness: 0.8
        });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);

        if (tipped) {
            barrel.position.set(x, 0.4, z);
            barrel.rotation.z = Math.PI / 2;
        } else {
            barrel.position.set(x, 0.45, z);
        }
        this.scene.add(barrel);

        // Metal bands
        for (let i of [-0.3, 0, 0.3]) {
            const bandGeometry = new THREE.TorusGeometry(0.42, 0.03, 8, 12);
            const bandMaterial = new THREE.MeshStandardMaterial({
                color: 0x3a3a3a,
                metalness: 0.6,
                roughness: 0.5
            });
            const band = new THREE.Mesh(bandGeometry, bandMaterial);

            if (tipped) {
                band.position.set(x + i, 0.4, z);
                band.rotation.y = Math.PI / 2;
            } else {
                band.position.set(x, 0.45 + i, z);
            }
            this.scene.add(band);
        }
    }

    createRat(x, z) {
        // Body
        const bodyGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const ratMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.9
        });
        const body = new THREE.Mesh(bodyGeometry, ratMaterial);
        body.position.set(x, 0.06, z);
        body.scale.set(1, 0.7, 1.3);
        this.scene.add(body);

        // Tail
        const tailGeometry = new THREE.CylinderGeometry(0.01, 0.005, 0.15, 4);
        const tail = new THREE.Mesh(tailGeometry, ratMaterial);
        tail.position.set(x, 0.05, z - 0.1);
        tail.rotation.x = Math.PI / 4;
        this.scene.add(tail);
    }

    createCobweb(x, z) {
        const cobwebGeometry = new THREE.PlaneGeometry(0.5, 0.5);
        const cobwebMaterial = new THREE.MeshStandardMaterial({
            color: 0x9a9a9a,
            transparent: true,
            opacity: 0.3,
            roughness: 0.9,
            side: THREE.DoubleSide
        });
        const cobweb = new THREE.Mesh(cobwebGeometry, cobwebMaterial);
        cobweb.position.set(x, 2, z);
        this.scene.add(cobweb);
    }

    createMoldPatch() {
        const wall = Math.floor(Math.random() * 4);
        const { width, depth, height } = this.config.size;
        let x, y, z, rotation;

        switch(wall) {
            case 0:
                x = -width/2 + 0.01;
                y = Math.random() * height * 0.6 + 0.5;
                z = (Math.random() - 0.5) * depth * 0.8;
                rotation = -Math.PI / 2;
                break;
            case 1:
                x = width/2 - 0.01;
                y = Math.random() * height * 0.6 + 0.5;
                z = (Math.random() - 0.5) * depth * 0.8;
                rotation = Math.PI / 2;
                break;
            case 2:
                x = (Math.random() - 0.5) * width * 0.8;
                y = Math.random() * height * 0.6 + 0.5;
                z = -depth/2 + 0.01;
                rotation = 0;
                break;
            default:
                x = (Math.random() - 0.5) * width * 0.8;
                y = Math.random() * height * 0.6 + 0.5;
                z = depth/2 - 0.01;
                rotation = Math.PI;
        }

        const moldGeometry = new THREE.CircleGeometry(Math.random() * 0.3 + 0.2, 12);
        const moldMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a4a2a,
            roughness: 0.95,
            emissive: 0x1a3a1a,
            emissiveIntensity: 0.1
        });
        const mold = new THREE.Mesh(moldGeometry, moldMaterial);
        mold.position.set(x, y, z);
        mold.rotation.y = rotation;
        this.scene.add(mold);
    }

    createShelf(x, z, rotation) {
        // Back panel
        const backGeometry = new THREE.BoxGeometry(2, 2, 0.1);
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3a2a,
            roughness: 0.9
        });
        const back = new THREE.Mesh(backGeometry, woodMaterial);
        back.position.set(x, 1.2, z);
        back.rotation.y = rotation;
        this.scene.add(back);

        // Shelves
        for (let i = 0; i < 3; i++) {
            const shelfGeometry = new THREE.BoxGeometry(1.9, 0.1, 0.4);
            const shelf = new THREE.Mesh(shelfGeometry, woodMaterial);
            shelf.position.set(x, 0.5 + i * 0.7, z + 0.2);
            shelf.rotation.y = rotation;
            this.scene.add(shelf);

            // Junk on shelves
            if (i < 2) {
                const junkGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.3);
                const junkMaterial = new THREE.MeshStandardMaterial({
                    color: new THREE.Color().setHSL(Math.random(), 0.3, 0.2)
                });
                const junk = new THREE.Mesh(junkGeometry, junkMaterial);
                junk.position.set(x + (Math.random() - 0.5) * 1.5, 0.6 + i * 0.7, z + 0.3);
                junk.rotation.y = rotation + Math.random();
                this.scene.add(junk);
            }
        }
    }

    createHangingLamp(x, y) {
        // Chain
        const chainGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6);
        const chainMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.7,
            roughness: 0.6
        });
        const chain = new THREE.Mesh(chainGeometry, chainMaterial);
        chain.position.set(x, y - 0.25, 0);
        this.scene.add(chain);

        // Lamp housing
        const lampGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.3, 8);
        const lampMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a3a,
            metalness: 0.5,
            roughness: 0.6
        });
        const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
        lamp.position.set(x, y - 0.5, 0);
        this.scene.add(lamp);

        // Light (dim and flickering handled by lighting setup)
        const bulbGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const bulbMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa44,
            emissive: 0xffaa44,
            emissiveIntensity: 0.5
        });
        const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
        bulb.position.set(x, y - 0.5, 0);
        this.scene.add(bulb);
    }

    createDrip(x, y, z) {
        const dripGeometry = new THREE.SphereGeometry(0.03, 6, 6);
        const dripMaterial = new THREE.MeshStandardMaterial({
            color: 0x4488aa,
            transparent: true,
            opacity: 0.6,
            roughness: 0.1,
            metalness: 0.8
        });
        const drip = new THREE.Mesh(dripGeometry, dripMaterial);
        drip.position.set(x, y, z);
        drip.scale.set(1, 2, 1);
        this.scene.add(drip);
    }

    setupLighting() {
        // Very dim ambient light (dark basement)
        const ambientLight = new THREE.AmbientLight(0x2a2a1a, 0.2);
        this.scene.add(ambientLight);

        // Single flickering lamp
        const lampLight = new THREE.PointLight(0xffaa44, 0.6, 8);
        lampLight.position.set(0, this.config.size.height - 1, 0);
        this.scene.add(lampLight);
        this.lights.push(lampLight); // Store for flickering animation

        // Dim greenish mold glow from patches
        for (let i = 0; i < 3; i++) {
            const moldLight = new THREE.PointLight(0x2a4a2a, 0.1, 2);
            moldLight.position.set(
                (Math.random() - 0.5) * this.config.size.width * 0.8,
                Math.random() * 2 + 0.5,
                (Math.random() - 0.5) * this.config.size.depth * 0.8
            );
            this.scene.add(moldLight);
        }
    }
}
