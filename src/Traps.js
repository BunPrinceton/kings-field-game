/**
 * Traps - Various trap types with OBVIOUS visual cues for beginner-friendly gameplay
 */

import * as THREE from 'three';

export const TrapType = {
    SPIKE: 'spike',
    ARROW: 'arrow',
    BLADE: 'blade',
    PIT: 'pit',
    FIRE: 'fire',
    BOULDER: 'boulder'
};

// Base trap class
export class Trap {
    constructor(scene, position, damage = 15) {
        this.scene = scene;
        this.position = position;
        this.damage = damage;
        this.active = true;
        this.cooldown = 0;
        this.cooldownMax = 2000; // 2 seconds between triggers
        this.triggerRange = 1.2;
        this.mesh = null;
        this.triggered = false;
    }

    canTrigger(playerPosition) {
        if (!this.active || this.cooldown > 0) return false;

        const distance = Math.sqrt(
            Math.pow(playerPosition.x - this.position.x, 2) +
            Math.pow(playerPosition.z - this.position.z, 2)
        );

        return distance <= this.triggerRange;
    }

    trigger(player) {
        if (!this.canTrigger(player.position)) return null;

        this.triggered = true;
        this.cooldown = this.cooldownMax;

        console.log(`Trap triggered! Taking ${this.damage} damage!`);

        // Deal damage to player
        const damageResult = player.takeDamage(this.damage, 'physical');

        // Start cooldown
        setTimeout(() => {
            this.triggered = false;
        }, this.cooldownMax);

        return damageResult;
    }

    update(deltaTime) {
        if (this.cooldown > 0) {
            this.cooldown = Math.max(0, this.cooldown - deltaTime);
        }
    }

    destroy() {
        if (this.mesh) {
            // Dispose materials (but NOT shared geometries from pool)
            this.mesh.traverse(child => {
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
                // Note: Don't dispose geometry if it's from SHARED_TRAP_GEOMETRIES
            });
            this.scene.remove(this.mesh);
        }
    }
}

// Floor Spike Trap - Visible pressure plate and spikes
export class SpikeTrap extends Trap {
    constructor(scene, position, damage = 12) {
        super(scene, position, damage);
        this.type = TrapType.SPIKE;
        this.spikesRaised = false;
        this.createMesh();
    }

    createMesh() {
        this.mesh = new THREE.Group();
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);

        // Pressure plate (OBVIOUS - bright red/orange glow)
        const plateGeometry = SHARED_TRAP_GEOMETRIES.plate;
        const plateMaterial = new THREE.MeshStandardMaterial({
            color: 0x884400,
            roughness: 0.7,
            metalness: 0.3,
            emissive: 0xFF4400,
            emissiveIntensity: 0.3
        });
        const plate = new THREE.Mesh(plateGeometry, plateMaterial);
        plate.position.y = 0.025;
        plate.receiveShadow = true;
        this.mesh.add(plate);

