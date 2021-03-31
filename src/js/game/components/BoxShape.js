import { Shape } from "./Shape.js";

export class BoxShape extends Shape {
    type = 'box'

    constructor({ color, width, height }) {
        super();

        this.color = color || 'black';
        this.width = width || 20;
        this.height = height || 20;
    }
}
