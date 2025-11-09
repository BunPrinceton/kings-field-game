import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class OutdoorWalkwayInstance extends Instance {
    constructor(id, config, scene) {
        super(id, 'outdoor_walkway', config, scene);
    }

    generateGeometry() {
        const { width, depth, height } = this.config.size;

        // Stone walkway floor
        const walkwayGeometry = new THREE.PlaneGeometry(width, depth);
        const stoneFloorMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a6a6a,
            roughness: 0.9
        });
        const walkway = new THREE.Mesh(walkwayGeometry, stoneFloorMaterial);
        walkway.rotation.x = -Math.PI / 2;
        walkway.receiveShadow = true;
        this.scene.add(walkway);

        // Battlements (crenellations) on both sides
        this.createBattlements(-width/2, depth);
        this.createBattlements(width/2, depth);

        // Torches along walkway
        for (let z = -depth/2 + 3; z < depth/2; z += 6) {
            this.createWallTorch(-width/2 + 0.3, z, Math.PI / 2);
            this.createWallTorch(width/2 - 0.3, z, -Math.PI / 2);
        }

        // Arrow slits in battlements
        for (let z = -depth/2 + 2; z < depth/2; z += 4) {
            this.createArrowSlit(-width/2, z);
            this.createArrowSlit(width/2, z);
        }

        // Weapon rack on wall
        this.createWeaponRack(-width/2 + 0.5, 0);

        // Guard posts at corners
        this.createGuardPost(-width/2 + 1, -depth/2 + 1);
        this.createGuardPost(width/2 - 1, -depth/2 + 1);

        // Barrels and crates
        this.createBarrel(-width/2 + 1.5, depth/4);
        this.createCrate(width/2 - 1.5, -depth/4);

        // Banners on poles
        this.createBanner(0, -depth/2 + 1);
        this.createBanner(0, depth/2 - 1);

        // Sky (visible since outdoor)
        const skyGeometry = new THREE.PlaneGeometry(width * 2, depth * 2);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x4466aa,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        sky.position.y = height + 10;
        sky.rotation.x = Math.PI / 2;
        this.scene.add(sky);

        // Clouds (simple moving planes)
        for (let i = 0; i < 5; i++) {
            this.createCloud(
                (Math.random() - 0.5) * width * 1.5,
                height + 8 + Math.random() * 3,
                (Math.random() - 0.5) * depth * 1.5
            );
        }
    }

    createBattlements(x, length) {
        const merlon = true;
        const merlonWidth = 1.5;
        const crenelWidth = 1.2;
        const totalSegment = merlonWidth + crenelWidth;
        const segments = Math.floor(length / totalSegment);

        for (let i = 0; i < segments; i++) {
            const z = -length/2 + i * totalSegment;

            // Merlon (solid part)
            const merlonGeometry = new THREE.BoxGeometry(0.5, 1.5, merlonWidth);
            const stoneMaterial = new THREE.MeshStandardMaterial({
                color: 0x8a8a8a,
                roughness: 0.9
            });
            const merlonMesh = new THREE.Mesh(merlonGeometry, stoneMaterial);
            merlonMesh.position.set(x, 0.75, z + merlonWidth/2);
            merlonMesh.castShadow = true;
            this.scene.add(merlonMesh);

            // Base wall (continuous)
            const baseGeometry = new THREE.BoxGeometry(0.5, 0.8, totalSegment);
            const base = new THREE.Mesh(baseGeometry, stoneMaterial);
            base.position.set(x, 0.4, z + totalSegment/2);
            base.castShadow = true;
            this.scene.add(base);
        }
    }

    createWallTorch(x, z, rotation) {
        // Torch bracket
        const bracketGeometry = new THREE.BoxGeometry(0.05, 0.3, 0.1);
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.8,
            roughness: 0.4
        });
        const bracket = new THREE.Mesh(bracketGeometry, metalMaterial);
        bracket.position.set(x, 1.2, z);
        bracket.rotation.y = rotation;
        this.scene.add(bracket);

        // Torch
        const torchGeometry = new THREE.CylinderGeometry(0.04, 0.05, 0.4, 8);
        const torchMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2a1a,
            roughness: 0.9
        });
        const torch = new THREE.Mesh(torchGeometry, torchMaterial);
        torch.position.set(x, 1.4, z);
        this.scene.add(torch);

        // Flame
        const flameGeometry = new THREE.ConeGeometry(0.08, 0.2, 4);
        const flameMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            emissive: 0xff4400,
            emissiveIntensity: 1
        });
        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.position.set(x, 1.65, z);
        this.scene.add(flame);

        // Light
        const light = new THREE.PointLight(0xff8844, 1.2, 5);
        light.position.set(x, 1.65, z);
        this.scene.add(light);
    }

    createArrowSlit(x, z) {
        const slitGeometry = new THREE.BoxGeometry(0.1, 0.6, 0.1);
        const slitMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.9
        });
        const slit = new THREE.Mesh(slitGeometry, slitMaterial);
        slit.position.set(x, 0.8, z);
        this.scene.add(slit);
    }

    createWeaponRack(x, z) {
        // Rack frame
        const rackGeometry = new THREE.BoxGeometry(0.3, 1.5, 2);
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a3a2a,
            roughness: 0.8
        });
        const rack = new THREE.Mesh(rackGeometry, woodMaterial);
        rack.position.set(x, 1.0, z);
        this.scene.add(rack);

        // Swords on rack
        for (let i = 0; i < 4; i++) {
            const swordGeometry = new THREE.BoxGeometry(0.05, 0.05, 1.2);
            const swordMaterial = new THREE.MeshStandardMaterial({
                color: 0xaaaaaa,
                metalness: 0.9,
                roughness: 0.3
            });
            const sword = new THREE.Mesh(swordGeometry, swordMaterial);
            sword.position.set(x + 0.2, 0.5 + i * 0.35, z);
            sword.rotation.x = Math.PI / 4;
            this.scene.add(sword);
        }
    }

    createGuardPost(x, z) {
        // Small shelter
        const postGeometry = new THREE.BoxGeometry(1.5, 2, 1.5);
        const stoneMaterial = new THREE.MeshStandardMaterial({
            color: 0x7a7a7a,
            roughness: 0.9
        });
        const post = new THREE.Mesh(postGeometry, stoneMaterial);
        post.position.set(x, 1.0, z);
        this.scene.add(post);

        // Roof
        const roofGeometry = new THREE.ConeGeometry(1.2, 0.8, 4);
        const roofMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2a1a,
            roughness: 0.9
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(x, 2.4, z);
        roof.rotation.y = Math.PI / 4;
        this.scene.add(roof);

        // Window
        const windowGeometry = new THREE.PlaneGeometry(0.4, 0.5);
        const windowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa44,
            emissive: 0xff8822,
            emissiveIntensity: 0.5
        });
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(x, 1.2, z + 0.76);
        this.scene.add(window);
    }

    createBarrel(x, z) {
        const barrelGeometry = new THREE.CylinderGeometry(0.3, 0.35, 0.8, 12);
        const barrelMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2a1a,
            roughness: 0.9
        });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.position.set(x, 0.4, z);
        this.scene.add(barrel);
    }

    createCrate(x, z) {
        const crateGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
        const crateMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.9
        });
        const crate = new THREE.Mesh(crateGeometry, crateMaterial);
        crate.position.set(x, 0.35, z);
        crate.rotation.y = Math.random();
        this.scene.add(crate);
    }

    createBanner(x, z) {
        // Pole
        const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3, 8);
        const poleMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.7,
            roughness: 0.4
        });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(x, 1.5, z);
        this.scene.add(pole);

        // Banner
        const bannerGeometry = new THREE.PlaneGeometry(0.8, 1.2);
        const bannerMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a1a1a,
            roughness: 0.9,
            side: THREE.DoubleSide
        });
        const banner = new THREE.Mesh(bannerGeometry, bannerMaterial);
        banner.position.set(x + 0.4, 2.4, z);
        this.scene.add(banner);
    }

    createCloud(x, y, z) {
        const cloudGeometry = new THREE.SphereGeometry(1.5, 8, 8);
        const cloudMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.6
        });
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloud.position.set(x, y, z);
        cloud.scale.set(2, 0.8, 1.2);
        this.scene.add(cloud);
    }

    setupLighting() {
        // Bright daylight
        const ambientLight = new THREE.AmbientLight(0xffffee, 0.7);
        this.scene.add(ambientLight);

        // Sun (directional)
        const sunlight = new THREE.DirectionalLight(0xffffdd, 1.0);
        sunlight.position.set(10, 20, 10);
        sunlight.castShadow = true;
        this.scene.add(sunlight);

        // Blue sky ambient
        const skyLight = new THREE.HemisphereLight(0x8899ff, 0x6a6a6a, 0.5);
        this.scene.add(skyLight);

        // Torch lights added in createWallTorch

        // Light fog for atmosphere
        this.scene.fog = new THREE.Fog(0xccddff, 10, 50);
    }
}
