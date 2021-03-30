import { BaseComponent } from "./BaseComponent.js";

export class PositionComponent extends BaseComponent {
    constructor({ x = 0, y = 0 }) {
        super();

        this.position = { x, y };
    }
}
