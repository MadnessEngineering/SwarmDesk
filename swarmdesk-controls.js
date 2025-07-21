/**
 * 🎮 STANDARDIZED SWARMDESK CONTROLS
 * Unified control system for all SwarmDesk environments
 * Provides consistent camera movement, mouse look, and keyboard shortcuts
 */

class SwarmDeskControls {
    constructor(camera, renderer, container, options = {}) {
        this.camera = camera;
        this.renderer = renderer;
        this.container = container || renderer.domElement.parentElement;
        
        // Control settings with standardized defaults
        this.settings = {
            mouseSensitivity: options.mouseSensitivity || 0.002,
            moveSpeed: options.moveSpeed || 0.02,
            friction: options.friction || 0.85,
            cameraBounds: options.cameraBounds || {
                minY: 1.6,
                maxY: 20,
                minX: -25,
                maxX: 25,
                minZ: -25,
                maxZ: 25
            },
            enablePointerLock: options.enablePointerLock !== false,
            enableKeyboardMovement: options.enableKeyboardMovement !== false,
            enableMouseLook: options.enableMouseLook !== false,
            ...options
        };

        // Control state
        this.isEnabled = true;
        this.isPointerLocked = false;
        this.keys = {};
        this.velocity = new THREE.Vector3();
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.direction = new THREE.Vector3();
        this.controls = {
            moveForward: false,
            moveBackward: false,
            moveLeft: false,
            moveRight: false
        };

        // Key mappings
        this.keyMap = {
            KeyW: 'moveForward',
            KeyS: 'moveBackward', 
            KeyA: 'moveLeft',
            KeyD: 'moveRight',
            ArrowUp: 'moveForward',
            ArrowDown: 'moveBackward',
            ArrowLeft: 'moveLeft',
            ArrowRight: 'moveRight'
        };

        // Shortcuts and callbacks
        this.shortcuts = new Map();
        this.callbacks = {
            onEscape: null,
            onProjectNavigator: null,
            onAgentInteract: null,
            onTogglePanel: null,
            ...options.callbacks
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupStandardShortcuts();
        
        // Set initial euler from camera
        this.euler.setFromQuaternion(this.camera.quaternion);
        
        console.log('🎮 SwarmDesk Controls initialized with standardized settings');
    }

    setupEventListeners() {
        // Keyboard events
        if (this.settings.enableKeyboardMovement) {
            document.addEventListener('keydown', this.onKeyDown.bind(this));
            document.addEventListener('keyup', this.onKeyUp.bind(this));
        }

        // Mouse events
        if (this.settings.enableMouseLook) {
            if (this.settings.enablePointerLock) {
                this.container.addEventListener('click', this.requestPointerLock.bind(this));
                document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
                document.addEventListener('mousemove', this.onMouseMove.bind(this));
            } else {
                // Fallback to mouse drag
                this.container.addEventListener('mousedown', this.onMouseDown.bind(this));
                this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
                this.container.addEventListener('mouseup', this.onMouseUp.bind(this));
                this.isMouseDown = false;
                this.lastMouseX = 0;
                this.lastMouseY = 0;
            }
        }

        // Prevent context menu
        this.container.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    setupStandardShortcuts() {
        // Standard SwarmDesk shortcuts
        this.addShortcut('Escape', () => {
            if (this.isPointerLocked) {
                document.exitPointerLock();
            } else if (this.callbacks.onEscape) {
                this.callbacks.onEscape();
            }
        });

        this.addShortcut('KeyE', () => {
            // Check for agent interaction first (context-sensitive)
            if (typeof window !== 'undefined' && window.nearAgent && window.openDialogue && !window.currentAgent) {
                window.openDialogue(window.nearAgent);
            }
            // Fallback to project navigator
            else if (this.callbacks.onProjectNavigator) {
                this.callbacks.onProjectNavigator();
            }
        });

        this.addShortcut('Tab', () => {
            if (this.callbacks.onTogglePanel) {
                this.callbacks.onTogglePanel('control-center');
            }
        });

        this.addShortcut('Equal', () => {
            if (this.callbacks.onTogglePanel) {
                this.callbacks.onTogglePanel('swarm-status');
            }
        });
    }

    addShortcut(key, callback) {
        this.shortcuts.set(key, callback);
    }

    removeShortcut(key) {
        this.shortcuts.delete(key);
    }

    onKeyDown(event) {
        if (!this.isEnabled) return;

        const key = event.code || event.key;
        this.keys[key] = true;

        // Handle movement keys
        if (this.keyMap[key]) {
            this.controls[this.keyMap[key]] = true;
        }

        // Handle shortcuts
        if (this.shortcuts.has(key)) {
            event.preventDefault();
            this.shortcuts.get(key)(event);
        }
    }

    onKeyUp(event) {
        if (!this.isEnabled) return;

        const key = event.code || event.key;
        this.keys[key] = false;

        // Handle movement keys
        if (this.keyMap[key]) {
            this.controls[this.keyMap[key]] = false;
        }
    }

    requestPointerLock() {
        if (!this.settings.enablePointerLock) return;
        this.container.requestPointerLock();
    }

    onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement === this.container;
    }

    onMouseDown(event) {
        if (!this.settings.enablePointerLock && this.settings.enableMouseLook) {
            this.isMouseDown = true;
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
        }
    }

    onMouseUp(event) {
        if (!this.settings.enablePointerLock) {
            this.isMouseDown = false;
        }
    }

    onMouseMove(event) {
        if (!this.isEnabled || !this.settings.enableMouseLook) return;

        let deltaX, deltaY;

        if (this.settings.enablePointerLock && this.isPointerLocked) {
            // Pointer lock mode - use movement deltas
            deltaX = event.movementX;
            deltaY = event.movementY;
        } else if (!this.settings.enablePointerLock && this.isMouseDown) {
            // Mouse drag mode - calculate deltas
            deltaX = event.clientX - this.lastMouseX;
            deltaY = event.clientY - this.lastMouseY;
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
        } else {
            return;
        }

        // Apply mouse look with standardized sensitivity
        this.euler.setFromQuaternion(this.camera.quaternion);
        this.euler.y -= deltaX * this.settings.mouseSensitivity;
        this.euler.x -= deltaY * this.settings.mouseSensitivity;

        // Clamp vertical rotation to prevent flipping
        this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));

