import { noop } from "../../game/utils/Utils.js";

export class Time {
    lastUpdate = 0;
    timeScale = 1;
    deltaTime = 16.67; // Default 60 FPS delta time

    #lastFixedUpdateTime = 0;
    #fixedDeltaTime = 1000 / 60; // 60 updates per second in milliseconds
    #lowPowerMode = false;
    #frameCount = 0;
    #lastFpsCheck = 0;

    constructor() {
        this.#lastFixedUpdateTime = performance.now();
        this.lastUpdate = performance.now();
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

        // Detect low power mode by checking if delta time is consistently high
        this.#frameCount++;
        if (time - this.#lastFpsCheck > 1000) { // Check every second
            const avgDelta = (time - this.#lastFpsCheck) / this.#frameCount;
            this.#lowPowerMode = avgDelta > 50; // If average delta > 50ms (20 FPS)
            this.#frameCount = 0;
            this.#lastFpsCheck = time;
        }

        // Cap delta time to prevent large jumps
        // Use different caps based on power mode
        const maxDelta = this.#lowPowerMode ? 50 : 100; // 20 FPS vs 10 FPS
        delta = Math.min(delta, maxDelta);

        this.deltaTime = delta * this.timeScale;

        run()

        this.lastUpdate = time;
    }

    get isLowPowerMode() {
        return this.#lowPowerMode;
    }

    get fps() {
        return 1000 / this.deltaTime;
    }
}
