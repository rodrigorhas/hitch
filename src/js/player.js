export function Player(options) {
    const state = {
        name: options.name,
        position: options.position,
        color: options.color,

        visible: options.visible !== undefined ? options.visible : true,
        speed: options.speed || 2,
        width: options.width || 20,
        height: options.height || 20,
    }

    function render(ctx) {
        if (!state.visible) {
            return;
        }

        ctx.fillStyle = state.color;

        ctx.fillRect(
            state.position.x, state.position.y,
            state.width, state.height
        );
    }

    function update() {
        state.position.x += state.speed;
        // state.position.y += state.speed;
    }

    return {
        state,
        render,
        update
    }
}
