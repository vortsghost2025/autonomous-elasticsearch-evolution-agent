// mini-mesh-gossip.js
const NODES = ['node-alpha', 'node-beta', 'node-gamma', 'node-delta'];
const METRICS = [
    'CPU is spicy',
    'memory is haunted',
    'disk is crunchy',
    'latency is cosmic',
    'network is bilingual',
    'cache is mythic',
    'node denies everything'
];

function randomMetric() {
    return METRICS[Math.floor(Math.random() * METRICS.length)];
}

class MiniMeshGossip {
    constructor(nodes = NODES) {
        this.nodes = nodes;
        this.gossipLog = [];
    }
    spreadGossip() {
        const from = this.nodes[Math.floor(Math.random() * this.nodes.length)];
        const about = this.nodes[Math.floor(Math.random() * this.nodes.length)];
        const message = `${from} says ${about} ${randomMetric()}`;
        this.gossipLog.push({
            time: new Date().toISOString(),
            message
        });
        if (this.gossipLog.length > 50) this.gossipLog.shift();
        return message;
    }
    getGossipLog() {
        return this.gossipLog;
    }
}

export { MiniMeshGossip };