import { Input } from './input.js'

export function Engine(options) {
    this.options = options;

    const FPS_RATE = 1000 / options.frameRate;

    const { context, clearCanvas } = this.createCanvas()

    const state = {
        interval: undefined
    }

    // loop principal do nosso jogo
    function gameLoop(ctx) {
        clearCanvas(ctx)

        options.render(ctx)
        options.update()
    }

    function start() {
        if (options.input instanceof Input) {
            // start input
            options.input.start()
        }

        // start main game loop
        gameLoop(context)

        // inicia o loop do jogo a cada 16.6ms (1000/16.6 = 60fps)
        state.interval = setInterval(() => gameLoop(context), FPS_RATE)
    }

    function stop() {
        clearInterval(state.interval)
        state.interval = undefined
    }

    return {
        start,
        stop
    }
}

Engine.prototype.createCanvas = function () {
    const canvas = document.getElementById(this.options.element);
    const context = canvas.getContext('2d')

    function clearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height)
    }

    return {
        canvas,
        context,
        clearCanvas
    }
}
