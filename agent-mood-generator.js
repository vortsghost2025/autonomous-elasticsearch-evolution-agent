// agent-mood-generator.js
const MOODS = [
    'feral', 'smug', 'overclocked', 'bilingual', 'cosmic',
    'crunchy', 'debugging gremlin', 'raccoon pope', 'vibing', 'hungry', 'suspicious', 'mythic'
];

function randomMood() {
    return MOODS[Math.floor(Math.random() * MOODS.length)];
}

class AgentMoodGenerator {
    constructor(agentNames = []) {
        this.agentNames = agentNames;
        this.moods = {};
    }
    updateMoods() {
        this.agentNames.forEach(name => {
            this.moods[name] = randomMood();
        });
        return this.moods;
    }
    getMoods() {
        return this.moods;
    }
}

export { AgentMoodGenerator, randomMood };