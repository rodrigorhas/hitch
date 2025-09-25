import { Entity } from "../../../engine/entities/Entity.js";
import { Position } from "../../components/Position.js";
import { RigidBody } from "../../components/RigidBody.js";
import { Collidable } from "../../components/Tags/Collidable.js";
import { Hittable } from "../../components/Hittable.js";
import { HitBehavior } from "../../components/HitBehavior.js";
import { HealthBar } from "../../components/HealthBar.js";
import { Knockback } from "../../components/Knockback.js";
import { Tooltip } from "../../components/Tooltip.js";
import { Vector2 } from "../../../engine/support/Vectors/Vector2.js";
import { Sprite } from "../../components/Sprite.js";
import { BoxCollider } from "../../../engine/support/Collider/BoxCollider.js";
import { EnemyState } from "../../components/EnemyState.js";
import { RangeIndicator } from "../../components/RangeIndicator.js";
import { toGridCell } from "../../utils/Utils.js";
import { Enemy } from "./Enemy.js";


export class Blob extends Enemy {
    constructor(options) {
        super(options);

        this.state = {
            ...this.state,
            health: options.health || 100,
            maxHealth: options.health || 100,
        }
    }

    get tooltipText() {
        const position = this.getComponent(Position);
        const enemyState = this.getComponent(EnemyState);
        
        return `${this.name} (${toGridCell(position.x)}, ${toGridCell(position.y)}) - ${enemyState.currentState}`;
    }

    static make(options) {
        const entity = new this(options);

        const { dimension, tooltip, position } = options;

        // Sprite - usando uma cor sólida para simular uma blob
        entity.addComponent(Sprite, {
            image: {
                src: null, // Vamos desenhar programaticamente
                cropSize: 32,
            },
            dimension,
            position,
            animationFrameLimit: 16,
            animations: {
                'idle': [ [0, 0] ],
                'chasing': [ [0, 0] ],
                'attacking': [ [0, 0] ],
                'damage_taken': [ [0, 0] ],
            },
            customDraw: true // Flag para indicar que vamos desenhar customizado
        });

        // Collider
        entity.addComponent(BoxCollider, {
            width: dimension.width,
            height: dimension.height,
            offset: { x: 0, y: 0 },
            onDrawDebug(ctx) {
                const { x, y, width, height } = this.bounds;

                ctx.save()
                ctx.strokeStyle = 'red'
                ctx.lineWidth = 1
                ctx.strokeRect(x, y, width, height)
                ctx.restore()
            }
        });

        entity.addComponent(Position, position);

        // RigidBody com velocidade baseada no estado
        entity.addComponent(RigidBody, {
            isRunning: false,
            walkSpeed: 0.5, // Será sobrescrito pelo EnemyState
            runningSpeed: 1.5,
        });

        // Estado do inimigo
        entity.addComponent(EnemyState, {
            detectionRange: options.detectionRange || 50,
            attackRange: options.attackRange || 20,
            chaseSpeed: options.chaseSpeed || 1.5,
            guardSpeed: options.guardSpeed || 0.5,
            knockbackForce: options.knockbackForce || 2
        });

        // Indicador de alcance
        entity.addComponent(RangeIndicator, {
            range: options.detectionRange || 50,
            color: 'rgba(255, 0, 0, 0.1)',
            borderColor: 'rgba(255, 0, 0, 0.3)',
            show: true
        });

        entity.addComponent(RangeIndicator, {
            range: options.attackRange || 20,
            color: 'rgba(0, 255, 0, 0.1)',
            borderColor: 'rgba(0, 255, 0, 0.3)',
            show: true
        });

        // Tooltip
        entity.addComponent(Tooltip, {
            width: dimension.width + 16, 
            height: 16,
            color: tooltip.color,
            offset: new Vector2().set(-10, -15),
            text: entity.tooltipText
        });

        // Tags
        entity.addComponent(Collidable);

        // Componente Hittable para o inimigo poder ser atingido
        entity.addComponent(Hittable, {
            health: options.health || 100,
            maxHealth: options.maxHealth || 100,
            invulnerabilityDuration: options.invulnerabilityDuration || 500 // Inimigos têm menos invulnerabilidade
        });

        // Adiciona comportamento de hit personalizado para inimigos
        entity.addComponent(HitBehavior, {
            invulnerabilityDuration: 500, // 0.5 segundos
            knockbackResistance: 0.1, // 10% de resistência ao knockback
            canBeStunned: true,
            stunDuration: 100 // 0.1 segundos de stun
        })

        // Adiciona health bar para inimigos
        entity.addComponent(HealthBar, {
            width: 30,
            height: 3,
            offset: { x: -2, y: -8 },
            healthColor: '#ff6600',
            lowHealthColor: '#ff0000',
            lowHealthThreshold: 0.4
        })

        // Adiciona knockback para inimigos
        entity.addComponent(Knockback, {
            force: 3,
            duration: 300,
            resistance: 0.1, // 10% de resistência ao knockback
            decayRate: 0.9
        })

        return entity;
    }

    // Método para desenhar a blob customizada
    drawBlob(ctx, position, dimension, enemyState) {
        ctx.save();
        
        // Cor baseada no estado
        let color;
        switch (enemyState.currentState) {
            case EnemyState.STATES.GUARD:
                color = '#4CAF50'; // Verde
                break;
            case EnemyState.STATES.CHASING:
                color = '#FF9800'; // Laranja
                break;
            case EnemyState.STATES.ATTACKING:
                color = '#F44336'; // Vermelho
                break;
            case EnemyState.STATES.DAMAGE_TAKEN:
                color = '#9C27B0'; // Roxo
                break;
            default:
                color = '#4CAF50';
        }

        // Desenha a blob (círculo com borda)
        ctx.beginPath();
        ctx.arc(
            position.x + dimension.width / 2, 
            position.y + dimension.height / 2, 
            dimension.width / 2 - 2, 
            0, 
            2 * Math.PI
        );
        
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Desenha olhos simples
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(position.x + dimension.width / 2 - 6, position.y + dimension.height / 2 - 2, 2, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(position.x + dimension.width / 2 + 6, position.y + dimension.height / 2 - 2, 2, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();
    }
}
