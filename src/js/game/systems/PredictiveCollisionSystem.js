import { System } from "../../engine/ecs/System.js";
import { Position } from "../components/Position.js";
import { Controllable } from "../components/Tags/Controllable.js";
import { RigidBody } from "../components/RigidBody.js";
import { SpeedBoost } from "../components/SpeedBoost.js";
import { BoxCollider } from "../../engine/support/Collider/BoxCollider.js";
import { Collider2D } from "../../engine/support/Collider/Collider2D.js";
import { Quadtree } from "../../engine/support/Quadtree.js";
import { Vector2 } from "../../engine/support/Vectors/Vector2.js";
import { Player } from "../entities/player/Player.js";

export class PredictiveCollisionSystem extends System {
    queries = {
        players: {
            class: [Player]
        },
        staticEntities: {
            components: [Position, BoxCollider]
        }
    }

    constructor() {
        super();
        this.quadtree = null;
        this.lastCanvasSize = { width: 0, height: 0 };
    }

    execute(game) {
        const { canvas, time } = game;
        const players = this.queries.players.results;
        const staticEntities = this.queries.staticEntities.results;

        // Cria ou atualiza quadtree se o canvas mudou de tamanho
        if (!this.quadtree || 
            canvas.width !== this.lastCanvasSize.width || 
            canvas.height !== this.lastCanvasSize.height) {
            
            this.quadtree = new Quadtree({
                x: 0,
                y: 0,
                width: canvas.width,
                height: canvas.height
            }, 10, 5);
            
            this.lastCanvasSize = { width: canvas.width, height: canvas.height };
        }

        // Limpa o quadtree
        this.quadtree.clear();

        // Insere todas as entidades estáticas no quadtree
        for (const entity of staticEntities) {
            const position = entity.getComponent(Position);
            const collider = entity.getComponent(BoxCollider);

            if (collider) {
                collider.updateBounds({ position });
                
                this.quadtree.insert({
                    entity: entity,
                    x: collider.bounds.x,
                    y: collider.bounds.y,
                    width: collider.bounds.width,
                    height: collider.bounds.height
                });
            }
        }

        for (const player of players) {
            const playerPosition = player.getComponent(Position);
            const playerCollider = player.getComponent(BoxCollider);
            const rigidBody = player.getComponent(RigidBody);

            if (!rigidBody) continue;

            // Obtém a velocidade atual do RigidBody
            const currentVelocity = rigidBody.getVelocity();
            
            if (currentVelocity.length() === 0) continue;

            // Calcula movimento pretendido baseado na velocidade
            const intendedMovement = currentVelocity.multiply(time.deltaTime / 1000);

            // Verifica colisões preditivas usando quadtree
            const collision = this.checkPredictiveCollisionWithQuadtree(
                playerPosition, 
                playerCollider, 
                intendedMovement, 
                player
            );

            if (collision) {
                // Ajusta velocidade para evitar colisão
                const adjustedVelocity = this.adjustVelocityForCollision(
                    currentVelocity, 
                    collision
                );
                
                // Aplica velocidade ajustada
                rigidBody.setVelocity(adjustedVelocity.x, adjustedVelocity.y);
            }
            // Se não há colisão, mantém a velocidade atual (já definida pelo PlayerControllerSystem)
        }
    }


    /**
     * Verifica colisão preditiva usando Quadtree
     * @param {Position} currentPosition - Posição atual
     * @param {BoxCollider} collider - Collider do player
     * @param {Vector2} movement - Movimento pretendido
     * @param {Entity} player - Entidade do player (para evitar auto-colisão)
     * @returns {Object|null} - Informações da colisão ou null
     */
    checkPredictiveCollisionWithQuadtree(currentPosition, collider, movement, player) {
        // Calcula nova posição
        const newPosition = new Position(
            currentPosition.x + movement.x,
            currentPosition.y + movement.y
        );

        // Atualiza bounds do collider
        collider.updateBounds({ position: newPosition });

        // Busca objetos próximos no quadtree
        const nearbyObjects = this.quadtree.retrieve({
            x: collider.bounds.x,
            y: collider.bounds.y,
            width: collider.bounds.width,
            height: collider.bounds.height
        });

        // Verifica colisão com objetos próximos
        for (const obj of nearbyObjects) {
            // Evita auto-colisão
            if (obj.entity === player) continue;

            const entityPosition = obj.entity.getComponent(Position);
            const entityCollider = obj.entity.getComponent(BoxCollider);

            if (!entityPosition || !entityCollider) continue;

            // Atualiza bounds da entidade
            entityCollider.updateBounds({ position: entityPosition });

            // Verifica colisão
            if (Collider2D.BoxColliding(collider, entityCollider)) {
                return {
                    entity: obj.entity,
                    position: entityPosition,
                    collider: entityCollider,
                    movement: movement
                };
            }
        }

        return null;
    }

    /**
     * Ajusta velocidade para evitar colisão
     * @param {Vector2} originalVelocity - Velocidade original
     * @param {Object} collision - Informações da colisão
     * @returns {Vector2} - Velocidade ajustada
     */
    adjustVelocityForCollision(originalVelocity, collision) {
        // Para colisão preditiva, simplesmente reduz a velocidade
        // Em uma implementação mais sofisticada, poderia calcular
        // a velocidade máxima possível antes da colisão
        
        const reductionFactor = 0.1; // Reduz velocidade em 90%
        return originalVelocity.multiply(reductionFactor);
    }
}
