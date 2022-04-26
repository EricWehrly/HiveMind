const { randomUUID } = require('crypto'); // Added in: node v14.17.0

const PLAYER_LIST = {};

function playerJoined(request, response) {

    console.log("Player joined");
    const playerId = randomUUID();
    const responseObject = {
        playerId
    };

    response.writeHead(200, { "Content-Type": "application/json" });

    console.log(`Adding player ${playerId} to list`);
    // TODO: validate token

    PLAYER_LIST[playerId] = {}

    responseObject.offer = getOpenoffer(playerId);
    response.end(JSON.stringify(responseObject));  
}

function offerMade(request, response) {

    const playerId = request?.headers?.playerid;
    console.log(`Received offer from player ${playerId}`);
    if(playerId && playerId in PLAYER_LIST) {

        let body = '';
        request.on('data', chunk => {
            body += chunk.toString(); // convert Buffer to string
        });

        request.on('end', () => {
            if(!body) {
                console.error("No body");
                // console.log(req);
            } else {
                // TODO: validate token
                PLAYER_LIST[playerId].offer = body;
            }
            response.writeHead(201);
            response.end("ok");
        });
    }
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
            if(requestPayload.offerPlayerId 
                && requestPayload.answer
                && requestPayload.offerPlayerId in PLAYER_LIST) {
                    PLAYER_LIST[requestPayload.offerPlayerId].answer = requestPayload.answer;
                } else {
                    console.error("!!!");
                }
        }
        response.end('ok');
    });
}

function getOpenoffer(playerId) {
    for(var key in PLAYER_LIST) {
        if(key == playerId) continue;
        var player = PLAYER_LIST[key];
        if(player.offer && !player.answer) {
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

    const playerId = request?.headers?.playerid;
    if(playerHasAnswer(playerId)) {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(PLAYER_LIST[playerId].answer));
    } else {        
        response.writeHead(201);
        response.end("ok");
    }
}

function playerHasAnswer(playerId) {
    return playerId 
        && playerId in PLAYER_LIST
        && PLAYER_LIST[playerId].answer != null;
}

exports.playerJoined = playerJoined;
exports.offerMade = offerMade;
exports.offerAnswered = offerAnswered;
exports.heartbeat = heartbeat;
