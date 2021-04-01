import { System } from "../../engine/ecs/System.js";
import { Position } from "../components/Position.js";
import { Controllable } from "../components/Tags/Controllable.js";
import { RigidBody } from "../components/RigidBody.js";
import { randomPlayers } from "../entities/player/Player.js";

export class PlayerControllerSystem extends System {
    queries = {
        players: {
            components: [ Controllable, RigidBody, Position ]
        }
    }

    execute(game) {
        const { canvas, input, time } = game;

        for (const entity of this.queries.players.results) {
            const position = entity.getComponent(Position)

            const rb = entity.getComponent(RigidBody)

            if (input.keyboard.isPressed('a')) {
                position.x += (rb.speed * -1) * time.deltaTime;
            }

            if (input.keyboard.isPressed('d')) {
                position.x += rb.speed * time.deltaTime;
            }

            if (input.keyboard.isPressed('w')) {
                position.y += (rb.speed * -1) * time.deltaTime
            }

            if (input.keyboard.isPressed('s')) {
                position.y += rb.speed * time.deltaTime;
            }

            if (input.keyboard.isButtonDown('r')) {
                position.set((canvas.width * 0.5), (canvas.height * 0.5))
            }

            if (input.keyboard.isButtonDown(',')) {
                game.ecs.entities.add(randomPlayers(game, 1, 3))
            }
        }
    }
}
