import { Component } from "../../engine/ecs/Component.js";
import { Vector2 } from "../../engine/support/Vectors/Vector2.js";

export class Knockback extends Component {
    force = 0;
    direction = new Vector2(0, 0);
    duration = 0;
    currentTime = 0;
    isActive = false;
    resistance = 0; // 0 = sem resistência, 1 = resistência total
    decayRate = 0.9; // Taxa de decaimento da força (0.9 = 10% de redução por frame)

    constructor({ 
        force = 5,
        direction = { x: 0, y: 0 },
        duration = 200, // 200ms por padrão
        resistance = 0,
        decayRate = 0.9
    } = {}) {
        super();
        
        this.force = force;
        this.direction = new Vector2(direction.x, direction.y);
        this.duration = duration;
        this.resistance = Math.max(0, Math.min(1, resistance)); // Clamp entre 0 e 1
        this.decayRate = decayRate;
        this.currentTime = 0;
        this.isActive = false;
    }

    /**
     * Aplica knockback à entidade
     * @param {Vector2} direction - Direção do knockback
     * @param {number} force - Força do knockback
     * @param {number} duration - Duração em ms (opcional)
     */
    applyKnockback(direction, force, duration = null) {
        // Aplica resistência ao knockback
        const effectiveForce = force * (1 - this.resistance);
        
        if (effectiveForce <= 0) {
            return; // Knockback completamente resistido
        }

        this.direction = direction.clone().normalize();
        this.force = effectiveForce;
        this.duration = duration || this.duration;
        this.currentTime = 0;
        this.isActive = true;
    }

    /**
     * Atualiza o knockback
     * @param {number} deltaTime - Tempo decorrido em ms
     * @returns {Vector2|null} - Vetor de movimento do knockback ou null se inativo
     */
    update(deltaTime) {
        if (!this.isActive) {
            return null;
        }

        this.currentTime += deltaTime;

        // Verifica se o knockback terminou
        if (this.currentTime >= this.duration) {
            this.isActive = false;
            return null;
        }

        // Calcula a força atual com decaimento
        const progress = this.currentTime / this.duration;
        const currentForce = this.force * Math.pow(this.decayRate, progress * 10); // Decaimento exponencial

        // Retorna o vetor de movimento
        return this.direction.clone().multiply(currentForce);
    }

    /**
     * Para o knockback imediatamente
     */
    stop() {
        this.isActive = false;
        this.currentTime = 0;
    }

    /**
     * Verifica se o knockback está ativo
     * @returns {boolean}
     */
    isKnockbackActive() {
        return this.isActive;
    }

    /**
     * Define a resistência ao knockback
     * @param {number} resistance - Resistência (0-1)
     */
    setResistance(resistance) {
        this.resistance = Math.max(0, Math.min(1, resistance));
    }

    /**
     * Define a taxa de decaimento
     * @param {number} decayRate - Taxa de decaimento (0-1)
     */
    setDecayRate(decayRate) {
        this.decayRate = Math.max(0, Math.min(1, decayRate));
    }

    /**
     * Retorna informações do knockback atual
     * @returns {Object}
     */
    getKnockbackInfo() {
        return {
            isActive: this.isActive,
            force: this.force,
            direction: this.direction.clone(),
            duration: this.duration,
            currentTime: this.currentTime,
            progress: this.currentTime / this.duration
        };
    }
}
