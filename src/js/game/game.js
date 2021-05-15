// game
import { Engine } from "../engine/Engine.js";
import { CollisionSystem } from "./systems/CollisionSystem.js";
import { RenderSystem } from "./systems/RenderSystem.js";
import { TooltipSystem } from "./systems/TooltipSystem.js";
import { PlayerControllerSystem } from "./systems/PlayerControllerSystem.js";

// project
import { sampleRooms } from "./procedural/room.js";
import { sampleBathrooms } from "./procedural/bathrooms.js";
import { createHouse } from "./procedural/house.js";

const config = {
    area: {
        width: 20,
        height: 20
    },
    slots: {
        rooms: 3,
        bathrooms: 2,
    }
}

const presets = {
    rooms: sampleRooms,
    bathrooms: sampleBathrooms,
}

const house = createHouse(config, presets)

console.log(house)

const game = Engine({
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
