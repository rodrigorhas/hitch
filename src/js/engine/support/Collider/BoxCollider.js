import { Collider } from "./Collider.js";

export class BoxCollider extends Collider {
    constructor({ x = 0, y = 0, w = 0, h = 0 }) {
        super();

        this.bounds = { x, y, w, h }
    }

    updateBounds({ shape, position }) {
        this.bounds = {
            x: position.x - (shape.width * 0.5),
            y: position.y - (shape.height * 0.5),
            w: shape.width,
            h: shape.height
        }
    }

    render(ctx) {
        const { x, y, w, h } = this.bounds;

        ctx.save()
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 2
        ctx.setLineDash([ 2, 2 ]);
        ctx.strokeRect(x, y, w, h)
        ctx.restore()
    }
}
