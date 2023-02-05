import Client from './client.mjs';
import Events from '../events.mjs';

export default class NetworkMessenger {

    static TransmitEvent(eventName, detail) {

        // TODO: attach playerid metadata info to request, just in case

        const newDetail = NetworkMessenger.#sanitize(detail);
        var payload = JSON.stringify({
            eventName,
            newDetail
        }, NetworkMessenger.#getCircularReplacer());
        // TODO: loop peerConnections instead, later, apparently
        // TODO: need to transmit a "welcome packet" of current state to any new players...
        if(Client?.peerConnection?.channels?.events) {
            Client.peerConnection.channels.events.send(payload);
        }
    }

    static ReceiveEvent(event) {
        var parsed = JSON.parse(event);
        // if no eventName or detail, throw warning
        Events.RaiseEvent(parsed.eventName, parsed.detail, {
          isNetworkOriginEvent: true
        });
    }

    // TODO: this is almost certainly too slow a method ...
    static #sanitize(detail) {

        // this breaks, not even really sure why
        // const newDetail = structuredClone(detail);

        const newDetail = {};
        for(var key of Object.keys(detail)) {

            if(detail[key] == null) continue;

            if(detail[key] instanceof HTMLElement) continue;

            // this is to remove circular dependencies for JSON.stringify
            if(typeof detail[key] == 'object') {
                if(Object.values(detail[key]).includes(detail)) continue;
            }
            newDetail[key] = detail[key];
        }

        return newDetail;
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value#examples
    static #getCircularReplacer = () => {
      const seen = new WeakSet();
      return (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return;
          }
          seen.add(value);
        }
        return value;
      };
    };
}