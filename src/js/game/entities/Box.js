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

        // Sprite - usando uma cor sólida para simular uma caixa
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
                'damaged': [ [0, 0] ],
                'broken': [ [0, 0] ],
            },
            customDraw: true // Flag para indicar que vamos desenhar customizado
        });

        // Collider
        entity.addComponent(BoxCollider, {
            width: Math.floor(dimension.width * 0.9),
            height: Math.floor(dimension.height * 0.9),
            offset: { x: 1, y: 1 },
            onDrawDebug(ctx) {
                const { x, y, width, height } = this.bounds;

                ctx.save()
                ctx.strokeStyle = 'brown'
                ctx.lineWidth = 2
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
            offset: { x: -12, y: -18 },
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
    drawBox(ctx, position, dimension, hittable) {
        ctx.save();

        // Centraliza o desenho
        const x = position.x - dimension.width / 2;
        const y = position.y - dimension.height / 2;
        const width = dimension.width;
        const height = dimension.height;

        // Determina a cor baseada na vida
        let boxColor = '#8B4513'; // Marrom escuro
        let borderColor = '#654321'; // Marrom mais escuro
        
        if (hittable.health <= hittable.maxHealth * 0.3) {
            boxColor = '#A0522D'; // Marrom claro (danificada)
            borderColor = '#8B4513';
        }

        // Desenha a caixa
        ctx.fillStyle = boxColor;
        ctx.fillRect(x, y, width, height);

        // Desenha a borda
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Desenha linhas para simular madeira
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        
        // Linha horizontal no meio
        ctx.beginPath();
        ctx.moveTo(x + 2, y + height / 2);
        ctx.lineTo(x + width - 2, y + height / 2);
        ctx.stroke();

        // Linha vertical no meio
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y + 2);
        ctx.lineTo(x + width / 2, y + height - 2);
        ctx.stroke();

        // Se quebrada, desenha rachaduras
        if (this.state.broken) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            
            // Rachaduras diagonais
            ctx.beginPath();
            ctx.moveTo(x + 4, y + 4);
            ctx.lineTo(x + width - 4, y + height - 4);
            ctx.moveTo(x + width - 4, y + 4);
            ctx.lineTo(x + 4, y + height - 4);
            ctx.stroke();
        }

        ctx.restore();
    }

    // Método para quebrar a caixa
    break() {
        this.state.broken = true;
        console.log(`Box ${this.name} was broken!`);
    }
}
