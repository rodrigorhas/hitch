import { EventBus } from "../../support/EventBus.js";

/**
 * Input event system for handling input callbacks
 */
export class InputEvents extends EventBus {
    constructor() {
        super();
        this.#setupEventTypes();
    }

    #setupEventTypes() {
        // Define event types
        this.EVENT_TYPES = {
            KEY_DOWN: 'keydown',
            KEY_UP: 'keyup',
            KEY_PRESSED: 'keypressed',
            MOUSE_DOWN: 'mousedown',
            MOUSE_UP: 'mouseup',
            MOUSE_MOVE: 'mousemove',
            MOUSE_CLICK: 'mouseclick',
            GAMEPAD_CONNECTED: 'gamepadconnected',
            GAMEPAD_DISCONNECTED: 'gamepaddisconnected',
            GAMEPAD_BUTTON_DOWN: 'gamepadbuttondown',
            GAMEPAD_BUTTON_UP: 'gamepadbuttonup'
        };
    }

    /**
     * Register a callback for a specific input event
     * @param {string} eventType - The type of event
     * @param {Function} callback - The callback function
     * @param {Object} context - The context to bind the callback to
     */
    on(eventType, callback, context = null) {
        if (context) {
            callback = callback.bind(context);
        }
        super.on(eventType, callback);
    }

    /**
     * Register a one-time callback for a specific input event
     * @param {string} eventType - The type of event
     * @param {Function} callback - The callback function
     * @param {Object} context - The context to bind the callback to
     */
    once(eventType, callback, context = null) {
        if (context) {
            callback = callback.bind(context);
        }
        super.once(eventType, callback);
    }

    /**
     * Emit an input event
     * @param {string} eventType - The type of event
     * @param {Object} data - The event data
     */
    emit(eventType, data = {}) {
        super.emit(eventType, data);
    }

    /**
     * Remove a specific callback for an event type
     * @param {string} eventType - The type of event
     * @param {Function} callback - The callback function to remove
     */
    off(eventType, callback) {
        super.off(eventType, callback);
    }

    /**
     * Remove all callbacks for an event type
     * @param {string} eventType - The type of event
     */
    removeAllListeners(eventType) {
        super.removeAllListeners(eventType);
    }

    /**
     * Get all registered event types
     * @returns {string[]}
     */
    getEventTypes() {
        return Object.values(this.EVENT_TYPES);
    }
}
