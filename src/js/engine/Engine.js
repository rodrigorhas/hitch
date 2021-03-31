import { Input } from './managers/Input.js'
import { Time } from "./managers/Time.js";
import { ECS } from "./ecs/ECS.js";

const noop = () => {
};

export class Engine {
    #render;
    #update;
    #mountElement;

    /**
     * @param {any} options
     * @param {Time?} options.time
     * @param {Input?} options.input
     * @param {ECS?} options.ecs
     */
    constructor(options) {
        this.#render = options.render || noop;
        this.#update = options.update || noop;

        this.#mountElement = options.element;

        this.#configureCanvas()

        this.#configureTime()
        this.#configureInput()
        this.#configureECS()

        this.state = {
            requestId: undefined,
            running: false
        }
    }

    gameLoop(canvas) {
        canvas.clearCanvas()

        this.time.update(() => {
            this.ecs.update(this)

            this.#render.call(this, canvas.ctx)
            this.#update.call(this)
        })
    }

    start() {
        if (this.input instanceof Input) {
            // start input
            this.input.start()
        }

        const mainLoop = () => {
            // start main game loop
            this.gameLoop(this.canvas)

            this.state.requestId = window.requestAnimationFrame(mainLoop)
        }

        mainLoop();

        this.state.running = true;
    }

    stop() {
        window.cancelAnimationFrame(this.state.requestId)
        this.state.requestId = undefined
        this.state.running = false;
    }

    createCanvas () {
        const canvas = document.getElementById(this.#mountElement);
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

    #configureCanvas() {
        const { canvas, context, clearCanvas } = this.createCanvas()

        canvas.clearCanvas = clearCanvas;
        canvas.ctx = context;

        this.canvas = canvas;
    }

    #configureTime() {
        this.time = this.time || new Time()
    }

    #configureInput() {
        this.input = this.input || new Input();
    }

    #configureECS() {
        this.ecs = this.ecs || new ECS();
    }
}
