import * as THREE from 'three';
import { Instance } from '../Instance.js';

export class ObservatoryInstance extends Instance {
    constructor(id, config, scene) {
        super(id, 'observatory', config, scene);
    }

    generateGeometry() {
        const { width, depth, height } = this.config.size;

        // Dark stone floor
        const floorGeometry = new THREE.PlaneGeometry(width, depth);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.8,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Circular walls with windows
        const wallSegments = 12;
        const radius = Math.min(width, depth) / 2 - 1;

        for (let i = 0; i < wallSegments; i++) {
            const angle = (i / wallSegments) * Math.PI * 2;
            const nextAngle = ((i + 1) / wallSegments) * Math.PI * 2;

            // Wall segment (with gaps for windows)
            if (i % 3 !== 1) {
                const wallGeometry = new THREE.BoxGeometry(2, height, 0.5);
                const wallMaterial = new THREE.MeshStandardMaterial({
                    color: 0x2a2a3e,
                    roughness: 0.9
                });
                const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                wall.position.x = Math.cos(angle) * radius;
                wall.position.z = Math.sin(angle) * radius;
                wall.position.y = height / 2;
                wall.rotation.y = angle;
                wall.castShadow = true;
                this.scene.add(wall);
            } else {
                // Window with starry view
                const windowGeometry = new THREE.PlaneGeometry(1.8, height * 0.7);
                const windowMaterial = new THREE.MeshBasicMaterial({
                    color: 0x000044,
                    transparent: true,
                    opacity: 0.3
                });
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                window.position.x = Math.cos(angle) * radius;
                window.position.z = Math.sin(angle) * radius;
                window.position.y = height / 2;
                window.rotation.y = angle;
                this.scene.add(window);

                // Stars visible through window
                for (let s = 0; s < 8; s++) {
                    const starGeometry = new THREE.SphereGeometry(0.02, 4, 4);
                    const starMaterial = new THREE.MeshBasicMaterial({
                        color: 0xffffff,
                        emissive: 0xffffdd,
                        emissiveIntensity: 2
                    });
                    const star = new THREE.Mesh(starGeometry, starMaterial);
                    star.position.x = Math.cos(angle) * (radius + 0.1) + (Math.random() - 0.5) * 1.5;
                    star.position.z = Math.sin(angle) * (radius + 0.1) + (Math.random() - 0.5) * 1.5;
                    star.position.y = Math.random() * height * 0.5 + height * 0.25;
                    this.scene.add(star);
                }
            }
        }

        // Domed ceiling
        const domeGeometry = new THREE.SphereGeometry(radius, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a3e,
            side: THREE.BackSide,
            roughness: 0.7
        });
        const dome = new THREE.Mesh(domeGeometry, domeMaterial);
        dome.position.y = height;
        this.scene.add(dome);

        // Central telescope
        this.createTelescope(0, 0);

