// AtmosphericDetails.js - Adds small atmospheric details like moss, puddles, cracks, cobwebs
import * as THREE from 'three';

export class AtmosphericDetails {
    constructor(scene, dungeonData, config = {}) {
        this.scene = scene;
        this.dungeonData = dungeonData;

        this.config = {
            cellSize: config.cellSize || 4,
            wallHeight: config.wallHeight || 3,
            detailDensity: config.detailDensity || 0.2, // 0.0 to 1.0
            enableMoss: config.enableMoss !== undefined ? config.enableMoss : true,
            enablePuddles: config.enablePuddles !== undefined ? config.enablePuddles : true,
            enableCracks: config.enableCracks !== undefined ? config.enableCracks : true,
            enableCobwebs: config.enableCobwebs !== undefined ? config.enableCobwebs : true,
            ...config
        };

        this.details = [];
    }

    /**
     * Add all atmospheric details
     */
    addDetails() {
        console.log('Adding atmospheric details...');

        if (this.config.enableMoss) {
            this.addMossPatches();
        }

        if (this.config.enablePuddles) {
            this.addPuddles();
        }

        if (this.config.enableCracks) {
            this.addCracks();
        }

        if (this.config.enableCobwebs) {
            this.addCobwebs();
        }

        console.log(`Added ${this.details.length} atmospheric details`);
        return this.details;
    }

