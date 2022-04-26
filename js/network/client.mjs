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
                        if(body.offer) {
                            // TODO innit?
                            const offer = JSON.parse(body.offer);
                            makeAnswer(offer)
                                .then(answer => {
                                    this.giveAnswer(offer, answer);
                                });
                        } else {
                            this.giveOffer();
                        }
                    });
            })

        // TODO: on error
        // if host not reachable
        // etc
    }

    static giveOffer() {

        makeOffer().then(
            (peerConnection) => {

                Client.PEER_CONNECTION = peerConnection;

                const url = `${SERVER}${ENDPOINTS.OFFER}`;

                const offer = peerConnection.localDescription;

        const options = {
            method: 'POST',
            headers: {
                "playerid": Client.LOCAL_PLAYER_ID
            },
            body: JSON.stringify(offer)
        };

        console.log("Sending offer to server.");
        fetch(url, options);
        Client.HEARTBEAT_INTERVAL = setInterval(this.heartbeat, 5000);
        });
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
                if(response.status == 200) {
                    response.json().then(console.log);
                    // TODO: accept the answer into the rtc connection
                    clearInterval(Client.HEARTBEAT_INTERVAL);
                }
            });
        } catch(ex) {
            console.error(ex);
            clearInterval(Client.HEARTBEAT_INTERVAL);
        }
    }

    static giveAnswer(offer, answer) {
        console.log("Sending answer to server");

        const offerPlayerId = offer.playerId;
        console.log(`Player id ${offerPlayerId}`);

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
                console.log("Complete answer send.");
                response.text().then(console.log);
            });
    }
}

window.Client = Client;