        // Star charts on tables
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
            const dist = radius * 0.5;
            this.createStarChartTable(
                Math.cos(angle) * dist,
                Math.sin(angle) * dist
            );
        }

        // Astrolabe
        this.createAstrolabe(radius * 0.6, 0);

        // Celestial globe
        this.createCelestialGlobe(-radius * 0.6, 0);

        // Books and scrolls
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * radius * 0.4 + radius * 0.3;
            this.createBookStack(
                Math.cos(angle) * dist,
                Math.sin(angle) * dist
            );
        }
    }

    createTelescope(x, z) {
        // Base
        const baseGeometry = new THREE.CylinderGeometry(0.8, 1.2, 1, 8);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a5a,
            metalness: 0.6,
            roughness: 0.3
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(x, 0.5, z);
        this.scene.add(base);

        // Tube
        const tubeGeometry = new THREE.CylinderGeometry(0.25, 0.3, 3, 16);
        const tubeMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a3a,
            metalness: 0.8,
            roughness: 0.2
        });
        const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
        tube.position.set(x, 2, z);
        tube.rotation.z = Math.PI / 6;
        this.scene.add(tube);

        // Lens (glowing)
        const lensGeometry = new THREE.CircleGeometry(0.3, 16);
        const lensMaterial = new THREE.MeshBasicMaterial({
            color: 0x4466ff,
            emissive: 0x2244cc,
            emissiveIntensity: 0.5
        });
        const lens = new THREE.Mesh(lensGeometry, lensMaterial);
        lens.position.set(x - 1.3, 2.8, z);
        lens.rotation.y = Math.PI / 2;
        this.scene.add(lens);
    }

    createStarChartTable(x, z) {
        // Table
        const tableGeometry = new THREE.BoxGeometry(2, 0.1, 1.5);
        const tableMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a2a1a,
            roughness: 0.8
        });
        const table = new THREE.Mesh(tableGeometry, tableMaterial);
        table.position.set(x, 0.8, z);
        this.scene.add(table);

        // Legs
        for (let lx of [-0.8, 0.8]) {
            for (let lz of [-0.6, 0.6]) {
                const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
                const leg = new THREE.Mesh(legGeometry, tableMaterial);
                leg.position.set(x + lx, 0.4, z + lz);
                this.scene.add(leg);
            }
        }

        // Chart (glowing parchment with constellation)
        const chartGeometry = new THREE.PlaneGeometry(1.5, 1);
        const chartMaterial = new THREE.MeshBasicMaterial({
            color: 0xffeecc,
            emissive: 0x664422,
            emissiveIntensity: 0.3
        });
        const chart = new THREE.Mesh(chartGeometry, chartMaterial);
        chart.position.set(x, 0.86, z);
        chart.rotation.x = -Math.PI / 2;
        this.scene.add(chart);

        // Constellation dots
        for (let i = 0; i < 6; i++) {
            const dotGeometry = new THREE.SphereGeometry(0.02, 4, 4);
            const dotMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 2
            });
            const dot = new THREE.Mesh(dotGeometry, dotMaterial);
            dot.position.set(
                x + (Math.random() - 0.5) * 1.2,
                0.87,
                z + (Math.random() - 0.5) * 0.8
            );
            this.scene.add(dot);
        }
    }

    createAstrolabe(x, z) {
        // Stand
        const standGeometry = new THREE.CylinderGeometry(0.05, 0.15, 1.2, 8);
        const standMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b7355,
            roughness: 0.7
        });
        const stand = new THREE.Mesh(standGeometry, standMaterial);
        stand.position.set(x, 0.6, z);
        this.scene.add(stand);

        // Astrolabe rings
        for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.TorusGeometry(0.4 - i * 0.1, 0.02, 8, 24);
            const ringMaterial = new THREE.MeshStandardMaterial({
                color: 0xb8860b,
                metalness: 0.7,
                roughness: 0.3
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.set(x, 1.2, z);
            ring.rotation.x = Math.PI / 2 + i * 0.2;
            this.scene.add(ring);
        }
    }

    createCelestialGlobe(x, z) {
        // Stand
        const standGeometry = new THREE.CylinderGeometry(0.05, 0.15, 0.8, 8);
        const standMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b7355,
            roughness: 0.7
        });
        const stand = new THREE.Mesh(standGeometry, standMaterial);
        stand.position.set(x, 0.4, z);
        this.scene.add(stand);

        // Globe
        const globeGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const globeMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a3e,
            roughness: 0.5,
            metalness: 0.3
        });
        const globe = new THREE.Mesh(globeGeometry, globeMaterial);
        globe.position.set(x, 1.2, z);
        this.scene.add(globe);

        // Stars on globe
        for (let i = 0; i < 20; i++) {
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const starGeometry = new THREE.SphereGeometry(0.02, 4, 4);
            const starMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 1.5
            });
            const star = new THREE.Mesh(starGeometry, starMaterial);
            star.position.set(
                x + 0.51 * Math.sin(theta) * Math.cos(phi),
                1.2 + 0.51 * Math.cos(theta),
                z + 0.51 * Math.sin(theta) * Math.sin(phi)
            );
            this.scene.add(star);
        }
    }

    createBookStack(x, z) {
        const books = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < books; i++) {
            const bookGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.4);
            const bookMaterial = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(Math.random(), 0.5, 0.3),
                roughness: 0.9
            });
            const book = new THREE.Mesh(bookGeometry, bookMaterial);
            book.position.set(x, i * 0.05 + 0.025, z);
            book.rotation.y = Math.random() * 0.3;
            this.scene.add(book);
        }
    }

    setupLighting() {
        // Dark blue ambient light (night sky)
        const ambientLight = new THREE.AmbientLight(0x1a1a3e, 0.3);
        this.scene.add(ambientLight);

        // Moonlight from above
        const moonlight = new THREE.DirectionalLight(0x4466aa, 0.4);
        moonlight.position.set(0, 10, 0);
        this.scene.add(moonlight);

        // Candles on tables (warm light)
        const radius = Math.min(this.config.size.width, this.config.size.depth) / 2 - 1;
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
            const dist = radius * 0.5;
            const candleLight = new THREE.PointLight(0xffaa66, 0.5, 4);
            candleLight.position.set(
                Math.cos(angle) * dist,
                1.0,
                Math.sin(angle) * dist
            );
            this.scene.add(candleLight);
        }

        // Telescope lens glow
        const lensLight = new THREE.PointLight(0x4466ff, 0.8, 3);
        lensLight.position.set(-1.3, 2.8, 0);
        this.scene.add(lensLight);
    }
}
