import { IterableWeakMap } from "../support/IterableWeakMap.js";

class ECSSystemManager {
    #systems = new IterableWeakMap();

    register(system, { priority } = {}) {
        const instance = new system();
        instance.priority = priority !== undefined ? priority : this.#systems.size;

        this.#systems.set(system, instance)
        return this;
    }

    unregister(system) {
        return this.#systems.delete(system);
    }

    update(game, entities) {
        const systems = Array.from(this.#systems.values());
        systems.sort((systemA, systemB) => systemA.priority - systemB.priority)

        for (const system of systems) {
            system.prepareExecution(entities)
            system.execute(game)
        }
    }
}

class ECSEntityManager {
    #entities = [];

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
}
