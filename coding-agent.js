// coding-agent.js
import { MessagePasser } from './message-passing.js';

class CodingAgent {
    constructor(messagePasser) {
        this.messagePasser = messagePasser;
        this.processedTasks = [];
    }
    
    async processMessages() {
        const messages = this.messagePasser.getMessages('coding-agent');
        for (const message of messages) {
            try {
                const payload = JSON.parse(message.content);
                switch (message.type) {
                    case 'research-results':
                        await this.handleResearchResults(payload);
                        break;
                    case 'task-request':
                        await this.handleTaskRequest(payload);
                        break;
                    default:
                        console.log(`Unknown message type: ${message.type}`);
                }
                this.messagePasser.clearMessages();
            } catch (error) {
                console.error(`Error processing message ${message.id}:`, error);
            }
        }
    }
    
    async handleResearchResults(results) {
        console.log('Processing research results:', results);
        // Use the research results to generate code
        const code = this.generateCodeFromResearch(results.results);
        // Send back to research agent
        this.messagePasser.sendMessage(
            'coding-agent',
            'research-agent',
            JSON.stringify({
                status: 'completed',
                code: code,
                timestamp: new Date().toISOString()
            }),
            'code-response'
        );
    }
    
    generateCodeFromResearch(researchData) {
        // Generate code based on research findings
        return `// Generated code based on research\n// Sources: ${researchData.map(r => r.source).join(', ')}\nfunction analyzeWeatherData(data) {\n    // Implementation based on research\n    return processSatelliteData(data);\n}`;
    }
}

export { CodingAgent };