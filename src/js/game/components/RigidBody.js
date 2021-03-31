import { Component } from "../../engine/ecs/Component.js";

export class RigidBody extends Component {
    constructor({ speed }) {
        super();

        this.speed = speed;
    }
}
