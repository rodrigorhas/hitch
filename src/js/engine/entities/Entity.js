import { randomHash } from "../support/Random.js";

export class Entity {
    #components = new Map();

    constructor({ id, name }) {
        this.id = id || randomHash(8);
        this.name = name || this.id;
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
