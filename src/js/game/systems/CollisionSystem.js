import { System } from "../../engine/ecs/System.js";
import { Collidable } from "../components/Tags/Collidable.js";
import { Position } from "../components/Position.js";
import { BoxCollider } from "../../engine/support/Collider/BoxCollider.js";
import {Collider2D} from "../../engine/support/Collider/Collider2D.js";
import Physics from "../utils/Physics.js";
import { SpatialPartitionSystem } from "./SpatialPartitionSystem.js";

export class CollisionSystem extends System {
    useFixedUpdate = true; // Física deve rodar em taxa fixa
    
    queries = {
        entities: {
            components: [ Collidable, Position ]
        }
    }

    fixedExecute(game) {
        const entities = this.queries.entities.results;
        
        const spatialPartition = game.ecs.systems.get(SpatialPartitionSystem)
        
        const checkedPairs = new Set();

        for (const entityA of entities) {
            const colliderA = entityA.getComponent(BoxCollider);
            const positionA = entityA.getComponent(Position);

            if (!colliderA || !positionA) continue;

            colliderA.updateBounds({ position: positionA });

            // Usa cache de candidatos do SpatialPartitionSystem
            const collisionCandidates = spatialPartition.getCollisionCandidates(entityA);

            for (const entityB of collisionCandidates) {
                // Evita verificar o mesmo par duas vezes
                const pairKey = entityA.id < entityB.id ? 
                    `${entityA.id}-${entityB.id}` : 
                    `${entityB.id}-${entityA.id}`;
                
                if (checkedPairs.has(pairKey)) continue;
                checkedPairs.add(pairKey);

                const colliderB = entityB.getComponent(BoxCollider);
                const positionB = entityB.getComponent(Position);

                if (!colliderB || !positionB) continue;

                colliderB.updateBounds({ position: positionB });

                // Narrow-phase collision detection
                if (Collider2D.BoxColliding(colliderA, colliderB)) {
                    Physics.separateBoxColliders(entityA, entityB);
                }
            }
        }
    }

    /**
     * Métodos de debug - delega para o SpatialPartitionSystem
     */
    getQuadtreeDebugInfo(game) {
        const allSystems = game.ecs.systems.getAll();
        const spatialPartition = allSystems.find(system => system.constructor.name === 'SpatialPartitionSystem');
        return spatialPartition ? spatialPartition.getDebugInfo() : null;
    }

    getQuadtreeStats(game) {
        const allSystems = game.ecs.systems.getAll();
        const spatialPartition = allSystems.find(system => system.constructor.name === 'SpatialPartitionSystem');
        return spatialPartition ? spatialPartition.getQuadtreeStats() : null;
    }

    debugDrawQuadtree(ctx, showObjects = true, game) {
        const allSystems = game.ecs.systems.getAll();
        const spatialPartition = allSystems.find(system => system.constructor.name === 'SpatialPartitionSystem');
        if (spatialPartition) {
            spatialPartition.debugDrawQuadtree(ctx, showObjects);
        }
    }
}
