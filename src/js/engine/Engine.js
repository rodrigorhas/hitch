import { Input } from './managers/Input.js'
import { Time } from "./managers/Time.js";
import { ECS } from "./ecs/ECS.js";
import { noop } from "../game/utils/Utils.js";

/**
 * @typedef {HTMLCanvasElement & {ctx: CanvasRenderingContext2D}} EngineCanvas
 */

export class Engine {
    #render;
    #update;
    #fixedUpdate;
    #mountElement;

    /**
     * @type {EngineCanvas} canvas
     */
    canvas;

    /**
     * @param {any} options
     * @param {Time?} options.time
     * @param {Input?} options.input
     * @param {ECS?} options.ecs
     */
    constructor(options) {
        this.#render = options.render || noop;
        this.#update = options.update || noop;
        this.#fixedUpdate = options.fixedUpdate || noop;

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

        this.time.fixedUpdate(() => {
            this.ecs.fixedUpdate(this)
            this.#fixedUpdate.call(this)
        })

        this.time.update(() => {
            this.ecs.update(this)

            this.#update.call(this)
            this.input.update(this)

            this.#render.call(this, canvas.ctx)
        })
    }

    start() {
        if (this.input instanceof Input) {
            // start input
            this.input.start(this)
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
        /**
         * @type {EngineCanvas|null}
         */
        const canvas = document.getElementById(this.#mountElement);
        const context = canvas.getContext('2d')

        context.imageSmoothingEnabled = false;

        canvas.onselectstart = function () {
            return false;
        };

        canvas.style.imageRendering = 'pixelated';

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
