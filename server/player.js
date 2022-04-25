// this should probably be a player list ....
let waitingToken = null;

function playerJoined(request, response, body) {
    console.log("Player joined");

    response.writeHead(200, { "Content-Type": "application/json" });
    request.on('end', () => {
        if(!body) {
            console.log("No body");
            // console.log(req);
        } else {
            // TODO: validate token
            waitingToken = JSON.parse(body);
        }
        // console.log(body);
        response.end('ok');
    });
    // log the player and send back the current player list    
}

exports.playerJoined = playerJoined;
