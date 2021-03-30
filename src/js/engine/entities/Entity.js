export class Entity {
    components = new Map();

    constructor(options) {
        this.state = {
            name: options.name,
            position: options.position || { x: 0, y: 0 },
            visible: options.visible !== undefined ? options.visible : true,
            width: options.width || 20,
            height: options.height || 20,
        }

        if (options.components) {
            Object.entries(options.components).forEach(([key, component]) => {
                this.components.set(key, component)
            })
        }
    }

    render(ctx) {
    }

    update() {
    }

    updateComponents (options) {
        this.components.forEach((component) => {
            component.update(this.state, options)
        })
    }

    renderComponents (options) {
        this.components.forEach((component) => {
            component.render(this.state, options)
        })
    }
}
