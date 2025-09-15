/**
 * QueryManager - Gerencia queries e cache para o ECS
 */
export class QueryManager {
    #cache = new Map();
    #entities = [];
    #entityVersion = 0;
    #maxCacheSize = 2048;
    #keyCache = new Map(); // Cache para chaves de query

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
     * Gera uma chave única para a query baseada nos parâmetros (otimizada)
     * @param {Object} queryConfig 
     * @returns {string}
     */
    #generateCacheKey(queryConfig) {
        const { class: classes, components } = queryConfig;
        
        // Gera chave simples baseada em contadores
        const classCount = classes ? classes.length : 0;
        const componentCount = components ? components.length : 0;
        const key = `${classCount}-${componentCount}`;
        
        // Verifica cache de chaves
        if (this.#keyCache.has(key)) {
            return this.#keyCache.get(key);
        }
        
        // Gera chave otimizada (sem sort para performance)
        let classKey = '';
        if (classes && classes.length > 0) {
            classKey = classes.map(c => c.name).join(',');
        }
        
        let componentKey = '';
        if (components && components.length > 0) {
            componentKey = components.map(c => c.name).join(',');
        }
        
        const result = `${classKey}|${componentKey}`;
        this.#keyCache.set(key, result);
        return result;
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
     * Remove entradas do cache relacionadas a uma entidade específica (otimizada)
     * @param {Entity} entity 
     */
    invalidateEntity(entity) {
        // Em vez de verificar cada entrada, simplesmente limpa o cache
        // Isso é mais eficiente para muitas entidades
        if (this.#cache.size > 100) {
            this.#cache.clear();
        } else {
            // Para caches pequenos, verifica individualmente
            for (const [key, value] of this.#cache.entries()) {
                if (value.includes(entity)) {
                    this.#cache.delete(key);
                }
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
