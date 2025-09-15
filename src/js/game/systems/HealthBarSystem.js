import { System } from "../../engine/ecs/System.js";
import { Position } from "../components/Position.js";
import { Hittable } from "../components/Hittable.js";
import { HealthBar } from "../components/HealthBar.js";

export class HealthBarSystem extends System {
    queries = {
        entitiesWithHealthBar: {
            components: [ Position, Hittable, HealthBar ]
        }
    }

    execute(game) {
        const { canvas } = game;
        const ctx = canvas.ctx;

        const entities = this.queries.entitiesWithHealthBar.results;

        for (const entity of entities) {
            const position = entity.getComponent(Position);
            const hittable = entity.getComponent(Hittable);
            const healthBar = entity.getComponent(HealthBar);

            // Só desenha se deve mostrar a health bar
            if (healthBar.shouldShow(hittable.health, hittable.maxHealth)) {
                // Atualiza a health bar
                healthBar.update(hittable.health, hittable.maxHealth, game.time.deltaTime);
                
                // Desenha a health bar
                healthBar.draw(ctx, position);
            }
        }
    }
}
