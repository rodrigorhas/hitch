import { Entity } from "../../engine/entities/Entity.js";
import { Position } from "../components/Position.js";
import { RigidBody } from "../components/RigidBody.js";
import { Collidable } from "../components/Tags/Collidable.js";
import { Hittable } from "../components/Hittable.js";
import { HitBehavior } from "../components/HitBehavior.js";
import { HealthBar } from "../components/HealthBar.js";
import { Knockback } from "../components/Knockback.js";
import { Tooltip } from "../components/Tooltip.js";
import { Vector2 } from "../../engine/support/Vectors/Vector2.js";
import { Sprite } from "../components/Sprite.js";
import { BoxCollider } from "../../engine/support/Collider/BoxCollider.js";
import { toGridCell } from "../utils/Utils.js";
import { randomNumber } from "../../engine/support/Random.js";

export class Box extends Entity {
    constructor(options) {
        super(options);

        this.state = {
            ...this.state,
            health: options.health || 50,
            maxHealth: options.health || 50,
            broken: false,
        }
    }

    get tooltipText() {
        const position = this.getComponent(Position);
        const hittable = this.getComponent(Hittable);
        
        if (this.state.broken) {
            return `${this.name} (Broken)`;
        }
        
        return `${this.name} (${toGridCell(position.x)}, ${toGridCell(position.y)}) - HP: ${hittable.health}/${hittable.maxHealth}`;
    }

    static make(options) {
        const entity = new this(options);

        const { dimension, tooltip, position } = options;

        // Collider
        entity.addComponent(BoxCollider, {
            width: dimension.width,
            height: dimension.height,
            offset: { x: 0, y: 0 },
            onDrawDebug(ctx) {
                const { x, y, width, height } = this.bounds;

                ctx.save()
                ctx.strokeStyle = 'brown'
                ctx.lineWidth = 1
                ctx.strokeRect(x, y, width, height)
                ctx.restore()
            }
        });

        entity.addComponent(Position, position);

        // RigidBody - caixas não se movem, mas precisam para colisão
        entity.addComponent(RigidBody, {
            isRunning: false,
            walkSpeed: 0,
            runningSpeed: 0,
        });

        // Componente Hittable para a caixa poder ser quebrada
        entity.addComponent(Hittable, {
            health: options.health || 50,
            maxHealth: options.maxHealth || 50,
            invulnerabilityDuration: 1000 // 1 segundo de cooldown para caixas
        });

        // Adiciona comportamento de hit personalizado para caixas
        entity.addComponent(HitBehavior, {
            invulnerabilityDuration: 1000, // 1 segundo de cooldown
            knockbackResistance: 0.4, // 80% de resistência ao knockback (caixas são pesadas)
            canBeStunned: false, // Caixas não podem ser atordoadas
            stunDuration: 0
        })

        // Adiciona health bar para caixas
        entity.addComponent(HealthBar, {
            width: 25,
            height: 3,
            offset: { x: 4, y: -6 },
            healthColor: '#8B4513', // Marrom
            lowHealthColor: '#A0522D', // Marrom claro
            lowHealthThreshold: 0.5
        })

        // Adiciona knockback para caixas
        entity.addComponent(Knockback, {
            force: 100,
            duration: 350,
            resistance: 0.1,
            decayRate: 1 
        })

        // Tooltip
        entity.addComponent(Tooltip, {
            width: dimension.width + 16, 
            height: 16,
            color: tooltip.color || 'brown',
            offset: new Vector2().set(-10, -15),
            text: entity.tooltipText
        });

        // Tags
        entity.addComponent(Collidable);

        return entity;
    }

    // Função para gerar caixas aleatoriamente
    static randomBoxes(game, count = 10) {
        const boxes = [];
        const canvas = game.canvas;
        
        for (let i = 0; i < count; i++) {
            const x = Math.random() * (canvas.width - 32);
            const y = Math.random() * (canvas.height - 32);

            const health = randomNumber(30, 80);
            
            boxes.push(Box.make({
                name: `Box ${i + 1}`,
                health: health,
                maxHealth: health,
                tooltip: {
                    color: 'brown',
                },
                dimension: {
                    width: 32,
                    height: 32,
                },
                position: {
                    x: x,
                    y: y
                }
            }));
        }
        
        return boxes;
    }

    // Método para desenhar a caixa customizada
    render(ctx) {
        const position = this.getComponent(Position);
        const dimension = this.getComponent(BoxCollider).bounds;
        const hittable = this.getComponent(Hittable);

        ctx.save();

        const x = position.x;
        const y = position.y;
        const width = dimension.width;
        const height = dimension.height;

        // Determina a cor baseada na vida
        let boxColor = '#8B4513'; // Marrom escuro
        let borderColor = '#654321'; // Marrom mais escuro
        
        if (hittable.health <= hittable.maxHealth * 0.3) {
            boxColor = '#A0522D'; // Marrom claro (danificada)
            borderColor = '#8B4513';
        }

        ctx.save()
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 2
        ctx.setLineDash([ 2, 2 ]);
        ctx.strokeRect(x, y, width, height)
        ctx.restore()
    }

    // Método para quebrar a caixa
    break() {
        this.state.broken = true;
        console.log(`Box ${this.name} was broken!`);
    }
}