        // Warning markings (diagonal stripes)
        const stripeGeometry = new THREE.PlaneGeometry(0.1, 1.4);
        const stripeMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,
            side: THREE.DoubleSide
        });

        for (let i = -1; i <= 1; i++) {
            const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
            stripe.position.set(i * 0.4, 0.06, 0);
            stripe.rotation.x = -Math.PI / 2;
            stripe.rotation.z = Math.PI / 4;
            this.mesh.add(stripe);
        }

        // Spikes group (will animate up/down)
        this.spikesGroup = new THREE.Group();
        this.spikesGroup.position.y = -0.3; // Hidden below floor

        const spikeCount = 9;
        const spikePositions = [
            [-0.4, -0.4], [-0.4, 0], [-0.4, 0.4],
            [0, -0.4], [0, 0], [0, 0.4],
            [0.4, -0.4], [0.4, 0], [0.4, 0.4]
        ];

        spikePositions.forEach(([x, z]) => {
            const spikeGeometry = SHARED_TRAP_GEOMETRIES.spikeCone;
            const spikeMaterial = new THREE.MeshStandardMaterial({
                color: 0x666666,
                roughness: 0.5,
                metalness: 0.7
            });
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            spike.position.set(x, 0.3, z);
            spike.castShadow = true;
            this.spikesGroup.add(spike);
        });

        this.mesh.add(this.spikesGroup);

        // Glow effect to make it super obvious
        const glowGeometry = new THREE.PlaneGeometry(1.5, 1.5);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF4400,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.rotation.x = -Math.PI / 2;
        glow.position.y = 0.01;
        this.mesh.add(glow);

        this.mesh.userData.trap = this;
        this.mesh.userData.type = 'trap';

        this.scene.add(this.mesh);
    }

    trigger(player) {
        const result = super.trigger(player);
        if (result) {
            this.animateSpikes();
        }
        return result;
    }

    animateSpikes() {
        if (this.spikesRaised) return;

        this.spikesRaised = true;
        const duration = 150;
        const startTime = Date.now();
        const startY = -0.3;
        const endY = 0;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            this.spikesGroup.position.y = startY + (endY - startY) * progress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Retract spikes after 500ms
                setTimeout(() => this.retractSpikes(), 500);
            }
        };

        animate();
    }

    retractSpikes() {
        const duration = 300;
        const startTime = Date.now();
        const startY = 0;
        const endY = -0.3;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            this.spikesGroup.position.y = startY + (endY - startY) * progress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.spikesRaised = false;
            }
        };

        animate();
    }
}

// Arrow Trap - Visible holes in walls with arrows
export class ArrowTrap extends Trap {
    constructor(scene, position, direction = new THREE.Vector3(1, 0, 0), damage = 10) {
        super(scene, position, damage);
        this.type = TrapType.ARROW;
        this.direction = direction.normalize();
        this.createMesh();
    }

    createMesh() {
        this.mesh = new THREE.Group();
        this.mesh.position.set(this.position.x, this.position.y + 0.8, this.position.z);

        // Arrow hole mount (OBVIOUS - bright red warning)
        const mountGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.1, 8);
        const mountMaterial = new THREE.MeshStandardMaterial({
            color: 0x883333,
            roughness: 0.6,
            emissive: 0xFF0000,
            emissiveIntensity: 0.4
        });
        const mount = new THREE.Mesh(mountGeometry, mountMaterial);
        mount.rotation.z = Math.PI / 2;
        mount.castShadow = true;
        this.mesh.add(mount);

        // Hole opening
        const holeGeometry = new THREE.CircleGeometry(0.1, 8);
        const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const hole = new THREE.Mesh(holeGeometry, holeMaterial);
        hole.position.x = 0.05;
        hole.rotation.y = Math.PI / 2;
        this.mesh.add(hole);

        // Warning light
        const lightGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const lightMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF0000,
            transparent: true,
            opacity: 0.7
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.y = 0.25;
        this.mesh.add(light);

        // Pulsing glow animation
        this.glowPhase = 0;
        this.lightMesh = light;

        this.mesh.userData.trap = this;
        this.mesh.userData.type = 'trap';

        this.scene.add(this.mesh);
    }

    trigger(player) {
        const result = super.trigger(player);
        if (result) {
            this.fireArrow();
        }
        return result;
    }

    fireArrow() {
        // Create arrow projectile visual
        const arrowGeometry = new THREE.ConeGeometry(0.03, 0.3, 6);
        const arrowMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        arrow.position.copy(this.mesh.position);
        arrow.rotation.z = -Math.PI / 2;
        this.scene.add(arrow);

        // Animate arrow flying
        const duration = 500;
        const startTime = Date.now();
        const startPos = arrow.position.clone();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            arrow.position.x = startPos.x + this.direction.x * 5 * progress;
            arrow.position.z = startPos.z + this.direction.z * 5 * progress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(arrow);
            }
        };

        animate();
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Pulsing warning light
        if (this.lightMesh) {
            this.glowPhase += deltaTime * 0.003;
            const pulseIntensity = 0.5 + Math.sin(this.glowPhase) * 0.3;
            this.lightMesh.material.opacity = pulseIntensity;
        }
    }
}

