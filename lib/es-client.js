import { Client } from '@elastic/elasticsearch';
import { esConfig } from '../config/elasticsearch.js';

class ElasticsearchClient {
  constructor() {
    const clientConfig = esConfig.cloudId
      ? { cloud: { id: esConfig.cloudId }, auth: { apiKey: esConfig.apiKey } }
      : { node: esConfig.node, auth: { apiKey: esConfig.apiKey } };
    this.client = new Client(clientConfig);
    this.defaultIndex = esConfig.defaultIndex;
  }
  async ping() {
    try {
      await this.client.ping();
      return { success: true, message: 'Connected to Elasticsearch' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  async search(index, query) {
    try {
      const response = await this.client.search({
        index: index || this.defaultIndex,
        body: query
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  async esql(query) {
    try {
      const response = await this.client.esql.query({
        query: query,
        format: 'json'
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  async getIndices() {
    try {
      const response = await this.client.cat.indices({ format: 'json' });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  async getMapping(index) {
    try {
      const response = await this.client.indices.getMapping({
        index: index || this.defaultIndex
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new ElasticsearchClient();
