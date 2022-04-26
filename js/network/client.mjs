import makeOffer from "./webrtc/offer.mjs";
import makeAnswer from "./webrtc/answer-await.mjs";

// call the server and let it know we 'joined'
const SERVER = window.location.href;
const ENDPOINT = "api/player";

// need to generate a join code ...

// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
export default class Client {

    static LOCAL_PLAYER_ID = null;

    static {

        makeOffer()
            .then((offer) => {
                this.notifyServer(offer);
            });
    }

    static notifyServer(offer) {

        const url = `${SERVER}${ENDPOINT}`;

        const options = {
            method: 'POST',
            body: JSON.stringify(offer)
        };

        fetch(url, options)
            .then(response => {
                response.json()
                    .then(body => {
                        Client.LOCAL_PLAYER_ID = body.playerId;
                        // console.log(playerId)
                        if(body.offer) {
                            const offer = JSON.parse(body.offer);
                            makeAnswer(offer)
                                .then(answer => console.log(answer));
                        }
                        // else heartbeat waiting for someone to answer us :(
                    });
            })
            // .then(data => console.log(data));

        // TODO: on error
        // if host not reachable
        // etc
    }
}