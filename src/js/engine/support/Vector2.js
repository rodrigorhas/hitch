export class Vector2 {
    constructor() {
        this.x = 0;
        this.y = 0;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    copy(source) {
        this.x = source.x;
        this.y = source.y;
        return this;
    }

    clone() {
        return new Vector2().set(this.x, this.y);
    }
}
