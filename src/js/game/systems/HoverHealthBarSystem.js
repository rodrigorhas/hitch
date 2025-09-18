import { System } from "../../engine/ecs/System.js";
import { Position } from "../components/Position.js";
import { Hittable } from "../components/Hittable.js";
import { HealthBar } from "../components/HealthBar.js";
import { BoxCollider } from "../../engine/support/Collider/BoxCollider.js";
import { FontManager } from "../utils/FontManager.js";

export class HoverHealthBarSystem extends System {
    queries = {
        hittableEntities: {
            components: [Position, Hittable, BoxCollider]
        }
    }

    #lastHoveredEntity = null;
    #hoverStartTime = 0;
    #hoverDelay = 500; // 500ms de delay antes de mostrar

    execute(game) {
        const { canvas, input, time } = game;
        const ctx = canvas.ctx;
        const mousePos = input.mouse.position;

        const entityUnderMouse = this.findEntityUnderMouse(mousePos);

        if (entityUnderMouse) {
            // Se é a mesma entidade, verifica se passou o delay
            if (this.#lastHoveredEntity === entityUnderMouse) {
                if (time.now - this.#hoverStartTime >= this.#hoverDelay) {
                    this.showHealthBar(ctx, entityUnderMouse, game);
                }
            } else {
                // Nova entidade, reseta o timer
                this.#lastHoveredEntity = entityUnderMouse;
                this.#hoverStartTime = time.now;
            }
        } else {
            // Mouse não está sobre nenhuma entidade
            this.#lastHoveredEntity = null;
            this.#hoverStartTime = 0;
        }
    }

    /**
     * Mostra a health bar da entidade
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     * @param {Entity} entity - Entidade para mostrar health bar
     * @param {Object} game - Instância do jogo
     */
    showHealthBar(ctx, entity, game) {
        const position = entity.getComponent(Position);
        const hittable = entity.getComponent(Hittable);
        const collider = entity.getComponent(BoxCollider);

        collider.updateBounds({ position });

        const healthBar = entity.getComponent(HealthBar);

        if (healthBar) {
            healthBar.update(hittable.health, hittable.maxHealth, game.time.deltaTime);
            healthBar.draw(ctx, position);
        }
    }

    /**
     * Encontra a entidade sob o mouse
     * @param {Vector2} mousePos - Posição do mouse
     * @returns {Entity|null} - Entidade sob o mouse ou null
     */
    findEntityUnderMouse(mousePos) {
        const entities = this.queries.hittableEntities.results;

        for (const entity of entities) {
            const position = entity.getComponent(Position);
            const collider = entity.getComponent(BoxCollider);

            // Atualiza bounds do collider
            collider.updateBounds({ position });

            // Verifica se o mouse está dentro do collider
            if (this.isPointInCollider(mousePos, collider)) {
                return entity;
            }
        }

        return null;
    }

    /**
     * Verifica se um ponto está dentro de um collider
     * @param {Vector2} point - Ponto a verificar
     * @param {BoxCollider} collider - Collider a verificar
     * @returns {boolean}
     */
    isPointInCollider(point, collider) {
        const bounds = collider.getBounds();
        return point.x >= bounds.x && 
               point.x <= bounds.x + bounds.width &&
               point.y >= bounds.y && 
               point.y <= bounds.y + bounds.height;
    }

    /**
     * Desenha a health bar de hover
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     * @param {Position} position - Posição da entidade
     * @param {Hittable} hittable - Componente hittable
     * @param {BoxCollider} collider - Collider da entidade
     */
    drawHoverHealthBar(ctx, position, hittable, collider) {
        const bounds = collider.getBounds();
        
        // Configurações da health bar
        const width = Math.max(40, bounds.width);
        const height = 6;
        const offsetY = -15;
        
        const barX = position.x - width / 2;
        const barY = position.y + offsetY;
        const currentHealthWidth = (hittable.health / hittable.maxHealth) * width;

        // Cor da barra de vida
        const healthPercentage = hittable.health / hittable.maxHealth;
        let healthColor = '#00ff00'; // Verde
        if (healthPercentage <= 0.3) {
            healthColor = '#ff0000'; // Vermelho
        } else if (healthPercentage <= 0.6) {
            healthColor = '#ffaa00'; // Laranja
        }

        ctx.save()
        // Desenha fundo da barra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX - 2, barY - 2, width + 4, height + 4);

        // Desenha a barra de vida
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, width, height);

        // Desenha a vida atual
        ctx.fillStyle = healthColor;
        ctx.fillRect(barX, barY, currentHealthWidth, height);

        // Desenha a borda
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, width, height);

        // Desenha texto com a vida
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            `${Math.ceil(hittable.health)}/${hittable.maxHealth}`, 
            position.x, 
            barY - 5
        );
        ctx.restore()
    }
}
