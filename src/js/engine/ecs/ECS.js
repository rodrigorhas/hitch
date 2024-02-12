import { IterableWeakMap } from "../support/IterableWeakMap.js";

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
                console.log(system.name)
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
     * @param {Object.<string, {components: Component[], results: Entity[]}>} queries
     */
    query(queries) {
        // TODO: implement a QueryManager to cache queries
        for (const queryName in queries) {
            if (queries.hasOwnProperty(queryName)) {
                const query = queries[queryName];

                query.results = this.#entities
                    .filter(
                        (entity) => query.components.every(
                            (component) => entity.hasComponent(component)
                        )
                    )
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
    }
}

export class ECS {
    systems = new ECSSystemManager()
    entities = new ECSEntityManager()

    start() {
    }

    update(game) {
        this.systems.update(game, this.entities)
    }

    fixedUpdate(game) {
        this.systems.fixedUpdate(game, this.entities)
    }
}
