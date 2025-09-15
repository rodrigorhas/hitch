import { System } from "../../engine/ecs/System.js";
import { Position } from "../components/Position.js";
import { EnemyState } from "../components/EnemyState.js";
import { RigidBody } from "../components/RigidBody.js";
import { Controllable } from "../components/Tags/Controllable.js";
import { Vector2 } from "../../engine/support/Vectors/Vector2.js";

export class EnemyAISystem extends System {
    queries = {
        enemies: {
            components: [ EnemyState, Position, RigidBody ]
        },
        players: {
            components: [ Controllable, Position ]
        }
    }

    execute(game) {
        const { time } = game;
        const deltaTime = time.deltaTime;

        const enemies = this.queries.enemies.results;
        const players = this.queries.players.results;

        for (const enemy of enemies) {
            const enemyPosition = enemy.getComponent(Position);
            const enemyState = enemy.getComponent(EnemyState);
            const enemyRb = enemy.getComponent(RigidBody);

            // Atualiza o estado do inimigo
            enemyState.update(deltaTime);

            // Encontra o player mais próximo
            const nearestPlayer = this.findNearestPlayer(enemyPosition, players);
            
            if (nearestPlayer) {
                const distance = Vector2.distance(enemyPosition, nearestPlayer.getComponent(Position));
                
                // Lógica de transição de estados
                this.updateEnemyState(enemyState, distance, nearestPlayer);
                
                // Movimentação baseada no estado
                this.updateEnemyMovement(enemy, nearestPlayer, enemyState, deltaTime);
            }

            // Atualiza a velocidade do RigidBody baseada no estado
            enemyRb.walkSpeed = enemyState.getCurrentSpeed();
        }
    }

    findNearestPlayer(enemyPosition, players) {
        let nearestPlayer = null;
        let minDistance = Infinity;

        for (const player of players) {
            const playerPosition = player.getComponent(Position);
            const distance = Vector2.distance(enemyPosition, playerPosition);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestPlayer = player;
            }
        }

        return nearestPlayer;
    }

    updateEnemyState(enemyState, distance, player) {
        const { STATES } = EnemyState;

        switch (enemyState.currentState) {
            case STATES.GUARD:
                // Se o player está dentro do alcance de detecção, começa a perseguir
                if (distance <= enemyState.detectionRange) {
                    enemyState.setState(STATES.CHASING);
                }
                break;

            case STATES.CHASING:
                // Se o player está muito longe, volta para guard
                if (distance > enemyState.detectionRange * 1.5) {
                    enemyState.setState(STATES.GUARD);
                }
                // Se está próximo o suficiente, ataca
                else if (distance <= enemyState.attackRange) {
                    enemyState.setState(STATES.ATTACKING);
                }
                break;

            case STATES.ATTACKING:
                // Se o player se afastou muito durante o ataque, volta a perseguir
                if (distance > enemyState.attackRange * 1.5) {
                    enemyState.setState(STATES.CHASING);
                }
                break;

            case STATES.DAMAGE_TAKEN:
                // Durante o knockback, não muda de estado
                break;
        }
    }

    updateEnemyMovement(enemy, player, enemyState, deltaTime) {
        const enemyPosition = enemy.getComponent(Position);
        const playerPosition = player.getComponent(Position);
        const { STATES } = EnemyState;

        switch (enemyState.currentState) {
            case STATES.GUARD:
                // Patrulha aleatória ou fica parado
                this.guardBehavior(enemy, deltaTime);
                break;

            case STATES.CHASING:
                // Move em direção ao player
                this.chaseBehavior(enemy, player, deltaTime);
                break;

            case STATES.ATTACKING:
                // Para e ataca (não se move)
                break;

            case STATES.DAMAGE_TAKEN:
                // Aplica knockback
                this.knockbackBehavior(enemy, enemyState, deltaTime);
                break;
        }
    }

    guardBehavior(enemy, deltaTime) {
        // Comportamento simples de guard - pode ser expandido para patrulha
        // Por enquanto, fica parado
    }

    chaseBehavior(enemy, player, deltaTime) {
        const enemyPosition = enemy.getComponent(Position);
        const playerPosition = player.getComponent(Position);
        
        // Calcula direção para o player
        const direction = Vector2.subtract(playerPosition, enemyPosition);
        
        // Verifica se a distância é zero (mesma posição)
        if (direction.length() === 0) {
            return; // Não se move se estiver na mesma posição
        }
        
        // Normaliza a direção
        direction.normalize();
        
        // Move na direção do player
        enemyPosition.move(direction, enemy.getComponent(RigidBody).speed * deltaTime);
    }

    knockbackBehavior(enemy, enemyState, deltaTime) {
        const enemyPosition = enemy.getComponent(Position);
        const knockbackDir = enemyState.knockbackDirection;
        
        // Aplica o knockback
        const knockbackVector = new Vector2(knockbackDir.x, knockbackDir.y);
        
        // Verifica se o vetor de knockback é válido
        if (knockbackVector.length() === 0) {
            return; // Não aplica knockback se a direção for zero
        }
        
        knockbackVector.normalize();
        enemyPosition.move(knockbackVector, enemyState.knockbackForce * deltaTime);
    }

    // Método para aplicar dano ao inimigo (chamado externamente)
    static damageEnemy(enemy, damageSource) {
        const enemyPosition = enemy.getComponent(Position);
        const damageSourcePosition = damageSource.getComponent(Position);
        const enemyState = enemy.getComponent(EnemyState);
        
        // Calcula direção do knockback (oposta à fonte do dano)
        const knockbackDirection = Vector2.subtract(enemyPosition, damageSourcePosition);
        
        // Se as posições são iguais, usa uma direção aleatória
        if (knockbackDirection.length() === 0) {
            const randomAngle = Math.random() * Math.PI * 2;
            knockbackDirection.set(Math.cos(randomAngle), Math.sin(randomAngle));
        } else {
            knockbackDirection.normalize();
        }
        
        // Aplica o dano e knockback
        enemy.state.health -= 10; // Dano fixo por enquanto
        enemyState.takeDamage(knockbackDirection);
        
        // Se a vida chegou a zero, remove a entidade
        if (enemy.state.health <= 0) {
            enemy.destroy();
        }
    }
}
