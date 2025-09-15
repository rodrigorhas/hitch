import { Component } from "../../engine/ecs/Component.js";
import { Vector2 } from "../../engine/support/Vectors/Vector2.js";

export class HealthBar extends Component {
    width = 50;
    height = 6;
    offset = new Vector2(0, -20); // Offset em relação à posição da entidade
    backgroundColor = 'rgba(0, 0, 0, 0.5)';
    borderColor = '#000000';
    healthColor = '#00ff00';
    lowHealthColor = '#ff0000';
    lowHealthThreshold = 0.3; // 30% da vida
    showBorder = true;
    showBackground = true;
    animated = true; // Se a barra anima ao mudar de valor
    animationSpeed = 0.1; // Velocidade da animação

    constructor({ 
        width = 50,
        height = 6,
        offset = { x: 0, y: -20 },
        backgroundColor = 'rgba(0, 0, 0, 0.5)',
        borderColor = '#000000',
        healthColor = '#00ff00',
        lowHealthColor = '#ff0000',
        lowHealthThreshold = 0.3,
        showBorder = true,
        showBackground = true,
        animated = true,
        animationSpeed = 0.1
    } = {}) {
        super();
        
        this.width = width;
        this.height = height;
        this.offset = new Vector2(offset.x, offset.y);
        this.backgroundColor = backgroundColor;
        this.borderColor = borderColor;
        this.healthColor = healthColor;
        this.lowHealthColor = lowHealthColor;
        this.lowHealthThreshold = lowHealthThreshold;
        this.showBorder = showBorder;
        this.showBackground = showBackground;
        this.animated = animated;
        this.animationSpeed = animationSpeed;
        
        // Para animação
        this.currentHealthRatio = 1;
        this.targetHealthRatio = 1;
    }

    /**
     * Atualiza a health bar
     * @param {number} currentHealth - Vida atual
     * @param {number} maxHealth - Vida máxima
     * @param {number} deltaTime - Tempo decorrido em ms
     */
    update(currentHealth, maxHealth, deltaTime) {
        this.targetHealthRatio = currentHealth / maxHealth;
        
        if (this.animated) {
            // Anima suavemente para o valor alvo
            const diff = this.targetHealthRatio - this.currentHealthRatio;
            this.currentHealthRatio += diff * this.animationSpeed * (deltaTime / 16.67); // Normaliza para 60fps
        } else {
            this.currentHealthRatio = this.targetHealthRatio;
        }
    }

    /**
     * Desenha a health bar
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     * @param {Vector2} position - Posição da entidade
     */
    draw(ctx, position) {
        const x = position.x + this.offset.x;
        const y = position.y + this.offset.y;
        
        ctx.save();
        
        // Desenha fundo
        if (this.showBackground) {
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(x, y, this.width, this.height);
        }
        
        // Desenha barra de vida
        const healthWidth = this.width * this.currentHealthRatio;
        const healthColor = this.currentHealthRatio <= this.lowHealthThreshold ? 
            this.lowHealthColor : this.healthColor;
        
        ctx.fillStyle = healthColor;
        ctx.fillRect(x, y, healthWidth, this.height);
        
        // Desenha borda
        if (this.showBorder) {
            ctx.strokeStyle = this.borderColor;
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, this.width, this.height);
        }
        
        ctx.restore();
    }

    /**
     * Verifica se a health bar deve ser mostrada
     * @param {number} currentHealth - Vida atual
     * @param {number} maxHealth - Vida máxima
     * @returns {boolean}
     */
    shouldShow(currentHealth, maxHealth) {
        return currentHealth < maxHealth; // Só mostra se não estiver com vida cheia
    }

    /**
     * Define a posição do offset
     * @param {number} x - Posição X
     * @param {number} y - Posição Y
     */
    setOffset(x, y) {
        this.offset.set(x, y);
    }

    /**
     * Define as cores da health bar
     * @param {string} healthColor - Cor da vida
     * @param {string} lowHealthColor - Cor da vida baixa
     * @param {string} backgroundColor - Cor de fundo
     */
    setColors(healthColor, lowHealthColor, backgroundColor) {
        this.healthColor = healthColor;
        this.lowHealthColor = lowHealthColor;
        this.backgroundColor = backgroundColor;
    }
}
