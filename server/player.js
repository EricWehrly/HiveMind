const { randomUUID } = require('crypto'); // Added in: node v14.17.0

const PLAYER_LIST = {};

function playerJoined(request, response) {

    console.log("Player joined");
    const playerId = randomUUID();

    let body;
    request.on('data', chunk => {
        body += chunk.toString(); // convert Buffer to string
    });

    response.writeHead(200, { "Content-Type": "application/json" });
    request.on('end', () => {
        if(!body) {
            console.error("No body");
            // console.log(req);
        } else {
            console.log("Adding player to list");
            // TODO: validate token

            PLAYER_LIST[playerId] = {
                token: body
            }
        }
        response.end(JSON.stringify(playerId));
    });
    // log the player and send back the current player list    
}

function heartbeat(request, response) {

    console.log(request.headers);
    /*
    if(waitingToken) {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(waitingToken);
        waitingToken = null;
    }
    else response.end();
    */
    response.end();
}

exports.playerJoined = playerJoined;
exports.heartbeat = heartbeat;
