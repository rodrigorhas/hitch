import { System } from "../../engine/ecs/System.js";
import { Position } from "../components/Position.js";
import { Controllable } from "../components/Tags/Controllable.js";
import { Projectile } from "../components/Projectile.js";
import { SpeedBoost } from "../components/SpeedBoost.js";
import { Shield } from "../components/Shield.js";
import { DamageTrail } from "../components/DamageTrail.js";
import { RigidBody } from "../components/RigidBody.js";
import { Vector2 } from "../../engine/support/Vectors/Vector2.js";
import { InputConfig } from "../../engine/managers/Input/InputConfig.js";
import { Entity } from "../../engine/entities/Entity.js";
import { Collidable } from "../components/Tags/Collidable.js";
import { BoxCollider } from "../../engine/support/Collider/BoxCollider.js";

export class SkillSystem extends System {
    queries = {
        players: {
            components: [ Controllable, Position, RigidBody ]
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
        const { input, time } = game;
        const deltaTime = time.deltaTime;

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

        // Calcula direção do projétil em relação ao mouse
        const direction = Vector2.subtract(mousePosition, playerPosition).normalize();

        // Cria o projétil
        const projectile = this.createProjectile(playerPosition, direction);
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
        }

        damageTrail.activate();

        this.skillCooldowns[4] = this.skillDurations[4];
        console.log('Rastro de dano ativado!');
    }

    /**
     * Cria um projétil
     * @param {Position} startPosition - Posição inicial
     * @param {Vector2} direction - Direção do projétil
     * @returns {Entity} - Entidade do projétil
     */
    createProjectile(startPosition, direction) {
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
            } else {
                projectile.destroy();
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
