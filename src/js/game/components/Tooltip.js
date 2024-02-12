import { Position } from "./Position.js";
import { RenderableComponent } from "./RenderableComponent.js";
import { Vector2 } from "../../engine/support/Vectors/Vector2.js";

export class Tooltip extends RenderableComponent {
    /**
     * @param {string} color
     * @param {number} width
     * @param {number} height
     * @param {Vector2} offset
     * @param {string} text
     */
    constructor({ color, width, height, offset, text }) {
        super();

        this.color = color;
        this.width = width;
        this.height = height;
        this.offset = offset || new Vector2();
        this.text = text;
        this.visible = false;
    }

    setText (text) {
        this.text = text
    }

    render(ctx, entity) {
        const position = entity.getComponent(Position)
        const offset = position.clone().add(this.offset)

        ctx.save()
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, offset.x, offset.y, this.width);
        ctx.restore()
    }
}