// Swinging Blade Trap - Visible pendulum blade
export class BladeTrap extends Trap {
    constructor(scene, position, damage = 18) {
        super(scene, position, damage);
        this.type = TrapType.BLADE;
        this.swingPhase = 0;
        this.createMesh();
    }

    createMesh() {
        this.mesh = new THREE.Group();
        this.mesh.position.set(this.position.x, this.position.y + 2, this.position.z);

        // Ceiling mount (OBVIOUS - bright colors)
        const mountGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 8);
        const mountMaterial = new THREE.MeshStandardMaterial({
            color: 0x664444,
            roughness: 0.6,
            emissive: 0xFF4400,
            emissiveIntensity: 0.2
        });
        const mount = new THREE.Mesh(mountGeometry, mountMaterial);
        mount.castShadow = true;
        this.mesh.add(mount);

        // Swinging arm
        this.arm = new THREE.Group();

        // Chain/rod
        const chainGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.8, 8);
        const chainMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            metalness: 0.8,
            roughness: 0.4
        });
        const chain = new THREE.Mesh(chainGeometry, chainMaterial);
        chain.position.y = -0.9;
        chain.castShadow = true;
        this.arm.add(chain);

        // Blade (VERY OBVIOUS - large and shiny)
        const bladeGeometry = new THREE.BoxGeometry(1.2, 0.15, 0.08);
        const bladeMaterial = new THREE.MeshStandardMaterial({
            color: 0xCCCCCC,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x444444,
            emissiveIntensity: 0.3
        });
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.y = -1.8;
        blade.castShadow = true;
        this.arm.add(blade);

        // Warning lights on blade
        const warningGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.12);
        const warningMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });

        for (let i = -1; i <= 1; i++) {
            const warning = new THREE.Mesh(warningGeometry, warningMaterial);
            warning.position.set(i * 0.4, -1.8, 0);
            this.arm.add(warning);
        }

        this.mesh.add(this.arm);

        this.mesh.userData.trap = this;
        this.mesh.userData.type = 'trap';

        this.scene.add(this.mesh);
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Constant swinging motion
        this.swingPhase += deltaTime * 0.002;
        const swingAngle = Math.sin(this.swingPhase) * Math.PI / 3; // ±60 degrees
        this.arm.rotation.z = swingAngle;
    }

    canTrigger(playerPosition) {
        // Check if player is in the path of the blade
        const distance = Math.sqrt(
            Math.pow(playerPosition.x - this.position.x, 2) +
            Math.pow(playerPosition.z - this.position.z, 2)
        );

        // Only trigger when blade is at bottom of swing
        const bladeAtBottom = Math.abs(Math.sin(this.swingPhase)) < 0.3;

        return distance <= 1.5 && bladeAtBottom && this.cooldown <= 0;
    }
}

// Pit Trap - Obvious gap in floor
export class PitTrap extends Trap {
    constructor(scene, position, damage = 15) {
        super(scene, position, damage);
        this.type = TrapType.PIT;
        this.createMesh();
    }

    createMesh() {
        this.mesh = new THREE.Group();
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);

