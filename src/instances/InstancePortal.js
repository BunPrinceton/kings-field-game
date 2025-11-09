// InstancePortal.js - Visual portal/door markers for instance entries
import * as THREE from 'three';

/**
 * Instance Portal - Visual marker for instance entry points
 */
export class InstancePortal {
    constructor(scene, position, instanceId, metadata = {}) {
        this.scene = scene;
        this.position = position;
        this.instanceId = instanceId;
        this.metadata = metadata;

        this.mesh = null;
        this.light = null;
        this.particles = [];
        this.isActive = true;

        this.createPortal();
    }

    /**
     * Create portal visual
     */
    createPortal() {
        const group = new THREE.Group();

        // Portal type based on instance type
        const portalType = this.metadata.type || 'standard';
        const color = this.getPortalColor(portalType);

        // Create portal geometry - swirling disc
        const portalGeometry = new THREE.CylinderGeometry(1.8, 1.8, 0.15, 32);
        const portalMaterial = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const portal = new THREE.Mesh(portalGeometry, portalMaterial);
        portal.rotation.x = Math.PI / 2; // Lay flat
        group.add(portal);

        // Inner swirl
        const innerGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.1, 24);
        const innerMaterial = new THREE.MeshStandardMaterial({
            color: this.lightenColor(color, 0.3),
            emissive: this.lightenColor(color, 0.3),
            emissiveIntensity: 1.0,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const inner = new THREE.Mesh(innerGeometry, innerMaterial);
        inner.rotation.x = Math.PI / 2;
        inner.position.y = 0.05;
        group.add(inner);

        // Outer ring
        const ringGeometry = new THREE.TorusGeometry(2, 0.15, 16, 32);
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.6,
            metalness: 0.5,
            roughness: 0.3
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);

        // Add glowing particles around portal
        this.createParticles(group, color);

        // Position the group
        group.position.copy(this.position);
        group.position.y = 0.1; // Slightly above floor

        // Store references
        this.mesh = group;
        this.portalDisc = portal;
        this.innerDisc = inner;
        this.ring = ring;

        // Add to scene
        this.scene.add(group);

        // Add point light
        this.light = new THREE.PointLight(color, 3, 12);
        this.light.position.copy(this.position);
        this.light.position.y = 1.5;
        this.scene.add(this.light);

        // Add interaction data
        this.mesh.userData.isInstancePortal = true;
        this.mesh.userData.instanceId = this.instanceId;
        this.mesh.userData.portalObject = this;
    }

    /**
     * Create swirling particles around portal
     */
    createParticles(group, color) {
        const particleCount = 20;
        const particleGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const particleMaterial = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 0.8
        });

        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 2.5;
            particle.position.set(
                Math.cos(angle) * radius,
                0.3,
                Math.sin(angle) * radius
            );
            particle.userData.angle = angle;
            particle.userData.radius = radius;
            particle.userData.speed = 0.5 + Math.random() * 0.5;
            group.add(particle);
            this.particles.push(particle);
        }
    }

    /**
     * Get portal color based on type
     */
    getPortalColor(type) {
        const colors = {
            boss_arena: 0xff2200,
            grand_library: 0x8844ff,
            treasure_vault: 0xffaa00,
            safe_haven: 0x4488ff,
            puzzle_chamber: 0xff44ff,
            throne_room: 0xffdd00,
            chapel: 0xffffff,
            workshop: 0xff6600,
            standard: 0x00ff88
        };
        return colors[type] || colors.standard;
    }

    /**
     * Lighten a color by a factor
     */
    lightenColor(color, factor) {
        const c = new THREE.Color(color);
        c.r = Math.min(1, c.r + factor);
        c.g = Math.min(1, c.g + factor);
        c.b = Math.min(1, c.b + factor);
        return c.getHex();
    }

    /**
     * Update portal animation
     */
    update(deltaTime) {
        if (!this.mesh || !this.isActive) return;

        const time = Date.now() * 0.001;

        // Rotate portal discs
        if (this.portalDisc) {
            this.portalDisc.rotation.z += deltaTime * 0.3;
        }
        if (this.innerDisc) {
            this.innerDisc.rotation.z -= deltaTime * 0.5;
        }

        // Pulse the ring
        if (this.ring) {
            const pulse = Math.sin(time * 2) * 0.1 + 1;
            this.ring.scale.set(pulse, pulse, pulse);
        }

        // Animate particles
        for (const particle of this.particles) {
            particle.userData.angle += deltaTime * particle.userData.speed;
            particle.position.x = Math.cos(particle.userData.angle) * particle.userData.radius;
            particle.position.z = Math.sin(particle.userData.angle) * particle.userData.radius;
            particle.position.y = 0.3 + Math.sin(particle.userData.angle * 3) * 0.2;
        }

        // Pulse light
        if (this.light) {
            this.light.intensity = 3 + Math.sin(time * 3) * 0.5;
        }

        // Bob up and down
        this.mesh.position.y = 0.1 + Math.sin(time * 1.5) * 0.08;
    }

    /**
     * Check if player is near portal
     */
    isPlayerNear(playerPosition, distance = 2.5) {
        const dx = playerPosition.x - this.position.x;
        const dz = playerPosition.z - this.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        return dist < distance;
    }

    /**
     * Activate portal (visual feedback)
     */
    activate() {
        if (!this.mesh) return;

        // Flash brighter
        if (this.light) {
            this.light.intensity = 5;
        }

        // Scale up briefly
        this.mesh.scale.set(1.2, 1.2, 1.2);
        setTimeout(() => {
            if (this.mesh) {
                this.mesh.scale.set(1, 1, 1);
            }
        }, 300);
    }

    /**
     * Deactivate portal (locked/unavailable)
     */
    deactivate() {
        this.isActive = false;
        if (this.mesh) {
            this.mesh.material.opacity = 0.3;
        }
        if (this.light) {
            this.light.intensity = 0.5;
        }
    }

    /**
     * Remove portal from scene
     */
    dispose() {
        if (this.mesh) {
            this.mesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            this.scene.remove(this.mesh);
        }
        if (this.light) {
            this.scene.remove(this.light);
        }
    }
}

/**
 * Portal Manager - Manages all portals in the dungeon
 */
export class PortalManager {
    constructor(scene) {
        this.scene = scene;
        this.portals = new Map(); // portalId -> InstancePortal
    }

    /**
     * Create a portal
     */
    createPortal(portalId, position, instanceId, metadata = {}) {
        const portal = new InstancePortal(this.scene, position, instanceId, metadata);
        this.portals.set(portalId, portal);
        return portal;
    }

    /**
     * Get portal by ID
     */
    getPortal(portalId) {
        return this.portals.get(portalId);
    }

    /**
     * Find nearest portal to player
     */
    findNearestPortal(playerPosition, maxDistance = 3.0) {
        let nearest = null;
        let minDistance = maxDistance;

        for (const portal of this.portals.values()) {
            const dx = playerPosition.x - portal.position.x;
            const dz = playerPosition.z - portal.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < minDistance) {
                minDistance = dist;
                nearest = portal;
            }
        }

        return nearest;
    }

    /**
     * Update all portals
     */
    update(deltaTime) {
        for (const portal of this.portals.values()) {
            portal.update(deltaTime);
        }
    }

    /**
     * Remove all portals
     */
    clear() {
        for (const portal of this.portals.values()) {
            portal.dispose();
        }
        this.portals.clear();
    }

    /**
     * Remove specific portal
     */
    removePortal(portalId) {
        const portal = this.portals.get(portalId);
        if (portal) {
            portal.dispose();
            this.portals.delete(portalId);
        }
    }
}
