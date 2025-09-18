import { System } from "../../engine/ecs/System.js";
import { Position } from "../components/Position.js";
import { Controllable } from "../components/Tags/Controllable.js";
import { Projectile } from "../components/Projectile.js";
import { SpeedBoost } from "../components/SpeedBoost.js";
import { Shield } from "../components/Shield.js";
import { DamageTrail } from "../components/DamageTrail.js";
import { RigidBody } from "../components/RigidBody.js";
import { Hittable } from "../components/Hittable.js";
import { Knockback } from "../components/Knockback.js";
import { Vector2 } from "../../engine/support/Vectors/Vector2.js";
import { InputConfig } from "../../engine/managers/Input/InputConfig.js";
import { Entity } from "../../engine/entities/Entity.js";
import { BoxCollider } from "../../engine/support/Collider/BoxCollider.js";
import { Collider2D } from "../../engine/support/Collider/Collider2D.js";
import { Player } from "../entities/player/Player.js";

export class SkillSystem extends System {
    queries = {
        players: {
            class: [Player]
        },
        projectiles: {
            components: [ Position, Projectile ]
        },
        entitiesWithShield: {
            components: [ Position, Shield ]
        },
        entitiesWithTrail: {
            components: [ Position, DamageTrail ]
        }
    }

    // Cooldowns das habilidades (em ms)
    skillCooldowns = {
        1: 0, // Projétil
        2: 0, // Speed boost
        3: 0, // Escudo
        4: 0  // Rastro de dano
    };

    skillDurations = {
        1: 500,  // Projétil - 0.5s cooldown
        2: 10000, // Speed boost - 10s cooldown
        3: 15000, // Escudo - 15s cooldown
        4: 8000   // Rastro de dano - 8s cooldown
    };

    execute(game) {
        const { time } = game;
        const deltaTime = time.deltaTime;

        // Debug: Verifica se as queries estão sendo atualizadas
        console.log('SkillSystem - Queries antes:', {
            players: this.queries.players?.results?.length || 0,
            projectiles: this.queries.projectiles?.results?.length || 0,
            shields: this.queries.entitiesWithShield?.results?.length || 0,
            trails: this.queries.entitiesWithTrail?.results?.length || 0
        });

        // Atualiza cooldowns
        this.updateCooldowns(deltaTime);

        // Processa habilidades dos players
        this.processPlayerSkills(game);

        // Atualiza projéteis
        this.updateProjectiles(game, deltaTime);

        // Atualiza escudos
        this.updateShields(game, deltaTime);

        // Atualiza rastros de dano
        this.updateDamageTrails(game, deltaTime);
    }

    /**
     * Atualiza os cooldowns das habilidades
     * @param {number} deltaTime - Tempo decorrido em ms
     */
    updateCooldowns(deltaTime) {
        for (const skill in this.skillCooldowns) {
            if (this.skillCooldowns[skill] > 0) {
                this.skillCooldowns[skill] -= deltaTime;
                if (this.skillCooldowns[skill] < 0) {
                    this.skillCooldowns[skill] = 0;
                }
            }
        }
    }

    /**
     * Processa as habilidades dos players
     * @param {Object} game - Instância do jogo
     */
    processPlayerSkills(game) {
        const players = this.queries.players.results;

        for (const player of players) {
            // Skill 1 - Projétil
            if (this.canUseSkill(1) && game.input.keyboard.isPressedForAction(InputConfig.getKeysForAction('SKILL_1'))) {
                this.useProjectileSkill(player, game);
            }

            // Skill 2 - Speed Boost
            if (this.canUseSkill(2) && game.input.keyboard.isPressedForAction(InputConfig.getKeysForAction('SKILL_2'))) {
                this.useSpeedBoostSkill(player);
            }

            // Skill 3 - Escudo
            if (this.canUseSkill(3) && game.input.keyboard.isPressedForAction(InputConfig.getKeysForAction('SKILL_3'))) {
                this.useShieldSkill(player);
            }

            // Skill 4 - Rastro de Dano
            if (this.canUseSkill(4) && game.input.keyboard.isPressedForAction(InputConfig.getKeysForAction('SKILL_4'))) {
                this.useDamageTrailSkill(player);
            }
        }
    }

