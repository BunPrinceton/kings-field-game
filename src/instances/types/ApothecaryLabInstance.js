// ApothecaryLabInstance.js - Alchemy lab with potions and herbs
import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class ApothecaryLabInstance extends Instance {
    constructor(definition) {
        super(definition);
    }

    async generateGeometry() {
        await super.generateGeometry();

        const size = this.definition.size;

        // Create alchemy work table
        this.createAlchemyTable(size.width, size.depth);

        // Create shelving with potion bottles
        this.createPotionShelves(size.width, size.depth);

        // Create cauldron with bubbling liquid
        this.createCauldron(size.width, size.depth);

        // Create ingredient area
        this.createIngredientArea(size.width, size.depth);

        // Create hanging dried herbs
        this.createHangingHerbs(size.width, size.depth);
    }

    createAlchemyTable(width, depth) {
        const tableX = -width / 2 + 3;
        const tableZ = 0;

        // Main table
        const tableGeometry = new THREE.BoxGeometry(3, 0.12, 1.8);
        const tableMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.7
        });
        const table = new THREE.Mesh(tableGeometry, tableMaterial);
        table.position.set(tableX, 0.85, tableZ);
        this.scene.add(table);
        this.meshes.push(table);

        // Table legs
        const legGeometry = new THREE.BoxGeometry(0.1, 0.85, 0.1);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a2a1a,
            roughness: 0.8
        });

        const corners = [
            { x: tableX - 1.4, z: tableZ - 0.8 },
            { x: tableX + 1.4, z: tableZ - 0.8 },
            { x: tableX - 1.4, z: tableZ + 0.8 },
            { x: tableX + 1.4, z: tableZ + 0.8 }
        ];

        for (const corner of corners) {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(corner.x, 0.425, corner.z);
            this.scene.add(leg);
            this.meshes.push(leg);
        }

        // Alchemy equipment on table
        this.createAlchemyEquipment(tableX - 0.8, tableZ - 0.5);
        this.createAlchemyEquipment(tableX + 0.8, tableZ - 0.5);
        this.createAlchemyEquipment(tableX, tableZ + 0.5);
    }

    createAlchemyEquipment(x, z) {
        // Alembic (distillery apparatus)
        const baseGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 8);
        const equipMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3a2a,
            roughness: 0.8
        });
        const base = new THREE.Mesh(baseGeometry, equipMaterial);
        base.position.set(x, 1, z);
        this.scene.add(base);
        this.meshes.push(base);

        // Neck
        const neckGeometry = new THREE.CylinderGeometry(0.08, 0.12, 0.25, 6);
        const neck = new THREE.Mesh(neckGeometry, equipMaterial);
        neck.position.set(x, 1.25, z);
        this.scene.add(neck);
        this.meshes.push(neck);

        // Receiver (bulb at top)
        const receiverGeometry = new THREE.SphereGeometry(0.12, 8, 8);
        const receiver = new THREE.Mesh(receiverGeometry, equipMaterial);
        receiver.position.set(x, 1.5, z);
        this.scene.add(receiver);
        this.meshes.push(receiver);
    }

    createPotionShelves(width, depth) {
        // Three tall shelves for potion bottles
        const shelfX = width / 2 - 2;
        const shelfZ = -2;

        for (let shelf = 0; shelf < 4; shelf++) {
            // Shelf board
            const shelfGeometry = new THREE.BoxGeometry(4, 0.15, 1);
            const shelfMaterial = new THREE.MeshStandardMaterial({
                color: 0x4a3a2a,
                roughness: 0.8
            });
            const shelfBoard = new THREE.Mesh(shelfGeometry, shelfMaterial);
            shelfBoard.position.set(shelfX, 0.8 + shelf * 0.7, shelfZ);
            this.scene.add(shelfBoard);
            this.meshes.push(shelfBoard);

            // Potion bottles on shelf
            for (let i = 0; i < 8; i++) {
                this.createPotionBottle(
                    shelfX - 1.8 + i * 0.45,
                    0.95 + shelf * 0.7,
                    shelfZ
                );
            }
        }

        // Shelf supports
        const supportGeometry = new THREE.BoxGeometry(0.2, 2.8, 0.2);
        const supportMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a2a1a,
            roughness: 0.85
        });

        for (let sx of [-1.9, 1.9]) {
            const support = new THREE.Mesh(supportGeometry, supportMaterial);
            support.position.set(shelfX + sx, 1.4, shelfZ);
            this.scene.add(support);
            this.meshes.push(support);
        }
    }

    createPotionBottle(x, y, z) {
        // Bottle body
        const colors = [
            0x1a1a5a,
            0x5a1a1a,
            0x1a5a1a,
            0x5a5a1a,
            0x5a1a5a,
            0x1a5a5a,
            0xaa1a1a,
            0x1a1aaa
        ];

        const color = colors[Math.floor(Math.random() * colors.length)];

        const bottleGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.25, 8);
        const bottleMaterial = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.1,
            roughness: 0.3,
            transparent: true,
            opacity: 0.85
        });
        const bottle = new THREE.Mesh(bottleGeometry, bottleMaterial);
        bottle.position.set(x, y, z);
        this.scene.add(bottle);
        this.meshes.push(bottle);

        // Bottle neck
        const neckGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.08, 8);
        const neck = new THREE.Mesh(neckGeometry, bottleMaterial);
        neck.position.set(x, y + 0.18, z);
        this.scene.add(neck);
        this.meshes.push(neck);

        // Bottle stopper
        const stopperGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.05, 6);
        const stopperMaterial = new THREE.MeshStandardMaterial({
            color: 0xaa7a5a,
            roughness: 0.7
        });
        const stopper = new THREE.Mesh(stopperGeometry, stopperMaterial);
        stopper.position.set(x, y + 0.25, z);
        this.scene.add(stopper);
        this.meshes.push(stopper);

        // Glowing potion effect
        const glowGeometry = new THREE.SphereGeometry(0.09, 8, 8);
        const glowMaterial = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.4
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(x, y, z);
        this.scene.add(glow);
        this.meshes.push(glow);
    }

    createCauldron(width, depth) {
        const cauldronX = width / 2 - 3;
        const cauldronZ = 3;

        // Cauldron body (large iron pot)
        const cauldronGeometry = new THREE.CylinderGeometry(0.8, 1, 0.7, 16);
        const cauldronMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.8,
            roughness: 0.4
        });
        const cauldron = new THREE.Mesh(cauldronGeometry, cauldronMaterial);
        cauldron.position.set(cauldronX, 0.45, cauldronZ);
        this.scene.add(cauldron);
        this.meshes.push(cauldron);

        // Cauldron rim
        const rimGeometry = new THREE.TorusGeometry(0.8, 0.08, 8, 16);
        const rimMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a5a5a,
            metalness: 0.85,
            roughness: 0.3
        });
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.position.set(cauldronX, 0.95, cauldronZ);
        this.scene.add(rim);
        this.meshes.push(rim);

        // Support legs
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.4, 8);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.7
        });

        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const legX = cauldronX + Math.cos(angle) * 0.6;
            const legZ = cauldronZ + Math.sin(angle) * 0.6;

            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(legX, 0.2, legZ);
            this.scene.add(leg);
            this.meshes.push(leg);
        }

        // Bubbling liquid inside
        const liquidGeometry = new THREE.CylinderGeometry(0.75, 0.95, 0.5, 16);
        const liquidMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a3a1a,
            metalness: 0.2,
            roughness: 0.5,
            transparent: true,
            opacity: 0.7
        });
        const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
        liquid.position.set(cauldronX, 0.5, cauldronZ);
        liquid.userData.isBubbling = true;
        this.scene.add(liquid);
        this.meshes.push(liquid);

        // Cauldron light
        const cauldronLight = new THREE.PointLight(0x4aaa4a, 2, 10);
        cauldronLight.position.set(cauldronX, 0.8, cauldronZ);
        this.scene.add(cauldronLight);
        this.lights.push(cauldronLight);

        // Bubbles
        for (let i = 0; i < 3; i++) {
            this.createBubble(cauldronX, cauldronZ);
        }
    }

    createBubble(x, z) {
        const bubbleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const bubbleMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a5a2a,
            metalness: 0.3,
            roughness: 0.4,
            transparent: true,
            opacity: 0.6
        });
        const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
        bubble.position.set(
            x + (Math.random() - 0.5) * 0.5,
            0.3 + Math.random() * 0.4,
            z + (Math.random() - 0.5) * 0.5
        );
        bubble.userData.isBubble = true;
        this.scene.add(bubble);
        this.meshes.push(bubble);
    }

    createIngredientArea(width, depth) {
        const areaX = -width / 2 + 2;
        const areaZ = 3;

        // Work surface
        const surfaceGeometry = new THREE.BoxGeometry(2, 0.1, 1.5);
        const surfaceMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a5a4a,
            roughness: 0.8
        });
        const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
        surface.position.set(areaX, 0.85, areaZ);
        this.scene.add(surface);
        this.meshes.push(surface);

        // Ingredient jars
        const jarPositions = [
            { x: areaX - 0.6, z: areaZ - 0.5 },
            { x: areaX, z: areaZ - 0.5 },
            { x: areaX + 0.6, z: areaZ - 0.5 },
            { x: areaX - 0.6, z: areaZ + 0.5 },
            { x: areaX, z: areaZ + 0.5 },
            { x: areaX + 0.6, z: areaZ + 0.5 }
        ];

        for (const pos of jarPositions) {
            this.createIngredientJar(pos.x, pos.z);
        }

        // Mortar and pestle
        this.createMortarAndPestle(areaX + 1, areaZ);
    }

    createIngredientJar(x, z) {
        // Jar body
        const jarGeometry = new THREE.CylinderGeometry(0.18, 0.2, 0.35, 12);
        const jarMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a7a6a,
            roughness: 0.6,
            transparent: true,
            opacity: 0.85
        });
        const jar = new THREE.Mesh(jarGeometry, jarMaterial);
        jar.position.set(x, 1.05, z);
        this.scene.add(jar);
        this.meshes.push(jar);

        // Jar lid
        const lidGeometry = new THREE.CylinderGeometry(0.22, 0.22, 0.1, 12);
        const lidMaterial = new THREE.MeshStandardMaterial({
            color: 0xaa8a6a,
            roughness: 0.7
        });
        const lid = new THREE.Mesh(lidGeometry, lidMaterial);
        lid.position.set(x, 1.3, z);
        this.scene.add(lid);
        this.meshes.push(lid);

        // Ingredients inside (colored powder)
        const ingredientGeometry = new THREE.CylinderGeometry(0.17, 0.17, 0.25, 12);
        const ingredientColors = [0x8a4a1a, 0x1a8a4a, 0x4a4a8a, 0x8a8a1a, 0x8a1a8a];
        const color = ingredientColors[Math.floor(Math.random() * ingredientColors.length)];

        const ingredientMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.95
        });
        const ingredient = new THREE.Mesh(ingredientGeometry, ingredientMaterial);
        ingredient.position.set(x, 0.95, z);
        this.scene.add(ingredient);
        this.meshes.push(ingredient);
    }

    createMortarAndPestle(x, z) {
        // Mortar (bowl)
        const mortarGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.2, 12);
        const mortarMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a5a5a,
            roughness: 0.9
        });
        const mortar = new THREE.Mesh(mortarGeometry, mortarMaterial);
        mortar.position.set(x, 0.95, z);
        this.scene.add(mortar);
        this.meshes.push(mortar);

        // Pestle
        const pestleGeometry = new THREE.CylinderGeometry(0.06, 0.08, 0.25, 8);
        const pestleMaterial = new THREE.MeshStandardMaterial({
            color: 0x7a7a7a,
            roughness: 0.8
        });
        const pestle = new THREE.Mesh(pestleGeometry, pestleMaterial);
        pestle.position.set(x + 0.15, 1.1, z);
        pestle.rotation.z = Math.PI / 6;
        this.scene.add(pestle);
        this.meshes.push(pestle);
    }

    createHangingHerbs(width, depth) {
        // Dried herbs hanging from ceiling
        const startX = -width / 2 + 1;
        const endX = width / 2 - 1;
        const herbZ = -depth / 2 + 1;
        const herbY = 2.8;

        for (let i = 0; i < 5; i++) {
            const herbX = startX + (i / 4) * (endX - startX);
            this.createHerbBundle(herbX, herbY, herbZ);
        }
    }

    createHerbBundle(x, y, z) {
        // Bundle base
        const bundleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 8);
        const bundleMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a6a3a,
            roughness: 0.85
        });
        const bundle = new THREE.Mesh(bundleGeometry, bundleMaterial);
        bundle.position.set(x, y, z);
        this.scene.add(bundle);
        this.meshes.push(bundle);

        // Hanging cord
        const cordGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6);
        const cordMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.9
        });
        const cord = new THREE.Mesh(cordGeometry, cordMaterial);
        cord.position.set(x, y + 0.4, z);
        this.scene.add(cord);
        this.meshes.push(cord);

        // Dried herb strands hanging down
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const leafGeometry = new THREE.PlaneGeometry(0.05, 0.25);
            const leafMaterial = new THREE.MeshStandardMaterial({
                color: 0x6a5a3a,
                roughness: 0.95,
                side: THREE.DoubleSide
            });
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            leaf.position.set(
                x + Math.cos(angle) * 0.1,
                y - 0.15 - Math.random() * 0.2,
                z + Math.sin(angle) * 0.1
            );
            leaf.rotation.x = (Math.random() - 0.5) * 0.5;
            this.scene.add(leaf);
            this.meshes.push(leaf);
        }
    }

    setupLighting() {
        // Mystical alchemy lighting with greenish tint
        const ambientLight = new THREE.AmbientLight(0x8a9a7a, 0.4);
        this.scene.add(ambientLight);

        // Add some green-tinted accent lighting
        const alchemyLight = new THREE.DirectionalLight(0x4aaa6a, 0.3);
        alchemyLight.position.set(3, 3, 3);
        this.scene.add(alchemyLight);
    }

    update(deltaTime, player) {
        super.update(deltaTime, player);

        const time = Date.now() * 0.001;

        // Animate bubbling in cauldron
        for (const mesh of this.meshes) {
            if (mesh.userData.isBubbling) {
                mesh.position.y = 0.5 + Math.sin(time * 3) * 0.03;
            }

            if (mesh.userData.isBubble) {
                mesh.position.y += 0.01;
                if (mesh.position.y > 1.2) {
                    mesh.position.y = 0.3;
                }
            }
        }
    }
}
