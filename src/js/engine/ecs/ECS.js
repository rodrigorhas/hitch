import { IterableWeakMap } from "../support/IterableWeakMap.js";
import { Position } from "../../game/components/Position.js";
import { QueryManager } from "./QueryManager.js";

class ECSSystemManager {
    #systems = new IterableWeakMap();
    #systemsByPriority = [];

    register(system, { priority } = {}) {
        const instance = new system();
        instance.priority = priority !== undefined ? priority : this.#systems.size;

        this.#systems.set(system, instance)
        this.#systemsByPriority = Array
            .from(this.#systems.values())
            .sort((systemA, systemB) => systemA.priority - systemB.priority)

        return this;
    }

    unregister(system) {
        return this.#systems.delete(system);
    }

    /**
     * @param {Engine} game
     * @param {ECSEntityManager} entities
     */
    update(game, entities) {
        const systems = this.#systemsByPriority;

        for (const system of systems) {
            system.prepareExecution(entities)
            system.execute(game)
        }
    }

    /**
     * @param {Engine} game
     * @param {ECSEntityManager} entities
     */
    fixedUpdate(game, entities) {
        const systems = this.#systemsByPriority;

        for (const system of systems) {
            if (system.useFixedUpdate) {
                system.prepareExecution(entities)
                system.execute(game)
            }
        }
    }
}

class ECSEntityManager {
    /**
     * @type {Entity[]}
     */
    #entities = [];
    
    /**
     * @type {Entity[]}
     */
    #destroyQueue = [];

    /**
     * @type {QueryManager}
     */
    #queryManager = new QueryManager();

    /**
     * @param {Object.<string, {class?: Function[], components?: Component[], results?: Entity[]}>} queries
     */
    query(queries) {
        this.#queryManager.updateEntities(this.#entities);
        
        // Executa as queries usando o QueryManager
        const results = this.#queryManager.query(queries);
        
        // Atualiza os resultados nas queries originais para compatibilidade
        for (const queryName in queries) {
            if (queries.hasOwnProperty(queryName)) {
                queries[queryName].results = results[queryName] || [];
            }
        }

        return queries;
    }

    count() {
        return this.#entities.length;
    }

    get() {
        return this.#entities.slice();
    }

    add(...entities) {
        entities = entities.flat(Infinity);
        this.#entities.push(...entities);
        // Invalida o cache quando entidades são adicionadas
        this.#queryManager.clearCache();

        return this;
    }

    remove(entity) {
        const index = this.#entities.indexOf(entity);
        if (index > -1) {
            this.#entities.splice(index, 1);
            // Invalida cache relacionado a esta entidade
            this.#queryManager.invalidateEntity(entity);
            return true;
        }
        return false;
    }

    removeById(id) {
        const index = this.#entities.findIndex(entity => entity.id === id);
        if (index > -1) {
            const entity = this.#entities[index];
            this.#entities.splice(index, 1);
            // Invalida cache relacionado a esta entidade
            this.#queryManager.invalidateEntity(entity);
            return true;
        }
        return false;
    }

    /**
     * Adiciona uma entidade à fila de destruição
     * @param {Entity} entity 
     */
    queueDestroy(entity) {
        if (!this.#destroyQueue.includes(entity)) {
            this.#destroyQueue.push(entity);
        }
    }

    /**
     * Processa a fila de destruição, removendo as entidades
     */
    processDestroyQueue() {
        for (const entity of this.#destroyQueue) {
            this.remove(entity);
            entity.destroyed = true;
        }
        this.#destroyQueue.length = 0; // Limpa a fila
    }

    /**
     * Retorna estatísticas do cache de queries
     * @returns {Object}
     */
    getQueryCacheStats() {
        return this.#queryManager.getCacheStats();
    }

    /**
     * Limpa o cache de queries
     */
    clearQueryCache() {
        this.#queryManager.clearCache();
    }

    sort () {
        this.#entities = this.#entities.toSorted((a, b) => {
            const posA = a.getComponent(Position);
            const posB = b.getComponent(Position);

            return posA.y - posB.y;
        })
    }
}

export class ECS {
    systems = new ECSSystemManager()
    entities = new ECSEntityManager()

    start() {
    }

    update(game) {
        this.sortEntitiesByLayer();

        this.systems.update(game, this.entities)
        
        // Processa a fila de destruição no final do frame
        this.entities.processDestroyQueue();
    }

    fixedUpdate(game) {
        this.systems.fixedUpdate(game, this.entities)
    }

    sortEntitiesByLayer() {
        this.entities.sort()
    }

    /**
     * Retorna estatísticas do cache de queries
     * @returns {Object}
     */
    getQueryCacheStats() {
        return this.entities.getQueryCacheStats();
    }

    /**
     * Limpa o cache de queries
     */
    clearQueryCache() {
        this.entities.clearQueryCache();
    }
}
