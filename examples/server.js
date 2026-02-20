import 'dotenv/config';
import express from 'express';
import agent from '../lib/agent.js';

const app = express();
app.use(express.json());

// Health endpoint
app.get('/health', async (req, res) => {
  const health = await agent.healthCheck();
  res.json(health);
});

// Ask endpoint
app.post('/ask', async (req, res) => {
  const { question, index, provider, summarize = true } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }
  const result = await agent.ask(question, { index, provider, summarize });
  res.json(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 ES-AI-Agent server running on http://localhost:${PORT}`);
});
