import { System } from "../../engine/ecs/System.js";
import { Position } from "../components/Position.js";
import { Sprite } from "../components/Sprite.js";
import { Hittable } from "../components/Hittable.js";

export class BoxRenderSystem extends System {
    queries = {
        boxes: {
            components: [ Position, Sprite, Hittable ]
        }
    }

    execute(game) {
        const { canvas } = game;
        const ctx = canvas.ctx;

        const boxes = this.queries.boxes.results;

        for (const box of boxes) {
            const position = box.getComponent(Position);
            const sprite = box.getComponent(Sprite);
            const hittable = box.getComponent(Hittable);

            // Só desenha se não estiver quebrada
            if (hittable.isAlive()) {
                // Chama o método customizado de desenho da caixa
                box.drawBox(ctx, position, sprite.dimension, hittable);
            }
        }
    }
}
