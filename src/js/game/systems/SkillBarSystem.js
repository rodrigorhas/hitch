import { System } from "../../engine/ecs/System.js";
import { SkillSystem } from "./SkillSystem.js";
import { FontManager } from "../utils/FontManager.js";

export class SkillBarSystem extends System {
    execute(game) {
        const { canvas } = game;
        const ctx = canvas.ctx;

        // Obtém o sistema de skills
        const skillSystem = game.ecs.systems.get(SkillSystem);
        if (!skillSystem) return;

        const cooldowns = skillSystem.getCooldownInfo();
        this.drawSkillBar(ctx, canvas, cooldowns);
    }

    /**
     * Desenha a barra de skills na parte inferior
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     * @param {Object} canvas - Objeto canvas
     * @param {Object} cooldowns - Informações de cooldown das skills
     */
    drawSkillBar(ctx, canvas, cooldowns) {
        const barHeight = 80;
        const barY = canvas.height - barHeight;
        const slotWidth = 80;
        const slotHeight = 60;
        const slotSpacing = 10;
        const startX = (canvas.width - (4 * slotWidth + 3 * slotSpacing)) / 2;

        // Desenha fundo da barra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, barY, canvas.width, barHeight);

        // Desenha borda da barra
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, barY, canvas.width, barHeight);

        // Desenha cada slot de skill
        for (let i = 1; i <= 4; i++) {
            const slotX = startX + (i - 1) * (slotWidth + slotSpacing);
            const slotY = barY + 10;
            
            this.drawSkillSlot(ctx, slotX, slotY, slotWidth, slotHeight, i, cooldowns);
        }
    }

    /**
     * Desenha um slot individual de skill
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     * @param {number} x - Posição X do slot
     * @param {number} y - Posição Y do slot
     * @param {number} width - Largura do slot
     * @param {number} height - Altura do slot
     * @param {number} skillNumber - Número da skill (1-4)
     * @param {Object} cooldowns - Informações de cooldown
     */
    drawSkillSlot(ctx, x, y, width, height, skillNumber, cooldowns) {
        const cooldownKey = this.getCooldownKey(skillNumber);
        const cooldown = cooldowns[cooldownKey];
        const isOnCooldown = cooldown > 0;

        // Cores baseadas no estado
        let slotColor = '#2a2a2a';
        let borderColor = '#555555';
        let textColor = '#ffffff';

        if (isOnCooldown) {
            slotColor = '#1a1a1a';
            borderColor = '#333333';
            textColor = '#888888';
        }

        ctx.save()

        // Desenha fundo do slot
        ctx.fillStyle = slotColor;
        ctx.fillRect(x, y, width, height);

        // Desenha borda do slot
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Desenha número da skill
        ctx.fillStyle = textColor;
        const restoreFont = FontManager.useFont(ctx, 'bold 24px Arial');
        ctx.textAlign = 'center';
        ctx.fillText(skillNumber.toString(), x + width / 2, y + height / 2 + 8);
        restoreFont();

        // Desenha ícone da skill
        this.drawSkillIcon(ctx, x, y, width, height, skillNumber, isOnCooldown);

        // Desenha cooldown se ativo
        if (isOnCooldown) {
            this.drawCooldownOverlay(ctx, x, y, width, height, cooldown);
        }

        ctx.restore()
    }

    /**
     * Desenha o ícone da skill
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     * @param {number} x - Posição X
     * @param {number} y - Posição Y
     * @param {number} width - Largura
     * @param {number} height - Altura
     * @param {number} skillNumber - Número da skill
     * @param {boolean} isOnCooldown - Se está em cooldown
     */
    drawSkillIcon(ctx, x, y, width, height, skillNumber, isOnCooldown) {
        const iconSize = 20;
        const iconX = x + width / 2 - iconSize / 2;
        const iconY = y + 5;

        ctx.save();
        ctx.globalAlpha = isOnCooldown ? 0.5 : 1.0;

        switch (skillNumber) {
            case 1: // Projétil
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 2: // Speed Boost
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(iconX, iconY, iconSize, iconSize);
                break;
            case 3: // Escudo
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 4: // Rastro de Dano
                ctx.strokeStyle = '#ff00ff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(iconX, iconY + iconSize);
                ctx.lineTo(iconX + iconSize / 2, iconY);
                ctx.lineTo(iconX + iconSize, iconY + iconSize);
                ctx.stroke();
                break;
        }

        ctx.restore();
    }

    /**
     * Desenha overlay de cooldown
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     * @param {number} x - Posição X
     * @param {number} y - Posição Y
     * @param {number} width - Largura
     * @param {number} height - Altura
     * @param {number} cooldown - Tempo de cooldown em ms
     */
    drawCooldownOverlay(ctx, x, y, width, height, cooldown) {
        // Calcula progresso do cooldown (assumindo duração máxima de 15s)
        const maxCooldown = 15000;
        const progress = Math.min(cooldown / maxCooldown, 1);
        const overlayHeight = height * progress;

        // Desenha overlay escuro
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x, y + height - overlayHeight, width, overlayHeight);

        // Desenha tempo restante
        const seconds = Math.ceil(cooldown / 1000);
        ctx.fillStyle = '#ffffff';
        const restoreFont = FontManager.useFont(ctx, 'bold 16px Arial');
        ctx.textAlign = 'center';
        ctx.fillText(seconds.toString(), x + width / 2, y + height / 2 + 20);
        restoreFont();
    }

    /**
     * Retorna a chave do cooldown baseada no número da skill
     * @param {number} skillNumber - Número da skill
     * @returns {string} - Chave do cooldown
     */
    getCooldownKey(skillNumber) {
        switch (skillNumber) {
            case 1: return 'projectile';
            case 2: return 'speedBoost';
            case 3: return 'shield';
            case 4: return 'damageTrail';
            default: return 'projectile';
        }
    }
}
