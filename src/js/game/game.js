import { Player, randomPlayers } from './entities/player/Player.js'
import { Blob } from './entities/enemy/Blob.js'
import { Box } from './entities/Box.js'
import { Engine } from "../engine/Engine.js";
import { SpriteRenderSystem } from "./systems/SpriteRenderSystem.js";
import { PlayerControllerSystem } from "./systems/PlayerControllerSystem.js";
import { TooltipSystem } from "./systems/TooltipSystem.js";
import { CollisionSystem } from "./systems/CollisionSystem.js";
import { EnemyAISystem } from "./systems/EnemyAISystem.js";
import { BlobRenderSystem } from "./systems/BlobRenderSystem.js";
import { BoxRenderSystem } from "./systems/BoxRenderSystem.js";
import { HealthBarSystem } from "./systems/HealthBarSystem.js";
import { KnockbackSystem } from "./systems/KnockbackSystem.js";
import { CombatSystem } from "./systems/CombatSystem.js";
import { withGrid } from "./utils/Utils.js";
import { randomNumber } from "../engine/support/Random.js";

const entities = [
    Player.make({
        isControlled: true,
        name: 'Player',
        walkSpeed: 10,
        runningSpeed: 20,
        tooltip: {
            color: 'black',
        },
        dimension: {
            width: 32,
            height: 32,
        },
        position: {
            x: withGrid(1),
            y: withGrid(1)
        }
    }),
    Player.make({
        isControlled: false,
        name: 'Player 2',
        speed: 0.1,
        tooltip: {
            color: 'black',
        },
        dimension: {
            width: 32,
            height: 32,
        },
        position: {
            x: withGrid(4),
            y: withGrid(4)
        }
    }),
    // Adiciona alguns blobs inimigos
    Blob.make({
        name: 'Blob 1',
        health: 100,
        detectionRange: 100,
        attackRange: 20,
        chaseSpeed: 3,
        guardSpeed: 1,
        tooltip: {
            color: 'red',
        },
        dimension: {
            width: 24,
            height: 24,
        },
        position: {
            x: withGrid(4),
            y: withGrid(4)
        }
    }),
    Blob.make({
        name: 'Blob 2',
        health: 100,
        detectionRange: 100,
        attackRange: 20,
        chaseSpeed: 3,
        guardSpeed: 1,
        tooltip: {
            color: 'red',
        },
        dimension: {
            width: 24,
            height: 24,
        },
        position: {
            x: withGrid(4),
            y: withGrid(3)
        }
    }),
];

const game = new Engine({
    element: 'canvas',
    render,
    update,
})

// Adiciona caixas aleatoriamente pelo mapa
const boxes = Box.randomBoxes(game, 15);

game.ecs.entities
    .add(entities)
    .add(boxes)

game.ecs.systems
    .register(PlayerControllerSystem)
    .register(EnemyAISystem)
    .register(CombatSystem)
    .register(CollisionSystem)
    .register(KnockbackSystem)
    .register(HealthBarSystem)
    .register(BlobRenderSystem)
    .register(SpriteRenderSystem)
    .register(TooltipSystem)

function render(ctx) {
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

        ctx.beginPath();
        ctx.arc(game.input.mouse.position.x, game.input.mouse.position.y, 2, 0, 2 * Math.PI)
        ctx.fill()
        ctx.closePath()
    }
}

function update() {
    if (game.input.keyboard.isButtonDown('.')) {
        game.debug = !game.debug;
    }

    if (game.input.keyboard.isButtonDown(',')) {
        game.ecs.entities.add(randomPlayers(game, 1, 3))
    }
}

game.start()

game.debug = true;

window.game = game;
