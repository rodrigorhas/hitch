import { Component } from "../../engine/ecs/Component.js";

export class HitBehavior extends Component {
    invulnerabilityDuration = 500; // 0.5 segundos por padrão
    knockbackResistance = 0; // 0 = sem resistência, 1 = resistência total
    canBeStunned = true; // Se pode ser atordoado
    stunDuration = 0; // Duração do stun em ms
    hitEffect = null; // Efeito visual ao ser atingido
    deathEffect = null; // Efeito visual ao morrer

    constructor({ 
        invulnerabilityDuration = 500,
        knockbackResistance = 0,
        canBeStunned = true,
        stunDuration = 0,
        hitEffect = null,
        deathEffect = null
    } = {}) {
        super();
        
        this.invulnerabilityDuration = invulnerabilityDuration;
        this.knockbackResistance = Math.max(0, Math.min(1, knockbackResistance)); // Clamp entre 0 e 1
        this.canBeStunned = canBeStunned;
        this.stunDuration = stunDuration;
        this.hitEffect = hitEffect;
        this.deathEffect = deathEffect;
    }

    /**
     * Aplica resistência ao knockback
     * @param {Vector2} knockbackVector - Vetor de knockback original
     * @returns {Vector2} - Vetor de knockback com resistência aplicada
     */
    applyKnockbackResistance(knockbackVector) {
        if (this.knockbackResistance >= 1) {
            return new Vector2(0, 0); // Resistência total
        }
        
        const resistance = 1 - this.knockbackResistance;
        return knockbackVector.multiply(resistance);
    }

    /**
     * Verifica se a entidade pode ser atordoada
     * @returns {boolean}
     */
    canBeStunnedNow() {
        return this.canBeStunned;
    }

    /**
     * Retorna a duração do stun se aplicável
     * @returns {number}
     */
    getStunDuration() {
        return this.canBeStunned ? this.stunDuration : 0;
    }

    /**
     * Retorna o efeito visual de hit
     * @returns {string|null}
     */
    getHitEffect() {
        return this.hitEffect;
    }

    /**
     * Retorna o efeito visual de morte
     * @returns {string|null}
     */
    getDeathEffect() {
        return this.deathEffect;
    }
}
