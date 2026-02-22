import { PersistentMemory } from './persistent-memory.js';

(async () => {
  const pm = new PersistentMemory({ storagePath: './ai-environment/environment-state.json' });
  try {
    await pm.load();
    console.log('Test load complete. isLoaded=', pm.isLoaded);
  } catch (err) {
    console.error('Test load failed:', err);
    process.exitCode = 1;
  }
})();
