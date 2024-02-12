import { System } from "../../engine/ecs/System.js";
import { Shape } from "../components/Shapes/Shape.js";
import { Position } from "../components/Position.js";
import { Collider } from "../../engine/support/Collider/Collider.js";

export class ShapeRenderSystem extends System {
    queries = {
        renderables: {
            components: [ Shape, Collider, Position ]
        }
    }

    execute({ canvas }) {
        const { ctx } = canvas;

        for (const entity of this.queries.renderables.results) {
            const shape = entity.getComponent(Shape)

            shape.render(ctx, entity)
        }
    }
}