        // Pit opening (dark void with visible edges)
        const pitGeometry = new THREE.PlaneGeometry(1.5, 1.5);
        const pitMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.DoubleSide
        });
        const pit = new THREE.Mesh(pitGeometry, pitMaterial);
        pit.rotation.x = -Math.PI / 2;
        this.mesh.add(pit);

        // Warning edges (VERY OBVIOUS - bright yellow/black stripes)
        const edgeHeight = 0.15;
        const edgeGeometry = new THREE.BoxGeometry(1.6, edgeHeight, 0.1);
        const edgeMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFF00,
            emissive: 0xFFFF00,
            emissiveIntensity: 0.5
        });

        // Four edges
        const edges = [
            { pos: [0, 0, -0.75], rot: 0 },
            { pos: [0, 0, 0.75], rot: 0 },
            { pos: [-0.75, 0, 0], rot: Math.PI / 2 },
            { pos: [0.75, 0, 0], rot: Math.PI / 2 }
        ];

        edges.forEach(({ pos, rot }) => {
            const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
            edge.position.set(...pos);
            edge.rotation.y = rot;
            edge.castShadow = true;
            this.mesh.add(edge);
        });

        // Spikes at bottom (visible if you look down)
        const spikeGroup = new THREE.Group();
        spikeGroup.position.y = -2;

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const spikeGeometry = new THREE.ConeGeometry(0.1, 0.5, 6);
                const spikeMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
                const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
                spike.position.set(i * 0.4, 0.25, j * 0.4);
                spikeGroup.add(spike);
            }
        }

        this.mesh.add(spikeGroup);

        this.mesh.userData.trap = this;
        this.mesh.userData.type = 'trap';

        this.scene.add(this.mesh);
    }

    canTrigger(playerPosition) {
        // Trigger when player is over the pit
        const distance = Math.sqrt(
            Math.pow(playerPosition.x - this.position.x, 2) +
            Math.pow(playerPosition.z - this.position.z, 2)
        );

        return distance <= 0.75 && this.cooldown <= 0;
    }
}

// Fire Grate Trap - Flames shooting from floor
export class FireTrap extends Trap {
    constructor(scene, position, damage = 14) {
        super(scene, position, damage);
        this.type = TrapType.FIRE;
        this.flamesActive = false;
        this.createMesh();
    }

    createMesh() {
        this.mesh = new THREE.Group();
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);

        // Grate (OBVIOUS - glowing red hot metal)
        const grateGeometry = new THREE.PlaneGeometry(1.2, 1.2);
        const grateMaterial = new THREE.MeshStandardMaterial({
            color: 0x442222,
            roughness: 0.5,
            metalness: 0.7,
            emissive: 0xFF4400,
            emissiveIntensity: 0.4
        });
        const grate = new THREE.Mesh(grateGeometry, grateMaterial);
        grate.rotation.x = -Math.PI / 2;
        grate.receiveShadow = true;
        this.mesh.add(grate);

        // Grate bars
        const barGeometry = new THREE.BoxGeometry(1.2, 0.05, 0.08);
        const barMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.6,
            metalness: 0.8,
            emissive: 0xFF2200,
            emissiveIntensity: 0.3
        });

        for (let i = -2; i <= 2; i++) {
            const bar1 = new THREE.Mesh(barGeometry, barMaterial);
            bar1.position.set(0, 0.03, i * 0.25);
            bar1.castShadow = true;
            this.mesh.add(bar1);

            const bar2 = new THREE.Mesh(barGeometry, barMaterial);
            bar2.position.set(i * 0.25, 0.03, 0);
            bar2.rotation.y = Math.PI / 2;
            bar2.castShadow = true;
            this.mesh.add(bar2);
        }

        // Flame particles (will show when triggered)
        this.flames = new THREE.Group();
        this.flames.visible = false;

        for (let i = 0; i < 8; i++) {
            const flameGeometry = new THREE.ConeGeometry(0.15, 0.8, 6);
            const flameMaterial = new THREE.MeshBasicMaterial({
                color: i % 2 === 0 ? 0xFF4400 : 0xFFAA00,
                transparent: true,
                opacity: 0.8
            });
            const flame = new THREE.Mesh(flameGeometry, flameMaterial);
            flame.position.set(
                (Math.random() - 0.5) * 1.0,
                0.4,
                (Math.random() - 0.5) * 1.0
            );
            flame.rotation.x = Math.PI;
            this.flames.add(flame);
        }

        this.mesh.add(this.flames);

        // Warning light
        const light = new THREE.PointLight(0xFF4400, 0.5, 3);
        light.position.y = 0.2;
        this.mesh.add(light);

        this.mesh.userData.trap = this;
        this.mesh.userData.type = 'trap';

        this.scene.add(this.mesh);
    }

    trigger(player) {
        const result = super.trigger(player);
        if (result) {
            this.activateFlames();
        }
        return result;
    }

    activateFlames() {
        this.flamesActive = true;
        this.flames.visible = true;

        setTimeout(() => {
            this.flamesActive = false;
            this.flames.visible = false;
        }, 1500);
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Animate flames
        if (this.flamesActive && this.flames.children.length > 0) {
            this.flames.children.forEach((flame, i) => {
                flame.position.y = 0.4 + Math.sin(Date.now() * 0.01 + i) * 0.2;
                flame.scale.y = 1 + Math.sin(Date.now() * 0.008 + i) * 0.3;
            });
        }
    }
}

