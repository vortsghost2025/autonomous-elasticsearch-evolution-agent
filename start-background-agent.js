import http from 'http';
const PORT = process.env.AGENT_PORT || 3002;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify({ status: 'ok', agent: 'background', port: PORT, uptime: process.uptime() }));
});
server.listen(PORT, () => console.log('[Background Agent] Running on port ' + PORT));
setInterval(() => {}, 30000);
