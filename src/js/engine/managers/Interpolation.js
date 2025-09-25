import { Vector2 } from "../support/Vectors/Vector2.js";

export class Interpolation {
    #previousPositions = new Map();
    #currentPositions = new Map();
    #interpolatedPositions = new Map();
    
    /**
     * Registra a posição atual de uma entidade
     * @param {Entity} entity 
     * @param {Position} position 
     */
    recordPosition(entity, position) {
        const key = entity.id;
        const pos = { x: position.x, y: position.y };
        
        // Move a posição atual para anterior
        if (this.#currentPositions.has(key)) {
            this.#previousPositions.set(key, this.#currentPositions.get(key));
        }
        
        // Define a nova posição atual
        this.#currentPositions.set(key, pos);
    }
    
    /**
     * Calcula a posição interpolada para renderização
     * @param {Entity} entity 
     * @param {number} alpha - Fator de interpolação (0-1)
     * @returns {Vector2|null}
     */
    getInterpolatedPosition(entity, alpha) {
        const key = entity.id;
        
        if (!this.#currentPositions.has(key) || !this.#previousPositions.has(key)) {
            return null;
        }
        
        const current = this.#currentPositions.get(key);
        const previous = this.#previousPositions.get(key);
        
        // Interpola entre a posição anterior e atual
        const interpolatedX = previous.x + (current.x - previous.x) * alpha;
        const interpolatedY = previous.y + (current.y - previous.y) * alpha;
        
        return new Vector2(interpolatedX, interpolatedY);
    }
    
    /**
     * Limpa as posições de uma entidade removida
     * @param {Entity} entity 
     */
    removeEntity(entity) {
        const key = entity.id;
        this.#previousPositions.delete(key);
        this.#currentPositions.delete(key);
        this.#interpolatedPositions.delete(key);
    }
    
    /**
     * Limpa todas as posições
     */
    clear() {
        this.#previousPositions.clear();
        this.#currentPositions.clear();
        this.#interpolatedPositions.clear();
    }
}

