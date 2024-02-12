import { Collider } from "./Collider.js";

export class CircleCollider extends Collider {
    constructor({ x = 0, y = 0, radius = 0 }) {
        super();

        this.bounds = { x, y, radius }
    }

    updateBounds({ position }) {
        this.bounds.x = position.x - (this.bounds.radius * 0.5);
        this.bounds.y = position.y - (this.bounds.radius * 0.5);
    }

    render(ctx) {
        const { x, y, radius } = this.bounds;

        const circle = new Path2D();
        circle.arc(x, y, radius, 0, 2 * Math.PI)

        ctx.save()
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 2
        ctx.setLineDash([ 2, 2 ]);
        ctx.stroke(circle)
        ctx.restore()
    }
}
