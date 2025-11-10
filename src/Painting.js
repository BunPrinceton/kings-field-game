// Painting.js - Individual painting with frame system
import * as THREE from 'three';

export class Painting {
    constructor(paintingData, frameStyle = 'simple') {
        this.data = paintingData;
        this.frameStyle = frameStyle;

        // Meshes
        this.group = new THREE.Group();
        this.canvasMesh = null;
        this.frameMesh = null;
        this.light = null;

        // Texture
        this.texture = null;
        this.textureLoader = new THREE.TextureLoader();

        // State
        this.isLoaded = false;
        this.loadError = false;
    }

    /**
     * Load the painting texture and create geometry
     * @returns {Promise<boolean>} Success status
     */
    async load() {
        try {
            // Load texture
            await this.loadTexture();

            // Create canvas mesh
            this.createCanvas();

            // Create frame mesh
            this.createFrame(this.frameStyle);

            // Add optional lighting
            if (this.data.hasLight !== false) {
                this.createLight();
            }

            this.isLoaded = true;
            return true;
        } catch (error) {
            console.error(`Failed to load painting: ${this.data.id}`, error);
            this.loadError = true;
            this.createFallbackPainting();
            return false;
        }
    }

    /**
     * Load the painting texture from path
     * @returns {Promise<THREE.Texture>}
     */
    async loadTexture() {
        return new Promise((resolve, reject) => {
            // Handle relative paths by adding /assets/paintings/ prefix if needed
            let texturePath = this.data.path;
            if (texturePath && !texturePath.startsWith('/')) {
                texturePath = `/assets/paintings/${texturePath}`;
            }

            this.textureLoader.load(
                texturePath,
                (texture) => {
                    this.texture = texture;
                    this.texture.minFilter = THREE.LinearMipmapLinearFilter;
                    this.texture.magFilter = THREE.LinearFilter;
                    this.texture.generateMipmaps = true;
                    this.texture.anisotropy = 4; // Better quality at angles
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.warn(`Failed to load texture: ${texturePath}`, error);
                    reject(error);
                }
            );
        });
    }

    /**
     * Create the canvas plane with painting texture
     */
    createCanvas() {
        const width = this.data.width || 1.0;
        const height = this.data.height || 1.2;

        const geometry = new THREE.PlaneGeometry(width, height);

        // Check if texture exists, otherwise create a default color
        if (this.texture) {
            // Use the texture if available
            const material = new THREE.MeshStandardMaterial({
                map: this.texture,
                roughness: 0.8,
                metalness: 0.1,
                emissive: 0x000000,
                emissiveIntensity: 0.0
            });
            material.needsUpdate = true;
            this.canvasMesh = new THREE.Mesh(geometry, material);
        } else {
            // Fallback to a solid color if no texture
            console.warn(`No texture for painting ${this.data.id}, using fallback color`);
            const material = new THREE.MeshStandardMaterial({
                color: 0x6B4423,
                roughness: 0.8,
                metalness: 0.1
            });
            this.canvasMesh = new THREE.Mesh(geometry, material);
        }

        this.canvasMesh.castShadow = false;
        this.canvasMesh.receiveShadow = true;

        this.group.add(this.canvasMesh);
    }

    /**
     * Create frame geometry based on style
     * @param {string} style - Frame style: 'ornate', 'simple', 'rustic', 'gothic'
     */
    createFrame(style) {
        const width = this.data.width || 1.0;
        const height = this.data.height || 1.2;

        switch (style) {
            case 'ornate':
                this.createOrnateFrame(width, height);
                break;
            case 'rustic':
                this.createRusticFrame(width, height);
                break;
            case 'gothic':
                this.createGothicFrame(width, height);
                break;
            case 'simple':
            default:
                this.createSimpleFrame(width, height);
                break;
        }
    }

