import { Collider } from "./Collider.js";
import { noop } from "../../../game/utils/Utils.js";

export class BoxCollider extends Collider {
    constructor({
        x = 0, y = 0,
        width = 0, height = 0,
        offset, onDrawDebug = noop
    }) {
        super();

        this.offset = {
            x: offset.x || 0,
            y: offset.y || 0,
        };

        this.bounds = { x, y, width, height };

        if (onDrawDebug) {
            this.onDrawDebug = onDrawDebug;
        }
    }

    updateBounds({ position }) {
        this.bounds = {
            x: position.x - (this.bounds.width * 0.5) + this.offset.x,
            y: position.y - (this.bounds.height * 0.5) + this.offset.y,
            width: this.bounds.width,
            height: this.bounds.height
        }
    }

    getBounds () {
        return this.bounds;
    }

    onDrawDebug(ctx) {
        const { x, y, width, height } = this.bounds;

        ctx.save()
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 2
        ctx.setLineDash([ 2, 2 ]);
        ctx.strokeRect(x, y, width, height)
        ctx.restore()
    }
}
