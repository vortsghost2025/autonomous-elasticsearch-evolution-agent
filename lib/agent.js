import esClient from './es-client.js';
import llmClient from './llm-client.js';

class ESAgent {
  async ask(question, options = {}) {
    const { 
      index = null, 
      provider = null, 
      summarize = true,
      returnRaw = false
    } = options;
    try {
      // Step 1: Get index mapping
      console.log('📊 Fetching index mapping...');
      const mappingResult = await esClient.getMapping(index);
      if (!mappingResult.success) {
        throw new Error(`Failed to get mapping: ${mappingResult.error}`);
      }
      // Step 2: Generate query using LLM
      console.log('🤖 Generating Elasticsearch query...');
      const queryString = await llmClient.generateQuery(
        question, 
        mappingResult.data, 
        provider
      );
      console.log('📝 Generated query:', queryString);
      // Step 3: Parse and execute query
      let searchResult;
      try {
        // Try as ES|QL first
        if (queryString.trim().toUpperCase().startsWith('FROM')) {
          searchResult = await esClient.esql(queryString);
        } else {
          // Parse as Query DSL
          const queryObj = JSON.parse(queryString);
          searchResult = await esClient.search(index, queryObj);
        }
      } catch (parseError) {
        throw new Error(`Query execution failed: ${parseError.message}`);
      }
      if (!searchResult.success) {
        throw new Error(`Search failed: ${searchResult.error}`);
      }
      // Step 4: Optionally summarize results
      let summary = null;
      if (summarize) {
        console.log('✨ Summarizing results...');
        summary = await llmClient.summarizeResults(
          question, 
          searchResult.data, 
          provider
        );
      }
      return {
        success: true,
        question,
        query: queryString,
        results: returnRaw ? searchResult.data : this._formatResults(searchResult.data),
        summary,
        provider: provider || llmClient.defaultProvider
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        question
      };
    }
  }
  _formatResults(data) {
    // Handle ES|QL response
    if (data.columns && data.values) {
      return {
        total: data.values.length,
        hits: data.values.map(row => {
          const obj = {};
          data.columns.forEach((col, idx) => {
            obj[col.name] = row[idx];
          });
          return obj;
        })
      };
    }
    // Handle Query DSL response
    if (data.hits) {
      return {
        total: data.hits.total.value,
        hits: data.hits.hits.map(hit => ({
          id: hit._id,
          score: hit._score,
          ...hit._source
        }))
      };
    }
    return data;
  }
  async healthCheck() {
    const ping = await esClient.ping();
    return {
      elasticsearch: ping.success,
      openai: !!process.env.OPENAI_API_KEY,
      claude: !!process.env.ANTHROPIC_API_KEY
    };
  }
}

export default new ESAgent();
