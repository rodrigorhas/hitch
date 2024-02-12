import { Collider } from "./Collider.js";

export class BoxCollider extends Collider {
    constructor({ x = 0, y = 0, width = 0, height = 0 }) {
        super();

        this.bounds = { x, y, width, height }
    }

    updateBounds({ shape, position }) {
        this.bounds = {
            x: position.x - (shape.width * 0.5),
            y: position.y - (shape.height * 0.5),
            width: shape.width,
            height: shape.height
        }
    }

    render(ctx) {
        const { x, y, width, height } = this.bounds;

        ctx.save()
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 2
        ctx.setLineDash([ 2, 2 ]);
        ctx.strokeRect(x, y, width, height)
        ctx.restore()
    }
}
