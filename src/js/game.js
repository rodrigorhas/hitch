import { Player } from './player.js'
import { Engine } from './engine.js'
import { Input } from './input.js'

const input = new Input();

const game = new Engine({
    element: 'canvas',
    frameRate: 60,
    render,
    update,
    input
})

const entities = [
    new Player({
        name: 'luis',
        color: 'blue',
        speed: -2,
        position: {
            x: 200,
            y: 20
        }
    }),
    new Player({
        name: 'rodrigo',
        color: 'red',
        speed: 2,
        position: {
            x: 200,
            y: 40
        },
    })
];

// MAIN LOOP STEPS

function render (ctx) {
    entities.forEach((entity) => {
        entity.render(ctx)
    })
}

function update () {
    entities.forEach((entity) => {
        entity.update()
    })
}

game.start()

window.game = game;
