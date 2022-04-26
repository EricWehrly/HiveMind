const http = require("http");
const PORT = process.env.PORT;
const { serveFile } = require('./serve-file.js');
const { playerJoined, offerMade, offerAnswered, heartbeat } = require('./player.js');

const server = http.createServer(async (req, res) => {

    // we should probably write a simple router class
    if (req.url === "/api" && req.method === "GET") {

        res.writeHead(200, { "Content-Type": "application/json" });

        res.write("Hi there, This is a Vanilla Node.js API");

        res.end();
    }

    else if (req.url === "/api/join" && req.method === "POST") {
        playerJoined(req, res);
    }

    else if (req.url === "/api/offer" && req.method === "POST") {
        offerMade(req, res);
    }

    else if (req.url === "/api/answer" && req.method === "POST") {
        offerAnswered(req, res);
    }

    else if (req.url === "/api/heartbeat" && req.method === "GET") {
        heartbeat(req, res);
    }

    else if (serveFile(req, res)) {
    }

    // If no route present
    else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }

    // path variables, basically:
    //     else if (req.url.match(/\/api\/todos\/([0-9]+)/) && req.method === "GET") {
});

server.listen(PORT, () => {
    console.log(`server started on port: ${PORT}`);
});
