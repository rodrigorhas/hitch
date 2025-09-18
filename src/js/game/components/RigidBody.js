import { Component } from "../../engine/ecs/Component.js";
import { Vector2 } from "../../engine/support/Vectors/Vector2.js";

export class RigidBody extends Component {

    isRunning = false;
    runningSpeed = 2;
    walkSpeed;
    velocity = new Vector2(0, 0);

    constructor({ runningSpeed, walkSpeed }) {
        super();

        this.runningSpeed = runningSpeed;
        this.walkSpeed = walkSpeed;
    }

    get speed () {
        return this.isRunning ? this.runningSpeed : this.walkSpeed;
    }

    setRunning (state = true) {
        this.isRunning = state;
    }

    setVelocity(x, y) {
        this.velocity.set(x, y);
    }

    addVelocity(x, y) {
        this.velocity.add(x, y);
    }

    getVelocity() {
        return this.velocity.clone();
    }
}
