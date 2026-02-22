/* message-passers.js Simple, stable message bus for agent communication */
export class MessagePasser {
    constructor() {
        this.listeners = {};
    }

    on(type, handler) {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        this.listeners[type].push(handler);
    }

    subscribe(type, handler) {
        return this.on(type, handler);
    }

    sendMessage(message) {
        const { type } = message;
        if (this.listeners[type]) {
            for (const handler of this.listeners[type]) {
                handler(message);
            }
        }
    }
}
export const messagePasser = new MessagePasser();