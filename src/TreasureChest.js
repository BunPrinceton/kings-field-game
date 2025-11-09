/**
 * TreasureChest - Interactive chest system with different types and loot
 */

import * as THREE from 'three';

export const ChestType = {
    WOODEN: 'wooden',
    IRON: 'iron',
    ORNATE: 'ornate',
    LOCKED: 'locked'
};

export const ChestRarity = {
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    LEGENDARY: 'legendary'
};

export class TreasureChest {
    constructor(scene, position, type = ChestType.WOODEN, rarity = ChestRarity.COMMON, locked = false) {
        this.scene = scene;
        this.position = position;
        this.type = type;
        this.rarity = rarity;
        this.locked = locked;
        this.opened = false;
        this.interactionRange = 2.5;

        // Loot contents (will be generated)
        this.loot = [];
        this.gold = 0;

        // Visual properties based on type
        this.chestConfig = this.getChestConfig();

        // Create mesh
        this.mesh = null;
        this.lid = null;
        this.createMesh();

        // Animation properties
        this.lidOpenRotation = Math.PI * 0.6; // ~108 degrees
        this.lidAnimationProgress = 0;
        this.isAnimating = false;
    }

    getChestConfig() {
        const configs = {
            [ChestType.WOODEN]: {
                bodyColor: 0x8B4513,
                accentColor: 0x654321,
                metalColor: 0x666666,
                size: { width: 0.8, height: 0.6, depth: 0.6 },
                emissive: 0x000000,
                emissiveIntensity: 0
            },
            [ChestType.IRON]: {
                bodyColor: 0x505050,
                accentColor: 0x383838,
                metalColor: 0xAAAAAA,
                size: { width: 0.9, height: 0.7, depth: 0.7 },
                emissive: 0x222222,
                emissiveIntensity: 0.1
            },
            [ChestType.ORNATE]: {
                bodyColor: 0x8B4513,
                accentColor: 0xFFD700,
                metalColor: 0xFFD700,
                size: { width: 1.0, height: 0.8, depth: 0.8 },
                emissive: 0xFFD700,
                emissiveIntensity: 0.2
            },
            [ChestType.LOCKED]: {
                bodyColor: 0x4A2F1F,
                accentColor: 0x2F1F0F,
                metalColor: 0x888888,
                size: { width: 0.85, height: 0.65, depth: 0.65 },
                emissive: 0xFF4400,
                emissiveIntensity: 0.15
            }
        };

        return configs[this.type];
    }

    createMesh() {
        const config = this.chestConfig;
        const { width, height, depth } = config.size;

        // Create chest group
        this.mesh = new THREE.Group();
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);

        // Chest body (bottom part)
        const bodyHeight = height * 0.55;
        const bodyGeometry = new THREE.BoxGeometry(width, bodyHeight, depth);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: config.bodyColor,
            roughness: 0.8,
            metalness: 0.2
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = bodyHeight / 2;
        body.castShadow = true;
        body.receiveShadow = true;
        this.mesh.add(body);

        // Chest lid (top part) - this will rotate when opened
        this.lid = new THREE.Group();
        const lidHeight = height * 0.45;
        const lidGeometry = new THREE.BoxGeometry(width, lidHeight, depth);
        const lidMaterial = new THREE.MeshStandardMaterial({
            color: config.bodyColor,
            roughness: 0.8,
            metalness: 0.2
        });
        const lidMesh = new THREE.Mesh(lidGeometry, lidMaterial);
        lidMesh.position.y = lidHeight / 2;
        lidMesh.castShadow = true;
        lidMesh.receiveShadow = true;
        this.lid.add(lidMesh);

        // Position lid pivot at back edge
        this.lid.position.y = bodyHeight;
        this.lid.position.z = -depth / 2;
        this.mesh.add(this.lid);

        // Metal bands on body
        const bandGeometry = new THREE.BoxGeometry(width + 0.02, 0.05, depth + 0.02);
        const bandMaterial = new THREE.MeshStandardMaterial({
            color: config.metalColor,
            roughness: 0.4,
            metalness: 0.8
        });

        const bottomBand = new THREE.Mesh(bandGeometry, bandMaterial);
        bottomBand.position.y = bodyHeight * 0.2;
        bottomBand.castShadow = true;
        this.mesh.add(bottomBand);

