import { PositionComponent } from "../../components/PositionComponent.js";

export class PlayerMovementComponent extends PositionComponent {
    constructor(position) {
        super(position);
    }

    update(state, { input, time }) {
        if (input.isPressed('a')) {
            state.position.x += (state.speed * -1) * time.deltaTime;
        }

        if (input.isPressed('d')) {
            state.position.x += state.speed * time.deltaTime;
        }

        if (input.isPressed('w')) {
            state.position.y += (state.speed * -1) * time.deltaTime;
        }

        if (input.isPressed('s')) {
            state.position.y += state.speed * time.deltaTime;
        }
    }
}
