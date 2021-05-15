import { Player } from './entities/player/Player.js'
import { Engine } from "../engine/Engine.js";
import { RenderSystem } from "./systems/RenderSystem.js";
import { PlayerControllerSystem } from "./systems/PlayerControllerSystem.js";
import { TooltipSystem } from "./systems/TooltipSystem.js";
import { CollisionSystem } from "./systems/CollisionSystem.js";

const entities = [
    Player.make({
        name: 'luis',
        color: 'cornflowerblue',
        speed: 0.15,
        radius: 10,
        position: {
            x: 0,
            y: 0
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
    .register(RenderSystem)
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
