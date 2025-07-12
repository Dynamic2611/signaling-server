const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

const users = {};

wss.on('connection', function (ws) {
  console.log("New connection");

  ws.on('message', function (message) {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'login':
          if (users[data.name]) {
            ws.send(JSON.stringify({ type: 'login', success: false, msg: "Username taken" }));
          } else {
            users[data.name] = ws;
            ws.name = data.name;
            ws.send(JSON.stringify({ type: 'login', success: true }));
          }
          break;

        case 'offer':
        case 'answer':
        case 'candidate':
        case 'leave':
          const target = users[data.target];
          if (target) {
            target.send(JSON.stringify({ ...data, from: ws.name }));
          }
          break;

        default:
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message type' }));
      }
    } catch (err) {
      console.error("Invalid JSON:", err);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
    }
  });

  ws.on('close', () => {
    if (ws.name && users[ws.name]) {
      delete users[ws.name];
      console.log(`User ${ws.name} disconnected`);
    }
  });
});

console.log(`✅ WebSocket Signaling Server running on ws://localhost:${PORT}`);
