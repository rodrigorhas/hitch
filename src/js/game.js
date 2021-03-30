import { Player } from './entities/player/player.js'
import { Engine } from './Engine.js'
import { Input } from './Input.js'

const input = new Input();

const game = new Engine({
    element: 'canvas',
    render,
    update,
    input
})

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

function render (ctx) {
    entities.forEach((entity) => {
        if (!entity.state.visible) {
            return;
        }

        entity.render(ctx)

        if (entity.renderComponents) {
            entity.renderComponents(game);
        }
    })
}

function update () {
    entities.forEach((entity) => {
        entity.update()

        if (entity.updateComponents) {
            entity.updateComponents(game);
        }
    })
}

game.start()

window.game = game;
