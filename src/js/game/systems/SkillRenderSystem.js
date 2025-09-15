import { System } from "../../engine/ecs/System.js";
import { Position } from "../components/Position.js";
import { Projectile } from "../components/Projectile.js";
import { Shield } from "../components/Shield.js";
import { DamageTrail } from "../components/DamageTrail.js";
import { Sprite } from "../components/Sprite.js";

export class SkillRenderSystem extends System {
    queries = {
        projectiles: {
            components: [ Position, Projectile ]
        },
        entitiesWithShield: {
            components: [ Position, Shield ]
        },
        entitiesWithTrail: {
            components: [ Position, DamageTrail ]
        }
    }

    execute(game) {
        const { canvas } = game;
        const ctx = canvas.ctx;

        // Renderiza projéteis
        this.renderProjectiles(ctx);

        // Renderiza escudos
        this.renderShields(ctx);

        // Renderiza rastros de dano
        this.renderDamageTrails(ctx);
    }

    /**
     * Renderiza os projéteis
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     */
    renderProjectiles(ctx) {
        const projectiles = this.queries.projectiles.results;

        for (const projectile of projectiles) {
            const position = projectile.getComponent(Position);
            const projectileComponent = projectile.getComponent(Projectile);

            projectileComponent.draw(ctx, position);
        }
    }

    /**
     * Renderiza os escudos
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     */
    renderShields(ctx) {
        const entitiesWithShield = this.queries.entitiesWithShield.results;

        for (const entity of entitiesWithShield) {
            const position = entity.getComponent(Position);
            const shield = entity.getComponent(Shield);
            const sprite = entity.getComponent(Sprite);

            if (sprite) {
                shield.draw(ctx, position, Math.max(sprite.dimension.width, sprite.dimension.height));
            } else {
                shield.draw(ctx, position, 32); // Tamanho padrão
            }
        }
    }

    /**
     * Renderiza os rastros de dano
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     */
    renderDamageTrails(ctx) {
        const entitiesWithTrail = this.queries.entitiesWithTrail.results;

        for (const entity of entitiesWithTrail) {
            const damageTrail = entity.getComponent(DamageTrail);

            damageTrail.draw(ctx);
        }
    }
}
