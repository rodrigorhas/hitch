/**
 * @template T
 * @typedef {{components: Component[], results: Entity[]}} SystemQuery
 */

/**
 * @template T
 * @typedef {Object.<T, SystemQuery>} SystemQueries
 */

export class System {
    /**
     * @param {SystemQueries<any>} queries
     */
    queries = {}
    useFixedUpdate = false;

    /**
     * @function
     * @template T
     * @param {T} queries
     * @returns {SystemQueries<(keyof T)>}
     */
    static queries(queries) {
        return queries;
    }

    /**
     * @param {ECSEntityManager} entities
     */
    prepareExecution(entities) {
        this.queries = entities.query(this.queries)
    }

    execute(engine) {
    }
}