    /**
     * Create a simple wooden frame
     */
    createSimpleFrame(width, height) {
        const frameThickness = 0.08;
        const frameDepth = 0.05;
        const frameColor = 0x4a3020;

        const frameMaterial = new THREE.MeshStandardMaterial({
            color: frameColor,
            roughness: 0.85,
            metalness: 0.0
        });

        const frameGroup = new THREE.Group();

        // Top bar
        const topGeometry = new THREE.BoxGeometry(
            width + frameThickness * 2,
            frameThickness,
            frameDepth
        );
        const top = new THREE.Mesh(topGeometry, frameMaterial);
        top.position.y = height / 2 + frameThickness / 2;
        top.position.z = -frameDepth / 2;
        frameGroup.add(top);

        // Bottom bar
        const bottom = new THREE.Mesh(topGeometry, frameMaterial);
        bottom.position.y = -height / 2 - frameThickness / 2;
        bottom.position.z = -frameDepth / 2;
        frameGroup.add(bottom);

        // Left bar
        const sideGeometry = new THREE.BoxGeometry(
            frameThickness,
            height,
            frameDepth
        );
        const left = new THREE.Mesh(sideGeometry, frameMaterial);
        left.position.x = -width / 2 - frameThickness / 2;
        left.position.z = -frameDepth / 2;
        frameGroup.add(left);

        // Right bar
        const right = new THREE.Mesh(sideGeometry, frameMaterial);
        right.position.x = width / 2 + frameThickness / 2;
        right.position.z = -frameDepth / 2;
        frameGroup.add(right);

        this.frameMesh = frameGroup;
        this.group.add(frameGroup);
    }

    /**
     * Create an ornate gold frame with bevels
     */
    createOrnateFrame(width, height) {
        const frameThickness = 0.12;
        const frameDepth = 0.08;
        const frameColor = 0xd4af37; // Gold

        const frameMaterial = new THREE.MeshStandardMaterial({
            color: frameColor,
            roughness: 0.4,
            metalness: 0.7,
            emissive: 0x332200,
            emissiveIntensity: 0.1
        });

        const frameGroup = new THREE.Group();

        // Create extruded shape for ornate look
        const shape = new THREE.Shape();
        shape.moveTo(-frameThickness / 2, 0);
        shape.lineTo(-frameThickness / 3, frameDepth / 3);
        shape.lineTo(0, frameDepth / 2);
        shape.lineTo(frameThickness / 3, frameDepth / 3);
        shape.lineTo(frameThickness / 2, 0);
        shape.lineTo(0, -frameDepth / 4);
        shape.closePath();

        const extrudeSettings = {
            depth: 0.01,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.01,
            bevelSegments: 2
        };

        // Top bar
        const topLength = width + frameThickness * 2;
        const topGeometry = new THREE.ExtrudeGeometry(shape, { ...extrudeSettings, depth: topLength });
        const top = new THREE.Mesh(topGeometry, frameMaterial);
        top.rotation.z = Math.PI / 2;
        top.rotation.y = Math.PI / 2;
        top.position.y = height / 2 + frameThickness / 2;
        top.position.x = -topLength / 2;
        frameGroup.add(top);

        // Bottom bar
        const bottom = new THREE.Mesh(topGeometry, frameMaterial);
        bottom.rotation.z = Math.PI / 2;
        bottom.rotation.y = Math.PI / 2;
        bottom.position.y = -height / 2 - frameThickness / 2;
        bottom.position.x = -topLength / 2;
        frameGroup.add(bottom);

        // Left bar
        const sideLength = height;
        const sideGeometry = new THREE.ExtrudeGeometry(shape, { ...extrudeSettings, depth: sideLength });
        const left = new THREE.Mesh(sideGeometry, frameMaterial);
        left.rotation.z = Math.PI / 2;
        left.rotation.y = Math.PI / 2;
        left.rotation.x = Math.PI / 2;
        left.position.x = -width / 2 - frameThickness / 2;
        left.position.y = -sideLength / 2;
        frameGroup.add(left);

        // Right bar
        const right = new THREE.Mesh(sideGeometry, frameMaterial);
        right.rotation.z = Math.PI / 2;
        right.rotation.y = Math.PI / 2;
        right.rotation.x = Math.PI / 2;
        right.position.x = width / 2 + frameThickness / 2;
        right.position.y = -sideLength / 2;
        frameGroup.add(right);

        this.frameMesh = frameGroup;
        this.group.add(frameGroup);
    }

