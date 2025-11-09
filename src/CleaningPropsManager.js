// CleaningPropsManager.js - Manages cleaning prop models and creation
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Types of cleaning props
 */
export const CleaningPropType = {
    BROOM: 'broom',
    MOP: 'mop',
    BUCKET: 'bucket',
    BARREL: 'barrel',
    BARREL_SMALL: 'barrel_small',
    CRATE: 'crate',
    SACK: 'sack',
    BRUSH: 'brush',
    RAG_PILE: 'rag_pile'
};

/**
 * Manages cleaning prop models and creation
 */
export class CleaningPropsManager {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.config = {
            basePath: config.basePath || '/assets/props/cleaning/',
            useGLTF: config.useGLTF !== false, // Default to true
            ...config
        };

        this.models = new Map();
        this.instances = [];
        this.loader = new GLTFLoader();
        this.isLoaded = false;
    }

    /**
     * Load all cleaning prop models
     */
    async loadModels() {
        console.log('Loading cleaning prop models...');

        // Try to load GLB files first, fallback to procedural
        const loadPromises = [];

        if (this.config.useGLTF) {
            loadPromises.push(this.loadGLTFModel('broom', CleaningPropType.BROOM));
            loadPromises.push(this.loadGLTFModel('mop_bucket', CleaningPropType.MOP));
            loadPromises.push(this.loadGLTFModel('bucket', CleaningPropType.BUCKET));
            loadPromises.push(this.loadGLTFModel('barrel_quaternius', CleaningPropType.BARREL));
            loadPromises.push(this.loadGLTFModel('barrel_kenney', CleaningPropType.BARREL_SMALL));
        }

        // Wait for GLB loading attempts
        await Promise.allSettled(loadPromises);

        // Create procedural fallbacks for any that didn't load
        this.createProceduralFallbacks();

        this.isLoaded = true;
        console.log(`Loaded ${this.models.size} cleaning prop models`);
    }

    /**
     * Load a GLTF/GLB model
     */
    async loadGLTFModel(filename, propType) {
        const path = `${this.config.basePath}models/${filename}.glb`;

        return new Promise((resolve, reject) => {
            this.loader.load(
                path,
                (gltf) => {
                    this.models.set(propType, gltf.scene);
                    console.log(`Loaded GLTF model: ${propType}`);
                    resolve(gltf.scene);
                },
                undefined,
                (error) => {
                    console.warn(`Failed to load GLTF for ${propType}, will use procedural model:`, error.message);
                    reject(error);
                }
            );
        });
    }

    /**
     * Create procedural fallback models for props that didn't load
     */
    createProceduralFallbacks() {
        const propTypes = Object.values(CleaningPropType);

        propTypes.forEach(propType => {
            if (!this.models.has(propType)) {
                const model = this.createProceduralModel(propType);
                if (model) {
                    this.models.set(propType, model);
                    console.log(`Created procedural model: ${propType}`);
                }
            }
        });
    }

    /**
     * Create a procedural 3D model for a cleaning prop
     */
    createProceduralModel(propType) {
        const group = new THREE.Group();

        switch (propType) {
            case CleaningPropType.BROOM:
                group.add(this.createBroom());
                break;
            case CleaningPropType.MOP:
                group.add(this.createMop());
                break;
            case CleaningPropType.BUCKET:
                group.add(this.createBucket());
                break;
            case CleaningPropType.BARREL:
                group.add(this.createBarrel(0.4, 0.6));
                break;
            case CleaningPropType.BARREL_SMALL:
                group.add(this.createBarrel(0.3, 0.4));
                break;
            case CleaningPropType.CRATE:
                group.add(this.createCrate());
                break;
            case CleaningPropType.SACK:
                group.add(this.createSack());
                break;
            case CleaningPropType.BRUSH:
                group.add(this.createBrush());
                break;
            case CleaningPropType.RAG_PILE:
                group.add(this.createRagPile());
                break;
            default:
                console.warn(`Unknown prop type: ${propType}`);
                return null;
        }

        return group;
    }

    /**
     * Create a procedural broom
     */
    createBroom() {
        const group = new THREE.Group();

        // Handle (stick)
        const handleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8);
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.8
        });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.y = 0.6;
        group.add(handle);

        // Bristles
        const bristleGeometry = new THREE.ConeGeometry(0.12, 0.3, 8);
        const bristleMaterial = new THREE.MeshStandardMaterial({
            color: 0xD2B48C,
            roughness: 0.9
        });
        const bristles = new THREE.Mesh(bristleGeometry, bristleMaterial);
        bristles.position.y = 0.15;
        bristles.rotation.y = Math.PI;
        group.add(bristles);

        return group;
    }

    /**
     * Create a procedural mop
     */
    createMop() {
        const group = new THREE.Group();

        // Handle
        const handleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.1, 8);
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: 0x696969,
            roughness: 0.7,
            metalness: 0.1
        });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.y = 0.55;
        group.add(handle);

        // Mop head (cloth strands)
        const mopHeadGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.2, 8);
        const mopHeadMaterial = new THREE.MeshStandardMaterial({
            color: 0xF5F5DC,
            roughness: 0.95
        });
        const mopHead = new THREE.Mesh(mopHeadGeometry, mopHeadMaterial);
        mopHead.position.y = 0.1;
        group.add(mopHead);

        return group;
    }

    /**
     * Create a procedural bucket
     */
    createBucket() {
        const group = new THREE.Group();

        // Bucket body (tapered cylinder)
        const bucketGeometry = new THREE.CylinderGeometry(0.15, 0.12, 0.25, 12);
        const bucketMaterial = new THREE.MeshStandardMaterial({
            color: 0x708090,
            roughness: 0.6,
            metalness: 0.3
        });
        const bucket = new THREE.Mesh(bucketGeometry, bucketMaterial);
        bucket.position.y = 0.125;
        group.add(bucket);

        // Handle
        const handleCurve = new THREE.EllipseCurve(0, 0, 0.12, 0.08, 0, Math.PI, false, 0);
        const handlePoints = handleCurve.getPoints(16);
        const handleGeometry = new THREE.BufferGeometry().setFromPoints(handlePoints);
        const handleMaterial = new THREE.LineBasicMaterial({ color: 0x505050 });
        const handle = new THREE.Line(handleGeometry, handleMaterial);
        handle.position.y = 0.25;
        handle.rotation.x = Math.PI / 2;
        group.add(handle);

        return group;
    }

    /**
     * Create a procedural barrel
     */
    createBarrel(radius = 0.4, height = 0.6) {
        const group = new THREE.Group();

        // Main barrel body
        const barrelGeometry = new THREE.CylinderGeometry(radius * 0.9, radius * 0.85, height, 16);
        const barrelMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B7355,
            roughness: 0.8
        });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.position.y = height / 2;
        group.add(barrel);

        // Metal bands
        const bandMaterial = new THREE.MeshStandardMaterial({
            color: 0x404040,
            roughness: 0.5,
            metalness: 0.6
        });

        const bandGeometry = new THREE.CylinderGeometry(radius, radius, 0.03, 16);

        const topBand = new THREE.Mesh(bandGeometry, bandMaterial);
        topBand.position.y = height * 0.85;
        group.add(topBand);

        const middleBand = new THREE.Mesh(bandGeometry, bandMaterial);
        middleBand.position.y = height / 2;
        group.add(middleBand);

        const bottomBand = new THREE.Mesh(bandGeometry, bandMaterial);
        bottomBand.position.y = height * 0.15;
        group.add(bottomBand);

        return group;
    }

    /**
     * Create a procedural crate
     */
    createCrate() {
        const group = new THREE.Group();

        const crateGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.4);
        const crateMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B7355,
            roughness: 0.9
        });
        const crate = new THREE.Mesh(crateGeometry, crateMaterial);
        crate.position.y = 0.15;
        group.add(crate);

        return group;
    }

    /**
     * Create a procedural sack
     */
    createSack() {
        const group = new THREE.Group();

        const sackGeometry = new THREE.SphereGeometry(0.2, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.7);
        const sackMaterial = new THREE.MeshStandardMaterial({
            color: 0xBDB76B,
            roughness: 0.95
        });
        const sack = new THREE.Mesh(sackGeometry, sackMaterial);
        sack.position.y = 0.1;
        group.add(sack);

        return group;
    }

    /**
     * Create a procedural brush
     */
    createBrush() {
        const group = new THREE.Group();

        // Handle
        const handleGeometry = new THREE.BoxGeometry(0.08, 0.02, 0.15);
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.8
        });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.y = 0.04;
        group.add(handle);

        // Bristles
        const bristleGeometry = new THREE.BoxGeometry(0.08, 0.03, 0.15);
        const bristleMaterial = new THREE.MeshStandardMaterial({
            color: 0xD2B48C,
            roughness: 0.9
        });
        const bristles = new THREE.Mesh(bristleGeometry, bristleMaterial);
        bristles.position.y = 0.015;
        group.add(bristles);

        return group;
    }

    /**
     * Create a procedural rag pile
     */
    createRagPile() {
        const group = new THREE.Group();

        // Stack of irregular cloth shapes
        const colors = [0xF5F5DC, 0xE0E0E0, 0xD3D3D3];

        for (let i = 0; i < 3; i++) {
            const ragGeometry = new THREE.BoxGeometry(
                0.15 + Math.random() * 0.1,
                0.05,
                0.2 + Math.random() * 0.1
            );
            const ragMaterial = new THREE.MeshStandardMaterial({
                color: colors[i % colors.length],
                roughness: 0.95
            });
            const rag = new THREE.Mesh(ragGeometry, ragMaterial);
            rag.position.y = 0.025 + i * 0.03;
            rag.rotation.y = Math.random() * Math.PI;
            group.add(rag);
        }

        return group;
    }

    /**
     * Create a cleaning prop instance
     */
    createProp(propType, position, options = {}) {
        if (!this.models.has(propType)) {
            console.warn(`Model not loaded for prop type: ${propType}`);
            return null;
        }

        const model = this.models.get(propType);
        const instance = model.clone();

        // Position
        instance.position.set(position.x, position.y || 0, position.z);

        // Rotation
        if (options.rotation !== undefined) {
            instance.rotation.y = options.rotation;
        }

        // Random slight rotation for natural look
        if (options.randomRotation) {
            instance.rotation.y += (Math.random() - 0.5) * 0.3;
            instance.rotation.z = (Math.random() - 0.5) * 0.1;
        }

        // Scale
        if (options.scale) {
            instance.scale.setScalar(options.scale);
        }

        // Add to scene
        this.scene.add(instance);
        this.instances.push(instance);

        return instance;
    }

    /**
     * Clean up all instances
     */
    dispose() {
        this.instances.forEach(instance => {
            this.scene.remove(instance);
            if (instance.geometry) instance.geometry.dispose();
            if (instance.material) {
                if (Array.isArray(instance.material)) {
                    instance.material.forEach(mat => mat.dispose());
                } else {
                    instance.material.dispose();
                }
            }
        });
        this.instances = [];
        this.models.clear();
    }
}
