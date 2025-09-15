import { Component } from "../../engine/ecs/Component.js";
import { Vector2 } from "../../engine/support/Vectors/Vector2.js";

export class Shield extends Component {
    health = 50;
    maxHealth = 50;
    duration = 5000; // 5 segundos
    currentTime = 0;
    isActive = false;
    explosionRadius = 60;
    explosionDamage = 15;
    explosionKnockback = 5;
    color = '#00ffff'; // Ciano
    pulseSpeed = 0.1;
    pulsePhase = 0;

    constructor({ 
        health = 50,
        maxHealth = 50,
        duration = 5000,
        explosionRadius = 60,
        explosionDamage = 15,
        explosionKnockback = 5,
        color = '#00ffff'
    } = {}) {
        super();
        
        this.health = health;
        this.maxHealth = maxHealth;
        this.duration = duration;
        this.explosionRadius = explosionRadius;
        this.explosionDamage = explosionDamage;
        this.explosionKnockback = explosionKnockback;
        this.color = color;
        this.currentTime = 0;
        this.isActive = false;
        this.pulsePhase = 0;
    }

    /**
     * Ativa o escudo
     */
    activate() {
        this.health = this.maxHealth;
        this.currentTime = 0;
        this.isActive = true;
        this.pulsePhase = 0;
    }

    /**
     * Atualiza o escudo
     * @param {number} deltaTime - Tempo decorrido em ms
     * @returns {boolean} - Retorna true se o escudo ainda está ativo
     */
    update(deltaTime) {
        if (!this.isActive) {
            return false;
        }

        this.currentTime += deltaTime;
        this.pulsePhase += this.pulseSpeed * (deltaTime / 16.67);

        // Verifica se o escudo expirou
        if (this.currentTime >= this.duration) {
            this.isActive = false;
            return false;
        }

        return true;
    }

    /**
     * Aplica dano ao escudo
     * @param {number} damage - Quantidade de dano
     * @returns {boolean} - Retorna true se o escudo foi quebrado
     */
    takeDamage(damage) {
        if (!this.isActive) return false;

        this.health = Math.max(0, this.health - damage);
        
        if (this.health <= 0) {
            this.isActive = false;
            return true; // Escudo quebrado
        }

        return false;
    }

    /**
     * Desenha o escudo
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     * @param {Position} position - Posição da entidade
     * @param {number} entitySize - Tamanho da entidade
     */
    draw(ctx, position, entitySize) {
        if (!this.isActive) return;

        ctx.save();

        const radius = entitySize + 10 + Math.sin(this.pulsePhase) * 5;
        const alpha = 0.3 + Math.sin(this.pulsePhase * 2) * 0.2;

        // Desenha o escudo
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Desenha efeito de pulso
        ctx.globalAlpha = alpha * 0.5;
        ctx.beginPath();
        ctx.arc(position.x, position.y, radius + 5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Explode o escudo, causando dano e knockback
     * @param {Position} position - Posição da explosão
     * @param {Array} entities - Lista de entidades para verificar
     * @returns {Array} - Entidades afetadas pela explosão
     */
    explode(position, entities) {
        const affectedEntities = [];

        for (const entity of entities) {
            const entityPosition = entity.getComponent(Position);
            if (!entityPosition) continue;

            const distance = Vector2.distance(position, entityPosition);
            
            if (distance <= this.explosionRadius) {
                // Calcula direção do knockback
                const knockbackDirection = Vector2.subtract(entityPosition, position);
                if (knockbackDirection.length() > 0) {
                    knockbackDirection.normalize();
                }

                // Aplica dano se a entidade tem Hittable
                const hittable = entity.getComponent(Hittable);
                if (hittable) {
                    hittable.takeDamage(this.explosionDamage);
                }

                // Aplica knockback se a entidade tem Knockback
                const knockback = entity.getComponent(Knockback);
                if (knockback) {
                    knockback.applyKnockback(knockbackDirection, this.explosionKnockback, 500);
                }

                affectedEntities.push(entity);
            }
        }

        this.isActive = false;
        return affectedEntities;
    }

    /**
     * Verifica se o escudo está ativo
     * @returns {boolean}
     */
    isShieldActive() {
        return this.isActive;
    }

    /**
     * Retorna o progresso do escudo (0-1)
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
