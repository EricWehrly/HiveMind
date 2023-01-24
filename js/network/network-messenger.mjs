import Client from './client.mjs';
import Events from '../events.mjs';

export default class NetworkMessenger {

    static TransmitEvent(eventName, detail) {

        // TODO: attach playerid metadata info to request, just in case
        var payload = JSON.stringify({
            eventName,
            detail
        });
        // TODO: loop peerConnections instead, later, apparently
        // TODO: need to transmit a "welcome packet" of current state to any new players...
        if(Client?.peerConnection?.channels?.events) {
            Client.peerConnection.channels.events.send(payload);
        }
    }

    static ReceiveEvent(event) {
        var parsed = JSON.parse(event);
        // if no eventName or detail, throw warning
        Events.RaiseEvent(parsed.eventName, parsed.detail);
    }
}