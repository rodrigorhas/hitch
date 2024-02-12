export class SpriteSheet {
    isLoaded = false;

    constructor({imageUrl, cols, rows, onLoad}) {
        this.image = new Image();
        this.image.src = imageUrl;

        this.cols = cols;
        this.rows = rows;
        this.totalFrames = cols * rows;

        this.frameWidth = 0;
        this.frameHeight = 0;

        this.image.onload = () => {
            this.frameWidth = this.image.width / this.cols;
            this.frameHeight = this.image.height / this.rows;

            this.isLoaded = true;

            onLoad(this.image)
        };
    }

    getFrame(frameNumber) {
        const col = frameNumber % this.cols;
        const row = Math.floor(frameNumber / this.cols);

        return (position) => [
            this.image,
            col * this.frameWidth,
            row * this.frameHeight,
            this.frameWidth,
            this.frameHeight,
            position.x,
            position.y,
            this.frameWidth,
            this.frameHeight
        ]
    }

    getFrameRect(frameNumber) {
        const col = frameNumber % this.cols;
        const row = Math.floor(frameNumber / this.cols);
        return {
            x: col * this.frameWidth,
            y: row * this.frameHeight,
            width: this.frameWidth,
            height: this.frameHeight
        };
    }

    getFrameAt(x, y) {
        const col = Math.floor(x / this.frameWidth);
        const row = Math.floor(y / this.frameHeight);
        const frameNumber = row * this.cols + col;

        if (frameNumber >= 0 && frameNumber < this.totalFrames) {
            return this.getFrame(frameNumber);
        } else {
            return null; // Return null if coordinates are out of bounds
        }
    }

}