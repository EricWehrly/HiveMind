import makeOffer from "./wrtc.mjs";

// call the server and let it know we 'joined'
const SERVER = "http://localhost:5000";
const ENDPOINT = "/api/player";

// need to generate a join code ...

// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
export default class Client {

    static peerConnection;

    static {

        makeOffer();

        const url = `${SERVER}${ENDPOINT}`;

        const options = {
            method: 'POST',
            body: JSON.stringify("hello")
        };

        fetch(url, options)
            .then(response => console.log(response))
            .then(data => console.log(data));

        // TODO: on error
        // if host not reachable
        // etc
    }
}