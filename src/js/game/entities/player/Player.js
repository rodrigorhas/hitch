import { fastRandomNumber, randomHash, randomHex } from "../../../engine/support/Random.js";
import { Entity } from "../../../engine/entities/Entity.js";
import { BoxShape } from "../../components/BoxShape.js";
import { Position } from "../../components/Position.js";
import { Controllable } from "../../components/tags/Controllable.js";
import { RigidBody } from "../../components/RigidBody.js";

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
        const entity = new this(options)

        const { width, height, color, speed, position } = options;

        entity.addComponent(BoxShape, { width, height, color })
        entity.addComponent(Position, { position })
        entity.addComponent(RigidBody, { speed })
        entity.addComponent(Controllable)

        return entity;
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
