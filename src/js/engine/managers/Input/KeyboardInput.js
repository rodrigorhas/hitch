import { GameObject } from "../../entities/GameObject.js";
import { InputEvents } from "./InputEvents.js";

export class KeyboardInput extends GameObject {
    #pressedKeys = new Set()
    #buttonDown = new Set()
    #eventListeners = new Map()
    #events = new InputEvents()

    initialized = false;

    setup() {
        if (this.initialized) {
            return;
        }

        this.initialized = true;

        // Use addEventListener instead of direct assignment
        const keydownHandler = (event) => {
            if (!event.repeat && !this.#buttonDown.has(event.key)) {
                this.#buttonDown.add(event.key)
                this.#events.emit(this.#events.EVENT_TYPES.KEY_DOWN, { key: event.key, event })
            }
            // Add to pressed keys for isPressed() method
            this.#pressedKeys.add(event.key)
        }

        const keyupHandler = (event) => {
            this.#pressedKeys.delete(event.key)
            this.#buttonDown.delete(event.key)
            this.#events.emit(this.#events.EVENT_TYPES.KEY_UP, { key: event.key, event })
        }

        // Store references for cleanup
        this.#eventListeners.set('keydown', keydownHandler)
        this.#eventListeners.set('keyup', keyupHandler)

        document.addEventListener('keydown', keydownHandler)
        document.addEventListener('keyup', keyupHandler)
    }

    isPressed(key) {
        return this.#pressedKeys.has(key)
    }

    isPressedForAction(actionKeys) {
        return actionKeys.some(key => this.isPressed(key))
    }

    isButtonDown(key) {
        return this.#buttonDown.has(key)
    }

    update() {
        // Emit key pressed events for all currently pressed keys
        for (const key of this.#pressedKeys) {
            this.#events.emit(this.#events.EVENT_TYPES.KEY_PRESSED, { key })
        }
        
        this.#buttonDown.clear()
    }

    // Add cleanup method for proper resource management
    destroy() {
        if (this.#eventListeners.size > 0) {
            for (const [eventType, handler] of this.#eventListeners) {
                document.removeEventListener(eventType, handler)
            }
            this.#eventListeners.clear()
        }
        
        this.#pressedKeys.clear()
        this.#buttonDown.clear()
        this.initialized = false
    }

    // Add method to check if any key is currently pressed
    hasAnyKeyPressed() {
        return this.#pressedKeys.size > 0
    }

    // Add method to get all currently pressed keys
    getPressedKeys() {
        return Array.from(this.#pressedKeys)
    }

    // Add method to access the event system
    get events() {
        return this.#events;
    }

    // Add method to register event listeners
    on(eventType, callback, context = null) {
        this.#events.on(eventType, callback, context);
    }

    // Add method to remove event listeners
    off(eventType, callback) {
        this.#events.off(eventType, callback);
    }
}
