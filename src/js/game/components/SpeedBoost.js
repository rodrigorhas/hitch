import { Component } from "../../engine/ecs/Component.js";

export class SpeedBoost extends Component {
    multiplier = 1.4; // 40% de aumento
    duration = 3000; // 3 segundos
    currentTime = 0;
    isActive = false;
    originalSpeed = 1;

    constructor({ 
        multiplier = 1.4,
        duration = 3000
    } = {}) {
        super();
        
        this.multiplier = multiplier;
        this.duration = duration;
        this.currentTime = 0;
        this.isActive = false;
        this.originalSpeed = 1;
    }

    /**
     * Ativa o speed boost
     * @param {number} originalSpeed - Velocidade original da entidade
     */
    activate(originalSpeed) {
        this.originalSpeed = originalSpeed;
        this.currentTime = 0;
        this.isActive = true;
    }

    /**
     * Atualiza o speed boost
     * @param {number} deltaTime - Tempo decorrido em ms
     * @returns {number} - Multiplicador de velocidade atual
     */
    update(deltaTime) {
        if (!this.isActive) {
            return 1; // Sem boost
        }

        this.currentTime += deltaTime;

        // Verifica se o boost expirou
        if (this.currentTime >= this.duration) {
            this.isActive = false;
            return 1; // Sem boost
        }

        return this.multiplier;
    }

    /**
     * Para o speed boost
     */
    deactivate() {
        this.isActive = false;
        this.currentTime = 0;
    }

    /**
     * Verifica se o speed boost está ativo
     * @returns {boolean}
     */
    isBoostActive() {
        return this.isActive;
    }

    /**
     * Retorna o progresso do boost (0-1)
     * @returns {number}
     */
    getProgress() {
        if (!this.isActive) return 0;
        return this.currentTime / this.duration;
    }

    /**
     * Retorna o tempo restante em ms
     * @returns {number}
     */
    getTimeRemaining() {
        if (!this.isActive) return 0;
        return Math.max(0, this.duration - this.currentTime);
    }
}
