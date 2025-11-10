// DemoRoom.js - A demo room with one of every object for inspection
import * as THREE from 'three';
import { FurnitureManager, FurnitureType } from './FurnitureManager.js';
import { PaintingGallery } from './PaintingGallery.js';
import { Painting } from './Painting.js';

export class DemoRoom {
    constructor(scene, position = { x: 0, z: 0 }) {
        this.scene = scene;
        this.position = position;
        this.objects = [];
        this.lights = [];

        // Room dimensions
        this.width = 40;
        this.height = 40;
        this.wallHeight = 5;

        // Create managers
        this.furnitureManager = new FurnitureManager(scene);
        this.paintingGallery = new PaintingGallery(scene);
    }

    /**
     * Build the demo room with all objects
     */
    async build() {
        console.log('Building Demo Room...');

        // Create room structure
        this.createRoomStructure();

        // Add lots of lighting
        this.addLighting();

        // Place all furniture types
        await this.placeFurniture();

        // Place paintings
        await this.placePaintings();

        // Create info display
        this.createInfoDisplay();

        console.log(`Demo room created with ${this.objects.length} objects`);

        return this.objects;
    }

    /**
     * Create the room walls and floor
     */
    createRoomStructure() {
        const roomX = this.position.x;
        const roomZ = this.position.z;

        // Floor
        const floorGeometry = new THREE.PlaneGeometry(this.width, this.height);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(roomX, 0, roomZ);
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Walls with grid pattern for reference
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.7,
            metalness: 0.1
        });

        // North wall
        const northWall = new THREE.Mesh(
            new THREE.BoxGeometry(this.width, this.wallHeight, 0.2),
            wallMaterial
        );
        northWall.position.set(roomX, this.wallHeight / 2, roomZ - this.height / 2);
        this.scene.add(northWall);

        // South wall
        const southWall = new THREE.Mesh(
            new THREE.BoxGeometry(this.width, this.wallHeight, 0.2),
            wallMaterial
        );
        southWall.position.set(roomX, this.wallHeight / 2, roomZ + this.height / 2);
        this.scene.add(southWall);

        // East wall
        const eastWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, this.wallHeight, this.height),
            wallMaterial
        );
        eastWall.position.set(roomX + this.width / 2, this.wallHeight / 2, roomZ);
        this.scene.add(eastWall);

        // West wall
        const westWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, this.wallHeight, this.height),
            wallMaterial
        );
        westWall.position.set(roomX - this.width / 2, this.wallHeight / 2, roomZ);
        this.scene.add(westWall);
    }

    /**
     * Add bright lighting to see everything clearly
     */
    addLighting() {
        // Bright ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        // Grid of point lights for even illumination
        const lightSpacing = 8;
        const lightRows = Math.floor(this.width / lightSpacing);
        const lightCols = Math.floor(this.height / lightSpacing);

        for (let row = 0; row <= lightRows; row++) {
            for (let col = 0; col <= lightCols; col++) {
                const x = this.position.x - this.width / 2 + row * lightSpacing;
                const z = this.position.z - this.height / 2 + col * lightSpacing;

                const pointLight = new THREE.PointLight(0xffffcc, 0.5, 10);
                pointLight.position.set(x, 3, z);
                this.scene.add(pointLight);
                this.lights.push(pointLight);

                // Add light helper for debugging
                const helper = new THREE.PointLightHelper(pointLight, 0.2);
                this.scene.add(helper);
            }
        }

        console.log(`Added ${this.lights.length} lights to demo room`);
    }

    /**
     * Place one of each furniture type
     */
    async placeFurniture() {
        const furnitureTypes = Object.values(FurnitureType);
        const itemsPerRow = 8;
        const spacing = 3;

        let row = 0;
        let col = 0;

        for (const type of furnitureTypes) {
            const x = this.position.x - this.width / 2 + 3 + col * spacing;
            const z = this.position.z - this.height / 2 + 3 + row * spacing;

            const furniture = this.furnitureManager.createFurniture(
                type,
                { x, y: 0, z },
                {
                    rotation: 0,
                    condition: 'GOOD'
                }
            );

            if (furniture) {
                // Add label
                this.addLabel(furniture, type);
                this.objects.push({
                    type: 'furniture',
                    name: type,
                    object: furniture,
                    position: { x, y: 0, z }
                });
            }

            col++;
            if (col >= itemsPerRow) {
                col = 0;
                row++;
            }
        }

        console.log(`Placed ${furnitureTypes.length} furniture types`);
    }

    /**
     * Place sample paintings
     */
    async placePaintings() {
        await this.paintingGallery.loadManifest();

        const categories = ['portraits', 'landscapes', 'creatures'];
        const frameStyles = ['simple', 'rustic', 'ornate', 'gothic'];

        let paintingIndex = 0;
        const wallPositions = [
            { pos: new THREE.Vector3(this.position.x - 15, 2, this.position.z - this.height / 2 + 1), normal: new THREE.Vector3(0, 0, 1) },
            { pos: new THREE.Vector3(this.position.x - 10, 2, this.position.z - this.height / 2 + 1), normal: new THREE.Vector3(0, 0, 1) },
            { pos: new THREE.Vector3(this.position.x - 5, 2, this.position.z - this.height / 2 + 1), normal: new THREE.Vector3(0, 0, 1) },
            { pos: new THREE.Vector3(this.position.x, 2, this.position.z - this.height / 2 + 1), normal: new THREE.Vector3(0, 0, 1) },
            { pos: new THREE.Vector3(this.position.x + 5, 2, this.position.z - this.height / 2 + 1), normal: new THREE.Vector3(0, 0, 1) },
            { pos: new THREE.Vector3(this.position.x + 10, 2, this.position.z - this.height / 2 + 1), normal: new THREE.Vector3(0, 0, 1) },
            { pos: new THREE.Vector3(this.position.x + 15, 2, this.position.z - this.height / 2 + 1), normal: new THREE.Vector3(0, 0, 1) }
        ];

        for (const category of categories) {
            if (paintingIndex >= wallPositions.length) break;

            const paintingData = this.paintingGallery.getRandomPainting(category);
            if (!paintingData) continue;

            paintingData.width = 1.2;
            paintingData.height = 1.5;

            // Generate texture with visible content
            const texture = this.createTestPaintingTexture(category, paintingIndex);

            const painting = new Painting(paintingData, frameStyles[paintingIndex % frameStyles.length]);
            painting.texture = texture;
            painting.createCanvas();
            painting.createFrame(frameStyles[paintingIndex % frameStyles.length]);
            painting.isLoaded = true;

            const wallPos = wallPositions[paintingIndex];
            painting.placeOnWall(wallPos.pos, wallPos.normal, 0.1);

            this.scene.add(painting.group);

            this.objects.push({
                type: 'painting',
                name: paintingData.title || `${category}_painting`,
                object: painting.group,
                position: wallPos.pos
            });

            paintingIndex++;
        }

        console.log(`Placed ${paintingIndex} paintings`);
    }

    /**
     * Create a test texture with visible content for debugging
     */
    createTestPaintingTexture(category, index) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 256, 256);
        gradient.addColorStop(0, '#663333');
        gradient.addColorStop(1, '#333366');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);

        // Draw category-specific content
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        if (category === 'portraits') {
            // Draw a simple face
            ctx.beginPath();
            ctx.arc(128, 100, 40, 0, Math.PI * 2);
            ctx.stroke();

            // Eyes
            ctx.beginPath();
            ctx.arc(115, 90, 5, 0, Math.PI * 2);
            ctx.arc(140, 90, 5, 0, Math.PI * 2);
            ctx.stroke();

            // Mouth
            ctx.beginPath();
            ctx.arc(128, 105, 15, 0, Math.PI);
            ctx.stroke();
        } else if (category === 'landscapes') {
            // Draw mountains
            ctx.beginPath();
            ctx.moveTo(0, 180);
            ctx.lineTo(80, 100);
            ctx.lineTo(128, 140);
            ctx.lineTo(180, 80);
            ctx.lineTo(256, 160);
            ctx.lineTo(256, 256);
            ctx.lineTo(0, 256);
            ctx.closePath();
            ctx.stroke();

            // Sun
            ctx.beginPath();
            ctx.arc(200, 50, 20, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // Draw creature shape
            ctx.beginPath();
            ctx.moveTo(128, 50);
            ctx.lineTo(100, 100);
            ctx.lineTo(90, 150);
            ctx.lineTo(100, 200);
            ctx.lineTo(128, 180);
            ctx.lineTo(156, 200);
            ctx.lineTo(166, 150);
            ctx.lineTo(156, 100);
            ctx.closePath();
            ctx.stroke();
        }

        // Add text label
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(category.toUpperCase(), 128, 230);
        ctx.fillText(`#${index + 1}`, 128, 250);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        return texture;
    }

    /**
     * Add a text label above an object
     */
    addLabel(object, text) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 256, 64);

        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, 128, 40);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);

        sprite.scale.set(2, 0.5, 1);
        sprite.position.copy(object.position);
        sprite.position.y += 2;

        this.scene.add(sprite);
    }

    /**
     * Create info display panel
     */
    createInfoDisplay() {
        const infoDiv = document.createElement('div');
        infoDiv.id = 'demo-room-info';
        infoDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border: 2px solid #444;
            font-family: monospace;
            font-size: 12px;
            z-index: 1000;
            max-height: 80vh;
            overflow-y: auto;
        `;

        infoDiv.innerHTML = `
            <h3>Demo Room Inspector</h3>
            <p>Total Objects: ${this.objects.length}</p>
            <p>Furniture Types: ${Object.keys(FurnitureType).length}</p>
            <p>Lights: ${this.lights.length}</p>
            <hr>
            <h4>Object List:</h4>
            <ul style="list-style: none; padding: 0;">
                ${this.objects.map(obj => `
                    <li style="margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.1);">
                        <strong>${obj.type}:</strong> ${obj.name}<br>
                        <small>Pos: (${obj.position.x.toFixed(1)}, ${obj.position.y.toFixed(1)}, ${obj.position.z.toFixed(1)})</small>
                    </li>
                `).join('')}
            </ul>
        `;

        document.body.appendChild(infoDiv);
    }

    /**
     * Clean up demo room
     */
    dispose() {
        // Remove info display
        const infoDiv = document.getElementById('demo-room-info');
        if (infoDiv) {
            infoDiv.remove();
        }

        // Dispose of objects
        for (const obj of this.objects) {
            if (obj.object) {
                this.scene.remove(obj.object);
                // Dispose geometry and materials
                if (obj.object.geometry) obj.object.geometry.dispose();
                if (obj.object.material) {
                    if (Array.isArray(obj.object.material)) {
                        obj.object.material.forEach(mat => mat.dispose());
                    } else {
                        obj.object.material.dispose();
                    }
                }
            }
        }

        // Remove lights
        for (const light of this.lights) {
            this.scene.remove(light);
        }

        this.objects = [];
        this.lights = [];
    }
}