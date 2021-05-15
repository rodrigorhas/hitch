import { fastRandomNumber, randomHash, randomHex, randomNumber } from "../../../engine/support/Random.js";
import { Entity } from "../../../engine/entities/Entity.js";
import { Position } from "../../components/Position.js";
import { Controllable } from "../../components/Tags/Controllable.js";
import { RigidBody } from "../../components/RigidBody.js";
import { Collidable } from "../../components/Tags/Collidable.js";
import { Tooltip } from "../../components/Tooltip.js";
import { Vector2 } from "../../../engine/support/Vectors/Vector2.js";
import { Material } from "../../components/Material.js";
import { CircleShape } from "../../components/Shapes/CircleShape.js";
import { CircleCollider } from "../../../engine/support/Collider/CircleCollider.js";
import { BoxShape } from "../../components/Shapes/BoxShape.js";
import { BoxCollider } from "../../../engine/support/Collider/BoxCollider.js";

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

        const { width, height, color, speed, position, radius } = options;

        entity.addComponent(Material, { color })

        if (Math.random() > 0.5) {
            entity.addComponent(BoxShape, { width, height })
            entity.addComponent(BoxCollider, { w: width, h: height })
        } else {
            entity.addComponent(CircleShape, { radius })
            entity.addComponent(CircleCollider, { r: radius })
        }

        entity.addComponent(Position, position)
        entity.addComponent(RigidBody, { speed })
        entity.addComponent(Tooltip, {
            color, width, height,
            offset: new Vector2().set(-10, -15),
            text: entity.name
        })

        // tags
        entity.addComponent(Controllable)
        entity.addComponent(Collidable)

        return entity;
    }
}

export const randomPlayers = (game, min, max) => Array(fastRandomNumber(min, max)).fill(0).map(function () {
    return Player.make({
        name: randomHash(),
        color: randomHex(),
        speed: randomNumber(0.1, 1),
        position: {
            x: fastRandomNumber(0, game.canvas.width - 20),
            y: fastRandomNumber(0, game.canvas.height - 20)
        },
    })
})
