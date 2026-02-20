import 'dotenv/config';
import agent from '../lib/agent.js';
import chalk from 'chalk';

async function main() {
  console.log(chalk.blue.bold('\n🚀 ES-AI-Agent CLI\n'));
  // Health check
  const health = await agent.healthCheck();
  console.log(chalk.green('Health Check:'), health);
  // Example question
  const question = process.argv[2] || 'Show me all records';
  console.log(chalk.yellow(`\n❓ Question: ${question}\n`));
  const result = await agent.ask(question, {
    summarize: true,
    provider: 'claude' // or 'openai'
  });
  if (result.success) {
    console.log(chalk.cyan('\n📊 Results:'));
    console.log(JSON.stringify(result.results, null, 2));
    if (result.summary) {
      console.log(chalk.magenta('\n✨ Summary:'));
      console.log(result.summary);
    }
  } else {
    console.log(chalk.red('\n❌ Error:'), result.error);
  }
}

main();
