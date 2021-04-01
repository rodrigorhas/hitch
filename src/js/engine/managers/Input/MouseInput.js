import { Vector2 } from "../../support/Vectors/Vector2.js";
import { GameObject } from "../../entities/GameObject.js";

export class MouseInput extends GameObject {
    initialized = false;
    position = new Vector2()

    pointer = {
        position: new Vector2(),
        lastPosition: new Vector2(),
        pressed: new Set()
    }

    handlers = {
        contextMenu(currentPosition, input, event) {
            input.pointer.pressed.add(event.button)
        },

        pointerStart(currentPosition, input, event) {
            input.pointer.pressed.add(event.button)

            input.pointer.position.set(currentPosition)
        },

        pointerMove(currentPosition, input) {
            input.position = currentPosition;

            // update position only if pointer is down
            if (input.isPressed(0)) {
                input.pointer.position.set(currentPosition)
            }
        },

        pointerEnd(currentPosition, input, event) {
            input.pointer.pressed.delete(event.button)

            input.lastPosition = currentPosition;
            input.pointer.position = new Vector2();
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
        canvas.addEventListener(DOMType, (event) => {
            event.preventDefault();

            const position = MouseInput.mouseEventToVector2(event)

            this.handlers[type](position, this, event);
        });
    }
}
