import { Component } from "../../engine/ecs/Component.js";

export class RangeIndicator extends Component {
    constructor(options = {}) {
        super();
        
        this.range = options.range || 50;
        this.color = options.color || 'rgba(255, 0, 0, 0.2)';
        this.borderColor = options.borderColor || 'rgba(255, 0, 0, 0.5)';
        this.show = options.show !== false; // Por padrão mostra
    }
    
    draw(ctx, position, dimension) {
        if (!this.show) return;
        
        ctx.save();
        
        // Centraliza o círculo na posição do inimigo
        const centerX = position.x + (dimension.width / 2);
        const centerY = position.y + (dimension.height / 2);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.range, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    }
}