    /**
     * Verifica se uma habilidade pode ser usada
     * @param {number} skillNumber - Número da habilidade (1-4)
     * @returns {boolean}
     */
    canUseSkill(skillNumber) {
        return this.skillCooldowns[skillNumber] <= 0;
    }

    /**
     * Usa a habilidade de projétil
     * @param {Entity} player - Entidade do player
     * @param {Object} game - Instância do jogo
     */
    useProjectileSkill(player, game) {
        const playerPosition = player.getComponent(Position);
        const mousePosition = game.input.mouse.position;

        const direction = Vector2.subtract(mousePosition, playerPosition).normalize();

        // Offset para evitar colisão com o lançador
        const offset = 30; // Distância do player
        const startX = playerPosition.x + direction.x * offset;
        const startY = playerPosition.y + direction.y * offset;

        const projectile = this.createProjectile({ x: startX, y: startY }, direction, player);
        game.ecs.entities.add(projectile);

        this.skillCooldowns[1] = this.skillDurations[1];
        console.log('Projétil disparado!');
    }

    /**
     * Usa a habilidade de speed boost
     * @param {Entity} player - Entidade do player
     */
    useSpeedBoostSkill(player) {
        let speedBoost = player.getComponent(SpeedBoost);
        
        if (!speedBoost) {
            speedBoost = new SpeedBoost();
            player.addComponent(SpeedBoost, speedBoost);
            console.log('SpeedBoost component added to player');
        }

        const rigidBody = player.getComponent(RigidBody);
        speedBoost.activate(rigidBody.walkSpeed);

        this.skillCooldowns[2] = this.skillDurations[2];
        console.log('Speed boost ativado!');
    }

    /**
     * Usa a habilidade de escudo
     * @param {Entity} player - Entidade do player
     */
    useShieldSkill(player) {
        let shield = player.getComponent(Shield);
        
        if (!shield) {
            shield = new Shield();
            player.addComponent(Shield, shield);
            console.log('Shield component added to player');
        }

        shield.activate();

        this.skillCooldowns[3] = this.skillDurations[3];
        console.log('Escudo ativado!');
    }

    /**
     * Usa a habilidade de rastro de dano
     * @param {Entity} player - Entidade do player
     */
    useDamageTrailSkill(player) {
        let damageTrail = player.getComponent(DamageTrail);
        
        if (!damageTrail) {
            damageTrail = new DamageTrail();
            player.addComponent(DamageTrail, damageTrail);
            console.log('DamageTrail component added to player');
        }

        damageTrail.activate();

        this.skillCooldowns[4] = this.skillDurations[4];
        console.log('Rastro de dano ativado!');
    }

    /**
     * Cria um projétil
     * @param {Object} startPosition - Posição inicial {x, y}
     * @param {Vector2} direction - Direção do projétil
     * @param {Entity} shooter - Entidade que disparou o projétil
     * @returns {Entity} - Entidade do projétil
     */
    createProjectile(startPosition, direction, shooter) {
        const projectile = new Entity({
            name: 'Projectile',
            id: `projectile_${Date.now()}`
        });

        projectile.addComponent(Position, {
            x: startPosition.x,
            y: startPosition.y
        });

        projectile.addComponent(Projectile, {
            speed: 8,
            direction: direction,
            damage: 5,
            lifetime: 2000,
            size: 4,
            color: '#000'
        });

        projectile.addComponent(BoxCollider, {
            width: 4,
            height: 4,
            offset: { x: 0, y: 0 }
        });

        // Armazena referência ao lançador para evitar auto-dano
        projectile.shooter = shooter;

        return projectile;
    }

