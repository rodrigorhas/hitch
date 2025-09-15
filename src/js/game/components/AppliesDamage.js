import { Component } from "../../engine/ecs/Component.js";

export class AppliesDamage extends Component {
    constructor({ damage }) {
        super();

        this.damage = damage || 10;
    }
}
