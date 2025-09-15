import { Component } from "../../engine/ecs/Component.js";
import { Vector2 } from "../../engine/support/Vectors/Vector2.js";

export class DamageTrail extends Component {
    damage = 1;
    interval = 200; // 0.2 segundos
    duration = 5000; // 5 segundos
    currentTime = 0;
    lastDamageTime = 0;
    isActive = false;
    trailPositions = [];
    maxTrailLength = 20;
    color = '#ff00ff'; // Magenta
    size = 3;

    constructor({ 
        damage = 1,
        interval = 200,
        duration = 5000,
        maxTrailLength = 20,
        color = '#ff00ff',
        size = 3
    } = {}) {
        super();
        
        this.damage = damage;
        this.interval = interval;
        this.duration = duration;
        this.maxTrailLength = maxTrailLength;
        this.color = color;
        this.size = size;
        this.currentTime = 0;
        this.lastDamageTime = 0;
        this.isActive = false;
        this.trailPositions = [];
    }

    /**
     * Ativa o rastro de dano
     */
    activate() {
        this.currentTime = 0;
        this.lastDamageTime = 0;
        this.isActive = true;
        this.trailPositions = [];
    }

    /**
     * Atualiza o rastro de dano
     * @param {number} deltaTime - Tempo decorrido em ms
     * @param {Position} position - Posição atual da entidade
     * @param {Array} entities - Lista de entidades para verificar
     * @returns {boolean} - Retorna true se o rastro ainda está ativo
     */
    update(deltaTime, position, entities) {
        if (!this.isActive) {
            return false;
        }

        this.currentTime += deltaTime;

        // Adiciona posição atual ao rastro
        this.trailPositions.push(position.clone());
        if (this.trailPositions.length > this.maxTrailLength) {
            this.trailPositions.shift();
        }

        // Verifica se deve causar dano
        if (this.currentTime - this.lastDamageTime >= this.interval) {
            this.dealDamageToEntities(entities);
            this.lastDamageTime = this.currentTime;
        }

        // Verifica se o rastro expirou
        if (this.currentTime >= this.duration) {
            this.isActive = false;
            return false;
        }

        return true;
    }

    /**
     * Causa dano às entidades próximas ao rastro
     * @param {Array} entities - Lista de entidades
     */
    dealDamageToEntities(entities) {
        for (const entity of entities) {
            const entityPosition = entity.getComponent(Position);
            if (!entityPosition) continue;

            // Verifica se a entidade está próxima ao rastro
            for (const trailPos of this.trailPositions) {
                const distance = Vector2.distance(entityPosition, trailPos);
                
                if (distance <= 15) { // Raio de dano
                    const hittable = entity.getComponent(Hittable);
                    if (hittable && hittable.canTakeDamage()) {
                        hittable.takeDamage(this.damage);
                        break; // Só causa dano uma vez por frame
                    }
                }
            }
        }
    }

    /**
     * Desenha o rastro de dano
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     */
    draw(ctx) {
        if (!this.isActive || this.trailPositions.length < 2) return;

        ctx.save();

        // Desenha o rastro
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size;
        ctx.globalAlpha = 0.6;
        
        ctx.beginPath();
        for (let i = 0; i < this.trailPositions.length - 1; i++) {
            const pos = this.trailPositions[i];
            if (i === 0) {
                ctx.moveTo(pos.x, pos.y);
            } else {
                ctx.lineTo(pos.x, pos.y);
            }
        }
        ctx.stroke();

        // Desenha pontos de dano
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.8;
        
        for (let i = 0; i < this.trailPositions.length; i += 3) {
            const pos = this.trailPositions[i];
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Para o rastro de dano
     */
    deactivate() {
        this.isActive = false;
        this.trailPositions = [];
    }

    /**
     * Verifica se o rastro está ativo
     * @returns {boolean}
     */
    isTrailActive() {
        return this.isActive;
    }

    /**
     * Retorna o progresso do rastro (0-1)
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