// Rolling Boulder Trap - Indiana Jones style
export class BoulderTrap extends Trap {
    constructor(scene, position, direction = new THREE.Vector3(0, 0, 1), damage = 20) {
        super(scene, position, damage);
        this.type = TrapType.BOULDER;
        this.direction = direction.normalize();
        this.boulder = null;
        this.rolling = false;
        this.triggerRange = 3.0; // Larger trigger range
        this.createMesh();
    }

    createMesh() {
        this.mesh = new THREE.Group();
        this.mesh.position.set(this.position.x, this.position.y + 1, this.position.z);

        // Boulder
        const boulderGeometry = new THREE.SphereGeometry(1, 16, 16);
        const boulderMaterial = new THREE.MeshStandardMaterial({
            color: 0x665544,
            roughness: 0.9,
            metalness: 0.1
        });
        this.boulder = new THREE.Mesh(boulderGeometry, boulderMaterial);
        this.boulder.castShadow = true;
        this.mesh.add(this.boulder);

        // Warning sign near boulder
        const signGeometry = new THREE.BoxGeometry(0.5, 0.7, 0.1);
        const signMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFF00,
            emissive: 0xFFFF00,
            emissiveIntensity: 0.5
        });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(1.5, 0, 0);
        this.mesh.add(sign);

        // Warning symbol (exclamation mark)
        const symbolGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.12);
        const symbolMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        const symbol = new THREE.Mesh(symbolGeometry, symbolMaterial);
        symbol.position.set(1.5, 0.1, 0.06);
        this.mesh.add(symbol);

        const dotGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.12);
        const dot = new THREE.Mesh(dotGeometry, symbolMaterial);
        dot.position.set(1.5, -0.25, 0.06);
        this.mesh.add(dot);

        this.mesh.userData.trap = this;
        this.mesh.userData.type = 'trap';

        this.scene.add(this.mesh);
    }

    trigger(player) {
        if (this.rolling) return null;

        const result = super.trigger(player);
        if (result) {
            this.rollBoulder();
        }
        return result;
    }

    rollBoulder() {
        this.rolling = true;
        const duration = 3000; // 3 seconds
        const startTime = Date.now();
        const startPos = this.mesh.position.clone();
        const distance = 10;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Move boulder
            this.mesh.position.x = startPos.x + this.direction.x * distance * progress;
            this.mesh.position.z = startPos.z + this.direction.z * distance * progress;

            // Rotate boulder
            this.boulder.rotation.x += 0.1;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Reset boulder position
                setTimeout(() => {
                    this.mesh.position.copy(startPos);
                    this.boulder.rotation.x = 0;
                    this.rolling = false;
                }, 2000);
            }
        };

        animate();
    }

    canTrigger(playerPosition) {
        if (this.rolling || this.cooldown > 0) return false;

        // Check if player is ahead of boulder in the rolling direction
        const toPlayer = new THREE.Vector3(
            playerPosition.x - this.position.x,
            0,
            playerPosition.z - this.position.z
        );

        const dot = toPlayer.normalize().dot(this.direction);
        const distance = toPlayer.length();

        return dot > 0.7 && distance <= this.triggerRange;
    }
}
