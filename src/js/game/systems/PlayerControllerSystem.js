import { System } from "../../engine/ecs/System.js";
import { Position } from "../components/Position.js";
import { Controllable } from "../components/tags/Controllable.js";
import { RigidBody } from "../components/RigidBody.js";

export class PlayerControllerSystem extends System {
    queries = {
        players: {
            components: [ Controllable, RigidBody, Position ]
        }
    }

    execute({ canvas, input, time }) {
        for (const entity of this.queries.players.results) {
            const position = entity.getComponent(Position)
            const rb = entity.getComponent(RigidBody)

            if (input.isPressed('a')) {
                position.x += (rb.speed * -1) * time.deltaTime;
            }

            if (input.isPressed('d')) {
                position.x += rb.speed * time.deltaTime;
            }

            if (input.isPressed('w')) {
                position.y += (rb.speed * -1) * time.deltaTime;
            }

            if (input.isPressed('s')) {
                position.y += rb.speed * time.deltaTime;
            }
        }
    }
}
