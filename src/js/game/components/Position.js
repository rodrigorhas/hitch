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

    move (direction, speed) {
        this.previousPosition = this.clone()

        this.add(direction.normalize().multiply(speed))
    }
}
