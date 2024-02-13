import { System } from "../../engine/ecs/System.js";
import { Collidable } from "../components/Tags/Collidable.js";
import { Position } from "../components/Position.js";
import { BoxShape } from "../components/Shapes/BoxShape.js";
import { Collider } from "../../engine/support/Collider/Collider.js";
import { BoxCollider } from "../../engine/support/Collider/BoxCollider.js";
import {Collider2D} from "../../engine/support/Collider/Collider2D.js";

export class CollisionSystem extends System {
    queries = {
        entities: {
            components: [ Collidable, Position ]
        }
    }

    execute(game) {
        const { canvas } = game;

        const entities = this.queries.entities.results;

        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const entityA = entities[i];
                const entityB = entities[j];

                const colliderA = entityA.getComponent(BoxCollider);
                const positionA = entityA.getComponent(Position);

                const colliderB = entityB.getComponent(BoxCollider);
                const positionB = entityB.getComponent(Position);

                colliderA.updateBounds({ position: positionA })
                colliderB.updateBounds({ position: positionB })

                console.log(colliderA, colliderB)

                if (Collider2D.BoxColliding(colliderA, colliderB)) {
                    const previousPositionA = positionA.previousPosition;

                    positionA.set(previousPositionA.x, previousPositionA.y)

                    // const previousPositionB = positionB.previousPosition;
                    //
                    // positionB.set(previousPositionB.x, previousPositionB.y)

                    // console.log('collide')
                }

                if (game.debug) {
                    colliderA.render(canvas.ctx)
                    colliderB.render(canvas.ctx)
                }
            }
        }
    }
}
