import { Component } from "../../engine/ecs/Component.js";
import { HitBehavior } from "./HitBehavior.js";

export class Hittable extends Component {
    health = 100;
    maxHealth = 100;
    invulnerable = false;
    invulnerabilityTimer = 0;
    hitBehavior = null; // Referência ao componente HitBehavior

    constructor({ 
        health = 100, 
        maxHealth = 100, 
        invulnerable = false,
        invulnerabilityDuration = 500 // 0.5 segundos por padrão
    } = {}) {
        super();
        
        this.health = health;
        this.maxHealth = maxHealth;
        this.invulnerable = invulnerable;
        this.invulnerabilityTimer = 0;
        
        // Cria HitBehavior padrão se não for fornecido
        this.hitBehavior = new HitBehavior({ invulnerabilityDuration });
    }

    /**
     * Aplica dano à entidade
     * @param {number} damage - Quantidade de dano
     * @returns {boolean} - Retorna true se o dano foi aplicado
     */
    takeDamage(damage) {
        if (this.invulnerable || this.invulnerabilityTimer > 0) {
            return false; // Não pode receber dano
        }

        this.health = Math.max(0, this.health - damage);
        
        // Ativa invulnerabilidade temporária usando HitBehavior
        this.invulnerabilityTimer = this.hitBehavior.invulnerabilityDuration;
        
        return true;
    }

    /**
     * Cura a entidade
     * @param {number} healing - Quantidade de cura
     */
    heal(healing) {
        this.health = Math.min(this.maxHealth, this.health + healing);
    }

    /**
     * Atualiza o timer de invulnerabilidade
     * @param {number} deltaTime - Tempo decorrido em ms
     */
    update(deltaTime) {
        if (this.invulnerabilityTimer > 0) {
            this.invulnerabilityTimer -= deltaTime;
        }
    }

    /**
     * Verifica se a entidade está viva
     * @returns {boolean}
     */
    isAlive() {
        return this.health > 0;
    }

    /**
     * Verifica se a entidade pode receber dano
     * @returns {boolean}
     */
    canTakeDamage() {
        return !this.invulnerable && this.invulnerabilityTimer <= 0 && this.isAlive();
    }

    /**
     * Define a invulnerabilidade
     * @param {boolean} state - Estado da invulnerabilidade
     * @param {number} duration - Duração em ms (opcional)
     */
    setInvulnerable(state, duration = null) {
        this.invulnerable = state;
        if (duration !== null) {
            this.hitBehavior.invulnerabilityDuration = duration;
        }
    }

    /**
     * Define o comportamento de hit
     * @param {HitBehavior} hitBehavior - Componente HitBehavior
     */
    setHitBehavior(hitBehavior) {
        this.hitBehavior = hitBehavior;
    }

    /**
     * Retorna o comportamento de hit
     * @returns {HitBehavior}
     */
    getHitBehavior() {
        return this.hitBehavior;
    }
}
