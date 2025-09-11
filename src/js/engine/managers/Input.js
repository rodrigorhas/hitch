import { KeyboardInput } from "./Input/KeyboardInput.js";
import { MouseInput } from "./Input/MouseInput.js";

export class Input {
    initialized = false;

    start(game) {
        if (this.initialized) {
            return;
        }

        this.initialized = true;

        this.#configureKeyboardInput(game);
        this.#configureMouseInput(game);
    }

    #configureKeyboardInput(game) {
        if (!game) {
            console.warn('Input: game parameter is required for keyboard configuration');
            return;
        }
        this.keyboard = new KeyboardInput();
        this.keyboard.setup(game);
    }

    #configureMouseInput(game) {
        if (!game) {
            console.warn('Input: game parameter is required for mouse configuration');
            return;
        }
        this.mouse = new MouseInput();
        this.mouse.setup(game);
    }

    update(game) {
        if (this.mouse) {
            this.mouse.update(game);
        }
        if (this.keyboard) {
            this.keyboard.update(game);
        }
    }

    // Add cleanup method for proper resource management
    destroy() {
        if (this.keyboard) {
            this.keyboard.destroy();
        }
        if (this.mouse) {
            this.mouse.destroy();
        }
        this.initialized = false;
    }

    // Add method to check if input is ready
    isReady() {
        return this.initialized && this.keyboard && this.mouse;
    }
}
