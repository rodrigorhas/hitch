import { Player, randomPlayers } from './entities/player/Player.js'
import { Engine } from "../engine/Engine.js";
import { SpriteRenderSystem } from "./systems/SpriteRenderSystem.js";
import { PlayerControllerSystem } from "./systems/PlayerControllerSystem.js";
import { TooltipSystem } from "./systems/TooltipSystem.js";
import { CollisionSystem } from "./systems/CollisionSystem.js";
import { withGrid } from "./utils/Utils.js";
import { randomNumber } from "../engine/support/Random.js";

const entities = [
    Player.make({
        isControlled: true,
        name: 'Player',
        walkSpeed: randomNumber(0.8, 0.9),
        runningSpeed: randomNumber(1.2, 1.5),
        tooltip: {
            color: 'black',
        },
        dimension: {
            width: 32,
            height: 32,
        },
        position: {
            x: withGrid(2),
            y: withGrid(2)
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
];

const game = new Engine({
    element: 'canvas',
    render,
    update,
})

game.ecs.entities
    .add(entities)

game.ecs.entities
    .add(randomPlayers(game, 200, 240))

game.ecs.systems
    .register(PlayerControllerSystem)
    .register(CollisionSystem)
    .register(SpriteRenderSystem)
    .register(TooltipSystem)

function render(ctx) {
    const text = 'Entities: ' + game.ecs.entities.count();

    ctx.fillStyle = 'black'
    ctx.fillText(text, 10, 20, 60);

    if (game.debug) {
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
