// raccoon-heartbeat.js
import EventEmitter from 'events';

class RaccoonHeartbeat extends EventEmitter {
    constructor(interval = 3000) {
        super();
        this.interval = interval;
        this.timer = null;
    }
    start() {
        if (this.timer) return;
        this.timer = setInterval(() => {
            this.emit('heartbeat', {
                time: new Date().toISOString(),
                type: 'raccoon-heartbeat'
            });
        }, this.interval);
    }
    stop() {
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
    }
}

export { RaccoonHeartbeat };