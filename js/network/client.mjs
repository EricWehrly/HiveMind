import makeOffer from "./webrtc/offer.mjs";
import makeAnswer from "./webrtc/answer.mjs";

// call the server and let it know we 'joined'
const SERVER = window.location.href;
const ENDPOINTS = {
    JOIN: "api/join",
    OFFER: "api/offer",
    ANSWER: "api/answer",
    HEARTBEAT: "api/heartbeat"
}

// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
export default class Client {

    static LOCAL_PLAYER_ID = null;
    static HEARTBEAT_INTERVAL = null;
    static PEER_CONNECTION = null;

    static {

        this.join();
    }

    static join() {

        const url = `${SERVER}${ENDPOINTS.JOIN}`;

        const options = {
            method: 'POST'
        };

        fetch(url, options)
            .then(response => {
                response.json()
                    .then(body => {
                        Client.LOCAL_PLAYER_ID = body.playerId;
                        console.log(`Got player id ${Client.LOCAL_PLAYER_ID}`);

                        if (body.offer) {
                            // TODO innit?
                            const offer = JSON.parse(body.offer);
                            makeAnswer(offer)
                                .then(answer => {
                                    this.giveAnswer(offer, answer);
                                });
                        } else {

                            makeOffer(Client.sendOffer).then(
                                (peerConnection) => {
                    
                                    Client.PEER_CONNECTION = peerConnection;
                                });
                        }
                    });
            })

        // TODO: on error
        // if host not reachable
        // etc
    }

    static sendOffer() {

        const url = `${SERVER}${ENDPOINTS.OFFER}`;

        const offer = Client.PEER_CONNECTION.localDescription;

        const options = {
            method: 'POST',
            headers: {
                "playerid": Client.LOCAL_PLAYER_ID
            },
            body: JSON.stringify(offer)
        };

        console.debug("Sending offer to server.");
        fetch(url, options);
        Client.HEARTBEAT_INTERVAL = setInterval(Client.heartbeat, 5000);
    }

    static heartbeat() {

        const url = `${SERVER}${ENDPOINTS.HEARTBEAT}`;

        const options = {
            method: 'GET',
            headers: {
                "playerid": Client.LOCAL_PLAYER_ID
            }
        };

        try {
            fetch(url, options)
                .then(response => {
                    if (response.status == 200) {
                        response.json().then((answer) => {
                            console.debug(`Received answer from server.`);
                            Client.PEER_CONNECTION.setRemoteDescription(answer);
                            clearInterval(Client.HEARTBEAT_INTERVAL);
                        });
                    }
                });
        } catch (ex) {
            console.error(ex);
            clearInterval(Client.HEARTBEAT_INTERVAL);
        }
    }

    static giveAnswer(offer, answer) {

        const offerPlayerId = offer.playerId;

        const url = `${SERVER}${ENDPOINTS.ANSWER}`;

        const options = {
            method: 'POST',
            body: JSON.stringify({
                offerPlayerId,
                answer
            })
        };

        fetch(url, options)
            .then(response => {
                console.debug("Complete answer send.");
                response.text().then(console.log);
            });
    }
}

window.Client = Client;
