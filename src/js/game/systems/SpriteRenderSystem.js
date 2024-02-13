import { System } from "../../engine/ecs/System.js";
import { Position } from "../components/Position.js";
import { Collider } from "../../engine/support/Collider/Collider.js";
import { Sprite } from "../components/Sprite.js";

export class SpriteRenderSystem extends System {
    queries = {
        renderables: {
            components: [ Sprite, Collider, Position ]
        }
    }

    execute({ canvas }) {
        const { ctx } = canvas;

        for (const entity of this.queries.renderables.results) {
            const position = entity.getComponent(Position)
            const sprite = entity.getComponent(Sprite)

            sprite.update({ position })
            sprite.render(ctx, entity)

            if (game.debug) {
                const collider = entity.getComponent(Collider)

                collider.onDrawDebug(canvas.ctx)
            }
        }
    }
}
