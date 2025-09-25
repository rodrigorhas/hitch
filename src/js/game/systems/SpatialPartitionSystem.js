import { System } from "../../engine/ecs/System.js";
import { Position } from "../components/Position.js";
import { Collidable } from "../components/Tags/Collidable.js";
import { BoxCollider } from "../../engine/support/Collider/BoxCollider.js";
import { SpatialDirty } from "../components/SpatialDirty.js";
import { Quadtree } from "../../engine/support/Quadtree.js";

/**
 * Sistema centralizado de particionamento espacial
 * Gerencia o quadtree global e cache de candidatos a colisão
 */
export class SpatialPartitionSystem extends System {
    useFixedUpdate = true; // Deve rodar antes dos outros sistemas
    
    queries = {
        entities: {
            components: [ Collidable, Position ]
        },
        dirtyEntities: {
            components: [ SpatialDirty, Position ]
        }
    }

    constructor() {
        super();
        
        // Quadtree centralizado
        this.quadtree = new Quadtree(
            { x: -1000, y: -1000, width: 2000, height: 2000 },
            10, // maxObjects por nó
            5   // maxLevels
        );
        
        // Cache de candidatos a colisão
        this.collisionCandidates = new Map(); // entityId -> Set<entityIds>
        this.dirtyEntities = new Set(); // Entidades que mudaram de posição
        this.frameNumber = 0;
        
        // Cache de entidades por tipo para consultas otimizadas
        this.entityCache = {
            players: new Set(),
            enemies: new Set(),
            boxes: new Set(),
            all: new Set()
        };
    }

    fixedExecute(game) {
        this.frameNumber++;
        
        // Atualiza cache de entidades
        this.updateEntityCache();
        
        // Verifica entidades dirty e marca para atualização
        this.checkDirtyEntities();
        
        // Atualização em lote otimizada
        this.batchUpdateQuadtree();
        
        // Gera cache de candidatos a colisão
        this.generateCollisionCandidates();
    }

    /**
     * Atualiza cache de entidades por tipo
     */
    updateEntityCache() {
        // Limpa caches
        this.entityCache.players.clear();
        this.entityCache.enemies.clear();
        this.entityCache.boxes.clear();
        this.entityCache.all.clear();

        const entities = this.queries.entities.results;
        
        for (const entity of entities) {
            this.entityCache.all.add(entity);
            
            // Classifica por tipo baseado na classe da entidade
            if (entity.constructor.name === 'Player') {
                this.entityCache.players.add(entity);
            } else if (entity.constructor.name === 'Enemy' || entity.constructor.name === 'Blob') {
                this.entityCache.enemies.add(entity);
            } else if (entity.constructor.name === 'Box') {
                this.entityCache.boxes.add(entity);
            }
        }
    }

    /**
     * Verifica entidades dirty e marca para atualização
     */
    checkDirtyEntities() {
        const dirtyEntities = this.queries.dirtyEntities.results;
        
        for (const entity of dirtyEntities) {
            const spatialDirty = entity.getComponent(SpatialDirty);
            const position = entity.getComponent(Position);
            
            if (spatialDirty && position) {
                // Verifica se a posição mudou significativamente
                if (spatialDirty.checkPositionChange(position)) {
                    this.dirtyEntities.add(entity);
                }
            }
        }
    }

    /**
     * Atualiza quadtree apenas para entidades que mudaram (dirty)
     */
    updateQuadtreeSelective() {
        // Se muitas entidades mudaram, é mais eficiente reconstruir tudo
        if (this.dirtyEntities.size > this.entityCache.all.size * 0.3) {
            this.rebuildQuadtree();
            this.clearAllDirtyFlags();
            return;
        }

        // Atualiza apenas entidades dirty
        for (const entity of this.dirtyEntities) {
            const position = entity.getComponent(Position);
            const collider = entity.getComponent(BoxCollider);
            const spatialDirty = entity.getComponent(SpatialDirty);
            
            if (position && collider) {
                collider.updateBounds({ position });
                this.quadtree.insert(entity, position, collider);
                
                // Limpa o flag dirty
                if (spatialDirty) {
                    spatialDirty.clearDirty();
                }
            }
        }
        
        this.dirtyEntities.clear();
    }

    /**
     * Limpa todos os dirty flags
     */
    clearAllDirtyFlags() {
        const dirtyEntities = this.queries.dirtyEntities.results;
        
        for (const entity of dirtyEntities) {
            const spatialDirty = entity.getComponent(SpatialDirty);
            if (spatialDirty) {
                spatialDirty.clearDirty();
            }
        }
        
        this.dirtyEntities.clear();
    }

    /**
     * Reconstrói o quadtree completamente
     */
    rebuildQuadtree() {
        this.quadtree.clear();
        
        const entities = this.queries.entities.results;
        
        for (const entity of entities) {
            const position = entity.getComponent(Position);
            const collider = entity.getComponent(BoxCollider);
            
            if (position && collider) {
                collider.updateBounds({ position });
                const inserted = this.quadtree.insert(entity, collider);
            }
        }
    }

