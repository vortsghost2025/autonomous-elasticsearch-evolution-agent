// ai-agent.js
// Beast mode: Claude/OpenAI-powered agent for Elasticsearch

const { Client } = require('@elastic/elasticsearch');
const fetch = require('node-fetch');

// --- CONFIG ---
const ES_ENDPOINT = 'https://my-elasticsearch-project-dd509a.es.us-central1.gcp.elastic.cloud:443';
const ES_API_KEY = 'ZGtxdGU1d0JySzNIU3VfSEJyY3g6cjRRT0xmYXNKcW9vazlmb1ZxRHp4Zw==';
// Set your OpenAI or Claude API key here
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || 'YOUR_CLAUDE_API_KEY';

// --- Elasticsearch Client ---
const esClient = new Client({
  node: ES_ENDPOINT,
  auth: { apiKey: ES_API_KEY }
});

// --- OpenAI Chat Completion (GPT-4) ---
async function askOpenAI(prompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 512
    })
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '[No response]';
}

// --- Claude Chat Completion (Anthropic) ---
async function askClaude(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await response.json();
  return data.content?.[0]?.text || '[No response]';
}

// --- Query Elasticsearch with natural language ---
async function queryElasticsearch(nlQuery, useClaude = false) {
  // Use LLM to generate ES|QL or Query DSL
  const llmPrompt = `Convert this natural language request to an Elasticsearch query: ${nlQuery}`;
  const esQuery = useClaude ? await askClaude(llmPrompt) : await askOpenAI(llmPrompt);

  // Try to parse and run the query (assume ES|QL or DSL)
  try {
    const result = await esClient.transport.request({
      method: 'POST',
      path: '/_search',
      body: JSON.parse(esQuery)
    });
    return result.body;
  } catch (err) {
    return { error: err.message, esQuery };
  }
}

// --- Summarize Elasticsearch results ---
async function summarizeResults(results, useClaude = false) {
  const prompt = `Summarize these Elasticsearch results for a user:\n${JSON.stringify(results).slice(0, 4000)}`;
  return useClaude ? await askClaude(prompt) : await askOpenAI(prompt);
}

// --- Example usage ---
async function main() {
  const nlQuery = 'Show me the top 5 most recent documents in the national-parks index.';
  const esResults = await queryElasticsearch(nlQuery, false); // false = OpenAI, true = Claude
  console.log('Raw ES Results:', esResults);
  const summary = await summarizeResults(esResults, false);
  console.log('Summary:', summary);
}

if (require.main === module) {
  main();
}

module.exports = {
  askOpenAI,
  askClaude,
  queryElasticsearch,
  summarizeResults
};
