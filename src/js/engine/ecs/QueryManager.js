/**
 * QueryManager - Gerencia queries e cache para o ECS
 */
export class QueryManager {
    #cache = new Map();
    #entities = [];
    #entityVersion = 0;
    #maxCacheSize = 2048;

    constructor() {
        this.#entities = [];
    }

    /**
     * Atualiza a lista de entidades e incrementa a versão apenas se houve mudanças
     * @param {Entity[]} entities 
     */
    updateEntities(entities) {
        // Só incrementa a versão se a lista de entidades realmente mudou
        if (this.#entities.length !== entities.length || 
            !this.#entities.every((entity, index) => entity === entities[index])) {
            this.#entityVersion++;
        }
        this.#entities = entities;
    }

    /**
     * Gera uma chave única para a query baseada nos parâmetros
     * @param {Object} queryConfig 
     * @returns {string}
     */
    #generateCacheKey(queryConfig) {
        const { class: classes, components } = queryConfig;
        const classKey = classes ? classes.map(c => c.name).sort().join(',') : '';
        const componentKey = components ? components.map(c => c.name).sort().join(',') : '';
        return `${classKey}|${componentKey}`;
    }

    /**
     * Verifica se uma entidade atende aos critérios da query
     * @param {Entity} entity 
     * @param {Object} queryConfig 
     * @returns {boolean}
     */
    #matchesQuery(entity, queryConfig) {
        const { class: classes, components } = queryConfig;

        // Se tem classes definidas, verifica se a entidade é de uma dessas classes
        if (classes && classes.length > 0) {
            const isCorrectClass = classes.some(cls => entity instanceof cls);
            if (!isCorrectClass) {
                return false;
            }
        }

        // Se tem componentes definidos, verifica se a entidade tem todos os componentes
        if (components && components.length > 0) {
            const hasAllComponents = components.every(component => entity.hasComponent(component));
            if (!hasAllComponents) {
                return false;
            }
        }

        return true;
    }

    /**
     * Executa uma query, usando cache quando possível
     * @param {Object} queries 
     * @returns {Object}
     */
    query(queries) {
        const results = {};

        for (const queryName in queries) {
            if (!queries.hasOwnProperty(queryName)) continue;

            const queryConfig = queries[queryName];
            const cacheKey = this.#generateCacheKey(queryConfig);
            const fullCacheKey = `${queryName}|${cacheKey}|${this.#entityVersion}`;

            // Verifica se tem resultado em cache
            if (this.#cache.has(fullCacheKey)) {
                results[queryName] = this.#cache.get(fullCacheKey);
                continue;
            }

            // Executa a query
            const queryResults = this.#entities.filter(entity => 
                this.#matchesQuery(entity, queryConfig)
            );

            // Armazena no cache
            this.#cache.set(fullCacheKey, queryResults);
            results[queryName] = queryResults;

            // Limpa cache se ficar muito grande
            this.#cleanupCacheIfNeeded();
        }

        return results;
    }

    /**
     * Limpa o cache (útil quando entidades são adicionadas/removidas)
     */
    clearCache() {
        this.#cache.clear();
    }

    /**
     * Remove entradas do cache relacionadas a uma entidade específica
     * @param {Entity} entity 
     */
    invalidateEntity(entity) {
        // Remove todas as entradas do cache que podem conter esta entidade
        for (const [key, value] of this.#cache.entries()) {
            if (value.includes(entity)) {
                this.#cache.delete(key);
            }
        }
    }

    /**
     * Limpa cache antigo se o tamanho exceder o limite
     */
    #cleanupCacheIfNeeded() {
        if (this.#cache.size > this.#maxCacheSize) {
            const entriesToRemove = this.#cache.size - Math.floor(this.#maxCacheSize * 0.2);
            const keysToRemove = Array.from(this.#cache.keys()).slice(0, entriesToRemove);
            
            for (const key of keysToRemove) {
                this.#cache.delete(key);
            }
        }
    }

    /**
     * Retorna estatísticas do cache
     * @returns {Object}
     */
    getCacheStats() {
        return {
            cacheSize: this.#cache.size,
            entityCount: this.#entities.length,
            entityVersion: this.#entityVersion,
            maxCacheSize: this.#maxCacheSize
        };
    }
}
