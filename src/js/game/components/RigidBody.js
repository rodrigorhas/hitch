import { Component } from "../../engine/ecs/Component.js";

export class RigidBody extends Component {

    isRunning = false;
    runningSpeed = 2;
    walkSpeed;

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
}
