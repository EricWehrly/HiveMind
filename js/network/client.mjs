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
class Client {

    static _instance;

    _LOCAL_PLAYER_ID = null;
    _HEARTBEAT_INTERVAL = null;
    _PEER_CONNECTION = null;

    static {

        Client._instance = new Client();
        window.Client = Client._instance;
    }

    constructor() {

        this.join();
    }

    static get peerConnection() {
        return Client._instance._PEER_CONNECTION;
    }

    // method for sending message
    // TODO: loop peerConnections instead, later, apparently
    sendMessage(channelName, payload) {

        if(Client.peerConnection == null) {
            // console.warn(`No peer connection!`);
            return;
        }

        if(!(channelName in Client.peerConnection.channels)) {
            console.warn(`Channel ${channelName} not in list :(`);
            return;
        }

        if(Client.peerConnection.channels[channelName] != "open") {
            console.warn(`Peer connection state is ${Client.peerConnection.readyState} , not ready`);
            return;
        }

        Client.peerConnection.channels[channelName].send(payload);
    }

    join() {

        // I think each player needs a new rtc peer connection for each player that joins

        const url = `${SERVER}${ENDPOINTS.JOIN}`;

        const options = {
            method: 'POST'
        };

        fetch(url, options)
            .then(response => {

                if(response.status == 404) {
                    console.warn(`Could not connect to server ${SERVER}. Playing offline.`);
                }

                else {
                    response.json()
                        .then(body => {
                            this._LOCAL_PLAYER_ID = body.playerId;
                            console.debug(`Got player id ${this._LOCAL_PLAYER_ID}`);

                            if (body.offer) {
                                const offer = JSON.parse(body.offer);
                                makeAnswer(offer)
                                    .then(answer => {
                                        this.giveAnswer(offer, answer);
                                    });
                            } else {

                                // maybe call this "buildOffer"
                                makeOffer(this.sendOffer.bind(this)).then(
                                    (peerConnection) => {                    
                                        this._PEER_CONNECTION = peerConnection;
                                    });
                            }
                        });
                }
            })

        // TODO: on error
        // if host not reachable
        // etc
    }

    sendOffer() {

        const url = `${SERVER}${ENDPOINTS.OFFER}`;

        const offer = this._PEER_CONNECTION.localDescription;

        const options = {
            method: 'POST',
            headers: {
                "playerid": this._LOCAL_PLAYER_ID
            },
            body: JSON.stringify(offer)
        };

        console.debug("Sending offer to server.");
        fetch(url, options);
        this._HEARTBEAT_INTERVAL = setInterval(this.heartbeat.bind(this), 5000);
    }

    heartbeat() {

        const url = `${SERVER}${ENDPOINTS.HEARTBEAT}`;

        const options = {
            method: 'GET',
            headers: {
                "playerid": this._LOCAL_PLAYER_ID
            }
        };

        try {
            fetch(url, options)
                .then(response => {
                    if (response.status == 200) {
                        response.json().then((answer) => {
                            console.debug(`Received answer from server.`);
                            this._PEER_CONNECTION.setRemoteDescription(answer);
                            clearInterval(this._HEARTBEAT_INTERVAL);
                        });
                    }
                });
        } catch (ex) {
            console.error(ex);
            clearInterval(this._HEARTBEAT_INTERVAL);
        }
    }

    giveAnswer(offer, answer) {

        const offerPlayerId = offer.playerId;

        const url = `${SERVER}${ENDPOINTS.ANSWER}`;

        const options = {
            method: 'POST',
            body: JSON.stringify({
                offerPlayerId,
                answer
            })
        };

        fetch(url, options);
    }
}

if(Client._instance == null) new Client();

export default Client._instance;
