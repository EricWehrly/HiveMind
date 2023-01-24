import Client from "./client.mjs";

export default class Messenger extends Client {

    #messageQueues = {}

    createChannel(channelName) {
        this.#messageQueues[channelName] = [];
    }

    sendMessage(channel, message) {
        this.#messageQueues[channel].push(message);

        // set interval to transmit message
        // in interval, if queue is empty, clear interval
    }
}