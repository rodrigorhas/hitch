export class Time {
    lastUpdate = 0;
    timeScale = 1;

    update () {
        const currentTime = new Date().getTime();
        const delta = currentTime - this.lastUpdate;

        this.lastUpdate = new Date().getTime()
        this.deltaTime = delta * this.timeScale;
    }
}
