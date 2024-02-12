import { Player, randomPlayers } from './entities/player/Player.js'
import { Engine } from "../engine/Engine.js";
import { SpriteRenderSystem } from "./systems/SpriteRenderSystem.js";
import { PlayerControllerSystem } from "./systems/PlayerControllerSystem.js";
import { TooltipSystem } from "./systems/TooltipSystem.js";
import { CollisionSystem } from "./systems/CollisionSystem.js";
import { withGrid } from "./utils/Utils.js";

const entities = [
    Player.make({
        isControlled: true,
        name: 'Player',
        speed: 0.08,
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
];

const game = new Engine({
    element: 'canvas',
    render,
    update,
})

game.ecs.entities
    .add(entities)

game.ecs.systems
    .register(CollisionSystem)
    .register(SpriteRenderSystem)
    .register(TooltipSystem)
    .register(PlayerControllerSystem)

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
}

game.start()

game.debug = true;

window.game = game;
