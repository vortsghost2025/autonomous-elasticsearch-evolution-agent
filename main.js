// main.js
import { MessagePasser } from './message-passing.js';
import { ResearchAgent } from './research-agent.js';
import { CodingAgent } from './coding-agent.js';
import { CommunicationMonitor } from './communication-monitor.js';

async function initializeSystem() {
    const messagePasser = new MessagePasser();
    const researchAgent = new ResearchAgent(messagePasser);
    const codingAgent = new CodingAgent(messagePasser);
    const monitor = new CommunicationMonitor(messagePasser);

    // Start monitoring communication
    setInterval(() => {
        monitor.displayCommunicationLog();
    }, 5000);

    // Example usage
    await researchAgent.conductResearch('Current weather patterns from NASA satellites');

    // Process messages periodically
    setInterval(async () => {
        await codingAgent.processMessages();
    }, 1000);
}

initializeSystem();