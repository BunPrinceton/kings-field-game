// PuzzleChamberInstance.js - Puzzle room with mechanics
import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class PuzzleChamberInstance extends Instance {
    constructor(definition) {
        super(definition);
        this.puzzleSolved = false;
    }

    placeFeatures() {
        const features = this.definition.features;

        if (features.runeStones) {
            this.placeRuneStones(features.runeStones);
        }
        if (features.magicCircle) {
            this.createMagicCircle();
        }
        if (features.pressurePlates) {
            this.placePressurePlates(features.pressurePlates);
        }
    }

    placeRuneStones(count) {
        const radius = 10;
        const angleStep = (Math.PI * 2) / count;

        for (let i = 0; i < count; i++) {
            const angle = angleStep * i;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            this.createRuneStone(x, z, i);
        }
    }

    createRuneStone(x, z, index) {
        const stoneGeometry = new THREE.CylinderGeometry(0.6, 0.7, 1.5, 6);
        const stoneMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a5a,
            roughness: 0.9
        });
        const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
        stone.position.set(x, 0.75, z);
        this.scene.add(stone);
        this.meshes.push(stone);

        // Rune symbol
        const runeGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 16);
        const runeMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a4a9a,
            emissive: 0x8a4a9a,
            emissiveIntensity: 0.6
        });
        const rune = new THREE.Mesh(runeGeometry, runeMaterial);
        rune.position.set(x, 1.55, z);
        rune.userData.isRune = true;
        rune.userData.runeIndex = index;
        this.scene.add(rune);
        this.meshes.push(rune);

        // Light
        const light = new THREE.PointLight(0x8a4a9a, 1.5, 6);
        light.position.set(x, 1.8, z);
        this.scene.add(light);
        this.lights.push(light);
    }

    createMagicCircle() {
        const circleGeometry = new THREE.TorusGeometry(8, 0.2, 16, 64);
        const circleMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a4a9a,
            emissive: 0x8a4a9a,
            emissiveIntensity: 0.5
        });
        const circle = new THREE.Mesh(circleGeometry, circleMaterial);
        circle.rotation.x = Math.PI / 2;
        circle.position.y = 0.05;
        circle.userData.isCircle = true;
        this.scene.add(circle);
        this.meshes.push(circle);
    }

    placePressurePlates(count) {
        const positions = [
            { x: -8, z: -8 }, { x: 8, z: -8 },
            { x: -8, z: 8 }, { x: 8, z: 8 },
            { x: 0, z: -10 }, { x: 0, z: 10 }
        ];

        for (let i = 0; i < Math.min(count, positions.length); i++) {
            const pos = positions[i];
            this.createPressurePlate(pos.x, pos.z);
        }
    }

    createPressurePlate(x, z) {
        const plateGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 16);
        const plateMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a5a6a,
            roughness: 0.7,
            metalness: 0.5
        });
        const plate = new THREE.Mesh(plateGeometry, plateMaterial);
        plate.position.set(x, 0.05, z);
        this.scene.add(plate);
        this.meshes.push(plate);
    }

    update(deltaTime, player) {
        super.update(deltaTime, player);

        const time = Date.now() * 0.001;

        for (const mesh of this.meshes) {
            if (mesh.userData.isRune) {
                mesh.rotation.y += deltaTime * 0.5;
            }
            if (mesh.userData.isCircle) {
                mesh.rotation.z += deltaTime * 0.2;
            }
        }
    }

    solvePuzzle() {
        this.puzzleSolved = true;
        this.complete();
        console.log('Puzzle solved!');
    }
}
