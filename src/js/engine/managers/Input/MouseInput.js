import { Vector2 } from "../../support/Vectors/Vector2.js";
import { GameObject } from "../../entities/GameObject.js";
import { InputEvents } from "./InputEvents.js";

export class MouseInput extends GameObject {
    initialized = false;
    position = new Vector2()
    #eventListeners = new Map()
    #events = new InputEvents()
    #deltaVector = new Vector2()

    pointer = {
        position: new Vector2(),
        lastPosition: new Vector2(),
        pressed: new Set()
    }

    handlers = {
        contextMenu(currentPosition, input, event) {
            input.pointer.pressed.add(event.button)
            input.#events.emit(input.#events.EVENT_TYPES.MOUSE_DOWN, { 
                button: event.button, 
                position: currentPosition, 
                event 
            })
        },

        pointerStart(currentPosition, input, event) {
            input.pointer.pressed.add(event.button)
            input.pointer.position.set(currentPosition)
            
            input.#events.emit(input.#events.EVENT_TYPES.MOUSE_DOWN, { 
                button: event.button, 
                position: currentPosition, 
                event 
            })
        },

        pointerMove(currentPosition, input) {
            if (!input.position.equals(currentPosition)) {
                input.position.set(currentPosition);

                if (input.isPressed(0)) {
                    input.pointer.position.set(currentPosition)
                }
                
                input.#events.emit(input.#events.EVENT_TYPES.MOUSE_MOVE, { 
                    position: currentPosition, 
                    delta: input.getDelta() 
                })
            }
        },

        pointerEnd(currentPosition, input, event) {
            input.pointer.pressed.delete(event.button)
            input.pointer.lastPosition.set(currentPosition);
            input.pointer.position.set(0, 0);
            
            input.#events.emit(input.#events.EVENT_TYPES.MOUSE_UP, { 
                button: event.button, 
                position: currentPosition, 
                event 
            })
            
            // Emit click event if it was a quick press and release
            input.#events.emit(input.#events.EVENT_TYPES.MOUSE_CLICK, { 
                button: event.button, 
                position: currentPosition, 
                event 
            })
        }
    }

    static mouseToWorldPosition(pointer, canvas) {
        const rect = canvas.getBoundingClientRect();
        const offset = new Vector2(rect.left, rect.top)

        return pointer.clone().subtract(offset)
    }

    static mouseEventToVector2(event) {
        const canvas = event.target;
        const position = new Vector2(
            (event.changedTouches ? event.changedTouches[0].clientX : event.clientX),
            (event.changedTouches ? event.changedTouches[0].clientY : event.clientY)
        )

        return MouseInput.mouseToWorldPosition(position, canvas)
    }

    setup(game) {
        if (this.initialized) {
            return;
        }

        this.initialized = true;

        this.#configureHandlers(game)
    }

    isPressed(key) {
        return this.pointer.pressed.has(key)
    }

    #configureHandlers(game) {
        const { canvas } = game;

        // mouse
        this.#createPointerHandler(canvas, 'contextmenu', 'contextMenu');

        this.#createPointerHandler(canvas, 'mousedown', 'pointerStart');
        this.#createPointerHandler(canvas, 'mousemove', 'pointerMove');
        this.#createPointerHandler(canvas, 'mouseup', 'pointerEnd');

        // touch
        this.#createPointerHandler(canvas, 'touchstart', 'pointerStart');
        this.#createPointerHandler(canvas, 'touchmove', 'pointerMove');
        this.#createPointerHandler(canvas, 'touchend', 'pointerEnd');
    }

    #createPointerHandler(canvas, DOMType, type) {
        const handler = (event) => {
            event.preventDefault();

            const position = MouseInput.mouseEventToVector2(event)

            this.handlers[type](position, this, event);
        };

        // Store reference for cleanup
        this.#eventListeners.set(DOMType, handler);
        canvas.addEventListener(DOMType, handler);
    }

    // Add cleanup method for proper resource management
    destroy() {
        if (this.#eventListeners.size > 0) {
            // Note: We need access to canvas for cleanup, but it's not stored
            // This is a limitation that should be addressed in the future
            this.#eventListeners.clear()
        }
        
        this.pointer.pressed.clear()
        this.position.set(0, 0)
        this.pointer.position.set(0, 0)
        this.pointer.lastPosition.set(0, 0)
        this.initialized = false
    }

    getDelta() {
        return this.#deltaVector.set(
            this.pointer.position.x - this.pointer.lastPosition.x,
            this.pointer.position.y - this.pointer.lastPosition.y
        )
    }

    // Add method to check if mouse moved
    hasMoved() {
        return !this.pointer.position.equals(this.pointer.lastPosition)
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
