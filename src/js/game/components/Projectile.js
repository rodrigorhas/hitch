import { Component } from "../../engine/ecs/Component.js";
import { Vector2 } from "../../engine/support/Vectors/Vector2.js";

export class Projectile extends Component {
    speed = 5;
    direction = new Vector2(0, 0);
    damage = 5;
    lifetime = 2000; // 2 segundos
    currentLifetime = 0;
    size = 4;
    color = '#ffff00'; // Amarelo
    trail = true;
    trailLength = 10;
    trailPositions = [];

    constructor({ 
        speed = 5,
        direction = { x: 0, y: 0 },
        damage = 5,
        lifetime = 2000,
        size = 4,
        color = '#ffff00',
        trail = true,
        trailLength = 10
    } = {}) {
        super();
        
        this.speed = speed;
        this.direction = new Vector2(direction.x, direction.y).normalize();
        this.damage = damage;
        this.lifetime = lifetime;
        this.size = size;
        this.color = color;
        this.trail = trail;
        this.trailLength = trailLength;
        this.currentLifetime = 0;
        this.trailPositions = [];
    }

    /**
     * Atualiza o projetil
     * @param {number} deltaTime - Tempo decorrido em ms
     * @returns {boolean} - Retorna true se o projetil ainda está vivo
     */
    update(deltaTime) {
        this.currentLifetime += deltaTime;
        
        // Verifica se o projetil expirou
        if (this.currentLifetime >= this.lifetime) {
            return false;
        }
        
        return true;
    }

    /**
     * Move o projetil na direção atual
     * @param {Position} position - Componente de posição
     * @param {number} deltaTime - Tempo decorrido em ms
     */
    move(position, deltaTime) {
        // Adiciona posição atual ao trail
        if (this.trail) {
            this.trailPositions.push(position.clone());
            if (this.trailPositions.length > this.trailLength) {
                this.trailPositions.shift();
            }
        }

        // Move o projetil
        const movement = this.direction.clone().multiply(this.speed * (deltaTime / 16.67));
        position.add(movement);
    }

    /**
     * Desenha o projetil
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     * @param {Position} position - Posição do projetil
     */
    draw(ctx, position) {
        ctx.save();

        // Desenha o trail
        if (this.trail && this.trailPositions.length > 1) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3;
            
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
        }

        // Desenha o projetil
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(position.x, position.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Desenha borda
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Define a direção do projetil
     * @param {Vector2} direction - Nova direção
     */
    setDirection(direction) {
        this.direction = direction.clone().normalize();
    }

    /**
     * Verifica se o projetil está vivo
     * @returns {boolean}
     */
    isAlive() {
        return this.currentLifetime < this.lifetime;
    }
}
