import { Shape } from "./Shape.js";
import { Material } from "../Material.js";
import { CircleCollider } from "../../../engine/support/Collider/CircleCollider.js";

export class CircleShape extends Shape {
    type = 'circle'

    constructor({ radius = 10 }) {
        super();

        this.radius = radius;
    }

    render(ctx, entity) {
        const { bounds } = entity.getComponent(CircleCollider)
        const material = entity.getComponent(Material)

        const circle = new Path2D();
        circle.arc(bounds.x, bounds.y, this.radius, 0, 2 * Math.PI);

        ctx.save()
        ctx.fillStyle = material.color;
        ctx.fill(circle)
        ctx.restore()
    }
}
