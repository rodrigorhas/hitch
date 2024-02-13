import { Component } from "../../engine/ecs/Component.js";
import { SpriteSheet } from "../../engine/managers/SpriteSheet.js";

export class Sprite extends Component {
    isLoaded = false;
    direction = 'down';

    constructor({ image, position, dimension, animations, ...options }) {
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

        this.animationFrameLimit = options.animationFrameLimit || 16;
        this.animationFrameProgress = this.animationFrameLimit;

        this.animations = animations;
    }

    onImageLoad () {
        this.isLoaded = true;
    }

    setAnimation (animationName) {
        this.currentAnimation = animationName;
        this.currentAnimationFrame = 0;
    }

    get frame () {
        return this.animations[this.currentAnimation][this.currentAnimationFrame]
    }

    updateAnimationProgress () {
        if (this.animationFrameProgress > 0) {
            this.animationFrameProgress -= 1;
            return;
        }

        this.animationFrameProgress = this.animationFrameLimit;
        this.currentAnimationFrame += 1;

        if (this.frame === undefined) {
            this.currentAnimationFrame = 0;
        }
    }

    render(ctx, entity) {
        if (!this.isLoaded) {
            return
        }

        const [frameX, frameY] = this.frame;
        const sheetFrame = this.spritesheet.getFrameAt(frameX, frameY);

        ctx.drawImage(...sheetFrame(this.position));

        this.updateAnimationProgress();
    }

    update ({ position }) {
        this.position = {
            x: position.x - this.dimension.width,
            y: position.y - this.dimension.height
        }
    }
}
