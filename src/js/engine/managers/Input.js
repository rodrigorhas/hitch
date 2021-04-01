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
        this.keyboard = new KeyboardInput();
        this.keyboard.setup(game)
    }

    #configureMouseInput(game) {
        this.mouse = new MouseInput();
        this.mouse.setup(game)
    }

    update(game) {
        this.mouse.update(game)
        this.keyboard.update(game)
    }
}