    /**
     * Atualização em lote otimizada
     */
    batchUpdateQuadtree() {
        // Se o quadtree está vazio ou é o primeiro frame, reconstrói tudo
        if (this.frameNumber === 1 || this.quadtree.objects.length === 0) {
            this.rebuildQuadtree();
            this.clearAllDirtyFlags();
            return;
        }
        
        // Coleta todas as entidades que precisam ser atualizadas
        const entitiesToUpdate = [];
        
        // Adiciona entidades dirty
        for (const entity of this.dirtyEntities) {
            entitiesToUpdate.push(entity);
        }
        
        // Se muitas entidades mudaram, reconstrói tudo
        if (entitiesToUpdate.length > this.entityCache.all.size * 0.3) {
            this.rebuildQuadtree();
            this.clearAllDirtyFlags();
            return;
        }
        
        // Atualiza em lote
        this.batchInsertEntities(entitiesToUpdate);
        
        // Limpa dirty flags
        this.clearDirtyFlagsForEntities(entitiesToUpdate);
        this.dirtyEntities.clear();
    }

    /**
     * Inserção em lote de entidades no quadtree
     */
    batchInsertEntities(entities) {
        for (const entity of entities) {
            const position = entity.getComponent(Position);
            const collider = entity.getComponent(BoxCollider);
            
            if (position && collider) {
                collider.updateBounds({ position });
                this.quadtree.insert(entity, collider);
            }
        }
    }

    /**
     * Limpa dirty flags para entidades específicas
     */
    clearDirtyFlagsForEntities(entities) {
        for (const entity of entities) {
            const spatialDirty = entity.getComponent(SpatialDirty);
            if (spatialDirty) {
                spatialDirty.clearDirty();
            }
        this.dirtyEntities.delete(entity);
        }
    }

    /**
     * Gera cache de candidatos a colisão para cada entidade
     */
    generateCollisionCandidates() {
        this.collisionCandidates.clear();
        
        const entities = this.queries.entities.results;
        
        for (const entity of entities) {
            const collider = entity.getComponent(BoxCollider);
            
            if (!collider) continue;
            
            // Busca entidades próximas usando quadtree
            const nearbyObjects = this.quadtree.retrieve(entity, collider);
            const candidates = new Set();
            
            for (const obj of nearbyObjects) {
                if (obj.entity !== entity) {
                    candidates.add(obj.entity);
                }
            }
            
            this.collisionCandidates.set(entity.id, candidates);
        }
    }

    /**
     * Marca uma entidade como dirty (mudou de posição)
     */
    markEntityDirty(entity) {
        this.dirtyEntities.add(entity);
    }

    /**
     * Obtém candidatos a colisão para uma entidade
     */
    getCollisionCandidates(entity) {
        return this.collisionCandidates.get(entity.id) || new Set();
    }

    /**
     * Busca entidades em um raio
     */
    queryRadius(centerX, centerY, radius) {
        return this.quadtree.queryRadius(centerX, centerY, radius);
    }

    /**
     * Busca entidades em um retângulo
     */
    queryRect(x, y, width, height) {
        return this.quadtree.queryRect(x, y, width, height);
    }

    /**
     * Encontra a entidade mais próxima
     */
    findNearest(centerX, centerY, maxDistance = Infinity, filterType = null) {
        const nearbyEntities = this.quadtree.queryRadius(centerX, centerY, maxDistance);
        
        let nearest = null;
        let minDistance = maxDistance;
        
        for (const entity of nearbyEntities) {
            // Filtra por tipo se especificado
            if (filterType) {
                if (filterType === 'player' && !this.entityCache.players.has(entity)) continue;
                if (filterType === 'enemy' && !this.entityCache.enemies.has(entity)) continue;
                if (filterType === 'box' && !this.entityCache.boxes.has(entity)) continue;
            }
            
            const position = entity.getComponent(Position);
            if (!position) continue;
            
            const distance = Math.sqrt(
                Math.pow(centerX - position.x, 2) + 
                Math.pow(centerY - position.y, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                nearest = entity;
            }
        }
        
        return nearest;
    }

    /**
     * Busca entidades de um tipo específico em um raio
     */
    queryRadiusByType(centerX, centerY, radius, entityType) {
        const nearbyEntities = this.quadtree.queryRadius(centerX, centerY, radius);
        const filtered = [];
        
        for (const entity of nearbyEntities) {
            if (entityType === 'player' && this.entityCache.players.has(entity)) {
                filtered.push(entity);
            } else if (entityType === 'enemy' && this.entityCache.enemies.has(entity)) {
                filtered.push(entity);
            } else if (entityType === 'box' && this.entityCache.boxes.has(entity)) {
                filtered.push(entity);
            }
        }
        
        return filtered;
    }

    /**
     * Métodos de debug
     */
    getDebugInfo() {
        return {
            quadtree: this.quadtree.getDebugInfo(),
            stats: this.quadtree.getStats(),
            cache: {
                totalEntities: this.entityCache.all.size,
                players: this.entityCache.players.size,
                enemies: this.entityCache.enemies.size,
                boxes: this.entityCache.boxes.size,
                dirtyEntities: this.dirtyEntities.size,
                collisionCandidates: this.collisionCandidates.size
            }
        };
    }

    getQuadtreeStats() {
        return this.quadtree.getStats();
    }

    debugDrawQuadtree(ctx, showObjects = true) {
        this.quadtree.debugDraw(ctx, showObjects);
    }

    /**
     * Força atualização completa (útil para debug)
     */
    forceFullUpdate() {
        this.dirtyEntities.clear();
        this.rebuildQuadtree();
        this.generateCollisionCandidates();
    }
}