    /**
     * Add moss patches to floors and walls
     */
    addMossPatches() {
        const mossMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a4a2a,
            roughness: 1.0,
            metalness: 0.0,
            transparent: true,
            opacity: 0.7
        });

        for (let y = 0; y < this.dungeonData.height; y++) {
            for (let x = 0; x < this.dungeonData.width; x++) {
                if (this.dungeonData.grid[y][x] === 1 && Math.random() < this.config.detailDensity) {
                    // Floor moss patch
                    const size = 0.3 + Math.random() * 0.5;
                    const geometry = new THREE.CircleGeometry(size, 8);
                    const moss = new THREE.Mesh(geometry, mossMaterial);

                    moss.rotation.x = -Math.PI / 2;
                    moss.position.set(
                        x * this.config.cellSize + (Math.random() - 0.5) * this.config.cellSize * 0.8,
                        0.01, // Slightly above floor to prevent z-fighting
                        y * this.config.cellSize + (Math.random() - 0.5) * this.config.cellSize * 0.8
                    );

                    this.scene.add(moss);
                    this.details.push(moss);
                }
            }
        }
    }

    /**
     * Add water puddles to floor
     */
    addPuddles() {
        const puddleMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2a,
            roughness: 0.1,
            metalness: 0.8,
            transparent: true,
            opacity: 0.6
        });

        for (let y = 0; y < this.dungeonData.height; y++) {
            for (let x = 0; x < this.dungeonData.width; x++) {
                if (this.dungeonData.grid[y][x] === 1 && Math.random() < this.config.detailDensity * 0.5) {
                    // Create irregular puddle shape using multiple circles
                    const puddleGroup = new THREE.Group();
                    const circleCount = 2 + Math.floor(Math.random() * 3);

                    for (let i = 0; i < circleCount; i++) {
                        const size = 0.2 + Math.random() * 0.4;
                        const geometry = new THREE.CircleGeometry(size, 8);
                        const circle = new THREE.Mesh(geometry, puddleMaterial);

                        circle.rotation.x = -Math.PI / 2;
                        circle.position.set(
                            (Math.random() - 0.5) * 0.6,
                            0.005,
                            (Math.random() - 0.5) * 0.6
                        );

                        puddleGroup.add(circle);
                    }

                    puddleGroup.position.set(
                        x * this.config.cellSize + (Math.random() - 0.5) * this.config.cellSize * 0.8,
                        0,
                        y * this.config.cellSize + (Math.random() - 0.5) * this.config.cellSize * 0.8
                    );

                    this.scene.add(puddleGroup);
                    this.details.push(puddleGroup);
                }
            }
        }
    }

    /**
     * Add cracks to walls and floors (using decals)
     */
    addCracks() {
        const crackMaterial = new THREE.MeshBasicMaterial({
            color: 0x0a0a0a,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });

        for (let y = 0; y < this.dungeonData.height; y++) {
            for (let x = 0; x < this.dungeonData.width; x++) {
                if (this.dungeonData.grid[y][x] === 1 && Math.random() < this.config.detailDensity * 0.3) {
                    // Floor crack
                    const crackGeometry = this.createCrackGeometry();
                    const crack = new THREE.Mesh(crackGeometry, crackMaterial);

                    crack.rotation.x = -Math.PI / 2;
                    crack.rotation.z = Math.random() * Math.PI * 2;
                    crack.position.set(
                        x * this.config.cellSize + (Math.random() - 0.5) * this.config.cellSize * 0.8,
                        0.02,
                        y * this.config.cellSize + (Math.random() - 0.5) * this.config.cellSize * 0.8
                    );

                    this.scene.add(crack);
                    this.details.push(crack);
                }
            }
        }
    }

    /**
     * Create a simple crack geometry
     */
    createCrackGeometry() {
        const shape = new THREE.Shape();

        // Create a jagged crack shape
        const length = 0.5 + Math.random() * 0.5;
        const width = 0.02 + Math.random() * 0.03;

        shape.moveTo(0, 0);
        shape.lineTo(width / 2, 0);

        const segments = 3 + Math.floor(Math.random() * 3);
        for (let i = 1; i <= segments; i++) {
            const progress = i / segments;
            const zigzag = (Math.random() - 0.5) * width * 2;
            shape.lineTo(
                width / 2 + zigzag,
                progress * length
            );
        }

        shape.lineTo(0, length);
        shape.lineTo(-width / 2, length);

        for (let i = segments; i >= 0; i--) {
            const progress = i / segments;
            const zigzag = (Math.random() - 0.5) * width * 2;
            shape.lineTo(
                -width / 2 + zigzag,
                progress * length
            );
        }

        shape.lineTo(0, 0);

        return new THREE.ShapeGeometry(shape);
    }

    /**
     * Add cobwebs in corners and ceiling edges
     */
    addCobwebs() {
        const cobwebMaterial = new THREE.MeshStandardMaterial({
            color: 0x9a9a9a,
            roughness: 0.9,
            metalness: 0.0,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });

        // Add cobwebs in room corners near ceiling
        for (const room of this.dungeonData.rooms) {
            if (Math.random() < 0.5) {
                // Corner cobwebs
                const corners = [
                    { x: room.x, z: room.y },
                    { x: room.x + room.width - 1, z: room.y },
                    { x: room.x, z: room.y + room.height - 1 },
                    { x: room.x + room.width - 1, z: room.y + room.height - 1 }
                ];

                for (const corner of corners) {
                    if (Math.random() < this.config.detailDensity) {
                        this.createCobweb(
                            corner.x * this.config.cellSize,
                            corner.z * this.config.cellSize,
                            cobwebMaterial
                        );
                    }
                }
            }
        }
    }

    /**
     * Create a cobweb mesh
     */
    createCobweb(x, z, material) {
        const size = 0.3 + Math.random() * 0.4;

        // Create a simple cobweb using a flat cone shape
        const geometry = new THREE.ConeGeometry(size, size * 0.5, 8, 1, true);
        const cobweb = new THREE.Mesh(geometry, material);

        cobweb.rotation.x = Math.PI;
        cobweb.position.set(
            x + (Math.random() - 0.5) * 0.5,
            this.config.wallHeight - 0.2,
            z + (Math.random() - 0.5) * 0.5
        );

        this.scene.add(cobweb);
        this.details.push(cobweb);
    }

    /**
     * Add volumetric dust particles (simple implementation)
     */
    addDustParticles() {
        const particleCount = 200;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        // Spread particles across the dungeon
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * this.dungeonData.width * this.config.cellSize;
            positions[i * 3 + 1] = Math.random() * this.config.wallHeight;
            positions[i * 3 + 2] = (Math.random() - 0.5) * this.dungeonData.height * this.config.cellSize;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.02,
            transparent: true,
            opacity: 0.3,
            sizeAttenuation: true
        });

        const particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(particleSystem);
        this.details.push(particleSystem);

        // Store for animation
        this.dustParticles = particleSystem;

        return particleSystem;
    }

    /**
     * Animate dust particles (call in game loop)
     */
    animateDust(time) {
        if (!this.dustParticles) return;

        const positions = this.dustParticles.geometry.attributes.position.array;

        for (let i = 0; i < positions.length; i += 3) {
            // Gentle floating motion
            positions[i + 1] += Math.sin(time * 0.5 + i) * 0.001;

            // Reset particles that drift too high or low
            if (positions[i + 1] > this.config.wallHeight) {
                positions[i + 1] = 0;
            } else if (positions[i + 1] < 0) {
                positions[i + 1] = this.config.wallHeight;
            }
        }

        this.dustParticles.geometry.attributes.position.needsUpdate = true;
    }

    /**
     * Remove all details from the scene
     */
    dispose() {
        for (const detail of this.details) {
            this.scene.remove(detail);
            if (detail.geometry) detail.geometry.dispose();
            if (detail.material) detail.material.dispose();
        }

        this.details = [];
        this.dustParticles = null;
    }
}
