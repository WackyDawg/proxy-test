import http from "http";

const PORT = 3000;
const HOST = 'localhost';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });

  res.end('Hello, World! Your Node.js server is running.\n');
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
