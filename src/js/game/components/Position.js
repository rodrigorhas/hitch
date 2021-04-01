import { Component } from "../../engine/ecs/Component.js";
import { Vector2 } from "../../engine/support/Vectors/Vector2.js";
import { Classes } from "../utils/class.js";

export class Position extends Classes(Vector2, Component) {
    constructor({ x = 0, y = 0 }) {
        super();

        this.set(x, y)
    }
}
