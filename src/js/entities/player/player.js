import { Entity } from '../Entity.js'
import { fastRandomNumber, randomHash, randomHex } from "../../Random.js";
import { PlayerMovementComponent } from "./PlayerMovementComponent.js";

export class Player extends Entity {
    constructor(options) {
        super(options);

        this.state = {
            ...this.state,
            color: options.color,
            speed: options.speed || 1,
        }
    }

    static make(options) {
        options.components = options.components || {};

        if (!options.components.PositionComponent) {
            options.components.PositionComponent = new PlayerMovementComponent(options.position);
        }

        return new this(options)
    }

    render(ctx) {
        ctx.fillStyle = this.state.color;

        ctx.fillRect(
            this.state.position.x, this.state.position.y,
            this.state.width, this.state.height
        );
    }

    update() {
    }
}

export const randomPlayers = (game, min, max) => Array(fastRandomNumber(min, max)).fill(0).map(function () {
    return Player.make({
        name: randomHash(),
        color: randomHex(),
        speed: fastRandomNumber(2, 5),
        position: {
            x: fastRandomNumber(0, game.canvas.width - 20),
            y: fastRandomNumber(0, game.canvas.width - 20)
        },
    })
})
