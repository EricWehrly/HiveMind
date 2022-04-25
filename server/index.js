const http = require("http");
const PORT = process.env.PORT || 5000;
// import serveFile from "./serve-file";
const { serveFile } = require('./serve-file.js');

const server = http.createServer(async (req, res) => {
    //set the request route
    if (req.url === "/api" && req.method === "GET") {
        //response headers
        res.writeHead(200, { "Content-Type": "application/json" });
        //set the response
        res.write("Hi there, This is a Vanilla Node.js API");
        //end the response
        res.end();
    }

    else if(serveFile(req, res)) {
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