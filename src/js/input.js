export function Input () {}

Input.prototype.start = function () {
    document.body.onkeypress = this.processInput;
}

/**
 * @param {KeyboardEvent} event
 */
Input.prototype.processInput = function (event) {
    const { key } = event;

    console.log(key)
}
