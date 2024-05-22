const WebSocket = require('ws');

let wss;

function startWebSocketServer(server) {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('Client connected');

        ws.on('message', (message) => {
            console.log('Received:', message);
            // Here you would handle the signaling messages. This might involve
            // parsing the message, and then depending on the message type,
            // calling `ws.send()` to send a message back to the client, or
            // using `wss.clients` to send a message to other connected clients.
        });

        ws.on('close', () => {
            console.log('Client disconnected');
            // Here you might clean up any resources associated with this client.
        });
    });
}

module.exports = { startWebSocketServer };