        this.camera.quaternion.setFromEuler(this.euler);
    }

    update() {
        if (!this.isEnabled) return;

        this.updateMovement();
        this.enforceBounds();
    }

    updateMovement() {
        if (!this.settings.enableKeyboardMovement) return;

        // Calculate movement direction
        this.direction.set(0, 0, 0);

        if (this.controls.moveForward) this.direction.z -= 1;
        if (this.controls.moveBackward) this.direction.z += 1;
        if (this.controls.moveLeft) this.direction.x -= 1;
        if (this.controls.moveRight) this.direction.x += 1;

        // Normalize and apply camera rotation for camera-relative movement
        if (this.direction.length() > 0) {
            this.direction.normalize();
            this.direction.applyQuaternion(this.camera.quaternion);
            this.direction.y = 0; // Keep movement horizontal
            this.direction.normalize();

            // Apply movement with velocity and friction
            this.velocity.add(this.direction.multiplyScalar(this.settings.moveSpeed));
        }

        // Apply velocity to camera position
        this.camera.position.add(this.velocity);

        // Apply friction
        this.velocity.multiplyScalar(this.settings.friction);
    }

    enforceBounds() {
        const bounds = this.settings.cameraBounds;
        if (!bounds) return;

        // Clamp camera position to bounds
        this.camera.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, this.camera.position.x));
        this.camera.position.y = Math.max(bounds.minY, Math.min(bounds.maxY, this.camera.position.y));
        this.camera.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, this.camera.position.z));
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
        // Reset all control states
        Object.keys(this.controls).forEach(key => {
            this.controls[key] = false;
        });
        this.velocity.set(0, 0, 0);
    }

    destroy() {
        this.disable();
        
        // Remove all event listeners
        document.removeEventListener('keydown', this.onKeyDown.bind(this));
        document.removeEventListener('keyup', this.onKeyUp.bind(this));
        document.removeEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
        document.removeEventListener('mousemove', this.onMouseMove.bind(this));
        
        this.container.removeEventListener('click', this.requestPointerLock.bind(this));
        this.container.removeEventListener('mousedown', this.onMouseDown.bind(this));
        this.container.removeEventListener('mousemove', this.onMouseMove.bind(this));
        this.container.removeEventListener('mouseup', this.onMouseUp.bind(this));
        this.container.removeEventListener('contextmenu', (e) => e.preventDefault());

        console.log('🎮 SwarmDesk Controls destroyed');
    }

    // Utility methods for external integrations
    setPosition(x, y, z) {
        this.camera.position.set(x, y, z);
    }

    getPosition() {
        return this.camera.position.clone();
    }

    setRotation(x, y, z) {
        this.euler.set(x, y, z);
        this.camera.quaternion.setFromEuler(this.euler);
    }

    getRotation() {
        return this.euler.clone();
    }

    isMoving() {
        return this.velocity.length() > 0.001;
    }

    resetVelocity() {
        this.velocity.set(0, 0, 0);
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.SwarmDeskControls = SwarmDeskControls;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SwarmDeskControls;
}