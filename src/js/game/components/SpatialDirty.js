import { Component } from "../../engine/ecs/Component.js";

/**
 * Componente para rastrear mudanças espaciais
 * Marca entidades que mudaram de posição para reinserção seletiva no quadtree
 */
export class SpatialDirty extends Component {
    constructor() {
        super();
        this.isDirty = false;
        this.lastPosition = { x: 0, y: 0 };
        this.dirtyCount = 0; // Contador para debug
    }

    /**
     * Marca a entidade como dirty
     */
    markDirty() {
        this.isDirty = true;
        this.dirtyCount++;
    }

    /**
     * Limpa o flag dirty
     */
    clearDirty() {
        this.isDirty = false;
    }

    /**
     * Verifica se a posição mudou significativamente
     */
    checkPositionChange(currentPosition, threshold = 0.1) {
        const dx = Math.abs(currentPosition.x - this.lastPosition.x);
        const dy = Math.abs(currentPosition.y - this.lastPosition.y);
        
        if (dx > threshold || dy > threshold) {
            this.lastPosition = { x: currentPosition.x, y: currentPosition.y };
            this.markDirty();
            return true;
        }
        
        return false;
    }

    /**
     * Atualiza a posição de referência
     */
    updateLastPosition(position) {
        this.lastPosition = { x: position.x, y: position.y };
    }

    /**
     * Retorna informações de debug
     */
    getDebugInfo() {
        return {
            isDirty: this.isDirty,
            lastPosition: { ...this.lastPosition },
            dirtyCount: this.dirtyCount
        };
    }
}
