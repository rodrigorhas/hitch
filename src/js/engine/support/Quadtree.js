import { Position } from "../../game/components/Position.js";
import { BoxCollider } from "./Collider/BoxCollider.js";
import { Vector2 } from "./Vectors/Vector2.js";

/**
 * Classe Quadtree para otimização de colisões e consultas espaciais
 * Implementa cache automático baseado no ECS
 */
export class Quadtree {
    constructor(bounds, maxObjects = 10, maxLevels = 5, level = 0) {
        this.bounds = bounds; // { x, y, width, height }
        this.maxObjects = maxObjects;
        this.maxLevels = maxLevels;
        this.level = level;
        
        this.objects = [];
        this.nodes = [];
        this.isLeaf = true;
        
        // Cache para entidades
        this.cachedEntities = new Set();
        this.lastUpdateFrame = -1;
    }

    /**
     * Limpa o quadtree
     */
    clear() {
        this.objects = [];
        this.cachedEntities.clear();
        
        if (!this.isLeaf) {
            for (let i = 0; i < 4; i++) {
                this.nodes[i].clear();
            }
            this.nodes = [];
            this.isLeaf = true;
        }
    }

    /**
     * Divide o quadtree em 4 sub-nós
     */
    split() {
        const subWidth = this.bounds.width / 2;
        const subHeight = this.bounds.height / 2;
        const x = this.bounds.x;
        const y = this.bounds.y;

        this.nodes[0] = new Quadtree(
            { x: x + subWidth, y: y, width: subWidth, height: subHeight },
            this.maxObjects,
            this.maxLevels,
            this.level + 1
        );

        this.nodes[1] = new Quadtree(
            { x: x, y: y, width: subWidth, height: subHeight },
            this.maxObjects,
            this.maxLevels,
            this.level + 1
        );

        this.nodes[2] = new Quadtree(
            { x: x, y: y + subHeight, width: subWidth, height: subHeight },
            this.maxObjects,
            this.maxLevels,
            this.level + 1
        );

        this.nodes[3] = new Quadtree(
            { x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight },
            this.maxObjects,
            this.maxLevels,
            this.level + 1
        );

        this.isLeaf = false;
    }

    /**
     * Determina em qual nó um objeto deve ser inserido
     */
    getIndex(rect) {
        let index = -1;
        const verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
        const horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);

        const topQuadrant = (rect.y < horizontalMidpoint && rect.y + rect.height < horizontalMidpoint);
        const bottomQuadrant = (rect.y > horizontalMidpoint);

        if (rect.x < verticalMidpoint && rect.x + rect.width < verticalMidpoint) {
            if (topQuadrant) {
                index = 1;
            } else if (bottomQuadrant) {
                index = 2;
            }
        } else if (rect.x > verticalMidpoint) {
            if (topQuadrant) {
                index = 0;
            } else if (bottomQuadrant) {
                index = 3;
            }
        }

