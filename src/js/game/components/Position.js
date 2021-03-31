import { Component } from "../../engine/ecs/Component.js";

export class Position extends Component {
    constructor({ x, y }) {
        super();

        this.x = x || 0;
        this.y = y || 0;
    }
}
