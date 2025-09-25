import { System } from "../../engine/ecs/System.js";
import { Entity } from "../../engine/entities/Entity.js";

export class EntityRenderSystem extends System {
    queries = {
        renderables: {
            class: [ Entity ]
        }
    }

    execute(game) {
        const { canvas } = game;
        const { ctx } = canvas;

        for (const entity of this.queries.renderables.results) {
            entity.render(ctx)
        }
    }
}
