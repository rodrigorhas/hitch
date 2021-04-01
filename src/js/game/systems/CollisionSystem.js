import { System } from "../../engine/ecs/System.js";
import { Collidable } from "../components/Tags/Collidable.js";
import { Position } from "../components/Position.js";
import { BoxShape } from "../components/Shapes/BoxShape.js";
import { Collider } from "../../engine/support/Collider/Collider.js";

export class CollisionSystem extends System {
    queries = {
        entities: {
            components: [ Collidable, Position ]
        }
    }

    execute(game) {
        const { canvas } = game;

        for (const entity of this.queries.entities.results) {
            const collider = entity.getComponent(Collider);
            const position = entity.getComponent(Position);
            const shape = entity.getComponent(BoxShape);

            collider.updateBounds({ shape, position })

            if (game.debug) {
                collider.render(canvas.ctx)
            }
        }
    }
}
