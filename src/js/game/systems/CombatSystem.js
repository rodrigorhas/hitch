import { System } from "../../engine/ecs/System.js";
import { Position } from "../components/Position.js";
import { Controllable } from "../components/Tags/Controllable.js";
import { EnemyState } from "../components/EnemyState.js";
import { Collidable } from "../components/Tags/Collidable.js";
import { Hittable } from "../components/Hittable.js";
import { Knockback } from "../components/Knockback.js";
import { Vector2 } from "../../engine/support/Vectors/Vector2.js";
import { InputConfig } from "../../engine/managers/Input/InputConfig.js";
import { Player } from "../entities/player/Player.js";
import { Box } from "../entities/Box.js";
import { Enemy } from "../entities/enemy/Enemy.js";
import { AppliesDamage } from "../components/AppliesDamage.js";
import { SpatialPartitionSystem } from "./SpatialPartitionSystem.js";

export class CombatSystem extends System {
    useFixedUpdate = true; // Combate deve rodar em taxa fixa
    
    queries = {
        players: {
            class: [ Player ],
            components: [ Controllable, Position, Hittable ]
        },
        enemies: {
            class: [ Enemy ],
            components: [ EnemyState, Position, Collidable, Hittable ]
        },
        boxes: {
            class: [ Box ],
            components: [ Position, Collidable, Hittable ]
        },
        entitiesWithKnockback: {
            components: [ Position, Hittable, Knockback ]
        }
    }

    // Cooldown de ataque por inimigo
    enemyAttackCooldowns = new Map();

    fixedExecute(game) {
        const { input } = game;
        
        const spatialPartition = game.ecs.systems.get(SpatialPartitionSystem)


        // Atualiza componentes Hittable
        this.updateHittableComponents(game.time.fixedDeltaTime);

        // Verifica se o player está atacando (tecla X)
        if (input.keyboard.isPressedForAction(InputConfig.getKeysForAction('ATTACK'))) {
            this.handlePlayerAttack(spatialPartition);
        }

        // Atualiza cooldowns
        this.updateCooldowns(game.time.fixedDeltaTime);
    }

    handlePlayerAttack(spatialPartition) {
        const players = this.queries.players.results;

        for (const player of players) {
            const playerPosition = player.getComponent(Position);

            // Usa SpatialPartitionSystem para encontrar entidades próximas (raio de ataque = 30)
            const nearbyEntities = spatialPartition.queryRadius(
                playerPosition.x, 
                playerPosition.y, 
                30
            );

            for (const entity of nearbyEntities) {
                // Verifica se é um inimigo
                if (entity instanceof Enemy) {
                    const enemyPosition = entity.getComponent(Position);
                    const distance = Vector2.distance(playerPosition, enemyPosition);

                    if (distance < 30 && this.canAttackEnemy(entity)) {
                        this.damageEnemy(entity, player);
                    }
                }
                // Verifica se é uma caixa
                else if (entity instanceof Box) {
                    const boxPosition = entity.getComponent(Position);
                    const distance = Vector2.distance(playerPosition, boxPosition);

                    if (distance < 30) {
                        this.damageBox(entity, player);
                    }
                }
            }
        }
    }

    damageEnemy(enemy, damageSource) {
        const enemyPosition = enemy.getComponent(Position);
        const damageSourcePosition = damageSource.getComponent(Position);
        const hasDamage = damageSource.getComponent(AppliesDamage);
        const hittable = enemy.getComponent(Hittable);
        const knockback = enemy.getComponent(Knockback);
        
        // Verifica se o inimigo pode receber dano
        if (!hittable.canTakeDamage()) {
            return;
        }
        
        // Calcula direção do knockback (oposta à fonte do dano)
        const knockbackDirection = Vector2.subtract(enemyPosition, damageSourcePosition);
        
        // Se as posições são iguais, usa uma direção aleatória
        if (knockbackDirection.length() === 0) {
            const randomAngle = Math.random() * Math.PI * 2;
            knockbackDirection.set(Math.cos(randomAngle), Math.sin(randomAngle));
        } else {
            knockbackDirection.normalize();
        }
        
        // Aplica o dano usando o componente Hittable
        const damageDealt = hittable.takeDamage(hasDamage.damage);
        
        if (damageDealt) {
            // Aplica knockback usando o novo sistema
            if (knockback) {
                knockback.applyKnockback(knockbackDirection, 3, 300); // Força 3, duração 300ms
            }
            
            // Define cooldown de 1 segundo (1000ms)
            this.enemyAttackCooldowns.set(enemy, 1000);
            
            console.log(`Enemy took damage! Health: ${hittable.health}/${hittable.maxHealth}`);
            
            // Se a vida chegou a zero, remove a entidade
            if (!hittable.isAlive()) {
                enemy.destroy();
                this.enemyAttackCooldowns.delete(enemy);
                console.log('Enemy destroyed!');
            }
        }
    }

    damageBox(box, damageSource) {
        const boxPosition = box.getComponent(Position);
        const damageSourcePosition = damageSource.getComponent(Position);
        const sourceDamageComponent = damageSource.getComponent(AppliesDamage);
        const hittable = box.getComponent(Hittable);
        const knockback = box.getComponent(Knockback);
        
        // Verifica se a caixa pode receber dano
        if (!hittable.canTakeDamage()) {
            return;
        }
        
        // Calcula direção do knockback (oposta à fonte do dano)
        const knockbackDirection = Vector2.subtract(boxPosition, damageSourcePosition);
        
        // Se as posições são iguais, usa uma direção aleatória
        if (knockbackDirection.length() === 0) {
            const randomAngle = Math.random() * Math.PI * 2;
            knockbackDirection.set(Math.cos(randomAngle), Math.sin(randomAngle));
        } else {
            knockbackDirection.normalize();
        }
        
        // Aplica o dano usando o componente Hittable
        const damageDealt = hittable.takeDamage(sourceDamageComponent.damage);
        
        if (damageDealt) {
            // Aplica knockback nas caixas
            if (knockback) {
                knockback.applyKnockback(knockbackDirection, 2, 200); // Força 2, duração 200ms
            }
            
            console.log(`Box took damage! Health: ${hittable.health}/${hittable.maxHealth}`);
            
            // Se a vida chegou a zero, quebra a caixa
            if (!hittable.isAlive()) {
                // box.break(); // Chama o método break da caixa
                box.destroy(); // Remove a caixa do jogo
                console.log('Box destroyed!');
            }
        }
    }

    canAttackEnemy(enemy) {
        return !this.enemyAttackCooldowns.has(enemy);
    }

    updateHittableComponents(deltaTime) {
        // Atualiza todos os componentes Hittable
        const allHittableEntities = [...this.queries.players.results, ...this.queries.enemies.results, ...this.queries.boxes.results];
        
        for (const entity of allHittableEntities) {
            const hittable = entity.getComponent(Hittable);
            if (hittable) {
                hittable.update(deltaTime);
            }
        }
    }

    updateCooldowns(deltaTime) {
        for (const [enemy, cooldown] of this.enemyAttackCooldowns.entries()) {
            const newCooldown = cooldown - deltaTime;
            if (newCooldown <= 0) {
                this.enemyAttackCooldowns.delete(enemy);
            } else {
                this.enemyAttackCooldowns.set(enemy, newCooldown);
            }
        }
    }
}