    /**
     * Create a rustic dark wood frame
     */
    createRusticFrame(width, height) {
        const frameThickness = 0.10;
        const frameDepth = 0.06;
        const frameColor = 0x2a1a0a;

        const frameMaterial = new THREE.MeshStandardMaterial({
            color: frameColor,
            roughness: 0.95,
            metalness: 0.0
        });

        const frameGroup = new THREE.Group();

        // Top bar (with slight irregularity)
        const topGeometry = new THREE.BoxGeometry(
            width + frameThickness * 2,
            frameThickness,
            frameDepth
        );
        const top = new THREE.Mesh(topGeometry, frameMaterial);
        top.position.y = height / 2 + frameThickness / 2;
        top.position.z = -frameDepth / 2;
        top.rotation.z = (Math.random() - 0.5) * 0.02; // Slight tilt
        frameGroup.add(top);

        // Bottom bar
        const bottom = new THREE.Mesh(topGeometry, frameMaterial);
        bottom.position.y = -height / 2 - frameThickness / 2;
        bottom.position.z = -frameDepth / 2;
        bottom.rotation.z = (Math.random() - 0.5) * 0.02;
        frameGroup.add(bottom);

        // Left bar
        const sideGeometry = new THREE.BoxGeometry(
            frameThickness,
            height + frameThickness,
            frameDepth
        );
        const left = new THREE.Mesh(sideGeometry, frameMaterial);
        left.position.x = -width / 2 - frameThickness / 2;
        left.position.z = -frameDepth / 2;
        frameGroup.add(left);

        // Right bar
        const right = new THREE.Mesh(sideGeometry, frameMaterial);
        right.position.x = width / 2 + frameThickness / 2;
        right.position.z = -frameDepth / 2;
        frameGroup.add(right);

        this.frameMesh = frameGroup;
        this.group.add(frameGroup);
    }

    /**
     * Create a gothic black iron frame
     */
    createGothicFrame(width, height) {
        const frameThickness = 0.06;
        const frameDepth = 0.04;
        const frameColor = 0x1a1a1a;

        const frameMaterial = new THREE.MeshStandardMaterial({
            color: frameColor,
            roughness: 0.6,
            metalness: 0.8
        });

        const frameGroup = new THREE.Group();

        // Main frame bars
        const topGeometry = new THREE.BoxGeometry(
            width + frameThickness * 2,
            frameThickness,
            frameDepth
        );
        const top = new THREE.Mesh(topGeometry, frameMaterial);
        top.position.y = height / 2 + frameThickness / 2;
        top.position.z = -frameDepth / 2;
        frameGroup.add(top);

        const bottom = new THREE.Mesh(topGeometry, frameMaterial);
        bottom.position.y = -height / 2 - frameThickness / 2;
        bottom.position.z = -frameDepth / 2;
        frameGroup.add(bottom);

        const sideGeometry = new THREE.BoxGeometry(
            frameThickness,
            height,
            frameDepth
        );
        const left = new THREE.Mesh(sideGeometry, frameMaterial);
        left.position.x = -width / 2 - frameThickness / 2;
        left.position.z = -frameDepth / 2;
        frameGroup.add(left);

        const right = new THREE.Mesh(sideGeometry, frameMaterial);
        right.position.x = width / 2 + frameThickness / 2;
        right.position.z = -frameDepth / 2;
        frameGroup.add(right);

        // Add gothic pointed corners
        const cornerSize = frameThickness * 1.5;
        const cornerGeometry = new THREE.ConeGeometry(cornerSize / 2, cornerSize, 4);

        const corners = [
            { x: -width / 2 - frameThickness / 2, y: height / 2 + frameThickness / 2 },
            { x: width / 2 + frameThickness / 2, y: height / 2 + frameThickness / 2 },
            { x: -width / 2 - frameThickness / 2, y: -height / 2 - frameThickness / 2 },
            { x: width / 2 + frameThickness / 2, y: -height / 2 - frameThickness / 2 }
        ];

        corners.forEach(pos => {
            const corner = new THREE.Mesh(cornerGeometry, frameMaterial);
            corner.position.set(pos.x, pos.y, -frameDepth / 2);
            corner.rotation.x = Math.PI / 2;
            corner.rotation.z = Math.PI / 4;
            frameGroup.add(corner);
        });

        this.frameMesh = frameGroup;
        this.group.add(frameGroup);
    }

