import { Shape } from "./Shape.js";
import { Collider } from "../../../engine/support/Collider/Collider.js";
import { Material } from "../Material.js";

export class BoxShape extends Shape {
    type = 'box'

    constructor({ width, height }) {
        super();

        this.width = width || 20;
        this.height = height || 20;
    }

    render(ctx, entity) {
        const { bounds } = entity.getComponent(Collider)
        const material = entity.getComponent(Material)

        ctx.save()
        ctx.fillStyle = material.color;
        ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h)
        ctx.restore()
    }
}