        return index;
    }

    /**
     * Insere um objeto no quadtree
     */
    insert(entity, collider) {
        if (!this.boundsContain(collider)) {
            return false;
        }

        if (this.isLeaf && this.objects.length < this.maxObjects) {
            this.objects.push({ entity, collider });
            return true;
        }

        if (this.isLeaf && this.level < this.maxLevels) {
            this.split();
            this.redistributeObjects();
        }

        if (!this.isLeaf) {
            const index = this.getIndex(this.getBounds(collider));
            if (index !== -1) {
                return this.nodes[index].insert(entity, collider);
            }
        }

        this.objects.push({ entity, collider });
        return true;
    }

    /**
     * Redistribui objetos quando o nó é dividido
     */
    redistributeObjects() {
        const objectsToRedistribute = [...this.objects];
        this.objects = [];

        for (const obj of objectsToRedistribute) {
            const index = this.getIndex(this.getBounds(obj.collider));
            if (index !== -1) {
                this.nodes[index].insert(obj.entity, obj.collider);
            } else {
                this.objects.push(obj);
            }
        }
    }

    /**
     * Retorna todos os objetos que podem colidir com o objeto dado
     */
    retrieve(entity, collider) {
        const returnObjects = [];
        const bounds = this.getBounds(collider);
        const index = this.getIndex(bounds);

        if (!this.isLeaf && index !== -1) {
            returnObjects.push(...this.nodes[index].retrieve(entity, collider));
        }

        returnObjects.push(...this.objects);

        return returnObjects;
    }

    /**
     * Atualiza o quadtree com entidades do ECS
     */
    updateFromECS(game, frameNumber) {
        // Só atualiza se for um novo frame
        if (this.lastUpdateFrame === frameNumber) {
            return;
        }

        this.lastUpdateFrame = frameNumber;
        this.clear();

        // Busca todas as entidades com Position e Collidable
        const entities = game.ecs.entities.getAll();
        
        for (const entity of entities) {
            const position = entity.getComponent(Position);
            const collider = entity.getComponent(BoxCollider);
            
            if (position && collider) {
                collider.updateBounds({ position });
                this.insert(entity, collider);
            }
        }
    }

    /**
     * Busca entidades próximas a uma posição dentro de um raio
     */
    queryRadius(centerX, centerY, radius) {
        const results = [];
        this._queryRadiusRecursive(centerX, centerY, radius, results);
        return results;
    }

    /**
     * Busca entidades dentro de um retângulo
     */
    queryRect(x, y, width, height) {
        const results = [];
        this._queryRectRecursive({ x, y, width, height }, results);
        return results;
    }

    /**
     * Busca a entidade mais próxima de uma posição
     */
    findNearest(centerX, centerY, maxDistance = Infinity) {
        let nearest = null;
        let minDistance = maxDistance;

        this._findNearestRecursive(centerX, centerY, minDistance, (entity, distance) => {
            if (distance < minDistance) {
                minDistance = distance;
                nearest = entity;
            }
        });

        return nearest;
    }

    /**
     * Métodos auxiliares privados
     */
    _queryRadiusRecursive(centerX, centerY, radius, results) {
        // Verifica objetos neste nó
        for (const obj of this.objects) {
            const distance = this._distanceToPoint(obj.collider.bounds.x, obj.collider.bounds.y, centerX, centerY);
            if (distance <= radius) {
                results.push(obj.entity);
            }
        }

        // Verifica sub-nós
        if (!this.isLeaf) {
            for (const node of this.nodes) {
                if (this._circleIntersectsRect(centerX, centerY, radius, node.bounds)) {
                    node._queryRadiusRecursive(centerX, centerY, radius, results);
                }
            }
        }
    }

    _queryRectRecursive(rect, results) {
        // Verifica objetos neste nó
        for (const obj of this.objects) {
            if (this._rectsIntersect(this.getBounds(obj.collider), rect)) {
                results.push(obj.entity);
            }
        }

        // Verifica sub-nós
        if (!this.isLeaf) {
            for (const node of this.nodes) {
                if (this._rectsIntersect(node.bounds, rect)) {
                    node._queryRectRecursive(rect, results);
                }
            }
        }
    }

    _findNearestRecursive(centerX, centerY, maxDistance, callback) {
        // Verifica objetos neste nó
        for (const obj of this.objects) {
            const distance = this._distanceToPoint(obj.collider.bounds.x, obj.collider.bounds.y, centerX, centerY);
            if (distance <= maxDistance) {
                callback(obj.entity, distance);
            }
        }

        // Verifica sub-nós
        if (!this.isLeaf) {
            for (const node of this.nodes) {
                if (this._circleIntersectsRect(centerX, centerY, maxDistance, node.bounds)) {
                    node._findNearestRecursive(centerX, centerY, maxDistance, callback);
                }
            }
        }
    }

    _distanceToPoint(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    _circleIntersectsRect(centerX, centerY, radius, rect) {
        const closestX = Math.max(rect.x, Math.min(centerX, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(centerY, rect.y + rect.height));
        const distance = this._distanceToPoint(centerX, centerY, closestX, closestY);
        return distance <= radius;
    }

    _rectsIntersect(rect1, rect2) {
        return !(rect1.x + rect1.width < rect2.x ||
                rect2.x + rect2.width < rect1.x ||
                rect1.y + rect1.height < rect2.y ||
                rect2.y + rect2.height < rect1.y);
    }

    boundsContain(collider) {
        const bounds = this.getBounds(collider);
        return bounds.x >= this.bounds.x &&
               bounds.y >= this.bounds.y &&
               bounds.x + bounds.width <= this.bounds.x + this.bounds.width &&
               bounds.y + bounds.height <= this.bounds.y + this.bounds.height;
    }

    getBounds(collider) {
        return {
            x: collider.bounds.x,
            y: collider.bounds.y,
            width: collider.bounds.width,
            height: collider.bounds.height
        };
    }

    /**
     * Métodos de debug
     */
    getDebugInfo() {
        const info = {
            level: this.level,
            bounds: { ...this.bounds },
            objectCount: this.objects.length,
            isLeaf: this.isLeaf,
            children: []
        };

        if (!this.isLeaf) {
            for (const node of this.nodes) {
                info.children.push(node.getDebugInfo());
            }
        }

        return info;
    }

    /**
     * Desenha o quadtree para debug (requer contexto de canvas)
     */
    debugDraw(ctx, showObjects = true) {
        // Desenha os limites do nó
        ctx.strokeStyle = `hsl(${this.level * 60}, 70%, 50%)`;
        ctx.lineWidth = 1;
        ctx.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

        // Desenha objetos se solicitado
        if (showObjects) {
            ctx.fillStyle = `hsl(${this.level * 60}, 70%, 70%)`;
            for (const obj of this.objects) {
                const bounds = this.getBounds(obj.collider);
                ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
            }
        }

        // Desenha sub-nós
        if (!this.isLeaf) {
            for (const node of this.nodes) {
                node.debugDraw(ctx, showObjects);
            }
        }
    }

    /**
     * Retorna estatísticas do quadtree
     */
    getStats() {
        let totalObjects = this.objects.length;
        let maxDepth = this.level;
        let nodeCount = 1;

        if (!this.isLeaf) {
            for (const node of this.nodes) {
                const childStats = node.getStats();
                totalObjects += childStats.totalObjects;
                maxDepth = Math.max(maxDepth, childStats.maxDepth);
                nodeCount += childStats.nodeCount;
            }
        }

        return {
            totalObjects,
            maxDepth,
            nodeCount,
            objectsPerNode: totalObjects / nodeCount
        };
    }
}
