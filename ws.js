const WebSocket = require("ws");

const TIMEOUT = 20000; // 20 seconds

let wss;

const init = server => {
    wss = new WebSocket.Server({ server });
    wss.on("connection", function connection(ws) {
        ws.isAlive = true;
        ws.on("pong", function() {
            ws.isAlive = true;
        });
        ws.on("message", function(data) {
            ws.id = data;
        });
    });

    const interval = setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping(() => {});
        });
    }, TIMEOUT);
};

const sendDocument = (id, doc) => {
    console.log(`Target ID: ${id}`);
    if (!id) {
        console.log("ERR: undefined ID provided to sendDocument");
    } else {
        wss.clients.forEach(client => {
            if (client.id == id && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(doc));
                client.terminate();
            }
        });
    }
};

module.exports = {
    init,
    sendDocument
};
