import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class KingsBedroomInstance extends Instance {
    constructor(id, config, scene) {
        super(id, 'kings_bedroom', config, scene);
    }

    generateGeometry() {
        const { width, depth, height } = this.config.size;

        // Ornate wooden floor with rug
        const floorGeometry = new THREE.PlaneGeometry(width, depth);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a3a2a,
            roughness: 0.7,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Royal rug
        const rugGeometry = new THREE.PlaneGeometry(width * 0.7, depth * 0.6);
        const rugMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a1a1a,
            roughness: 0.9
        });
        const rug = new THREE.Mesh(rugMaterial, rugGeometry);
        rug.position.set(0, 0.01, 0);
        rug.rotation.x = -Math.PI / 2;
        this.scene.add(rug);

        // Tapestried walls
        this.createTapestriedWall(-width/2, 0, 0, 0, depth, height);
        this.createTapestriedWall(width/2, 0, 0, 0, depth, height);
        this.createTapestriedWall(0, 0, -depth/2, Math.PI/2, width, height);
        this.createTapestriedWall(0, 0, depth/2, Math.PI/2, width, height);

        // Ornate ceiling
        const ceilingGeometry = new THREE.PlaneGeometry(width, depth);
        const ceilingMaterial = new THREE.MeshStandardMaterial({
            color: 0x7a5a3a,
            roughness: 0.7
        });
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.position.y = height;
        ceiling.rotation.x = Math.PI / 2;
        this.scene.add(ceiling);

        // Grand canopy bed
        this.createCanopyBed(-width/3, depth/3);

        // Throne/chair
        this.createThrone(width/3, -depth/3);

        // Large wardrobe
        this.createWardrobe(-width/3, -depth/3);

        // Ornate desk
        this.createDesk(width/3, depth/4);

        // Fireplace with mantel
        this.createFireplace(0, -depth/2 + 0.5);

        // Crown on pedestal
        this.createCrownPedestal(0, depth/3);

        // Chandeliers
        this.createChandelier(0, height - 1);
        this.createChandelier(-width/4, height - 1);
        this.createChandelier(width/4, height - 1);

        // Candelabras
        this.createCandelabra(-width/2 + 1, -depth/2 + 1);
        this.createCandelabra(width/2 - 1, -depth/2 + 1);

        // Paintings on walls
        this.createPainting(-width/2 + 0.1, 2, depth/4, -Math.PI/2);
        this.createPainting(width/2 - 0.1, 2, -depth/4, Math.PI/2);

        // Treasure chest
        this.createTreasureChest(-width/2 + 2, depth/2 - 1.5);

        // Royal banner
        this.createBanner(0, -depth/2 + 0.1, height - 0.5);

        // Ornate mirror
        this.createMirror(width/2 - 0.1, 2, depth/3, Math.PI/2);
    }

    createTapestriedWall(x, y, z, rotation, length, height) {
        // Stone wall
        const wallGeometry = new THREE.PlaneGeometry(length, height);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a5a4a,
            roughness: 0.8
        });
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(x, y + height/2, z);
        wall.rotation.y = rotation;
        wall.receiveShadow = true;
        this.scene.add(wall);
    }

    createCanopyBed(x, z) {
        // Mattress
        const mattressGeometry = new THREE.BoxGeometry(2.5, 0.4, 3);
        const mattressMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a1a1a,
            roughness: 0.8
        });
        const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
        mattress.position.set(x, 0.6, z);
        this.scene.add(mattress);

        // Bed frame
        const frameGeometry = new THREE.BoxGeometry(2.7, 0.2, 3.2);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2a1a,
            roughness: 0.7,
            metalness: 0.3
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(x, 0.4, z);
        this.scene.add(frame);

        // Pillows
        for (let i = 0; i < 3; i++) {
            const pillowGeometry = new THREE.BoxGeometry(0.6, 0.2, 0.4);
            const pillowMaterial = new THREE.MeshStandardMaterial({
                color: 0xeeeeee,
                roughness: 0.9
            });
            const pillow = new THREE.Mesh(pillowGeometry, pillowMaterial);
            pillow.position.set(x + (i - 1) * 0.7, 0.9, z - 1.2);
            this.scene.add(pillow);
        }

        // Four posts
        for (let px of [-1.2, 1.2]) {
            for (let pz of [-1.4, 1.4]) {
                const postGeometry = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 12);
                const post = new THREE.Mesh(postGeometry, frameMaterial);
                post.position.set(x + px, 1.65, z + pz);
                this.scene.add(post);

                // Gold ornament on top
                const ornamentGeometry = new THREE.SphereGeometry(0.12, 8, 8);
                const ornamentMaterial = new THREE.MeshStandardMaterial({
                    color: 0xffd700,
                    roughness: 0.3,
                    metalness: 0.9
                });
                const ornament = new THREE.Mesh(ornamentGeometry, ornamentMaterial);
                ornament.position.set(x + px, 2.9, z + pz);
                this.scene.add(ornament);
            }
        }

        // Canopy
        const canopyGeometry = new THREE.PlaneGeometry(2.8, 3.2);
        const canopyMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a1a1a,
            roughness: 0.9,
            side: THREE.DoubleSide
        });
        const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
        canopy.position.set(x, 2.9, z);
        canopy.rotation.x = Math.PI / 2;
        this.scene.add(canopy);
    }

    createThrone(x, z) {
        // Seat
        const seatGeometry = new THREE.BoxGeometry(1.2, 0.2, 1);
        const goldMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            roughness: 0.3,
            metalness: 0.9
        });
        const seat = new THREE.Mesh(seatGeometry, goldMaterial);
        seat.position.set(x, 0.8, z);
        this.scene.add(seat);

        // High back
        const backGeometry = new THREE.BoxGeometry(1.2, 1.8, 0.2);
        const back = new THREE.Mesh(backGeometry, goldMaterial);
        back.position.set(x, 1.7, z - 0.4);
        this.scene.add(back);

        // Arms
        for (let ax of [-0.5, 0.5]) {
            const armGeometry = new THREE.BoxGeometry(0.15, 0.6, 0.8);
            const arm = new THREE.Mesh(armGeometry, goldMaterial);
            arm.position.set(x + ax, 1.0, z);
            this.scene.add(arm);
        }

        // Crown ornament on back
        const crownGeometry = new THREE.ConeGeometry(0.3, 0.5, 6);
        const crown = new THREE.Mesh(crownGeometry, goldMaterial);
        crown.position.set(x, 2.7, z - 0.4);
        this.scene.add(crown);

        // Cushion
        const cushionGeometry = new THREE.BoxGeometry(1.0, 0.15, 0.8);
        const cushionMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a1a1a,
            roughness: 0.9
        });
        const cushion = new THREE.Mesh(cushionGeometry, cushionMaterial);
        cushion.position.set(x, 0.975, z);
        this.scene.add(cushion);
    }

    createWardrobe(x, z) {
        // Main body
        const bodyGeometry = new THREE.BoxGeometry(1.5, 2.5, 0.8);
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a2a1a,
            roughness: 0.7
        });
        const body = new THREE.Mesh(bodyGeometry, woodMaterial);
        body.position.set(x, 1.25, z);
        this.scene.add(body);

        // Doors
        for (let dx of [-0.35, 0.35]) {
            const doorGeometry = new THREE.BoxGeometry(0.7, 2.3, 0.05);
            const door = new THREE.Mesh(doorGeometry, woodMaterial);
            door.position.set(x + dx, 1.25, z + 0.425);
            this.scene.add(door);

            // Gold handle
            const handleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            const handleMaterial = new THREE.MeshStandardMaterial({
                color: 0xffd700,
                roughness: 0.3,
                metalness: 0.9
            });
            const handle = new THREE.Mesh(handleGeometry, handleMaterial);
            handle.position.set(x + dx * 0.3, 1.25, z + 0.48);
            this.scene.add(handle);
        }
    }

    createDesk(x, z) {
        // Desktop
        const deskGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.8);
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2a1a,
            roughness: 0.6,
            metalness: 0.2
        });
        const desk = new THREE.Mesh(deskGeometry, woodMaterial);
        desk.position.set(x, 0.8, z);
        this.scene.add(desk);

        // Legs
        for (let lx of [-0.6, 0.6]) {
            for (let lz of [-0.3, 0.3]) {
                const legGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.1);
                const leg = new THREE.Mesh(legGeometry, woodMaterial);
                leg.position.set(x + lx, 0.4, z + lz);
                this.scene.add(leg);
            }
        }

        // Quill and inkwell
        const inkwellGeometry = new THREE.CylinderGeometry(0.05, 0.06, 0.08, 12);
        const inkwellMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.4,
            metalness: 0.6
        });
        const inkwell = new THREE.Mesh(inkwellGeometry, inkwellMaterial);
        inkwell.position.set(x + 0.3, 0.89, z + 0.2);
        this.scene.add(inkwell);

        // Scroll
        const scrollGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 12);
        const scrollMaterial = new THREE.MeshStandardMaterial({
            color: 0xeeeecc,
            roughness: 0.8
        });
        const scroll = new THREE.Mesh(scrollGeometry, scrollMaterial);
        scroll.position.set(x - 0.2, 0.86, z);
        scroll.rotation.z = Math.PI / 2;
        this.scene.add(scroll);
    }

    createFireplace(x, z) {
        // Fireplace structure
        const fireplaceGeometry = new THREE.BoxGeometry(2, 1.5, 0.5);
        const stoneMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.9
        });
        const fireplace = new THREE.Mesh(fireplaceGeometry, stoneMaterial);
        fireplace.position.set(x, 0.75, z);
        this.scene.add(fireplace);

        // Fire (glowing)
        const fireGeometry = new THREE.ConeGeometry(0.3, 0.6, 4);
        const fireMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            emissive: 0xff4400,
            emissiveIntensity: 1
        });
        const fire = new THREE.Mesh(fireGeometry, fireMaterial);
        fire.position.set(x, 0.5, z + 0.1);
        this.scene.add(fire);

        // Mantel
        const mantelGeometry = new THREE.BoxGeometry(2.4, 0.2, 0.4);
        const mantelMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a3a2a,
            roughness: 0.6,
            metalness: 0.3
        });
        const mantel = new THREE.Mesh(mantelGeometry, mantelMaterial);
        mantel.position.set(x, 1.6, z + 0.2);
        this.scene.add(mantel);
    }

    createCrownPedestal(x, z) {
        // Pedestal
        const pedestalGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1, 12);
        const pedestalMaterial = new THREE.MeshStandardMaterial({
            color: 0xeeeeee,
            roughness: 0.3,
            metalness: 0.7
        });
        const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
        pedestal.position.set(x, 0.5, z);
        this.scene.add(pedestal);

        // Crown
        const crownGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.2, 8);
        const crownMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0xffaa00,
            emissiveIntensity: 0.5,
            roughness: 0.2,
            metalness: 1.0
        });
        const crown = new THREE.Mesh(crownGeometry, crownMaterial);
        crown.position.set(x, 1.15, z);
        this.scene.add(crown);

        // Crown points
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const pointGeometry = new THREE.ConeGeometry(0.05, 0.3, 4);
            const point = new THREE.Mesh(pointGeometry, crownMaterial);
            point.position.set(
                x + Math.cos(angle) * 0.27,
                1.4,
                z + Math.sin(angle) * 0.27
            );
            this.scene.add(point);
        }

        // Glowing gem on crown
        const gemGeometry = new THREE.SphereGeometry(0.08, 12, 12);
        const gemMaterial = new THREE.MeshStandardMaterial({
            color: 0xff4466,
            emissive: 0xff2244,
            emissiveIntensity: 1.0,
            roughness: 0.1,
            metalness: 0.9
        });
        const gem = new THREE.Mesh(gemGeometry, gemMaterial);
        gem.position.set(x, 1.25, z);
        this.scene.add(gem);
    }

    createChandelier(x, y) {
        // Chain
        const chainGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8);
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            roughness: 0.3,
            metalness: 0.9
        });
        const chain = new THREE.Mesh(chainGeometry, metalMaterial);
        chain.position.set(x, y - 0.4, 0);
        this.scene.add(chain);

        // Chandelier ring
        const ringGeometry = new THREE.TorusGeometry(0.5, 0.05, 8, 16);
        const ring = new THREE.Mesh(ringGeometry, metalMaterial);
        ring.position.set(x, y - 0.8, 0);
        ring.rotation.x = Math.PI / 2;
        this.scene.add(ring);

        // Candles
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            // Candle
            const candleGeometry = new THREE.CylinderGeometry(0.03, 0.04, 0.3, 8);
            const candleMaterial = new THREE.MeshStandardMaterial({
                color: 0xeeeecc,
                roughness: 0.8
            });
            const candle = new THREE.Mesh(candleGeometry, candleMaterial);
            candle.position.set(
                x + Math.cos(angle) * 0.5,
                y - 0.65,
                Math.sin(angle) * 0.5
            );
            this.scene.add(candle);

            // Flame
            const flameGeometry = new THREE.ConeGeometry(0.04, 0.1, 4);
            const flameMaterial = new THREE.MeshBasicMaterial({
                color: 0xffaa44,
                emissive: 0xff8822,
                emissiveIntensity: 1
            });
            const flame = new THREE.Mesh(flameGeometry, flameMaterial);
            flame.position.set(
                x + Math.cos(angle) * 0.5,
                y - 0.45,
                Math.sin(angle) * 0.5
            );
            this.scene.add(flame);
        }
    }

    createCandelabra(x, z) {
        // Base
        const baseGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.1, 12);
        const goldMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            roughness: 0.3,
            metalness: 0.9
        });
        const base = new THREE.Mesh(baseGeometry, goldMaterial);
        base.position.set(x, 0.05, z);
        this.scene.add(base);

        // Stem
        const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8);
        const stem = new THREE.Mesh(stemGeometry, goldMaterial);
        stem.position.set(x, 0.4, z);
        this.scene.add(stem);

        // Candle holders (3)
        for (let i = 0; i < 3; i++) {
            const holderGeometry = new THREE.CylinderGeometry(0.04, 0.05, 0.1, 8);
            const holder = new THREE.Mesh(holderGeometry, goldMaterial);
            holder.position.set(x + (i - 1) * 0.15, 0.75, z);
            this.scene.add(holder);

            // Candle
            const candleGeometry = new THREE.CylinderGeometry(0.03, 0.04, 0.2, 8);
            const candleMaterial = new THREE.MeshStandardMaterial({
                color: 0xeeeecc,
                roughness: 0.8
            });
            const candle = new THREE.Mesh(candleGeometry, candleMaterial);
            candle.position.set(x + (i - 1) * 0.15, 0.9, z);
            this.scene.add(candle);

            // Flame
            const flameGeometry = new THREE.ConeGeometry(0.03, 0.08, 4);
            const flameMaterial = new THREE.MeshBasicMaterial({
                color: 0xffaa44,
                emissive: 0xff8822,
                emissiveIntensity: 1
            });
            const flame = new THREE.Mesh(flameGeometry, flameMaterial);
            flame.position.set(x + (i - 1) * 0.15, 1.04, z);
            this.scene.add(flame);
        }
    }

    createPainting(x, y, z, rotation) {
        // Frame
        const frameGeometry = new THREE.BoxGeometry(1.2, 1.5, 0.1);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            roughness: 0.3,
            metalness: 0.8
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(x, y, z);
        frame.rotation.y = rotation;
        this.scene.add(frame);

        // Canvas
        const canvasGeometry = new THREE.PlaneGeometry(1.0, 1.3);
        const canvasMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3a2a,
            roughness: 0.8
        });
        const canvas = new THREE.Mesh(canvasGeometry, canvasMaterial);
        canvas.position.set(
            x + Math.cos(rotation) * 0.06,
            y,
            z - Math.sin(rotation) * 0.06
        );
        canvas.rotation.y = rotation;
        this.scene.add(canvas);
    }

    createTreasureChest(x, z) {
        // Bottom
        const bottomGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.6);
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2a1a,
            roughness: 0.7
        });
        const bottom = new THREE.Mesh(bottomGeometry, woodMaterial);
        bottom.position.set(x, 0.2, z);
        this.scene.add(bottom);

        // Lid
        const lidGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.6);
        const lid = new THREE.Mesh(lidGeometry, woodMaterial);
        lid.position.set(x, 0.45, z);
        this.scene.add(lid);

        // Metal bands
        const bandMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            roughness: 0.3,
            metalness: 0.9
        });
        for (let bz of [-0.2, 0, 0.2]) {
            const bandGeometry = new THREE.BoxGeometry(0.85, 0.05, 0.05);
            const band = new THREE.Mesh(bandGeometry, bandMaterial);
            band.position.set(x, 0.2, z + bz);
            this.scene.add(band);
        }
    }

    createBanner(x, z, y) {
        // Pole
        const poleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 2.5, 8);
        const poleMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.6,
            metalness: 0.7
        });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(x, y - 1.25, z);
        this.scene.add(pole);

        // Banner
        const bannerGeometry = new THREE.PlaneGeometry(1.0, 1.5);
        const bannerMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a1a1a,
            roughness: 0.9,
            side: THREE.DoubleSide
        });
        const banner = new THREE.Mesh(bannerGeometry, bannerMaterial);
        banner.position.set(x, y - 0.75, z + 0.5);
        this.scene.add(banner);

        // Gold crown emblem
        const emblemGeometry = new THREE.ConeGeometry(0.15, 0.3, 6);
        const emblemMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0xffaa00,
            emissiveIntensity: 0.3,
            roughness: 0.3,
            metalness: 0.9
        });
        const emblem = new THREE.Mesh(emblemGeometry, emblemMaterial);
        emblem.position.set(x, y - 0.5, z + 0.51);
        this.scene.add(emblem);
    }

    createMirror(x, y, z, rotation) {
        // Frame
        const frameGeometry = new THREE.BoxGeometry(0.15, 1.8, 1.2);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            roughness: 0.3,
            metalness: 0.9
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(x, y, z);
        frame.rotation.y = rotation;
        this.scene.add(frame);

        // Mirror surface
        const mirrorGeometry = new THREE.PlaneGeometry(1.0, 1.6);
        const mirrorMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaccff,
            roughness: 0.05,
            metalness: 0.95
        });
        const mirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
        mirror.position.set(
            x + Math.cos(rotation) * 0.08,
            y,
            z - Math.sin(rotation) * 0.08
        );
        mirror.rotation.y = rotation;
        this.scene.add(mirror);
    }

    setupLighting() {
        // Warm ambient light
        const ambientLight = new THREE.AmbientLight(0xffd700, 0.6);
        this.scene.add(ambientLight);

        // Fireplace light
        const fireplaceLight = new THREE.PointLight(0xff6600, 1.5, 8);
        fireplaceLight.position.set(0, 0.5, -this.config.size.depth / 2 + 0.5);
        this.scene.add(fireplaceLight);

        // Chandelier lights
        for (let x of [-this.config.size.width / 4, 0, this.config.size.width / 4]) {
            const chandelierLight = new THREE.PointLight(0xffaa44, 1.0, 6);
            chandelierLight.position.set(x, this.config.size.height - 1, 0);
            this.scene.add(chandelierLight);
        }

        // Crown glow
        const crownLight = new THREE.PointLight(0xff4466, 0.8, 3);
        crownLight.position.set(0, 1.3, this.config.size.depth / 3);
        this.scene.add(crownLight);
    }
}
