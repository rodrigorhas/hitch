import { System } from "../../engine/ecs/System.js";
import { Position } from "../components/Position.js";
import { RigidBody } from "../components/RigidBody.js";
import { Controllable } from "../components/Tags/Controllable.js";

export class MovementSystem extends System {
    queries = {
        entities: {
            components: [Position, RigidBody]
        }
    }

    execute(game) {
        const { time } = game;
        const deltaTime = time.deltaTime;
        const entities = this.queries.entities.results;

        for (const entity of entities) {
            const position = entity.getComponent(Position);
            const rigidBody = entity.getComponent(RigidBody);

            // Aplica a velocidade do RigidBody à posição
            const velocity = rigidBody.getVelocity();
            if (velocity.length() > 0) {
                position.add(velocity.multiply(deltaTime / 1000));
            }
        }
    }
}
