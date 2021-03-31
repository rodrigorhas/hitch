import { randomHash } from "../support/Random.js";

export class Entity {
    #components = new Map();

    constructor(options) {
        this.state = {
            id: randomHash(8),
            name: options.name,
        }
    }

    addComponent(component, data) {
        this.#components.set(component, new component(data));
    }

    hasComponent(component) {
        return this.#components.has(component);
    }

    getComponent(component) {
        return this.#components.get(component);
    }
}