    /**
     * Create a subtle light above the painting for gallery effect
     */
    createLight() {
        const width = this.data.width || 1.0;
        const height = this.data.height || 1.2;

        const light = new THREE.SpotLight(0xFFE8CC, 0.3, 3, Math.PI / 6, 0.5, 1);
        light.position.set(0, height / 2 + 0.5, 0.3);
        light.target.position.set(0, 0, 0);

        this.light = light;
        this.group.add(light);
        this.group.add(light.target);
    }

    /**
     * Create a fallback painting when texture fails to load
     */
    createFallbackPainting() {
        const width = this.data.width || 1.0;
        const height = this.data.height || 1.2;

        // Create a simple colored rectangle as fallback
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.9,
            metalness: 0.1
        });

        this.canvasMesh = new THREE.Mesh(geometry, material);
        this.group.add(this.canvasMesh);

        // Still add frame
        this.createFrame(this.frameStyle);
    }

    /**
     * Place painting on a wall
     * @param {THREE.Vector3} position - World position
     * @param {THREE.Vector3} normal - Wall normal vector
     * @param {number} offsetFromWall - Distance from wall (prevents z-fighting)
     */
    placeOnWall(position, normal, offsetFromWall = 0.02) {
        // Position the painting
        const offset = normal.clone().multiplyScalar(offsetFromWall);
        this.group.position.copy(position.add(offset));

        // Rotate to face outward from wall
        const angle = Math.atan2(normal.x, normal.z);
        this.group.rotation.y = angle;
    }

    /**
     * Set the frame style and rebuild frame
     * @param {string} style - New frame style
     */
    setFrameStyle(style) {
        if (this.frameMesh) {
            this.group.remove(this.frameMesh);
            this.disposeMesh(this.frameMesh);
        }

        this.frameStyle = style;
        this.createFrame(style);
    }

    /**
     * Set painting size and rebuild geometry
     * @param {number} width - New width
     * @param {number} height - New height
     */
    setSize(width, height) {
        this.data.width = width;
        this.data.height = height;

        // Rebuild canvas
        if (this.canvasMesh) {
            this.group.remove(this.canvasMesh);
            this.disposeMesh(this.canvasMesh);
            this.createCanvas();
        }

        // Rebuild frame
        if (this.frameMesh) {
            this.group.remove(this.frameMesh);
            this.disposeMesh(this.frameMesh);
            this.createFrame(this.frameStyle);
        }

        // Rebuild light
        if (this.light) {
            this.group.remove(this.light);
            this.group.remove(this.light.target);
            this.createLight();
        }
    }

    /**
     * Get the Three.js group containing all meshes
     * @returns {THREE.Group}
     */
    getGroup() {
        return this.group;
    }

    /**
     * Dispose of a mesh and its geometry/materials
     * @param {THREE.Object3D} mesh - Mesh or group to dispose
     */
    disposeMesh(mesh) {
        if (mesh instanceof THREE.Group) {
            mesh.children.forEach(child => this.disposeMesh(child));
        } else {
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(mat => mat.dispose());
                } else {
                    mesh.material.dispose();
                }
            }
        }
    }

    /**
     * Clean up all resources
     */
    dispose() {
        // Dispose texture
        if (this.texture) {
            this.texture.dispose();
        }

        // Dispose meshes
        if (this.canvasMesh) {
            this.disposeMesh(this.canvasMesh);
        }

        if (this.frameMesh) {
            this.disposeMesh(this.frameMesh);
        }

        // Remove light
        if (this.light) {
            this.light = null;
        }

        // Clear group
        this.group.clear();
    }
}
