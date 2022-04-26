import makeOffer from "./wrtc.mjs";

// call the server and let it know we 'joined'
const SERVER = window.location.href;
const ENDPOINT = "api/player";

// need to generate a join code ...

// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
export default class Client {

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
                    .then(playerId => console.log(playerId));
            })
            // .then(data => console.log(data));

        // TODO: on error
        // if host not reachable
        // etc
    }
}