import { System } from "../../engine/ecs/System.js";
import { Sprite } from "../components/Sprite.js";
import { Position } from "../components/Position.js";
import { EnemyState } from "../components/EnemyState.js";
import { RangeIndicator } from "../components/RangeIndicator.js";

export class BlobRenderSystem extends System {
    queries = {
        blobs: {
            components: [ Sprite, Position, EnemyState, RangeIndicator ]
        }
    }

    execute(game) {
        const { canvas } = game;
        const ctx = canvas.getContext('2d');

        const entities = this.queries.blobs.results;

        for (const entity of entities) {
            const sprite = entity.getComponent(Sprite);
            const position = entity.getComponent(Position);
            const enemyState = entity.getComponent(EnemyState);
            
            // Desenha todos os indicadores de alcance
            const rangeIndicators = entity.getComponents(RangeIndicator);
            for (const rangeIndicator of rangeIndicators) {
                rangeIndicator.draw(ctx, position, sprite.dimension);
            }

            // Desenha a blob customizada
            if (entity.drawBlob) {
                entity.drawBlob(ctx, position, sprite.dimension, enemyState);
            }
        }
    }
}
