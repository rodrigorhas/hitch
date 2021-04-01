import { GameObject } from "../../entities/GameObject.js";

export class KeyboardInput extends GameObject {
    #pressedKeys = new Set()
    #buttonDown = new Set()

    initialized = false;

    setup() {
        if (this.initialized) {
            return;
        }

        this.initialized = true;

        document.body.onkeydown = (event) => {
            if (!event.repeat && !this.#buttonDown.has(event.key)) {
                this.#buttonDown.add(event.key)
            }
        }

        document.body.onkeypress = (event) => {
            this.#pressedKeys.add(event.key)
        }

        document.body.onkeyup = (event) => {
            this.#pressedKeys.delete(event.key)
            this.#buttonDown.delete(event.key)
        }
    }

    isPressed(key) {
        return this.#pressedKeys.has(key)
    }

    isButtonDown(key) {
        return this.#buttonDown.has(key)
    }

    update() {
        this.#buttonDown.clear()
    }
}
