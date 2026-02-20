// message-passing.js
class MessagePasser {
    constructor() {
        this.messages = [];
        this.maxMessages = 100; // Prevent memory issues
    }
    
    sendMessage(sender, recipient, content, type = 'text') {
        const message = {
            id: Date.now(),
            sender,
            recipient,
            content,
            type,
            timestamp: new Date().toISOString()
        };
        this.messages.push(message);
        if (this.messages.length > this.maxMessages) {
            this.messages.shift();
        }
        return message.id;
    }
    
    getMessages(recipient) {
        return this.messages.filter(msg => msg.recipient === recipient);
    }
    
    clearMessages() {
        this.messages = [];
    }
}

export { MessagePasser };