import { randomHash } from "../support/Random.js";

export class Entity {
    #components = new Map();

    get #_components() {
        const allComponents = [];
        for (const componentArray of this.#components.values()) {
            allComponents.push(...componentArray);
        }
        return allComponents;
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
        const componentInstance = new component(data);
        
        if (!this.#components.has(component)) {
            this.#components.set(component, [componentInstance]);
        } else {
            this.#components.get(component).push(componentInstance);
        }
        
        return componentInstance;
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
     * @param {number} index - Índice do componente (0 para o primeiro, 1 para o segundo, etc.)
     * @returns {T}
     */
    getComponent(component) {
        const components = this.#components.get(component);
        
        if (components && components.length > 0) {
            return components[0];
        }

        // Fallback para busca por instância (compatibilidade com código existente)
        return this.#_components.find(
            (registeredComponent) => registeredComponent instanceof component
        );
    }

    /**
     * @function
     * @template T
     * @param {T} component
     * @returns {T[]}
     */
    getComponents(component) {
        return this.#components.get(component) || [];
    }

    /**
     * @function
     * @template T
     * @param {T} component
     * @returns {number}
     */
    getComponentCount(component) {
        const components = this.#components.get(component);
        return components ? components.length : 0;
    }

    /**
     * Destroi a entidade, adicionando-a à fila de destruição
     */
    destroy() {
        if (game.ecs && game.ecs.entities) {
            game.ecs.entities.queueDestroy(this);
        }
        
        // Marca como marcada para destruição
        this.markedForDestruction = true;
    }

    render (ctx) {
    }
}
