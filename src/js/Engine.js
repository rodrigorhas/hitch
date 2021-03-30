import { Input } from './Input.js'
import { Time } from "./Time.js";

/**
 * @constructor {Time} options.time
 */
export class Engine {
    constructor(options) {
        this.options = options;

        const { canvas, context, clearCanvas } = this.createCanvas()

        this.time = new Time()
        this.input = this.options.input;

        this.state = {
            requestId: undefined
        }

        canvas.clearCanvas = clearCanvas;
        canvas.ctx = context;
        this.canvas = canvas;
    }

    gameLoop(canvas) {
        canvas.clearCanvas()

        this.options.render.call(this, canvas.ctx)

        this.time.update()
        this.options.update.call(this)
    }

    start() {
        if (this.options.input instanceof Input) {
            // start input
            this.options.input.start()
        }

        const mainLoop = () => {
            // start main game loop
            this.gameLoop(this.canvas)

            this.state.requestId = window.requestAnimationFrame(mainLoop)
        }

        mainLoop();
    }

    stop() {
        window.cancelAnimationFrame(this.state.requestId)
        this.state.requestId = undefined
    }

    createCanvas () {
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
}
