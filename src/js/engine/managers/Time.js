export class Time {
    lastUpdate = 0;
    timeScale = 1;

    update(run) {
        const time = performance.now();
        let delta = time - this.lastUpdate;

        this.deltaTime = delta * this.timeScale;

        run()

        this.lastUpdate = time;
    }
}
