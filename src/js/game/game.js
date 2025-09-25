import { Engine } from "../engine/Engine.js";

import { SpriteRenderSystem } from "./systems/SpriteRenderSystem.js";
import { PlayerControllerSystem } from "./systems/PlayerControllerSystem.js";
import { TooltipSystem } from "./systems/TooltipSystem.js";
import { CollisionSystem } from "./systems/CollisionSystem.js";
import { EnemyAISystem } from "./systems/EnemyAISystem.js";
import { BlobRenderSystem } from "./systems/BlobRenderSystem.js";
import { HealthBarSystem } from "./systems/HealthBarSystem.js";
import { KnockbackSystem } from "./systems/KnockbackSystem.js";
import { SkillSystem } from "./systems/SkillSystem.js";
import { SkillRenderSystem } from "./systems/SkillRenderSystem.js";
import { CombatSystem } from "./systems/CombatSystem.js";
import { EntityRenderSystem } from './systems/EntityRenderSystem.js';

import { BattleStage } from "./stages/BattleStage.js";

const game = new Engine({
    element: 'canvas',
    render,
    update,
})

game.ecs.systems
    .register(PlayerControllerSystem)
    .register(EnemyAISystem)
    // .register(CombatSystem)
    .register(CollisionSystem)
    // .register(KnockbackSystem)
    // .register(SkillSystem)
    .register(BlobRenderSystem)
    .register(HealthBarSystem)
    
    .register(SpriteRenderSystem)
    // .register(SkillRenderSystem)
    .register(TooltipSystem)
    .register(EntityRenderSystem)

function render(ctx, alpha = 1.0) {
    ctx.save();
    const text = 'Entities: ' + game.ecs.entities.count();

    ctx.fillStyle = 'black'
    ctx.fillText(text, 10, 20, 60);

    if (game.debug) {
        // Show FPS and power mode info
        const fps = Math.round(game.time.fps);
        const powerMode = game.time.isLowPowerMode ? 'LOW POWER' : 'NORMAL';
        const deltaTime = Math.round(game.time.deltaTime * 100) / 100;
        
        ctx.fillStyle = game.time.isLowPowerMode ? 'red' : 'green';
        ctx.fillText(`FPS: ${fps} | ${powerMode} | Δt: ${deltaTime}ms`, 10, 40);

        // Show query cache stats
        const cacheStats = game.ecs.getQueryCacheStats();
        ctx.fillStyle = cacheStats.cacheSize > cacheStats.maxCacheSize * 0.8 ? 'orange' : 'blue';
        ctx.fillText(`Cache: ${cacheStats.cacheSize}/${cacheStats.maxCacheSize} queries | Entities: ${cacheStats.entityCount}`, 10, 60);

        // Show skill cooldowns
        const skillSystem = game.ecs.systems.get(SkillSystem);
        if (skillSystem) {
            const cooldowns = skillSystem.getCooldownInfo();
            ctx.fillStyle = 'red';
            ctx.fillText(`Skills: 1(${Math.ceil(cooldowns.projectile/1000)}s) 2(${Math.ceil(cooldowns.speedBoost/1000)}s) 3(${Math.ceil(cooldowns.shield/1000)}s) 4(${Math.ceil(cooldowns.damageTrail/1000)}s)`, 10, 80);
        }

        ctx.beginPath();
        ctx.arc(game.input.mouse.position.x, game.input.mouse.position.y, 2, 0, 2 * Math.PI)
        ctx.fill()
        ctx.closePath()

        ctx.restore();
    }
}

function update() {
    if (game.input.keyboard.isButtonDown('.')) {
        game.debug = !game.debug;
    }
}

BattleStage(game)

game.start()
game.debug = true;

window.game = game;
