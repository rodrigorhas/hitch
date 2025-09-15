import { System } from "../../engine/ecs/System.js";
import { Position } from "../components/Position.js";
import { Knockback } from "../components/Knockback.js";

export class KnockbackSystem extends System {
    queries = {
        entitiesWithKnockback: {
            components: [ Position, Knockback ]
        }
    }

    execute(game) {
        const deltaTime = game.time.deltaTime;
        const entities = this.queries.entitiesWithKnockback.results;

        for (const entity of entities) {
            const position = entity.getComponent(Position);
            const knockback = entity.getComponent(Knockback);

            // Atualiza o knockback e obtém o vetor de movimento
            const knockbackVector = knockback.update(deltaTime);

            if (knockbackVector) {
                // Aplica o movimento do knockback
                position.add(knockbackVector);
            }
        }
    }
}
