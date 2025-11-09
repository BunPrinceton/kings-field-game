// StairManager.js - Manages stair placement and level transitions

import * as THREE from 'three';
import { POIType } from './DungeonGenerator.js';

export class StairManager {
    constructor(scene, dungeonData, config = {}) {
        this.scene = scene;
        this.dungeonData = dungeonData;
        this.config = {
            cellSize: config.cellSize || 4,
            wallHeight: config.wallHeight || 3.5,
            stairHeight: config.stairHeight || 0.3,
            interactionRange: config.interactionRange || 3.0,
            ...config
        };

        this.stairs = [];
        this.currentLevel = 1;
        this.maxLevel = 10; // Total dungeon levels
    }

    placeStairs() {
        // Find the exit room and place stairs down
        const exitRoom = this.dungeonData.rooms.find(r => r.type === POIType.EXIT);

        if (exitRoom) {
            const stairDown = this.createStairs(
                exitRoom.centerX,
                exitRoom.centerY,
                'down',
                this.currentLevel + 1
            );

            if (stairDown) {
                this.stairs.push(stairDown);
                console.log(`Placed stairs down at exit room (Level ${this.currentLevel} -> ${this.currentLevel + 1})`);
            }
        }

        // Optionally place stairs up if not on first level
        if (this.currentLevel > 1) {
            const entranceRoom = this.dungeonData.rooms.find(r => r.type === POIType.ENTRANCE);
            if (entranceRoom) {
                const stairUp = this.createStairs(
                    entranceRoom.centerX,
                    entranceRoom.centerY,
                    'up',
                    this.currentLevel - 1
                );

                if (stairUp) {
                    this.stairs.push(stairUp);
                    console.log(`Placed stairs up at entrance room (Level ${this.currentLevel} -> ${this.currentLevel - 1})`);
                }
            }
        }

        return this.stairs.length;
    }

    createStairs(gridX, gridY, direction = 'down', targetLevel = 2) {
        const worldX = gridX * this.config.cellSize;
        const worldZ = gridY * this.config.cellSize;

        // Create stair group
        const stairGroup = new THREE.Group();
        stairGroup.position.set(worldX, 0, worldZ);

        // Create stair steps (descending/ascending)
        const stepCount = 8;
        const stepWidth = 2.0;
        const stepDepth = 0.3;
        const stepHeight = this.config.stairHeight;

        const baseColor = direction === 'down' ? 0x4a2a2a : 0x2a4a2a;
        const emissiveColor = direction === 'down' ? 0x8a1a1a : 0x1a8a1a;

        for (let i = 0; i < stepCount; i++) {
            const stepGeometry = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
            const stepMaterial = new THREE.MeshStandardMaterial({
                color: baseColor,
                roughness: 0.9,
                metalness: 0.1
            });

            const step = new THREE.Mesh(stepGeometry, stepMaterial);

            if (direction === 'down') {
                step.position.set(
                    0,
                    -i * stepHeight * 0.5,
                    i * stepDepth
                );
            } else {
                step.position.set(
                    0,
                    i * stepHeight * 0.5,
                    i * stepDepth
                );
            }

            stairGroup.add(step);
        }

        // Create glowing portal/marker at the stairs
        const portalGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.1, 16);
        const portalMaterial = new THREE.MeshStandardMaterial({
            color: direction === 'down' ? 0xff4444 : 0x44ff44,
            emissive: emissiveColor,
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 0.4
        });

        const portal = new THREE.Mesh(portalGeometry, portalMaterial);
        portal.position.set(0, 0.05, 0);
        portal.rotation.x = 0;
        stairGroup.add(portal);

        // Add pulsing light
        const lightColor = direction === 'down' ? 0xff3333 : 0x33ff33;
        const light = new THREE.PointLight(lightColor, 2, 8);
        light.position.set(0, 1.5, 0);
        stairGroup.add(light);

        // Animate light pulsing
        this.animateStairLight(light);

        // Add to scene
        this.scene.add(stairGroup);

        // Store stair data
        const stairData = {
            group: stairGroup,
            position: { x: worldX, y: 0, z: worldZ },
            gridPosition: { x: gridX, y: gridY },
            direction: direction,
            targetLevel: targetLevel,
            light: light,
            portal: portal
        };

        return stairData;
    }

    animateStairLight(light) {
        // Store initial intensity
        if (!light.userData.baseIntensity) {
            light.userData.baseIntensity = light.intensity;
        }
        if (!light.userData.time) {
            light.userData.time = 0;
        }

        // This will be called from the main animation loop
        light.userData.animate = (deltaTime) => {
            light.userData.time += deltaTime;
            const pulse = Math.sin(light.userData.time * 2) * 0.5 + 0.5;
            light.intensity = light.userData.baseIntensity * (0.7 + pulse * 0.3);
        };
    }

    update(deltaTime) {
        // Animate all stair lights
        for (const stair of this.stairs) {
            if (stair.light && stair.light.userData.animate) {
                stair.light.userData.animate(deltaTime);
            }

            // Rotate portal slowly
            if (stair.portal) {
                stair.portal.rotation.y += deltaTime * 0.5;
            }
        }
    }

    checkInteraction(playerPosition) {
        const playerPos = new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z);

        for (const stair of this.stairs) {
            const stairPos = new THREE.Vector3(stair.position.x, stair.position.y, stair.position.z);
            const distance = playerPos.distanceTo(stairPos);

            if (distance < this.config.interactionRange) {
                return stair;
            }
        }

        return null;
    }

    getNearestStair(playerPosition) {
        if (this.stairs.length === 0) return null;

        const playerPos = new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z);
        let nearestStair = null;
        let minDistance = Infinity;

        for (const stair of this.stairs) {
            const stairPos = new THREE.Vector3(stair.position.x, stair.position.y, stair.position.z);
            const distance = playerPos.distanceTo(stairPos);

            if (distance < minDistance) {
                minDistance = distance;
                nearestStair = stair;
            }
        }

        return {
            stair: nearestStair,
            distance: minDistance
        };
    }

    setCurrentLevel(level) {
        this.currentLevel = level;
    }

    getCurrentLevel() {
        return this.currentLevel;
    }

    clearStairs() {
        // Remove all stairs from scene
        for (const stair of this.stairs) {
            if (stair.group) {
                this.scene.remove(stair.group);
            }
        }
        this.stairs = [];
    }

    getStats() {
        return {
            totalStairs: this.stairs.length,
            currentLevel: this.currentLevel,
            maxLevel: this.maxLevel,
            stairsDown: this.stairs.filter(s => s.direction === 'down').length,
            stairsUp: this.stairs.filter(s => s.direction === 'up').length
        };
    }
}
