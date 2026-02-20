export const esConfig = {
  cloudId: process.env.ELASTIC_CLOUD_ID,
  apiKey: process.env.ELASTIC_API_KEY,
  // Alternative: direct endpoint
  node: process.env.ELASTIC_ENDPOINT,
  defaultIndex: process.env.ELASTIC_INDEX || 'kibana_sample_data_basics'
};
