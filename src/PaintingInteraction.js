// PaintingInteraction.js - Handles player interaction with paintings
import * as THREE from 'three';

export class PaintingInteraction {
    constructor(camera, paintings = []) {
        this.camera = camera;
        this.paintings = paintings;

        // Raycasting
        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = 3.0; // Max interaction distance

        // State
        this.currentPainting = null;
        this.isExamining = false;
        this.isShowingInfo = false;

        // UI elements
        this.infoPanel = null;
        this.examineOverlay = null;

        // Input
        this.keys = {};

        this.setupUI();
        this.setupInput();
    }

    /**
     * Setup UI elements for painting interaction
     */
    setupUI() {
        // Info panel (shown when looking at painting)
        this.infoPanel = document.createElement('div');
        this.infoPanel.id = 'painting-info-panel';
        this.infoPanel.style.cssText = `
            position: fixed;
            bottom: 120px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(10, 10, 10, 0.9);
            border: 2px solid rgba(139, 115, 85, 0.6);
            padding: 15px 20px;
            max-width: 500px;
            color: #c0c0c0;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.5;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
            display: none;
            z-index: 1000;
            pointer-events: none;
        `;
        document.body.appendChild(this.infoPanel);

        // Examine overlay (fullscreen painting view)
        this.examineOverlay = document.createElement('div');
        this.examineOverlay.id = 'painting-examine-overlay';
        this.examineOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            cursor: pointer;
        `;

        const examineContent = document.createElement('div');
        examineContent.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            text-align: center;
        `;

        const examineImage = document.createElement('div');
        examineImage.id = 'examine-painting-image';
        examineImage.style.cssText = `
            max-width: 800px;
            max-height: 600px;
            margin: 0 auto 20px;
            border: 8px solid #8b7355;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.9);
        `;

        const examineInfo = document.createElement('div');
        examineInfo.id = 'examine-painting-info';
        examineInfo.style.cssText = `
            color: #c0c0c0;
            font-family: 'Courier New', monospace;
            font-size: 14px;
        `;

        const examineHint = document.createElement('div');
        examineHint.textContent = 'Press ESC or click to close';
        examineHint.style.cssText = `
            color: #808080;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            margin-top: 15px;
        `;

        examineContent.appendChild(examineImage);
        examineContent.appendChild(examineInfo);
        examineContent.appendChild(examineHint);
        this.examineOverlay.appendChild(examineContent);
        document.body.appendChild(this.examineOverlay);

        // Close examine mode on click
        this.examineOverlay.addEventListener('click', () => {
            this.exitExamineMode();
        });
    }

    /**
     * Setup input handlers
     */
    setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            // E key to examine
            if (e.code === 'KeyE' && this.currentPainting && !this.isExamining) {
                this.enterExamineMode();
            }

            // ESC to exit examine mode
            if (e.code === 'Escape' && this.isExamining) {
                this.exitExamineMode();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    /**
     * Add paintings to the interaction system
     * @param {Array<Painting>} paintings - Array of Painting instances
     */
    addPaintings(paintings) {
        this.paintings.push(...paintings);
    }

    /**
     * Update interaction system (call every frame)
     */
    update() {
        if (this.isExamining) {
            return; // Don't raycast while examining
        }

        // Cast ray from camera forward
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

        // Get all painting meshes
        const paintingMeshes = [];
        for (const painting of this.paintings) {
            if (painting.group && painting.canvasMesh) {
                paintingMeshes.push(painting.canvasMesh);
            }
        }

        // Check for intersections
        const intersects = this.raycaster.intersectObjects(paintingMeshes, false);

        if (intersects.length > 0) {
            // Find the painting object from the mesh
            const intersectedMesh = intersects[0].object;
            const painting = this.paintings.find(p => p.canvasMesh === intersectedMesh);

            if (painting) {
                this.showPaintingInfo(painting);
                this.currentPainting = painting;
                this.isShowingInfo = true;
                return;
            }
        }

        // No painting in view
        if (this.isShowingInfo) {
            this.hidePaintingInfo();
            this.currentPainting = null;
            this.isShowingInfo = false;
        }
    }

    /**
     * Show painting information panel
     * @param {Painting} painting - The painting to display info for
     */
    showPaintingInfo(painting) {
        const title = painting.data.title || 'Untitled';
        const artist = painting.data.artist || 'Unknown Artist';
        const description = painting.data.description || 'A mysterious work of art.';
        const style = painting.data.style || 'Unknown Style';

        this.infoPanel.innerHTML = `
            <div style="font-size: 16px; color: #d4af37; margin-bottom: 8px; font-weight: bold;">
                ${title}
            </div>
            <div style="font-size: 12px; color: #a0a0a0; margin-bottom: 10px; font-style: italic;">
                ${artist} - ${style}
            </div>
            <div style="font-size: 13px; margin-bottom: 10px;">
                ${description}
            </div>
            <div style="font-size: 11px; color: #808080; border-top: 1px solid rgba(139, 115, 85, 0.4); padding-top: 8px;">
                Press E to examine closely
            </div>
        `;

        this.infoPanel.style.display = 'block';
    }

    /**
     * Hide painting information panel
     */
    hidePaintingInfo() {
        this.infoPanel.style.display = 'none';
    }

    /**
     * Enter examine mode (fullscreen view)
     */
    enterExamineMode() {
        if (!this.currentPainting) return;

        this.isExamining = true;
        this.hidePaintingInfo();

        const title = this.currentPainting.data.title || 'Untitled';
        const artist = this.currentPainting.data.artist || 'Unknown Artist';
        const description = this.currentPainting.data.description || 'A mysterious work of art.';
        const style = this.currentPainting.data.style || 'Unknown Style';

        // Get the painting's texture as an image
        const imageDiv = document.getElementById('examine-painting-image');
        if (this.currentPainting.texture && this.currentPainting.texture.image) {
            imageDiv.innerHTML = '';
            const img = this.currentPainting.texture.image.cloneNode();
            img.style.cssText = 'max-width: 100%; max-height: 100%; display: block;';
            imageDiv.appendChild(img);
        } else {
            // Use procedurally generated texture (render canvas texture)
            imageDiv.style.width = '600px';
            imageDiv.style.height = '400px';
            imageDiv.style.background = '#3a3a3a';
            imageDiv.innerHTML = '<div style="color: #808080; padding: 150px; text-align: center;">Abstract Art</div>';
        }

        const infoDiv = document.getElementById('examine-painting-info');
        infoDiv.innerHTML = `
            <div style="font-size: 20px; color: #d4af37; margin-bottom: 10px; font-weight: bold;">
                ${title}
            </div>
            <div style="font-size: 14px; color: #a0a0a0; margin-bottom: 15px; font-style: italic;">
                by ${artist}
            </div>
            <div style="font-size: 13px; color: #b0b0b0; margin-bottom: 10px;">
                ${style}
            </div>
            <div style="font-size: 14px; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                ${description}
            </div>
        `;

        this.examineOverlay.style.display = 'flex';

        // Lock pointer if it was locked
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }

    /**
     * Exit examine mode
     */
    exitExamineMode() {
        this.isExamining = false;
        this.examineOverlay.style.display = 'none';
    }

    /**
     * Clean up UI elements
     */
    dispose() {
        if (this.infoPanel && this.infoPanel.parentNode) {
            this.infoPanel.parentNode.removeChild(this.infoPanel);
        }

        if (this.examineOverlay && this.examineOverlay.parentNode) {
            this.examineOverlay.parentNode.removeChild(this.examineOverlay);
        }
    }
}
