// https://css-tricks.com/lets-create-a-lightweight-native-event-bus-in-javascript/

export class EventBus extends EventTarget {
    on(type, listener) {
        this.addEventListener(type, listener)
    }

    once(type, listener) {
        this.addEventListener(type, listener, {once: true})
    }

    off(type, listener) {
        this.removeEventListener(type, listener)
    }

    emit(type, payload) {
        const event = new CustomEvent(type, {detail: payload})
        this.dispatchEvent(event)
    }
}

