import { fastRandomNumber, randomHash, randomHex, randomNumber } from "../../../engine/support/Random.js";
import { Entity } from "../../../engine/entities/Entity.js";
import { Position } from "../../components/Position.js";
import { Controllable } from "../../components/Tags/Controllable.js";
import { RigidBody } from "../../components/RigidBody.js";
import { Collidable } from "../../components/Tags/Collidable.js";
import { Tooltip } from "../../components/Tooltip.js";
import { Vector2 } from "../../../engine/support/Vectors/Vector2.js";
import { Sprite } from "../../components/Sprite.js";
import { BoxShape } from "../../components/Shapes/BoxShape.js";
import { BoxCollider } from "../../../engine/support/Collider/BoxCollider.js";
import { toGridCell } from "../../utils/Utils.js";

export class Player extends Entity {
    constructor(options) {
        super(options);

        this.state = {
            ...this.state,
            color: options.color,
            speed: options.speed || 1,
        }
    }

    get tooltipText () {
        const position = this.getComponent(Position)

        return `${this.name} (${toGridCell(position.x)}, ${toGridCell(position.y)})`
    }

    static make(options) {
        const entity = new this(options)

        const { dimension, tooltip, speed, position } = options;

        entity.addComponent(Sprite, {
            image: {
                src: 'js/game/assets/char_a_p1/char_a_p1_0bas_humn_v01.png',
                cropSize: 16,
            },
            dimension,
            position,
        })

        entity.addComponent(BoxShape, dimension)
        entity.addComponent(BoxCollider, dimension)

        entity.addComponent(Position, position)
        entity.addComponent(RigidBody, { speed })
        entity.addComponent(Tooltip, {
            width: dimension.width + 16, height: 16,
            color: tooltip.color,
            offset: new Vector2().set(-10, -15),
            text: entity.tooltipText
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
        speed: randomNumber(0.1, 1),
        tooltip: {
            color: randomHex(),
        },
        dimension: {
            width: 32,
            height: 32
        },
        position: {
            x: fastRandomNumber(0, game.canvas.width - 20),
            y: fastRandomNumber(0, game.canvas.height - 20)
        },
    })
})
