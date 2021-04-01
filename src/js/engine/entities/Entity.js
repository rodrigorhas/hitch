import { randomHash } from "../support/Random.js";

export class Entity {
    #components = new Map();

    get #_components() {
        return Array.from(this.#components.values())
    }

    constructor({ id, name }) {
        this.id = id || randomHash(8);
        this.name = name || this.id;
    }

    /**
     * @function
     * @template T
     * @param {T} component
     * @param {any} data
     * @returns {T}
     */
    addComponent(component, data = null) {
        this.#components.set(component, new component(data));
    }

    hasComponent(component) {
        return (
            this.#components.has(component) ||
            this.#_components.some(
                (registeredComponent) => registeredComponent instanceof component
            )
        );
    }

    /**
     * @function
     * @template T
     * @param {T} component
     * @returns {T}
     */
    getComponent(component) {
        return (
            this.#components.get(component) ||
            this.#_components.find(
                (registeredComponent) => registeredComponent instanceof component
            )
        )
    }
}
