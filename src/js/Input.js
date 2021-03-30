export function Input () {
    this.state = {
        started: false
    }

    this.pressedKeys = {};
}

Input.prototype.start = function () {
    if (this.state.started) {
        return;
    }

    this.state.started = true;

    document.body.onkeypress = (event) => {
        this.pressedKeys[event.key] = true;
    }

    document.body.onkeyup = (event) => {
        this.pressedKeys[event.key] = false;
    }
}

Input.prototype.isPressed = function (key) {
    return this.pressedKeys[key]
}
