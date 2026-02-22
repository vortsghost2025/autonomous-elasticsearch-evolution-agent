import http from 'http';
const PORT = process.env.AGENT_PORT || 3003;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify({ status: 'ok', agent: 'cloud', port: PORT, uptime: process.uptime() }));
});
server.listen(PORT, () => console.log('[Cloud Agent] Running on port ' + PORT));
setInterval(() => {}, 45000);