    /**
     * Atualiza os projéteis
     * @param {Object} game - Instância do jogo
     * @param {number} deltaTime - Tempo decorrido em ms
     */
    updateProjectiles(game, deltaTime) {
        const projectiles = this.queries.projectiles.results;

        for (const projectile of projectiles) {
            const position = projectile.getComponent(Position);
            const projectileComponent = projectile.getComponent(Projectile);

            if (projectileComponent.update(deltaTime)) {
                projectileComponent.move(position, deltaTime);
                
                // Verifica colisão com outras entidades
                this.checkProjectileCollisions(projectile, game);
            } else {
                projectile.destroy();
            }
        }
    }

    /**
     * Verifica colisões do projétil com outras entidades
     * @param {Entity} projectile - Entidade do projétil
     * @param {Object} game - Instância do jogo
     */
    checkProjectileCollisions(projectile, game) {
        const projectilePosition = projectile.getComponent(Position);
        const projectileComponent = projectile.getComponent(Projectile);
        const projectileCollider = projectile.getComponent(BoxCollider);

        if (!projectileCollider) return;

        // Busca todas as entidades que podem ser atingidas
        const allEntities = game.ecs.entities.get();
        
        for (const entity of allEntities) {
            // Pula o próprio projétil
            if (entity === projectile) continue;
            
            // Pula o lançador do projétil (evita auto-dano)
            if (entity === projectile.shooter) continue;
            
            // Pula entidades sem posição
            const entityPosition = entity.getComponent(Position);
            if (!entityPosition) continue;
            
            // Pula entidades sem collider
            const entityCollider = entity.getComponent(BoxCollider);
            if (!entityCollider) continue;
            
            // Verifica se a entidade pode ser atingida
            const hittable = entity.getComponent(Hittable);
            if (!hittable) continue;
            
            // Atualiza bounds dos colliders
            projectileCollider.updateBounds({ position: projectilePosition });
            entityCollider.updateBounds({ position: entityPosition });
            
            // Verifica colisão
            if (Collider2D.BoxColliding(projectileCollider, entityCollider)) {
                // Aplica dano
                const damageDealt = hittable.takeDamage(projectileComponent.damage);
                
                if (damageDealt) {
                    console.log(`Projectile hit ${entity.name} for ${projectileComponent.damage} damage!`);
                    
                    // Aplica knockback se a entidade tem componente Knockback
                    const knockback = entity.getComponent(Knockback);
                    if (knockback) {
                        const direction = Vector2.subtract(entityPosition, projectilePosition);
                        if (direction.length() > 0) {
                            direction.normalize();
                            knockback.applyKnockback(direction, 2, 200);
                        }
                    }
                }
                
                // Destrói o projétil
                projectile.destroy();
                return; // Só pode acertar uma entidade por vez
            }
        }
    }

    /**
     * Atualiza os escudos
     * @param {Object} game - Instância do jogo
     * @param {number} deltaTime - Tempo decorrido em ms
     */
    updateShields(game, deltaTime) {
        const entitiesWithShield = this.queries.entitiesWithShield.results;

        for (const entity of entitiesWithShield) {
            const shield = entity.getComponent(Shield);
            
            if (!shield.update(deltaTime)) {
                // Escudo expirou ou foi quebrado
                continue;
            }
        }
    }

    /**
     * Atualiza os rastros de dano
     * @param {Object} game - Instância do jogo
     * @param {number} deltaTime - Tempo decorrido em ms
     */
    updateDamageTrails(game, deltaTime) {
        const entitiesWithTrail = this.queries.entitiesWithTrail.results;

        for (const entity of entitiesWithTrail) {
            const position = entity.getComponent(Position);
            const damageTrail = entity.getComponent(DamageTrail);
            
            if (!damageTrail.update(deltaTime, position, game.ecs.entities.get())) {
                // Rastro expirou
                continue;
            }
        }
    }

    /**
     * Retorna informações dos cooldowns
     * @returns {Object}
     */
    getCooldownInfo() {
        return {
            projectile: this.skillCooldowns[1],
            speedBoost: this.skillCooldowns[2],
            shield: this.skillCooldowns[3],
            damageTrail: this.skillCooldowns[4]
        };
    }
}
