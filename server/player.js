const { randomUUID } = require('crypto'); // Added in: node v14.17.0

const PLAYER_LIST = {};

function playerJoined(request, response) {

    console.log("Player joined");
    const playerId = randomUUID();
    const responseObject = {
        playerId
    };

    let body = '';
    request.on('data', chunk => {
        body += chunk.toString(); // convert Buffer to string
    });

    response.writeHead(200, { "Content-Type": "application/json" });
    request.on('end', () => {
        if(!body) {
            console.error("No body");
            // console.log(req);
        } else {
            console.log(`Adding player ${playerId} to list`);
            // TODO: validate token

            PLAYER_LIST[playerId] = {
                offer: body
            }

            responseObject.offer = getOpenoffer(playerId);
        }
        response.end(JSON.stringify(responseObject));
    });
    // log the player and send back the current player list    
}

function offerAnswered(request, response) {

    console.log("Offer answered");
    
    let body = '';
    request.on('data', chunk => {
        body += chunk.toString(); // convert Buffer to string
    });

    response.writeHead(200, { "Content-Type": "application/json" });
    request.on('end', () => {
        if(!body) {
            console.error("No body");
        } else {

            const requestPayload = JSON.parse(body);
            console.log(requestPayload);
        }
        response.end('ok');
    });
}

function getOpenoffer(playerId) {
    for(var key in PLAYER_LIST) {
        if(key == playerId) continue;
        var player = PLAYER_LIST[key];
        if(!player.answer) {
            console.log(`Found an open offer from ${key}, sending to ${playerId}`);
            // this hack got bad, probably need to do differently
            const offer = JSON.parse(player.offer);
            offer.playerId = key;
            return JSON.stringify(offer);
        }
    }

    return undefined;
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
exports.offerAnswered = offerAnswered;
exports.heartbeat = heartbeat;
