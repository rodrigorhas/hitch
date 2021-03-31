import { System } from "../../engine/ecs/System.js";
import { BoxShape } from "../components/BoxShape.js";
import { Position } from "../components/Position.js";

export class RenderSystem extends System {
    queries = {
        renderables: {
            components: [ BoxShape ]
        }
    }

    execute({ canvas }) {
        const { ctx } = canvas;
        for (const entity of this.queries.renderables.results) {
            const position = entity.getComponent(Position)
            const shape = entity.getComponent(BoxShape)

            ctx.fillStyle = shape.color;

            ctx.fillRect(
                position.x, position.y,
                shape.width, shape.height
            );
        }
    }
}
