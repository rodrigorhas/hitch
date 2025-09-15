import { System } from "../../engine/ecs/System.js";
import { Collidable } from "../components/Tags/Collidable.js";
import { Position } from "../components/Position.js";
import { BoxCollider } from "../../engine/support/Collider/BoxCollider.js";
import {Collider2D} from "../../engine/support/Collider/Collider2D.js";
import { Quadtree } from "../../engine/support/Quadtree.js";
import Physics from "../utils/Physics.js";

export class CollisionSystem extends System {
    queries = {
        entities: {
            components: [ Collidable, Position ]
        }
    }

    constructor() {
        super();
        this.quadtree = null;
        this.lastCanvasSize = { width: 0, height: 0 };
    }

    execute(game) {
        const { canvas } = game;

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

        const entities = this.queries.entities.results;

        // Insere todas as entidades no quadtree
        for (const entity of entities) {
            const collider = entity.getComponent(BoxCollider);
            const position = entity.getComponent(Position);

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

        // Verifica colisões usando quadtree
        for (const entity of entities) {
            const collider = entity.getComponent(BoxCollider);
            const position = entity.getComponent(Position);

            if (collider) {
                collider.updateBounds({ position });
                
                const rect = {
                    x: collider.bounds.x,
                    y: collider.bounds.y,
                    width: collider.bounds.width,
                    height: collider.bounds.height
                };

                // Busca objetos próximos no quadtree
                const nearbyObjects = this.quadtree.retrieve(rect);

                for (const obj of nearbyObjects) {
                    if (obj.entity !== entity) {
                        const otherCollider = obj.entity.getComponent(BoxCollider);
                        if (otherCollider && Collider2D.BoxColliding(collider, otherCollider)) {
                            Physics.separateBoxColliders(entity, obj.entity);
                        }
                    }
                }
            }
        }
    }
}
