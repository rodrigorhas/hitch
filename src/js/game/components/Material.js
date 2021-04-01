import { Component } from "../../engine/ecs/Component.js";

export class Material extends Component {
    constructor({ color }) {
        super();

        this.color = color || 'white';
    }
}
