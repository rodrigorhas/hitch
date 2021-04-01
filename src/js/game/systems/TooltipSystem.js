import { System } from "../../engine/ecs/System.js";
import { Tooltip } from "../components/Tooltip.js";
import { Collider2D } from "../../engine/support/Collider/Collider2D.js";
import { Collider } from "../../engine/support/Collider/Collider.js";

export class TooltipSystem extends System {
    queries = System.queries({
        renderables: {
            components: [ Tooltip, Collider ],
        }
    })

    /**
     * @param {EngineCanvas} canvas
     * @param {Input} input
     */
    execute({ canvas, input }) {
        const { ctx } = canvas;
        const { mouse } = input;

        for (const entity of this.queries.renderables.results) {
            const collider = entity.getComponent(Collider)
            const tooltip = entity.getComponent(Tooltip)

            if (input.keyboard.isButtonDown('c')) {
                tooltip.visible = !tooltip.visible;
            }

            if (tooltip.visible || Collider2D.PointBoxColliding(mouse.position, collider)) {
                tooltip.render(ctx, entity)
            }
        }
    }
}
