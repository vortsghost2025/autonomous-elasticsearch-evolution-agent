import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

class LLMClient {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.defaultProvider = process.env.DEFAULT_LLM || 'claude';
  }
  async generateQuery(userQuestion, indexMapping, provider = this.defaultProvider) {
    const systemPrompt = `You are an Elasticsearch query expert. Given a user's natural language question and an index mapping, generate a valid Elasticsearch Query DSL or ES|QL query.\nIndex Mapping:${JSON.stringify(indexMapping, null, 2)}\nRules:- Return ONLY valid JSON (for Query DSL) or ES|QL syntax- Use appropriate field types from the mapping- Optimize for performance- If ES|QL is better suited, use it; otherwise use Query DSL`;
    const userPrompt = `Generate an Elasticsearch query for: "${userQuestion}"`;
    if (provider === 'openai') {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1
      });
      return response.choices[0].message.content;
    } else {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          { role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }
        ],
        temperature: 0.1
      });
      return response.content[0].text;
    }
  }
  async summarizeResults(query, results, provider = this.defaultProvider) {
    const prompt = `Summarize these Elasticsearch results for the query: "${query}"\nResults:${JSON.stringify(results, null, 2)}\nProvide a concise, human-readable summary highlighting key findings.`;
    if (provider === 'openai') {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      });
      return response.choices[0].message.content;
    } else {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      });
      return response.content[0].text;
    }
  }
  async chat(messages, provider = this.defaultProvider) {
    if (provider === 'openai') {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: messages
      });
      return response.choices[0].message.content;
    } else {
      const anthropicMessages = messages.filter(m => m.role !== 'system');
      const systemMessage = messages.find(m => m.role === 'system')?.content;
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: systemMessage,
        messages: anthropicMessages
      });
      return response.content[0].text;
    }
  }
}

export default new LLMClient();
