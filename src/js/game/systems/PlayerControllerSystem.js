import { System } from "../../engine/ecs/System.js";
import { Position } from "../components/Position.js";
import { Controllable } from "../components/Tags/Controllable.js";
import { RigidBody } from "../components/RigidBody.js";
import { randomPlayers } from "../entities/player/Player.js";
import { Sprite } from "../components/Sprite.js";
import { Vector2 } from "../../engine/support/Vectors/Vector2.js";
import { InputConfig } from "../../engine/managers/Input/InputConfig.js";

export class PlayerControllerSystem extends System {
    queries = {
        players: {
            components: [ Controllable, RigidBody, Position, Sprite ]
        }
    }

    direction(input) {
        const direction = new Vector2(0, 0);
        let animationDirection;

        if (input.keyboard.isPressedForAction(InputConfig.getKeysForAction('MOVE_LEFT'))) {
            direction.set(-1, 0);
            animationDirection = 'left';
        }

        if (input.keyboard.isPressedForAction(InputConfig.getKeysForAction('MOVE_RIGHT'))) {
            direction.set(1, 0);
            animationDirection = 'right';
        }

        if (input.keyboard.isPressedForAction(InputConfig.getKeysForAction('MOVE_UP'))) {
            direction.set(0, -1);
            animationDirection = 'up';
        }

        if (input.keyboard.isPressedForAction(InputConfig.getKeysForAction('MOVE_DOWN'))) {
            direction.set(0, 1);
            animationDirection = 'down';
        }

        return {
            direction,
            animationDirection
        };
    }

    execute(game) {
        const { canvas, input, time } = game;

        /** @type {Player[]|*} */
        const entities = this.queries.players.results;

        for (const entity of entities) {
            const position = entity.getComponent(Position)
            const sprite = entity.getComponent(Sprite)
            const rb = entity.getComponent(RigidBody)
            const controllable = entity.getComponent(Controllable)

            if (!controllable) continue;

            const {animationDirection, direction} = this.direction(input);

            if (input.keyboard.isPressedForAction(InputConfig.getKeysForAction('TOGGLE_RUN'))) {
                rb.setRunning(!rb.isRunning)
            }

            position.move(direction, rb.speed * time.deltaTime)

            if (sprite.direction !== animationDirection) {
                const state = rb.isRunning ? 'run' : 'walk';

                sprite.setAnimation(
                    animationDirection
                        ? `${state}-${animationDirection || 'down'}`
                        : `idle-${sprite.direction || animationDirection}`
                )

                sprite.direction = animationDirection;
            }

            if (input.keyboard.isPressedForAction(InputConfig.getKeysForAction('SPAWN_ENTITIES'))) {
                game.ecs.entities.add(randomPlayers(game, 1, 3))
            }
        }
    }
}
