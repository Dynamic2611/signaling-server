// const WebSocket = require('ws');

// const PORT = process.env.PORT || 8080;
// const wss = new WebSocket.Server({ port: PORT });

// const users = {};

// wss.on('connection', function (ws) {
//   console.log("New connection");

//   ws.on('message', function (message) {
//     try {
//       const data = JSON.parse(message);

//       switch (data.type) {
//         case 'login':
//           if (users[data.name]) {
//             ws.send(JSON.stringify({ type: 'login', success: false, msg: "Username taken" }));
//           } else {
//             users[data.name] = ws;
//             ws.name = data.name;
//             ws.send(JSON.stringify({ type: 'login', success: true }));
//           }
//           break;

//         case 'offer':
//         case 'answer':
//         case 'candidate':
//         case 'leave':
//           const target = users[data.target];
//           if (target) {
//             target.send(JSON.stringify({ ...data, from: ws.name }));
//           }
//           break;

//         default:
//           ws.send(JSON.stringify({ type: 'error', message: 'Invalid message type' }));
//       }
//     } catch (err) {
//       console.error("Invalid JSON:", err);
//       ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
//     }
//   });

//   ws.on('close', () => {
//     if (ws.name && users[ws.name]) {
//       delete users[ws.name];
//       console.log(`User ${ws.name} disconnected`);
//     }
//   });
// });

// console.log(`✅ WebSocket Signaling Server running on ws://localhost:${PORT}`);






const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let clients = new Map(); // userID -> socket

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    const { type, to, from, payload } = data;

    // Register user
    if (type === 'register') {
      clients.set(from, ws);
      return;
    }

    // Forward message (chat, offer, answer, ICE)
    if (clients.has(to)) {
      clients.get(to).send(JSON.stringify({ type, from, payload }));
    }
  });

  ws.on('close', () => {
    for (const [userId, client] of clients.entries()) {
      if (client === ws) {
        clients.delete(userId);
        break;
      }
    }
  });
});

console.log('WebSocket signaling server running on ws://localhost:8080');

