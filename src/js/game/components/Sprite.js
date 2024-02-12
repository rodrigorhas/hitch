import { Component } from "../../engine/ecs/Component.js";
import { SpriteSheet } from "../../engine/managers/SpriteSheet.js";

export class Sprite extends Component {
    isLoaded = false;

    constructor({ image, position, dimension }) {
        super();

        this.imageElement = new Image();

        this.imageElement.src = image.src;
        this.imageElement.onload = () => this.onImageLoad();

        this.spritesheet = new SpriteSheet({
            imageUrl: image.src,
            cols: 8, rows: 8,
            onLoad: () => this.isLoaded = true
        });

        this.image = image;
        this.position = position;
        this.dimension = dimension;

        this.currentAnimation = 'idle-down';
        this.currentAnimationFrame = 0;

        this.animationFrameLimit = 16;
        this.animationFrameProgress = this.animationFrameLimit;

        this.animations = {
            'idle-down': [
                [0, 0]
            ],
            'walk-left': [
                [0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7],
            ]
        }
    }

    onImageLoad () {
        this.isLoaded = true;
    }

    get frame () {
        return this.animations[this.currentAnimation][this.currentAnimationFrame]
    }

    render(ctx, entity) {
        if (!this.isLoaded) {
            return
        }

        const [frameX, frameY] = this.frame;
        const sheetFrame = this.spritesheet.getFrameAt(frameX, frameY);

        ctx.drawImage(...sheetFrame(this.position))
    }

    update ({ position }) {
        this.position = {
            x: position.x - this.dimension.width,
            y: position.y - this.dimension.height
        }
    }
}
