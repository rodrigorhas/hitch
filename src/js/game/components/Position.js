import { Component } from "../../engine/ecs/Component.js";
import { Vector2 } from "../../engine/support/Vectors/Vector2.js";
import { Classes } from "../utils/class.js";

export class Position extends Classes(Vector2, Component) {
    previousPosition = new Vector2();

    constructor({ x = 0, y = 0 }) {
        super();

        this.set(x, y);
        this.previousPosition.set(x, y);
    }

    move (direction, speed, deltaTime = 16.67) {
        this.previousPosition = this.clone()

        // Convert deltaTime from milliseconds to seconds and apply to movement
        const deltaSeconds = deltaTime / 1000;
        this.add(direction.normalize().multiply(speed * deltaSeconds))
    }
}
