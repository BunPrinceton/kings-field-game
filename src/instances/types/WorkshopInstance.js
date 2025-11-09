// WorkshopInstance.js - Blacksmith workshop
import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class WorkshopInstance extends Instance {
    constructor(definition) {
        super(definition);
    }

    placeFeatures() {
        const features = this.definition.features;

        if (features.forge) {
            this.createForge();
        }
        if (features.anvil) {
            this.createAnvil();
        }
        if (features.workbenches) {
            this.placeWorkbenches(features.workbenches);
        }
        if (features.toolRacks) {
            this.placeToolRacks(features.toolRacks);
        }
    }

    createForge() {
        const forgeGeometry = new THREE.BoxGeometry(3, 1.5, 2);
        const forgeMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.9
        });
        const forge = new THREE.Mesh(forgeGeometry, forgeMaterial);
        forge.position.set(-8, 0.75, 0);
        this.scene.add(forge);
        this.meshes.push(forge);

        // Fire
        const fireGeometry = new THREE.ConeGeometry(0.8, 1.2, 8);
        const fireMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6600,
            emissive: 0xff6600,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 0.8
        });
        const fire = new THREE.Mesh(fireGeometry, fireMaterial);
        fire.position.set(-8, 1.8, 0);
        fire.userData.isFire = true;
        this.scene.add(fire);
        this.meshes.push(fire);

        // Forge light
        const light = new THREE.PointLight(0xff6600, 5, 15);
        light.position.set(-8, 2, 0);
        this.scene.add(light);
        this.lights.push(light);
    }

    createAnvil() {
        const anvilGeometry = new THREE.CylinderGeometry(0.6, 0.4, 0.6, 8);
        const anvilMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.5,
            metalness: 0.9
        });
        const anvil = new THREE.Mesh(anvilGeometry, anvilMaterial);
        anvil.position.set(-5, 0.8, 0);
        this.scene.add(anvil);
        this.meshes.push(anvil);

        // Anvil top (flat surface)
        const topGeometry = new THREE.BoxGeometry(0.8, 0.2, 0.6);
        const top = new THREE.Mesh(topGeometry, anvilMaterial);
        top.position.set(-5, 1.2, 0);
        this.scene.add(top);
        this.meshes.push(top);
    }

    placeWorkbenches(count) {
        const positions = [
            { x: 6, z: -8 }, { x: 6, z: -4 },
            { x: 6, z: 4 }, { x: 6, z: 8 }
        ];

        for (let i = 0; i < Math.min(count, positions.length); i++) {
            const pos = positions[i];
            this.createWorkbench(pos.x, pos.z);
        }
    }

    createWorkbench(x, z) {
        const benchGeometry = new THREE.BoxGeometry(3, 0.15, 1.5);
        const benchMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.8
        });
        const bench = new THREE.Mesh(benchGeometry, benchMaterial);
        bench.position.set(x, 0.9, z);
        this.scene.add(bench);
        this.meshes.push(bench);

        // Legs
        const legGeometry = new THREE.BoxGeometry(0.1, 0.85, 0.1);
        const corners = [
            { x: x - 1.4, z: z - 0.7 },
            { x: x + 1.4, z: z - 0.7 },
            { x: x - 1.4, z: z + 0.7 },
            { x: x + 1.4, z: z + 0.7 }
        ];

        for (const corner of corners) {
            const leg = new THREE.Mesh(legGeometry, benchMaterial);
            leg.position.set(corner.x, 0.425, corner.z);
            this.scene.add(leg);
            this.meshes.push(leg);
        }
    }

    placeToolRacks(count) {
        const positions = [
            { x: -10, z: -8 }, { x: -10, z: -4 },
            { x: -10, z: 4 }, { x: -10, z: 8 },
            { x: 10, z: -8 }, { x: 10, z: 8 }
        ];

        for (let i = 0; i < Math.min(count, positions.length); i++) {
            const pos = positions[i];
            this.createToolRack(pos.x, pos.z);
        }
    }

    createToolRack(x, z) {
        const rackGeometry = new THREE.BoxGeometry(0.3, 2, 1.5);
        const rackMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3a2a,
            roughness: 0.8
        });
        const rack = new THREE.Mesh(rackGeometry, rackMaterial);
        rack.position.set(x, 1, z);
        this.scene.add(rack);
        this.meshes.push(rack);

        // Hammers and tools
        const toolCount = 4;
        for (let i = 0; i < toolCount; i++) {
            const toolGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8);
            const toolMaterial = new THREE.MeshStandardMaterial({
                color: 0x5a4a3a
            });
            const tool = new THREE.Mesh(toolGeometry, toolMaterial);
            tool.position.set(x + 0.2, 0.5 + i * 0.5, z - 0.5 + i * 0.3);
            tool.rotation.z = Math.PI / 2;
            this.scene.add(tool);
            this.meshes.push(tool);
        }
    }

    update(deltaTime, player) {
        super.update(deltaTime, player);

        const time = Date.now() * 0.001;
        for (const mesh of this.meshes) {
            if (mesh.userData.isFire) {
                const flicker = Math.sin(time * 8) * 0.1 + 1;
                mesh.scale.set(flicker, 1 + Math.sin(time * 6) * 0.15, flicker);
            }
        }
    }
}
