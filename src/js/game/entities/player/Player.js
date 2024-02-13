import { fastRandomNumber, randomHash, randomHex, randomNumber } from "../../../engine/support/Random.js";
import { Entity } from "../../../engine/entities/Entity.js";
import { Position } from "../../components/Position.js";
import { Controllable } from "../../components/Tags/Controllable.js";
import { RigidBody } from "../../components/RigidBody.js";
import { Collidable } from "../../components/Tags/Collidable.js";
import { Tooltip } from "../../components/Tooltip.js";
import { Vector2 } from "../../../engine/support/Vectors/Vector2.js";
import { Sprite } from "../../components/Sprite.js";
import { BoxCollider } from "../../../engine/support/Collider/BoxCollider.js";
import { toGridCell } from "../../utils/Utils.js";

export class Player extends Entity {
    constructor(options) {
        super(options);

        this.state = {
            ...this.state,
            speed: options.speed || 1,
        }
    }

    get tooltipText () {
        const position = this.getComponent(Position)

        return `${this.name} (${toGridCell(position.x)}, ${toGridCell(position.y)})`
    }

    static make(options) {
        const entity = new this(options)

        const { dimension, tooltip, position } = options;

        entity.addComponent(Sprite, {
            image: {
                src: 'js/game/assets/char_a_p1/char_a_p1_0bas_humn_v01.png',
                cropSize: 16,
            },
            dimension,
            position,
            animationFrameLimit: 16,
            animations: {
                'idle-up': [ [0, 1] ],
                'idle-down': [ [0, 0] ],
                'idle-left': [ [0, 3] ],
                'idle-right': [ [0, 2] ],
                'walk-up': [ [0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5] ],
                'walk-down': [ [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4] ],
                'walk-left': [ [0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7] ],
                'walk-right': [ [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6] ],
                'run-up': [ [0, 5], [1, 5], [6, 5], [3, 5], [4, 5], [7, 5] ],
                'run-down': [ [0, 4], [1, 4], [6, 4], [3, 4], [4, 4], [7, 4] ],
                'run-left': [ [0, 7], [1, 7], [6, 7], [3, 7], [4, 7], [7, 7] ],
                'run-right': [ [0, 6], [1, 6], [6, 6], [3, 6], [4, 6], [7, 6] ],
            }
        })

        entity.addComponent(BoxCollider, {
            width: Math.floor(dimension.width * 0.5),
            height: Math.floor(dimension.height * 0.5),
            offset: { y: 8 }
        })

        entity.addComponent(Position, position)

        entity.addComponent(RigidBody, {
            isRunning: false,
            walkSpeed: options.walkSpeed || 1,
            runningSpeed: options.runningSpeed || 2,
        })

        entity.addComponent(Tooltip, {
            width: dimension.width + 16, height: 16,
            color: tooltip.color,
            offset: new Vector2().set(-10, -15),
            text: entity.tooltipText
        })

        // tags
        if (options.isControlled) {
            entity.addComponent(Controllable)
        }

        entity.addComponent(Collidable)

        return entity;
    }
}

export const randomPlayers = (game, min, max) => Array(fastRandomNumber(min, max)).fill(0).map(function () {
    return Player.make({
        name: randomHash(),
        walkSpeed: randomNumber(0.8, 0.9),
        runningSpeed: randomNumber(1.2, 1.5),
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
