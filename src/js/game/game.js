import { Player } from './entities/player/Player.js'
import { Engine } from "../engine/Engine.js";
import { RenderSystem } from "./systems/RenderSystem.js";
import { PlayerControllerSystem } from "./systems/PlayerControllerSystem.js";

const entities = [
    Player.make({
        name: 'luis',
        color: 'blue',
        speed: 0.25,
        position: {
            x: 200,
            y: 20
        }
    }),
];

const game = new Engine({
    element: 'canvas',
    render,
    update,
})

game.ecs.entities.add(entities)
game.ecs.systems
    .register(RenderSystem)
    .register(PlayerControllerSystem)

function render(ctx) {
}

function update() {
}

game.start()

window.game = game;