        const topBand = new THREE.Mesh(bandGeometry, bandMaterial);
        topBand.position.y = bodyHeight * 0.8;
        topBand.castShadow = true;
        this.mesh.add(topBand);

        // Lock on front (for locked chests)
        if (this.locked) {
            const lockGroup = this.createLock(config);
            lockGroup.position.set(0, bodyHeight * 0.5, depth / 2 + 0.05);
            this.mesh.add(lockGroup);
        }

        // Glow effect for rare chests
        if (this.rarity === ChestRarity.RARE || this.rarity === ChestRarity.LEGENDARY) {
            const glowGeometry = new THREE.BoxGeometry(width + 0.1, height + 0.1, depth + 0.1);
            const glowColor = this.rarity === ChestRarity.LEGENDARY ? 0xFFD700 : 0x4444FF;
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: glowColor,
                transparent: true,
                opacity: 0.15
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.y = height / 2;
            this.mesh.add(glow);

            // Add point light for legendary chests
            if (this.rarity === ChestRarity.LEGENDARY) {
                const light = new THREE.PointLight(glowColor, 0.5, 5);
                light.position.y = height;
                this.mesh.add(light);
            }
        }

        // Visual indicator for opened state
        if (this.opened) {
            this.lid.rotation.x = -this.lidOpenRotation;
        }

        // Store chest data for interaction
        this.mesh.userData.chest = this;
        this.mesh.userData.interactive = true;
        this.mesh.userData.type = 'chest';

        this.scene.add(this.mesh);
    }

    createLock(config) {
        const lockGroup = new THREE.Group();

        // Lock body
        const lockBodyGeometry = new THREE.BoxGeometry(0.15, 0.2, 0.08);
        const lockMaterial = new THREE.MeshStandardMaterial({
            color: config.metalColor,
            roughness: 0.3,
            metalness: 0.9,
            emissive: config.emissive,
            emissiveIntensity: config.emissiveIntensity
        });
        const lockBody = new THREE.Mesh(lockBodyGeometry, lockMaterial);
        lockGroup.add(lockBody);

        // Keyhole
        const keyholeGeometry = new THREE.CircleGeometry(0.03, 8);
        const keyholeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const keyhole = new THREE.Mesh(keyholeGeometry, keyholeMaterial);
        keyhole.position.z = 0.041;
        lockGroup.add(keyhole);

        return lockGroup;
    }

    canInteract(playerPosition) {
        const distance = Math.sqrt(
            Math.pow(playerPosition.x - this.position.x, 2) +
            Math.pow(playerPosition.z - this.position.z, 2)
        );
        return distance <= this.interactionRange && !this.opened && !this.locked;
    }

    interact(player) {
        if (this.opened) {
            console.log('Chest already opened');
            return false;
        }

        if (this.locked) {
            console.log('Chest is locked! You need a key.');
            // TODO: Check if player has key
            return false;
        }

        // Open the chest
        this.open();

        // Give loot to player
        if (this.loot.length > 0) {
            console.log(`Found ${this.loot.length} item(s) in the chest!`);
            this.loot.forEach(item => {
                if (player.inventory) {
                    player.inventory.addItem(item);
                }
            });
        }

        // Give gold
        if (this.gold > 0) {
            console.log(`Found ${this.gold} gold!`);
            if (player.inventory) {
                player.inventory.addGold(this.gold);
            }
        }

        return true;
    }

    open() {
        if (this.opened || this.isAnimating) return;

        this.opened = true;
        this.isAnimating = true;

        // Animate lid opening
        const duration = 800; // milliseconds
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const easedProgress = 1 - Math.pow(1 - progress, 3);

            this.lidAnimationProgress = easedProgress;
            this.lid.rotation.x = -this.lidOpenRotation * easedProgress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
            }
        };

        animate();
    }

    unlock(key) {
        // TODO: Implement key system
        if (this.locked) {
            this.locked = false;
            console.log('Chest unlocked!');
            return true;
        }
        return false;
    }

    setLoot(items, gold = 0) {
        this.loot = items;
        this.gold = gold;
    }

    addLoot(item) {
        this.loot.push(item);
    }

    getDistanceToPlayer(playerPosition) {
        return Math.sqrt(
            Math.pow(playerPosition.x - this.position.x, 2) +
            Math.pow(playerPosition.z - this.position.z, 2)
        );
    }

    update(deltaTime) {
        // Update animations if needed
        // Currently handled by requestAnimationFrame in open()
    }

    destroy() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }
    }
}
