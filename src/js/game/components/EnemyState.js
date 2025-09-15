import { Component } from "../../engine/ecs/Component.js";

export class EnemyState extends Component {
    static STATES = {
        GUARD: 'guard',
        CHASING: 'chasing', 
        ATTACKING: 'attacking',
        DAMAGE_TAKEN: 'damage_taken'
    };

    currentState = EnemyState.STATES.GUARD;
    stateTimer = 0;
    maxStateTime = 0;
    
    // Configurações de estado
    guardDuration = 2000; // 2 segundos em guard
    chasingDuration = 5000; // 5 segundos perseguindo
    attackingDuration = 1000; // 1 segundo atacando
    damageTakenDuration = 500; // 0.5 segundos de knockback
    
    // Configurações de alcance e velocidade
    detectionRange = 50; // 50px de alcance para detectar player
    attackRange = 20; // 20px de alcance para atacar
    chaseSpeed = 1.5; // Velocidade ao perseguir
    guardSpeed = 0.5; // Velocidade em guard (patrulha)
    
    // Knockback
    knockbackForce = 2;
    knockbackDirection = { x: 0, y: 0 };
    
    constructor(options = {}) {
        super();
        
        this.detectionRange = options.detectionRange || 50;
        this.attackRange = options.attackRange || 20;
        this.chaseSpeed = options.chaseSpeed || 1.5;
        this.guardSpeed = options.guardSpeed || 0.5;
        this.knockbackForce = options.knockbackForce || 2;
    }
    
    setState(newState) {
        if (this.currentState !== newState) {
            this.currentState = newState;
            this.stateTimer = 0;
            
            // Define o tempo máximo para cada estado
            switch (newState) {
                case EnemyState.STATES.GUARD:
                    this.maxStateTime = this.guardDuration;
                    break;
                case EnemyState.STATES.CHASING:
                    this.maxStateTime = this.chasingDuration;
                    break;
                case EnemyState.STATES.ATTACKING:
                    this.maxStateTime = this.attackingDuration;
                    break;
                case EnemyState.STATES.DAMAGE_TAKEN:
                    this.maxStateTime = this.damageTakenDuration;
                    break;
            }
        }
    }
    
    update(deltaTime) {
        this.stateTimer += deltaTime;
        
        // Apenas transições automáticas baseadas no tempo para estados específicos
        if (this.stateTimer >= this.maxStateTime) {
            switch (this.currentState) {
                case EnemyState.STATES.ATTACKING:
                    // Após atacar, volta para chasing se ainda estiver próximo do player
                    this.setState(EnemyState.STATES.CHASING);
                    break;
                case EnemyState.STATES.DAMAGE_TAKEN:
                    // Após knockback, volta para chasing se ainda estiver próximo do player
                    this.setState(EnemyState.STATES.CHASING);
                    break;
            }
        }
    }
    
    takeDamage(knockbackDirection) {
        this.knockbackDirection = knockbackDirection;
        this.setState(EnemyState.STATES.DAMAGE_TAKEN);
    }
    
    getCurrentSpeed() {
        switch (this.currentState) {
            case EnemyState.STATES.CHASING:
                return this.chaseSpeed;
            case EnemyState.STATES.GUARD:
                return this.guardSpeed;
            case EnemyState.STATES.ATTACKING:
            case EnemyState.STATES.DAMAGE_TAKEN:
                return 0; // Não se move durante ataque ou knockback
            default:
                return this.guardSpeed;
        }
    }
}
