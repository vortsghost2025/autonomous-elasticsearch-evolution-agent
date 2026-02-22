// communication-monitor.js
import { MessagePasser } from './message-passing.js';

class CommunicationMonitor {
    constructor(messagePasser) {
        this.messagePasser = messagePasser;
    }
    
    displayCommunicationLog() {
        const messages = this.messagePasser.messages;
        console.log('\n=== COMMUNICATION LOG ===');
        messages.forEach(msg => {
            console.log(`${msg.timestamp} | ${msg.sender} -> ${msg.recipient}: ${msg.type}`);
        });
        console.log('=========================\n');
    }
}

export { CommunicationMonitor };
[/**