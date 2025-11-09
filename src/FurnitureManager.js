// FurnitureManager.js - Comprehensive furniture and structural elements system
import * as THREE from 'three';

/**
 * Furniture types and categories
 */
export const FurnitureType = {
    // Doors (with functionality)
    WOODEN_DOOR: 'wooden_door',
    IRON_DOOR: 'iron_door',
    ORNATE_DOOR: 'ornate_door',
    REINFORCED_DOOR: 'reinforced_door',
    BROKEN_DOOR: 'broken_door',

    // Gates
    PORTCULLIS: 'portcullis',
    LARGE_GATE: 'large_gate',
    DUNGEON_GATE: 'dungeon_gate',

    // Tables
    DINING_TABLE: 'dining_table',
    WORK_TABLE: 'work_table',
    ROUND_TABLE: 'round_table',
    BANQUET_TABLE: 'banquet_table',

    // Chairs and Seating
    WOODEN_CHAIR: 'wooden_chair',
    THRONE: 'throne',
    BENCH: 'bench',
    STOOL: 'stool',

    // Beds
    STRAW_BED: 'straw_bed',
    WOODEN_BED: 'wooden_bed',
    CANOPY_BED: 'canopy_bed',

    // Storage
    SHELF: 'shelf',
    BOOKCASE: 'bookcase',
    CABINET: 'cabinet',
    WARDROBE: 'wardrobe',
    CHEST: 'chest',

    // Equipment Storage
    WEAPON_RACK: 'weapon_rack',
    ARMOR_STAND: 'armor_stand',
    SHIELD_RACK: 'shield_rack',

    // Miscellaneous
    DESK: 'desk',
    CRATE_SMALL: 'crate_small',
    CRATE_MEDIUM: 'crate_medium',
    CRATE_LARGE: 'crate_large',
    BARREL_SMALL: 'barrel_small',
    BARREL_LARGE: 'barrel_large',
    BOX: 'box',
    DEBRIS_PILE: 'debris_pile',
    BROKEN_FURNITURE: 'broken_furniture',
    CHANDELIER: 'chandelier',
    CANDELABRA: 'candelabra',
    LECTERN: 'lectern',
    ANVIL: 'anvil',
    FORGE: 'forge',
    COFFIN: 'coffin',
    SARCOPHAGUS: 'sarcophagus'
};

/**
 * Furniture condition states
 */
export const FurnitureCondition = {
    PRISTINE: 'pristine',
    GOOD: 'good',
    WORN: 'worn',
    DAMAGED: 'damaged',
    BROKEN: 'broken'
};

/**
 * Main furniture manager class
 */
export class FurnitureManager {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.config = {
            cellSize: config.cellSize || 4,
            wallHeight: config.wallHeight || 3,
            enableInteraction: config.enableInteraction !== undefined ? config.enableInteraction : true,
            defaultCondition: config.defaultCondition || FurnitureCondition.WORN,
            ...config
        };

        // Store all furniture instances
        this.furniture = [];
        this.interactables = new Map(); // Map of mesh to furniture instance

        // Material cache to reduce duplicates
        this.materialCache = new Map();

