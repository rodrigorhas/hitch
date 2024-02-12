import { noop } from "../../game/utils/Utils.js";

export class Time {
    lastUpdate = 0;
    timeScale = 1;

    #lastFixedUpdateTime = 0;
    #fixedDeltaTime = 1000 / 60; // 60 updates per second in milliseconds

    constructor() {
        this.#lastFixedUpdateTime = performance.now();
    }

    fixedUpdate (run) {
        const now = performance.now();
        const timeSinceLastFixedUpdate = now - this.#lastFixedUpdateTime;

        if (timeSinceLastFixedUpdate >= this.#fixedDeltaTime) {
            while (this.#lastFixedUpdateTime < now - this.#fixedDeltaTime) {
                run();
                this.#lastFixedUpdateTime += this.#fixedDeltaTime;
            }
        }

    }

    update(run) {
        const time = performance.now();
        let delta = time - this.lastUpdate;

        this.deltaTime = delta * this.timeScale;

        run()

        this.lastUpdate = time;
    }
}