        // Animation tracking for doors and gates
        this.animating = new Set();
    }

    /**
     * Create a furniture piece at a specified location
     */
    createFurniture(type, position, options = {}) {
        const furnitureData = {
            type,
            position: new THREE.Vector3(position.x, position.y || 0, position.z),
            rotation: options.rotation || 0,
            condition: options.condition || this.config.defaultCondition,
            scale: options.scale || 1,
            interactable: options.interactable !== undefined ? options.interactable : false,
            state: options.state || {} // For doors (open/closed), chests (open/closed), etc.
        };

        let furnitureObject;

        // Create the appropriate furniture based on type
        switch (type) {
            // DOORS
            case FurnitureType.WOODEN_DOOR:
                furnitureObject = this.createWoodenDoor(furnitureData);
                break;
            case FurnitureType.IRON_DOOR:
                furnitureObject = this.createIronDoor(furnitureData);
                break;
            case FurnitureType.ORNATE_DOOR:
                furnitureObject = this.createOrnateDoor(furnitureData);
                break;
            case FurnitureType.REINFORCED_DOOR:
                furnitureObject = this.createReinforcedDoor(furnitureData);
                break;
            case FurnitureType.BROKEN_DOOR:
                furnitureObject = this.createBrokenDoor(furnitureData);
                break;

            // GATES
            case FurnitureType.PORTCULLIS:
                furnitureObject = this.createPortcullis(furnitureData);
                break;
            case FurnitureType.LARGE_GATE:
                furnitureObject = this.createLargeGate(furnitureData);
                break;
            case FurnitureType.DUNGEON_GATE:
                furnitureObject = this.createDungeonGate(furnitureData);
                break;

            // TABLES
            case FurnitureType.DINING_TABLE:
                furnitureObject = this.createDiningTable(furnitureData);
                break;
            case FurnitureType.WORK_TABLE:
                furnitureObject = this.createWorkTable(furnitureData);
                break;
            case FurnitureType.ROUND_TABLE:
                furnitureObject = this.createRoundTable(furnitureData);
                break;
            case FurnitureType.BANQUET_TABLE:
                furnitureObject = this.createBanquetTable(furnitureData);
                break;

            // CHAIRS
            case FurnitureType.WOODEN_CHAIR:
                furnitureObject = this.createWoodenChair(furnitureData);
                break;
            case FurnitureType.THRONE:
                furnitureObject = this.createThrone(furnitureData);
                break;
            case FurnitureType.BENCH:
                furnitureObject = this.createBench(furnitureData);
                break;
            case FurnitureType.STOOL:
                furnitureObject = this.createStool(furnitureData);
                break;

            // BEDS
            case FurnitureType.STRAW_BED:
                furnitureObject = this.createStrawBed(furnitureData);
                break;
            case FurnitureType.WOODEN_BED:
                furnitureObject = this.createWoodenBed(furnitureData);
                break;
            case FurnitureType.CANOPY_BED:
                furnitureObject = this.createCanopyBed(furnitureData);
                break;

            // STORAGE
            case FurnitureType.SHELF:
                furnitureObject = this.createShelf(furnitureData);
                break;
            case FurnitureType.BOOKCASE:
                furnitureObject = this.createBookcase(furnitureData);
                break;
            case FurnitureType.CABINET:
                furnitureObject = this.createCabinet(furnitureData);
                break;
            case FurnitureType.WARDROBE:
                furnitureObject = this.createWardrobe(furnitureData);
                break;
            case FurnitureType.CHEST:
                furnitureObject = this.createChest(furnitureData);
                break;

            // EQUIPMENT STORAGE
            case FurnitureType.WEAPON_RACK:
                furnitureObject = this.createWeaponRack(furnitureData);
                break;
            case FurnitureType.ARMOR_STAND:
                furnitureObject = this.createArmorStand(furnitureData);
                break;
            case FurnitureType.SHIELD_RACK:
                furnitureObject = this.createShieldRack(furnitureData);
                break;

            // MISC
            case FurnitureType.DESK:
                furnitureObject = this.createDesk(furnitureData);
                break;
            case FurnitureType.CRATE_SMALL:
                furnitureObject = this.createCrate(furnitureData, 0.6);
                break;
            case FurnitureType.CRATE_MEDIUM:
                furnitureObject = this.createCrate(furnitureData, 1.0);
                break;
            case FurnitureType.CRATE_LARGE:
                furnitureObject = this.createCrate(furnitureData, 1.5);
                break;
            case FurnitureType.BARREL_SMALL:
                furnitureObject = this.createBarrel(furnitureData, 0.6);
                break;
            case FurnitureType.BARREL_LARGE:
                furnitureObject = this.createBarrel(furnitureData, 1.0);
                break;
            case FurnitureType.BOX:
                furnitureObject = this.createBox(furnitureData);
                break;
            case FurnitureType.DEBRIS_PILE:
                furnitureObject = this.createDebrisPile(furnitureData);
                break;
            case FurnitureType.BROKEN_FURNITURE:
                furnitureObject = this.createBrokenFurniture(furnitureData);
                break;
            case FurnitureType.CHANDELIER:
                furnitureObject = this.createChandelier(furnitureData);
                break;
            case FurnitureType.CANDELABRA:
                furnitureObject = this.createCandelabra(furnitureData);
                break;
            case FurnitureType.LECTERN:
                furnitureObject = this.createLectern(furnitureData);
                break;
            case FurnitureType.ANVIL:
                furnitureObject = this.createAnvil(furnitureData);
                break;
            case FurnitureType.FORGE:
                furnitureObject = this.createForge(furnitureData);
                break;
            case FurnitureType.COFFIN:
                furnitureObject = this.createCoffin(furnitureData);
                break;
            case FurnitureType.SARCOPHAGUS:
                furnitureObject = this.createSarcophagus(furnitureData);
                break;

            default:
                console.warn(`Unknown furniture type: ${type}`);
                return null;
        }

        if (furnitureObject) {
            // Store metadata
            furnitureObject.userData.furnitureData = furnitureData;
            furnitureObject.userData.furnitureType = type;

            // Add to scene
            this.scene.add(furnitureObject);
            this.furniture.push(furnitureObject);

            // Track interactable furniture
            if (furnitureData.interactable) {
                this.interactables.set(furnitureObject, furnitureData);
            }
        }

        return furnitureObject;
    }

    // ==================== DOOR CREATION METHODS ====================

    createWoodenDoor(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition);

        // Door panel
        const doorGeometry = new THREE.BoxGeometry(1.6, 2.4, 0.1);
        const door = new THREE.Mesh(doorGeometry, woodMat);

        // Add cross beams
        const beamGeometry = new THREE.BoxGeometry(1.4, 0.1, 0.12);
        const topBeam = new THREE.Mesh(beamGeometry, woodMat);
        topBeam.position.set(0, 0.8, 0);
        const bottomBeam = new THREE.Mesh(beamGeometry, woodMat);
        bottomBeam.position.set(0, -0.8, 0);

        group.add(door);
        group.add(topBeam);
        group.add(bottomBeam);

        // Add metal handle
        const handleMat = this.getMetalMaterial('iron', data.condition);
        const handleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
        const handle = new THREE.Mesh(handleGeometry, handleMat);
        handle.position.set(0.6, 0, 0.1);
        handle.rotation.z = Math.PI / 2;
        group.add(handle);

        // Position and setup
        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        // Initialize door state
        if (!data.state.isOpen) {
            data.state.isOpen = false;
        }

        return group;
    }

    createIronDoor(data) {
        const group = new THREE.Group();
        const ironMat = this.getMetalMaterial('iron', data.condition);

        // Main door panel
        const doorGeometry = new THREE.BoxGeometry(1.6, 2.4, 0.15);
        const door = new THREE.Mesh(doorGeometry, ironMat);
        group.add(door);

        // Metal rivets
        const rivetGeometry = new THREE.SphereGeometry(0.04, 8, 8);
        const rivetMat = this.getMetalMaterial('dark_iron', data.condition);

        for (let y = -1; y <= 1; y += 0.5) {
            for (let x = -0.6; x <= 0.6; x += 0.4) {
                const rivet = new THREE.Mesh(rivetGeometry, rivetMat);
                rivet.position.set(x, y, 0.08);
                group.add(rivet);
            }
        }

        // Heavy handle
        const handleGeometry = new THREE.TorusGeometry(0.15, 0.03, 8, 12);
        const handle = new THREE.Mesh(handleGeometry, ironMat);
        handle.position.set(0.5, 0, 0.1);
        group.add(handle);

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        if (!data.state.isOpen) {
            data.state.isOpen = false;
        }

        return group;
    }

    createOrnateDoor(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition, 0x6a4a2a); // Richer wood
        const goldMat = this.getMetalMaterial('gold', data.condition);

        // Carved door panels
        const leftPanel = new THREE.BoxGeometry(0.7, 2.4, 0.12);
        const rightPanel = new THREE.BoxGeometry(0.7, 2.4, 0.12);
        const left = new THREE.Mesh(leftPanel, woodMat);
        const right = new THREE.Mesh(rightPanel, woodMat);
        left.position.x = -0.4;
        right.position.x = 0.4;
        group.add(left);
        group.add(right);

        // Ornate frame
        const frameGeometry = new THREE.BoxGeometry(1.8, 2.6, 0.08);
        const frame = new THREE.Mesh(frameGeometry, goldMat);
        frame.position.z = -0.05;
        group.add(frame);

        // Decorative elements
        const ornamentGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const topOrnament = new THREE.Mesh(ornamentGeometry, goldMat);
        topOrnament.position.set(0, 1.2, 0.08);
        group.add(topOrnament);

        // Twin handles
        const handleGeometry = new THREE.TorusGeometry(0.12, 0.025, 8, 12);
        const handleLeft = new THREE.Mesh(handleGeometry, goldMat);
        const handleRight = new THREE.Mesh(handleGeometry, goldMat);
        handleLeft.position.set(-0.3, 0, 0.1);
        handleRight.position.set(0.3, 0, 0.1);
        group.add(handleLeft);
        group.add(handleRight);

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        if (!data.state.isOpen) {
            data.state.isOpen = false;
        }

        return group;
    }

    createReinforcedDoor(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition, 0x3a2a1a);
        const ironMat = this.getMetalMaterial('iron', data.condition);

        // Thick wooden door
        const doorGeometry = new THREE.BoxGeometry(1.6, 2.4, 0.2);
        const door = new THREE.Mesh(doorGeometry, woodMat);
        group.add(door);

        // Metal reinforcement bands
        const bandGeometry = new THREE.BoxGeometry(1.7, 0.15, 0.05);
        for (let i = 0; i < 4; i++) {
            const band = new THREE.Mesh(bandGeometry, ironMat);
            band.position.set(0, -1 + i * 0.6, 0.11);
            group.add(band);
        }

        // Corner reinforcements
        const cornerGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.05);
        const corners = [
            [-0.7, 1.1], [0.7, 1.1], [-0.7, -1.1], [0.7, -1.1]
        ];
        corners.forEach(([x, y]) => {
            const corner = new THREE.Mesh(cornerGeometry, ironMat);
            corner.position.set(x, y, 0.11);
            group.add(corner);
        });

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        if (!data.state.isOpen) {
            data.state.isOpen = false;
        }

        return group;
    }

    createBrokenDoor(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(FurnitureCondition.BROKEN);

        // Broken door pieces at odd angles
        const piece1 = new THREE.BoxGeometry(0.8, 1.5, 0.1);
        const piece2 = new THREE.BoxGeometry(0.6, 1.0, 0.1);
        const mesh1 = new THREE.Mesh(piece1, woodMat);
        const mesh2 = new THREE.Mesh(piece2, woodMat);

        mesh1.position.set(-0.3, -0.4, 0);
        mesh1.rotation.z = 0.3;
        mesh2.position.set(0.4, 0.6, 0);
        mesh2.rotation.z = -0.4;

        group.add(mesh1);
        group.add(mesh2);

        // Hanging hinge
        const hingeGeometry = new THREE.BoxGeometry(0.1, 0.15, 0.05);
        const hingeMat = this.getMetalMaterial('iron', FurnitureCondition.BROKEN);
        const hinge = new THREE.Mesh(hingeGeometry, hingeMat);
        hinge.position.set(-0.7, 1.0, 0);
        hinge.rotation.z = 0.5;
        group.add(hinge);

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    // ==================== GATE CREATION METHODS ====================

    createPortcullis(data) {
        const group = new THREE.Group();
        const ironMat = this.getMetalMaterial('dark_iron', data.condition);

        // Vertical bars
        const barGeometry = new THREE.BoxGeometry(0.1, 2.8, 0.1);
        for (let i = 0; i < 6; i++) {
            const bar = new THREE.Mesh(barGeometry, ironMat);
            bar.position.x = -1.25 + i * 0.5;
            bar.position.y = 1.4;
            group.add(bar);
        }

        // Horizontal cross bars
        const crossBarGeometry = new THREE.BoxGeometry(3.0, 0.1, 0.1);
        for (let i = 0; i < 4; i++) {
            const crossBar = new THREE.Mesh(crossBarGeometry, ironMat);
            crossBar.position.y = 0.5 + i * 0.8;
            group.add(crossBar);
        }

        // Spikes at bottom
        const spikeGeometry = new THREE.ConeGeometry(0.08, 0.3, 4);
        for (let i = 0; i < 6; i++) {
            const spike = new THREE.Mesh(spikeGeometry, ironMat);
            spike.position.x = -1.25 + i * 0.5;
            spike.position.y = -0.15;
            spike.rotation.x = Math.PI;
            group.add(spike);
        }

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        if (!data.state.raised) {
            data.state.raised = false;
        }

        return group;
    }

    createLargeGate(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition);
        const ironMat = this.getMetalMaterial('iron', data.condition);

        // Two large door panels
        const panelGeometry = new THREE.BoxGeometry(1.8, 3.0, 0.2);
        const leftPanel = new THREE.Mesh(panelGeometry, woodMat);
        const rightPanel = new THREE.Mesh(panelGeometry, woodMat);

        leftPanel.position.set(-1.8, 1.5, 0);
        rightPanel.position.set(1.8, 1.5, 0);

        group.add(leftPanel);
        group.add(rightPanel);

        // Metal reinforcements on each panel
        const bandGeometry = new THREE.BoxGeometry(1.9, 0.2, 0.05);
        for (let panel of [leftPanel, rightPanel]) {
            for (let i = 0; i < 3; i++) {
                const band = new THREE.Mesh(bandGeometry, ironMat);
                band.position.set(0, -1.2 + i * 1.2, 0.11);
                panel.add(band);
            }
        }

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        if (!data.state.isOpen) {
            data.state.isOpen = false;
        }

        return group;
    }

    createDungeonGate(data) {
        const group = new THREE.Group();
        const ironMat = this.getMetalMaterial('dark_iron', data.condition);

        // Heavy iron frame
        const frameGeometry = new THREE.BoxGeometry(0.15, 2.8, 0.15);
        const leftFrame = new THREE.Mesh(frameGeometry, ironMat);
        const rightFrame = new THREE.Mesh(frameGeometry, ironMat);
        leftFrame.position.set(-1.0, 1.4, 0);
        rightFrame.position.set(1.0, 1.4, 0);
        group.add(leftFrame);
        group.add(rightFrame);

        // Grid pattern
        const gridBarGeometry = new THREE.BoxGeometry(0.08, 2.6, 0.08);
        for (let i = 0; i < 4; i++) {
            const bar = new THREE.Mesh(gridBarGeometry, ironMat);
            bar.position.x = -0.6 + i * 0.4;
            bar.position.y = 1.4;
            group.add(bar);
        }

        const hBarGeometry = new THREE.BoxGeometry(1.8, 0.08, 0.08);
        for (let i = 0; i < 5; i++) {
            const bar = new THREE.Mesh(hBarGeometry, ironMat);
            bar.position.y = 0.2 + i * 0.6;
            group.add(bar);
        }

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        if (!data.state.isOpen) {
            data.state.isOpen = false;
        }

        return group;
    }

    // ==================== TABLE CREATION METHODS ====================

    createDiningTable(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition);

        // Tabletop
        const topGeometry = new THREE.BoxGeometry(2.0, 0.1, 1.0);
        const top = new THREE.Mesh(topGeometry, woodMat);
        top.position.y = 0.75;
        group.add(top);

        // Four legs
        const legGeometry = new THREE.BoxGeometry(0.1, 0.75, 0.1);
        const positions = [
            [-0.85, 0.375, -0.4],
            [0.85, 0.375, -0.4],
            [-0.85, 0.375, 0.4],
            [0.85, 0.375, 0.4]
        ];
        positions.forEach(([x, y, z]) => {
            const leg = new THREE.Mesh(legGeometry, woodMat);
            leg.position.set(x, y, z);
            group.add(leg);
        });

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createWorkTable(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition, 0x5a4a3a);

        // Thicker, more rugged top
        const topGeometry = new THREE.BoxGeometry(1.5, 0.15, 0.8);
        const top = new THREE.Mesh(topGeometry, woodMat);
        top.position.y = 0.8;
        group.add(top);

        // Sturdy legs with cross bracing
        const legGeometry = new THREE.BoxGeometry(0.12, 0.8, 0.12);
        const braceGeometry = new THREE.BoxGeometry(1.3, 0.08, 0.08);

        const positions = [
            [-0.65, 0.4, -0.35],
            [0.65, 0.4, -0.35],
            [-0.65, 0.4, 0.35],
            [0.65, 0.4, 0.35]
        ];
        positions.forEach(([x, y, z]) => {
            const leg = new THREE.Mesh(legGeometry, woodMat);
            leg.position.set(x, y, z);
            group.add(leg);
        });

        // Lower shelf
        const shelfGeometry = new THREE.BoxGeometry(1.4, 0.08, 0.7);
        const shelf = new THREE.Mesh(shelfGeometry, woodMat);
        shelf.position.y = 0.3;
        group.add(shelf);

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createRoundTable(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition);

        // Round top
        const topGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 16);
        const top = new THREE.Mesh(topGeometry, woodMat);
        top.position.y = 0.75;
        group.add(top);

        // Central pedestal
        const pedestalGeometry = new THREE.CylinderGeometry(0.15, 0.25, 0.7, 8);
        const pedestal = new THREE.Mesh(pedestalGeometry, woodMat);
        pedestal.position.y = 0.35;
        group.add(pedestal);

        // Base
        const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 8);
        const base = new THREE.Mesh(baseGeometry, woodMat);
        base.position.y = 0.05;
        group.add(base);

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createBanquetTable(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition, 0x6a4a2a);

        // Very long tabletop
        const topGeometry = new THREE.BoxGeometry(4.0, 0.12, 1.2);
        const top = new THREE.Mesh(topGeometry, woodMat);
        top.position.y = 0.8;
        group.add(top);

        // Six legs for stability
        const legGeometry = new THREE.BoxGeometry(0.15, 0.8, 0.15);
        for (let i = 0; i < 3; i++) {
            const x = -1.5 + i * 1.5;
            const leg1 = new THREE.Mesh(legGeometry, woodMat);
            const leg2 = new THREE.Mesh(legGeometry, woodMat);
            leg1.position.set(x, 0.4, -0.5);
            leg2.position.set(x, 0.4, 0.5);
            group.add(leg1);
            group.add(leg2);
        }

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    // ==================== CHAIR CREATION METHODS ====================

    createWoodenChair(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition);

        // Seat
        const seatGeometry = new THREE.BoxGeometry(0.45, 0.08, 0.45);
        const seat = new THREE.Mesh(seatGeometry, woodMat);
        seat.position.y = 0.45;
        group.add(seat);

        // Four legs
        const legGeometry = new THREE.BoxGeometry(0.06, 0.45, 0.06);
        const legPositions = [
            [-0.18, 0.225, -0.18],
            [0.18, 0.225, -0.18],
            [-0.18, 0.225, 0.18],
            [0.18, 0.225, 0.18]
        ];
        legPositions.forEach(([x, y, z]) => {
            const leg = new THREE.Mesh(legGeometry, woodMat);
            leg.position.set(x, y, z);
            group.add(leg);
        });

        // Backrest
        const backGeometry = new THREE.BoxGeometry(0.45, 0.5, 0.06);
        const back = new THREE.Mesh(backGeometry, woodMat);
        back.position.set(0, 0.7, -0.2);
        group.add(back);

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createThrone(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition, 0x4a2a1a);
        const goldMat = this.getMetalMaterial('gold', data.condition);
        const velvetMat = this.getMaterial('velvet', data.condition);

        // Large seat
        const seatGeometry = new THREE.BoxGeometry(0.8, 0.12, 0.7);
        const seat = new THREE.Mesh(seatGeometry, velvetMat);
        seat.position.y = 0.6;
        group.add(seat);

        // Ornate armrests
        const armGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.5);
        const leftArm = new THREE.Mesh(armGeometry, woodMat);
        const rightArm = new THREE.Mesh(armGeometry, woodMat);
        leftArm.position.set(-0.45, 0.65, 0.05);
        rightArm.position.set(0.45, 0.65, 0.05);
        group.add(leftArm);
        group.add(rightArm);

        // High backrest
        const backGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.12);
        const back = new THREE.Mesh(backGeometry, woodMat);
        back.position.set(0, 1.15, -0.3);
        group.add(back);

        // Crown decoration on top
        const crownGeometry = new THREE.ConeGeometry(0.15, 0.3, 5);
        const crown = new THREE.Mesh(crownGeometry, goldMat);
        crown.position.set(0, 1.9, -0.3);
        group.add(crown);

        // Four thick legs
        const legGeometry = new THREE.BoxGeometry(0.12, 0.6, 0.12);
        const legPositions = [
            [-0.35, 0.3, -0.3],
            [0.35, 0.3, -0.3],
            [-0.35, 0.3, 0.3],
            [0.35, 0.3, 0.3]
        ];
        legPositions.forEach(([x, y, z]) => {
            const leg = new THREE.Mesh(legGeometry, woodMat);
            leg.position.set(x, y, z);
            group.add(leg);
        });

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createBench(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition);

        // Long seat
        const seatGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.4);
        const seat = new THREE.Mesh(seatGeometry, woodMat);
        seat.position.y = 0.45;
        group.add(seat);

        // Four legs
        const legGeometry = new THREE.BoxGeometry(0.08, 0.45, 0.08);
        const legPositions = [
            [-0.65, 0.225, -0.15],
            [0.65, 0.225, -0.15],
            [-0.65, 0.225, 0.15],
            [0.65, 0.225, 0.15]
        ];
        legPositions.forEach(([x, y, z]) => {
            const leg = new THREE.Mesh(legGeometry, woodMat);
            leg.position.set(x, y, z);
            group.add(leg);
        });

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createStool(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition);

        // Round seat
        const seatGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.08, 12);
        const seat = new THREE.Mesh(seatGeometry, woodMat);
        seat.position.y = 0.5;
        group.add(seat);

        // Three legs
        const legGeometry = new THREE.CylinderGeometry(0.03, 0.04, 0.5, 8);
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const leg = new THREE.Mesh(legGeometry, woodMat);
            leg.position.set(
                Math.cos(angle) * 0.15,
                0.25,
                Math.sin(angle) * 0.15
            );
            leg.rotation.z = Math.sin(angle) * 0.1;
            leg.rotation.x = Math.cos(angle) * 0.1;
            group.add(leg);
        }

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    // ==================== BED CREATION METHODS ====================

    createStrawBed(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition);
        const strawMat = this.getMaterial('straw', data.condition);

        // Simple wooden frame
        const frameGeometry = new THREE.BoxGeometry(2.0, 0.1, 1.0);
        const frame = new THREE.Mesh(frameGeometry, woodMat);
        frame.position.y = 0.15;
        group.add(frame);

        // Straw mattress
        const mattressGeometry = new THREE.BoxGeometry(1.8, 0.3, 0.9);
        const mattress = new THREE.Mesh(mattressGeometry, strawMat);
        mattress.position.y = 0.35;
        group.add(mattress);

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createWoodenBed(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition);
        const clothMat = this.getMaterial('cloth', data.condition);

        // Bed frame with posts
        const frameGeometry = new THREE.BoxGeometry(2.0, 0.15, 1.0);
        const frame = new THREE.Mesh(frameGeometry, woodMat);
        frame.position.y = 0.4;
        group.add(frame);

        // Four corner posts
        const postGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.1);
        const postPositions = [
            [-0.9, 0.4, -0.45],
            [0.9, 0.4, -0.45],
            [-0.9, 0.4, 0.45],
            [0.9, 0.4, 0.45]
        ];
        postPositions.forEach(([x, y, z]) => {
            const post = new THREE.Mesh(postGeometry, woodMat);
            post.position.set(x, y, z);
            group.add(post);
        });

        // Mattress
        const mattressGeometry = new THREE.BoxGeometry(1.9, 0.25, 0.95);
        const mattress = new THREE.Mesh(mattressGeometry, clothMat);
        mattress.position.y = 0.6;
        group.add(mattress);

        // Headboard
        const headboardGeometry = new THREE.BoxGeometry(2.0, 0.6, 0.08);
        const headboard = new THREE.Mesh(headboardGeometry, woodMat);
        headboard.position.set(0, 0.7, -0.5);
        group.add(headboard);

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createCanopyBed(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition, 0x6a4a2a);
        const clothMat = this.getMaterial('cloth', data.condition);

        // Bed frame
        const frameGeometry = new THREE.BoxGeometry(2.2, 0.15, 1.2);
        const frame = new THREE.Mesh(frameGeometry, woodMat);
        frame.position.y = 0.5;
        group.add(frame);

        // Tall corner posts
        const postGeometry = new THREE.BoxGeometry(0.12, 2.5, 0.12);
        const postPositions = [
            [-1.0, 1.25, -0.55],
            [1.0, 1.25, -0.55],
            [-1.0, 1.25, 0.55],
            [1.0, 1.25, 0.55]
        ];
        postPositions.forEach(([x, y, z]) => {
            const post = new THREE.Mesh(postGeometry, woodMat);
            post.position.set(x, y, z);
            group.add(post);
        });

        // Canopy frame
        const canopyFrameGeometry = new THREE.BoxGeometry(2.2, 0.08, 1.2);
        const canopyFrame = new THREE.Mesh(canopyFrameGeometry, woodMat);
        canopyFrame.position.y = 2.5;
        group.add(canopyFrame);

        // Canopy cloth
        const canopyClothGeometry = new THREE.PlaneGeometry(2.2, 1.2);
        const canopyCloth = new THREE.Mesh(canopyClothGeometry, clothMat);
        canopyCloth.rotation.x = -Math.PI / 2;
        canopyCloth.position.y = 2.48;
        group.add(canopyCloth);

        // Mattress
        const mattressGeometry = new THREE.BoxGeometry(2.0, 0.3, 1.1);
        const mattress = new THREE.Mesh(mattressGeometry, clothMat);
        mattress.position.y = 0.75;
        group.add(mattress);

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    // ==================== STORAGE CREATION METHODS ====================

    createShelf(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition);

        // Vertical supports
        const supportGeometry = new THREE.BoxGeometry(0.08, 1.5, 0.08);
        const leftSupport = new THREE.Mesh(supportGeometry, woodMat);
        const rightSupport = new THREE.Mesh(supportGeometry, woodMat);
        leftSupport.position.set(-0.45, 0.75, 0);
        rightSupport.position.set(0.45, 0.75, 0);
        group.add(leftSupport);
        group.add(rightSupport);

        // Three shelves
        const shelfGeometry = new THREE.BoxGeometry(1.0, 0.05, 0.3);
        for (let i = 0; i < 3; i++) {
            const shelf = new THREE.Mesh(shelfGeometry, woodMat);
            shelf.position.y = 0.3 + i * 0.5;
            group.add(shelf);
        }

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createBookcase(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition, 0x4a3020);

        // Frame
        const sideGeometry = new THREE.BoxGeometry(0.12, 2.0, 0.4);
        const leftSide = new THREE.Mesh(sideGeometry, woodMat);
        const rightSide = new THREE.Mesh(sideGeometry, woodMat);
        leftSide.position.set(-0.55, 1.0, 0);
        rightSide.position.set(0.55, 1.0, 0);
        group.add(leftSide);
        group.add(rightSide);

        // Back panel
        const backGeometry = new THREE.BoxGeometry(1.1, 2.0, 0.05);
        const back = new THREE.Mesh(backGeometry, woodMat);
        back.position.set(0, 1.0, -0.175);
        group.add(back);

        // Shelves
        const shelfGeometry = new THREE.BoxGeometry(1.0, 0.08, 0.35);
        for (let i = 0; i < 5; i++) {
            const shelf = new THREE.Mesh(shelfGeometry, woodMat);
            shelf.position.y = 0.2 + i * 0.45;
            group.add(shelf);
        }

        // Add some books
        const bookMat = this.getMaterial('leather', data.condition);
        for (let shelfIdx = 0; shelfIdx < 4; shelfIdx++) {
            const numBooks = 3 + Math.floor(Math.random() * 4);
            for (let i = 0; i < numBooks; i++) {
                const bookGeometry = new THREE.BoxGeometry(
                    0.05 + Math.random() * 0.03,
                    0.15 + Math.random() * 0.1,
                    0.25
                );
                const book = new THREE.Mesh(bookGeometry, bookMat);
                book.position.set(
                    -0.4 + (i / numBooks) * 0.8,
                    0.28 + shelfIdx * 0.45,
                    0
                );
                book.rotation.y = (Math.random() - 0.5) * 0.2;
                group.add(book);
            }
        }

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createCabinet(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition);

        // Main body
        const bodyGeometry = new THREE.BoxGeometry(1.0, 1.2, 0.5);
        const body = new THREE.Mesh(bodyGeometry, woodMat);
        body.position.y = 0.6;
        group.add(body);

        // Doors
        const doorGeometry = new THREE.BoxGeometry(0.48, 1.1, 0.05);
        const leftDoor = new THREE.Mesh(doorGeometry, woodMat);
        const rightDoor = new THREE.Mesh(doorGeometry, woodMat);
        leftDoor.position.set(-0.25, 0.6, 0.28);
        rightDoor.position.set(0.25, 0.6, 0.28);
        group.add(leftDoor);
        group.add(rightDoor);

        // Handles
        const handleMat = this.getMetalMaterial('iron', data.condition);
        const handleGeometry = new THREE.SphereGeometry(0.03, 8, 8);
        const leftHandle = new THREE.Mesh(handleGeometry, handleMat);
        const rightHandle = new THREE.Mesh(handleGeometry, handleMat);
        leftHandle.position.set(-0.15, 0.6, 0.32);
        rightHandle.position.set(0.15, 0.6, 0.32);
        group.add(leftHandle);
        group.add(rightHandle);

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createWardrobe(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition, 0x3a2a1a);

        // Large body
        const bodyGeometry = new THREE.BoxGeometry(1.5, 2.2, 0.6);
        const body = new THREE.Mesh(bodyGeometry, woodMat);
        body.position.y = 1.1;
        group.add(body);

        // Two large doors
        const doorGeometry = new THREE.BoxGeometry(0.72, 2.0, 0.05);
        const leftDoor = new THREE.Mesh(doorGeometry, woodMat);
        const rightDoor = new THREE.Mesh(doorGeometry, woodMat);
        leftDoor.position.set(-0.37, 1.1, 0.33);
        rightDoor.position.set(0.37, 1.1, 0.33);
        group.add(leftDoor);
        group.add(rightDoor);

        // Top crown
        const crownGeometry = new THREE.BoxGeometry(1.6, 0.15, 0.65);
        const crown = new THREE.Mesh(crownGeometry, woodMat);
        crown.position.y = 2.25;
        group.add(crown);

        // Handles
        const handleMat = this.getMetalMaterial('iron', data.condition);
        const handleGeometry = new THREE.TorusGeometry(0.05, 0.015, 8, 12);
        const leftHandle = new THREE.Mesh(handleGeometry, handleMat);
        const rightHandle = new THREE.Mesh(handleGeometry, handleMat);
        leftHandle.position.set(-0.25, 1.1, 0.36);
        rightHandle.position.set(0.25, 1.1, 0.36);
        group.add(leftHandle);
        group.add(rightHandle);

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createChest(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition, 0x5a3a2a);
        const ironMat = this.getMetalMaterial('iron', data.condition);

        // Chest body
        const bodyGeometry = new THREE.BoxGeometry(1.0, 0.6, 0.6);
        const body = new THREE.Mesh(bodyGeometry, woodMat);
        body.position.y = 0.3;
        group.add(body);

        // Lid (curved)
        const lidGeometry = new THREE.BoxGeometry(1.0, 0.3, 0.6);
        const lid = new THREE.Mesh(lidGeometry, woodMat);
        lid.position.set(0, 0.75, 0);
        group.add(lid);

        // Metal bands
        const bandGeometry = new THREE.BoxGeometry(1.05, 0.05, 0.03);
        for (let i = 0; i < 3; i++) {
            const band = new THREE.Mesh(bandGeometry, ironMat);
            band.position.set(0, 0.15 + i * 0.25, 0.305);
            group.add(band);
        }

        // Lock
        const lockGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.05);
        const lock = new THREE.Mesh(lockGeometry, ironMat);
        lock.position.set(0, 0.35, 0.32);
        group.add(lock);

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        if (!data.state.isOpen) {
            data.state.isOpen = false;
        }

        return group;
    }

    // ==================== EQUIPMENT STORAGE METHODS ====================

    createWeaponRack(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition);
        const ironMat = this.getMetalMaterial('iron', data.condition);

        // Vertical frame
        const frameGeometry = new THREE.BoxGeometry(0.1, 1.8, 0.1);
        const leftFrame = new THREE.Mesh(frameGeometry, woodMat);
        const rightFrame = new THREE.Mesh(frameGeometry, woodMat);
        leftFrame.position.set(-0.6, 0.9, 0);
        rightFrame.position.set(0.6, 0.9, 0);
        group.add(leftFrame);
        group.add(rightFrame);

        // Horizontal bars for weapons
        const barGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8);
        for (let i = 0; i < 4; i++) {
            const bar = new THREE.Mesh(barGeometry, woodMat);
            bar.rotation.z = Math.PI / 2;
            bar.position.y = 0.4 + i * 0.4;
            group.add(bar);
        }

        // Add some swords on the rack
        for (let i = 0; i < 3; i++) {
            const swordBlade = new THREE.BoxGeometry(0.05, 0.8, 0.02);
            const sword = new THREE.Mesh(swordBlade, ironMat);
            sword.position.set(-0.4 + i * 0.4, 1.2, 0.1);
            sword.rotation.z = Math.PI / 4;
            group.add(sword);
        }

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createArmorStand(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition);
        const ironMat = this.getMetalMaterial('iron', data.condition);

        // Base
        const baseGeometry = new THREE.CylinderGeometry(0.3, 0.35, 0.1, 8);
        const base = new THREE.Mesh(baseGeometry, woodMat);
        base.position.y = 0.05;
        group.add(base);

        // Central pole
        const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
        const pole = new THREE.Mesh(poleGeometry, woodMat);
        pole.position.y = 0.75;
        group.add(pole);

        // Shoulders
        const shoulderGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8);
        const shoulders = new THREE.Mesh(shoulderGeometry, woodMat);
        shoulders.rotation.z = Math.PI / 2;
        shoulders.position.y = 1.3;
        group.add(shoulders);

        // Armor pieces (simplified)
        const chestGeometry = new THREE.BoxGeometry(0.4, 0.5, 0.15);
        const chest = new THREE.Mesh(chestGeometry, ironMat);
        chest.position.set(0, 1.1, 0);
        group.add(chest);

        // Helmet on top
        const helmetGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const helmet = new THREE.Mesh(helmetGeometry, ironMat);
        helmet.position.y = 1.6;
        group.add(helmet);

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createShieldRack(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition);
        const ironMat = this.getMetalMaterial('iron', data.condition);

        // Wall-mounted frame
        const frameGeometry = new THREE.BoxGeometry(1.5, 1.2, 0.08);
        const frame = new THREE.Mesh(frameGeometry, woodMat);
        frame.position.y = 1.0;
        group.add(frame);

        // Add shields
        const shieldGeometry = new THREE.CircleGeometry(0.3, 8);
        for (let i = 0; i < 3; i++) {
            const shield = new THREE.Mesh(shieldGeometry, ironMat);
            shield.position.set(-0.5 + i * 0.5, 1.0, 0.1);
            group.add(shield);
        }

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    // ==================== MISCELLANEOUS CREATION METHODS ====================

    createDesk(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition);

        // Desktop
        const topGeometry = new THREE.BoxGeometry(1.2, 0.08, 0.7);
        const top = new THREE.Mesh(topGeometry, woodMat);
        top.position.y = 0.75;
        group.add(top);

        // Legs
        const legGeometry = new THREE.BoxGeometry(0.08, 0.75, 0.08);
        const positions = [
            [-0.5, 0.375, -0.3],
            [0.5, 0.375, -0.3],
            [-0.5, 0.375, 0.3],
            [0.5, 0.375, 0.3]
        ];
        positions.forEach(([x, y, z]) => {
            const leg = new THREE.Mesh(legGeometry, woodMat);
            leg.position.set(x, y, z);
            group.add(leg);
        });

        // Drawer
        const drawerGeometry = new THREE.BoxGeometry(0.9, 0.15, 0.6);
        const drawer = new THREE.Mesh(drawerGeometry, woodMat);
        drawer.position.set(0, 0.4, 0);
        group.add(drawer);

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createCrate(data, size) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition, 0x5a4a3a);

        const crateGeometry = new THREE.BoxGeometry(size, size, size);
        const crate = new THREE.Mesh(crateGeometry, woodMat);
        crate.position.y = size / 2;
        group.add(crate);

        // Add wooden slats
        const slatGeometry = new THREE.BoxGeometry(size + 0.02, 0.05, 0.03);
        for (let i = 0; i < 3; i++) {
            const slat = new THREE.Mesh(slatGeometry, woodMat);
            slat.position.set(0, (i - 1) * (size / 3), size / 2 + 0.01);
            group.add(slat);
        }

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createBarrel(data, size) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition, 0x4a3a2a);
        const ironMat = this.getMetalMaterial('iron', data.condition);

        const barrelGeometry = new THREE.CylinderGeometry(
            size * 0.45,
            size * 0.4,
            size * 1.2,
            16
        );
        const barrel = new THREE.Mesh(barrelGeometry, woodMat);
        barrel.position.y = size * 0.6;
        group.add(barrel);

        // Metal bands
        const bandGeometry = new THREE.TorusGeometry(size * 0.45, 0.02, 8, 16);
        for (let i = 0; i < 3; i++) {
            const band = new THREE.Mesh(bandGeometry, ironMat);
            band.rotation.x = Math.PI / 2;
            band.position.y = size * 0.3 + i * (size * 0.3);
            group.add(band);
        }

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createBox(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition);

        const boxGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.4);
        const box = new THREE.Mesh(boxGeometry, woodMat);
        box.position.y = 0.15;
        group.add(box);

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createDebrisPile(data) {
        const group = new THREE.Group();
        const stoneMat = this.getMaterial('stone', FurnitureCondition.BROKEN);
        const woodMat = this.getWoodMaterial(FurnitureCondition.BROKEN);

        // Random debris pieces
        const pieceCount = 5 + Math.floor(Math.random() * 5);
        for (let i = 0; i < pieceCount; i++) {
            const size = 0.1 + Math.random() * 0.3;
            const geometry = Math.random() > 0.5
                ? new THREE.BoxGeometry(size, size * 0.5, size * 0.8)
                : new THREE.DodecahedronGeometry(size * 0.5);

            const material = Math.random() > 0.5 ? stoneMat : woodMat;
            const piece = new THREE.Mesh(geometry, material);

            piece.position.set(
                (Math.random() - 0.5) * 0.8,
                size / 2,
                (Math.random() - 0.5) * 0.8
            );
            piece.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            group.add(piece);
        }

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createBrokenFurniture(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(FurnitureCondition.BROKEN);

        // Broken table/chair parts
        const leg1 = new THREE.BoxGeometry(0.08, 0.4, 0.08);
        const leg2 = new THREE.BoxGeometry(0.08, 0.3, 0.08);
        const plank = new THREE.BoxGeometry(0.6, 0.05, 0.4);

        const mesh1 = new THREE.Mesh(leg1, woodMat);
        const mesh2 = new THREE.Mesh(leg2, woodMat);
        const mesh3 = new THREE.Mesh(plank, woodMat);

        mesh1.position.set(-0.2, 0.2, 0);
        mesh1.rotation.z = 0.4;
        mesh2.position.set(0.3, 0.15, 0.2);
        mesh2.rotation.set(0.3, 0, -0.2);
        mesh3.position.set(0, 0.05, -0.2);
        mesh3.rotation.set(0.2, 0.3, 0);

        group.add(mesh1);
        group.add(mesh2);
        group.add(mesh3);

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createChandelier(data) {
        const group = new THREE.Group();
        const ironMat = this.getMetalMaterial('dark_iron', data.condition);

        // Central chain
        const chainGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.5, 8);
        const chain = new THREE.Mesh(chainGeometry, ironMat);
        chain.position.y = 0.75;
        group.add(chain);

        // Circular frame
        const frameGeometry = new THREE.TorusGeometry(0.5, 0.04, 8, 16);
        const frame = new THREE.Mesh(frameGeometry, ironMat);
        frame.rotation.x = Math.PI / 2;
        group.add(frame);

        // Candles
        const candleCount = 6;
        for (let i = 0; i < candleCount; i++) {
            const angle = (i / candleCount) * Math.PI * 2;
            const x = Math.cos(angle) * 0.5;
            const z = Math.sin(angle) * 0.5;

            // Candle holder
            const holderGeometry = new THREE.CylinderGeometry(0.03, 0.04, 0.15, 8);
            const holder = new THREE.Mesh(holderGeometry, ironMat);
            holder.position.set(x, -0.1, z);
            group.add(holder);

            // Flame
            const flameGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            const flameMaterial = new THREE.MeshStandardMaterial({
                color: 0xff6600,
                emissive: 0xff6600,
                emissiveIntensity: 1
            });
            const flame = new THREE.Mesh(flameGeometry, flameMaterial);
            flame.position.set(x, 0, z);
            group.add(flame);
        }

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createCandelabra(data) {
        const group = new THREE.Group();
        const ironMat = this.getMetalMaterial('iron', data.condition);

        // Base
        const baseGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.08, 8);
        const base = new THREE.Mesh(baseGeometry, ironMat);
        base.position.y = 0.04;
        group.add(base);

        // Central stem
        const stemGeometry = new THREE.CylinderGeometry(0.03, 0.04, 0.5, 8);
        const stem = new THREE.Mesh(stemGeometry, ironMat);
        stem.position.y = 0.3;
        group.add(stem);

        // Three arms
        const armCount = 3;
        for (let i = 0; i < armCount; i++) {
            const angle = (i / armCount) * Math.PI * 2;
            const x = Math.cos(angle) * 0.15;
            const z = Math.sin(angle) * 0.15;

            const armGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8);
            const arm = new THREE.Mesh(armGeometry, ironMat);
            arm.position.set(x / 2, 0.5, z / 2);
            arm.rotation.set(0, angle, Math.PI / 3);
            group.add(arm);

            // Candle
            const candleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8);
            const candleMaterial = new THREE.MeshStandardMaterial({ color: 0xf0e0c0 });
            const candle = new THREE.Mesh(candleGeometry, candleMaterial);
            candle.position.set(x, 0.65, z);
            group.add(candle);

            // Flame
            const flameGeometry = new THREE.SphereGeometry(0.04, 8, 8);
            const flameMaterial = new THREE.MeshStandardMaterial({
                color: 0xff6600,
                emissive: 0xff6600,
                emissiveIntensity: 1
            });
            const flame = new THREE.Mesh(flameGeometry, flameMaterial);
            flame.position.set(x, 0.75, z);
            group.add(flame);
        }

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createLectern(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition, 0x4a3020);

        // Base
        const baseGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.5);
        const base = new THREE.Mesh(baseGeometry, woodMat);
        base.position.y = 0.05;
        group.add(base);

        // Pedestal
        const pedestalGeometry = new THREE.CylinderGeometry(0.08, 0.12, 1.0, 8);
        const pedestal = new THREE.Mesh(pedestalGeometry, woodMat);
        pedestal.position.y = 0.55;
        group.add(pedestal);

        // Reading surface (angled)
        const surfaceGeometry = new THREE.BoxGeometry(0.6, 0.05, 0.45);
        const surface = new THREE.Mesh(surfaceGeometry, woodMat);
        surface.position.set(0, 1.1, 0.1);
        surface.rotation.x = -0.3;
        group.add(surface);

        // Open book on lectern
        const bookMat = this.getMaterial('leather', data.condition);
        const leftPage = new THREE.BoxGeometry(0.25, 0.02, 0.35);
        const rightPage = new THREE.BoxGeometry(0.25, 0.02, 0.35);
        const left = new THREE.Mesh(leftPage, bookMat);
        const right = new THREE.Mesh(rightPage, bookMat);
        left.position.set(-0.13, 1.13, 0.1);
        left.rotation.set(-0.3, -0.1, 0);
        right.position.set(0.13, 1.13, 0.1);
        right.rotation.set(-0.3, 0.1, 0);
        group.add(left);
        group.add(right);

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createAnvil(data) {
        const group = new THREE.Group();
        const ironMat = this.getMetalMaterial('dark_iron', data.condition);

        // Base
        const baseGeometry = new THREE.CylinderGeometry(0.3, 0.35, 0.15, 8);
        const base = new THREE.Mesh(baseGeometry, ironMat);
        base.position.y = 0.075;
        group.add(base);

        // Body
        const bodyGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.3);
        const body = new THREE.Mesh(bodyGeometry, ironMat);
        body.position.y = 0.35;
        group.add(body);

        // Horn (pointed end)
        const hornGeometry = new THREE.ConeGeometry(0.08, 0.25, 8);
        const horn = new THREE.Mesh(hornGeometry, ironMat);
        horn.rotation.z = Math.PI / 2;
        horn.position.set(0.35, 0.45, 0);
        group.add(horn);

        // Flat top surface
        const topGeometry = new THREE.BoxGeometry(0.4, 0.08, 0.25);
        const top = new THREE.Mesh(topGeometry, ironMat);
        top.position.set(-0.05, 0.54, 0);
        group.add(top);

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createForge(data) {
        const group = new THREE.Group();
        const stoneMat = this.getMaterial('stone', data.condition);

        // Stone base
        const baseGeometry = new THREE.BoxGeometry(1.5, 0.8, 1.0);
        const base = new THREE.Mesh(baseGeometry, stoneMat);
        base.position.y = 0.4;
        group.add(base);

        // Fire pit
        const pitGeometry = new THREE.BoxGeometry(1.0, 0.3, 0.6);
        const pitMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
        const pit = new THREE.Mesh(pitGeometry, pitMat);
        pit.position.y = 0.95;
        group.add(pit);

        // Glowing coals
        const coalsGeometry = new THREE.BoxGeometry(0.9, 0.15, 0.5);
        const coalsMat = new THREE.MeshStandardMaterial({
            color: 0xff3300,
            emissive: 0xff3300,
            emissiveIntensity: 0.8
        });
        const coals = new THREE.Mesh(coalsGeometry, coalsMat);
        coals.position.y = 1.0;
        group.add(coals);

        // Chimney
        const chimneyGeometry = new THREE.BoxGeometry(0.6, 1.5, 0.6);
        const chimney = new THREE.Mesh(chimneyGeometry, stoneMat);
        chimney.position.set(0, 1.8, -0.3);
        group.add(chimney);

        // Light
        const light = new THREE.PointLight(0xff6600, 2, 8);
        light.position.set(0, 1.0, 0);
        group.add(light);

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createCoffin(data) {
        const group = new THREE.Group();
        const woodMat = this.getWoodMaterial(data.condition, 0x2a1a0a);

        // Coffin body (tapered)
        const bodyGeometry = new THREE.BoxGeometry(0.8, 0.5, 2.0);
        const body = new THREE.Mesh(bodyGeometry, woodMat);
        body.position.y = 0.25;
        group.add(body);

        // Lid (slightly raised)
        const lidGeometry = new THREE.BoxGeometry(0.85, 0.15, 2.05);
        const lid = new THREE.Mesh(lidGeometry, woodMat);
        lid.position.y = 0.58;
        group.add(lid);

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    createSarcophagus(data) {
        const group = new THREE.Group();
        const stoneMat = this.getMaterial('stone', data.condition);

        // Stone base
        const baseGeometry = new THREE.BoxGeometry(1.2, 0.3, 2.5);
        const base = new THREE.Mesh(baseGeometry, stoneMat);
        base.position.y = 0.15;
        group.add(base);

        // Body
        const bodyGeometry = new THREE.BoxGeometry(1.0, 0.8, 2.2);
        const body = new THREE.Mesh(bodyGeometry, stoneMat);
        body.position.y = 0.7;
        group.add(body);

        // Lid with carved details
        const lidGeometry = new THREE.BoxGeometry(1.05, 0.4, 2.25);
        const lid = new THREE.Mesh(lidGeometry, stoneMat);
        lid.position.y = 1.3;
        group.add(lid);

        // Carved figure on lid (simplified)
        const figureGeometry = new THREE.BoxGeometry(0.4, 0.1, 1.5);
        const figure = new THREE.Mesh(figureGeometry, stoneMat);
        figure.position.set(0, 1.55, 0);
        group.add(figure);

        group.position.copy(data.position);
        group.rotation.y = data.rotation;

        return group;
    }

    // ==================== MATERIAL HELPERS ====================

    getWoodMaterial(condition, baseColor = 0x4a3020) {
        const key = `wood_${condition}_${baseColor}`;
        if (this.materialCache.has(key)) {
            return this.materialCache.get(key);
        }

        let color = baseColor;
        let roughness = 0.9;
        let metalness = 0.0;

        switch (condition) {
            case FurnitureCondition.PRISTINE:
                roughness = 0.7;
                break;
            case FurnitureCondition.GOOD:
                roughness = 0.8;
                break;
            case FurnitureCondition.WORN:
                color = this.darkenColor(baseColor, 0.9);
                roughness = 0.95;
                break;
            case FurnitureCondition.DAMAGED:
                color = this.darkenColor(baseColor, 0.8);
                roughness = 1.0;
                break;
            case FurnitureCondition.BROKEN:
                color = this.darkenColor(baseColor, 0.6);
                roughness = 1.0;
                break;
        }

        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: roughness,
            metalness: metalness
        });

        this.materialCache.set(key, material);
        return material;
    }

    getMetalMaterial(metalType, condition) {
        const key = `metal_${metalType}_${condition}`;
        if (this.materialCache.has(key)) {
            return this.materialCache.get(key);
        }

        let color, roughness, metalness;

        switch (metalType) {
            case 'iron':
                color = 0x5a5a5a;
                roughness = 0.6;
                metalness = 0.8;
                break;
            case 'dark_iron':
                color = 0x2a2a2a;
                roughness = 0.7;
                metalness = 0.7;
                break;
            case 'gold':
                color = 0xffaa00;
                roughness = 0.3;
                metalness = 0.9;
                break;
            default:
                color = 0x666666;
                roughness = 0.6;
                metalness = 0.8;
        }

        // Adjust for condition
        switch (condition) {
            case FurnitureCondition.WORN:
                roughness += 0.1;
                color = this.darkenColor(color, 0.9);
                break;
            case FurnitureCondition.DAMAGED:
                roughness += 0.2;
                color = this.darkenColor(color, 0.8);
                break;
            case FurnitureCondition.BROKEN:
                roughness += 0.3;
                color = this.darkenColor(color, 0.7);
                break;
        }

        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: Math.min(roughness, 1.0),
            metalness: metalness
        });

        this.materialCache.set(key, material);
        return material;
    }

    getMaterial(type, condition) {
        const key = `${type}_${condition}`;
        if (this.materialCache.has(key)) {
            return this.materialCache.get(key);
        }

        let color, roughness, metalness;

        switch (type) {
            case 'stone':
                color = 0x4a4a4a;
                roughness = 0.95;
                metalness = 0.0;
                break;
            case 'leather':
                color = 0x3a2a1a;
                roughness = 0.8;
                metalness = 0.0;
                break;
            case 'cloth':
                color = 0x8a7a6a;
                roughness = 1.0;
                metalness = 0.0;
                break;
            case 'velvet':
                color = 0x5a1a1a;
                roughness = 0.9;
                metalness = 0.0;
                break;
            case 'straw':
                color = 0xc0a060;
                roughness = 1.0;
                metalness = 0.0;
                break;
            default:
                color = 0x666666;
                roughness = 0.8;
                metalness = 0.0;
        }

        // Adjust for condition
        if (condition === FurnitureCondition.WORN ||
            condition === FurnitureCondition.DAMAGED ||
            condition === FurnitureCondition.BROKEN) {
            color = this.darkenColor(color, 0.8);
        }

        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: roughness,
            metalness: metalness
        });

        this.materialCache.set(key, material);
        return material;
    }

    darkenColor(color, factor) {
        const r = ((color >> 16) & 0xff) * factor;
        const g = ((color >> 8) & 0xff) * factor;
        const b = (color & 0xff) * factor;
        return (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);
    }

    // ==================== INTERACTION METHODS ====================

    /**
     * Toggle a door between open and closed
     */
    toggleDoor(furnitureObject) {
        const data = furnitureObject.userData.furnitureData;
        if (!data || !data.state) return;

        const targetRotation = data.state.isOpen ? 0 : Math.PI / 2;
        data.state.isOpen = !data.state.isOpen;

        this.animateDoorRotation(furnitureObject, targetRotation);
    }

    /**
     * Raise or lower a portcullis
     */
    togglePortcullis(furnitureObject) {
        const data = furnitureObject.userData.furnitureData;
        if (!data || !data.state) return;

        const targetY = data.state.raised ? data.position.y : data.position.y + 2.5;
        data.state.raised = !data.state.raised;

        this.animatePortcullisHeight(furnitureObject, targetY);
    }

    /**
     * Open/close a gate
     */
    toggleGate(furnitureObject) {
        const data = furnitureObject.userData.furnitureData;
        if (!data || !data.state) return;

        data.state.isOpen = !data.state.isOpen;

        // For large gates with two panels, animate them swinging apart/together
        const leftPanel = furnitureObject.children[0];
        const rightPanel = furnitureObject.children[1];

        if (leftPanel && rightPanel) {
            const targetRotation = data.state.isOpen ? Math.PI / 3 : 0;
            this.animateGatePanels(leftPanel, rightPanel, targetRotation);
        }
    }

    /**
     * Animate door rotation
     */
    animateDoorRotation(door, targetRotation, duration = 500) {
        const startRotation = door.rotation.y;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeInOutQuad(progress);

            door.rotation.y = startRotation + (targetRotation - startRotation) * eased;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    /**
     * Animate portcullis height
     */
    animatePortcullisHeight(portcullis, targetY, duration = 1000) {
        const startY = portcullis.position.y;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeInOutQuad(progress);

            portcullis.position.y = startY + (targetY - startY) * eased;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    /**
     * Animate gate panels swinging
     */
    animateGatePanels(leftPanel, rightPanel, targetRotation, duration = 800) {
        const startRotationLeft = leftPanel.rotation.y;
        const startRotationRight = rightPanel.rotation.y;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeInOutQuad(progress);

            leftPanel.rotation.y = startRotationLeft + (targetRotation - startRotationLeft) * eased;
            rightPanel.rotation.y = startRotationRight + (-targetRotation - startRotationRight) * eased;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    /**
     * Easing function for smooth animations
     */
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    /**
     * Check if furniture can be interacted with
     */
    canInteract(furnitureObject) {
        return this.interactables.has(furnitureObject);
    }

    /**
     * Interact with furniture (generic handler)
     */
    interact(furnitureObject) {
        const data = furnitureObject.userData.furnitureData;
        if (!data || !data.interactable) return false;

        const type = furnitureObject.userData.furnitureType;

        // Handle different furniture types
        if (type === FurnitureType.WOODEN_DOOR ||
            type === FurnitureType.IRON_DOOR ||
            type === FurnitureType.ORNATE_DOOR ||
            type === FurnitureType.REINFORCED_DOOR) {
            this.toggleDoor(furnitureObject);
            return true;
        }

        if (type === FurnitureType.PORTCULLIS) {
            this.togglePortcullis(furnitureObject);
            return true;
        }

        if (type === FurnitureType.LARGE_GATE ||
            type === FurnitureType.DUNGEON_GATE) {
            this.toggleGate(furnitureObject);
            return true;
        }

        if (type === FurnitureType.CHEST) {
            // Chest interaction would open inventory or loot
            console.log('Opening chest...');
            return true;
        }

        return false;
    }

    /**
     * Dispose of all furniture and free memory
     */
    dispose() {
        for (const furniture of this.furniture) {
            this.scene.remove(furniture);

            furniture.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }

        this.furniture = [];
        this.interactables.clear();
        this.materialCache.clear();
        this.animating.clear();
    }
}
