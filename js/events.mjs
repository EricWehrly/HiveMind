import { generateId } from "./util/javascript-extensions.js";
import NetworkMessenger from './network/network-messenger.mjs';

// TODO: if an event is raised with the "FiresOnce" property,
// remember it, and respond immediately to any subscribers

// TODO: extends Listed
export default class Events {

    static List = {
        "GameStart": "GameStart"
    }

    static #Subscriptions = {};

    static Subscribe(eventNames, callback, options) {

        // TODO: check inputs for bad values

        if (Array.isArray(eventNames)) {
            eventNames.forEach(function (eventName) {
                Events.#subscribe(eventName, callback, options);
            });
        } else {
            return Events.#subscribe(eventNames, callback, options);
        }
    }

    /**
     * 
     * @param {String} eventName The enum name from Events.List
     * @param {Object} detail The details of the event (usually the subject of the action). Varies by event type.
     * @param {Object} options 
     * @param {Boolean} options.removeAfterRaise Whether to de-register the event after the first time that it is raised, preventing subsequent calls from resulting in a raised event.
     * @param {Boolean} options.isNetworkBoundEvent Whether the event should go to the network.
     * @param {Boolean} options.isNetworkOriginEvent Did the event originate from a machine other than this one?
     */
    static RaiseEvent(eventName, detail, options) {

        const callbackOptions = {
            isNetworkOriginEvent: options?.isNetworkOriginEvent || false
        };

        if (options?.isNetworkBoundEvent) {
            NetworkMessenger.TransmitEvent(eventName, detail);
        }

        var subscribedEvents = Events.#Subscriptions[eventName];
        if (!subscribedEvents) return;   // handle no subscriptions
        subscribedEvents = subscribedEvents.slice(0)   // create an unmodified copy, to survive modifications

        for (var subscription of subscribedEvents) {
            try {
                subscription.callback(detail, callbackOptions);

                if (subscription.oneTime || options?.removeAfterRaise == true) {
                    console.warn("Didn't implement unsubscribe ...");
                    // Events.Unsubscribe(subscription.subscriptionId);
                }
            } catch (ex) {
                console.error(`Issue firing subscription for event ${eventName}`);
                if (subscription.callback.name != "") {
                    console.log(subscription.callback.name);
                }
                console.error(ex);
                debugger;
            }
        }
    }

    // Unsubscribe

    // subscribeOnce

    static #subscribe(eventName, callback, options) {

        const subscriptionId = generateId();

        if (!(eventName in Events.#Subscriptions)) Events.#Subscriptions[eventName] = [];
        var length = Events.#Subscriptions[eventName].push({
            "subscriptionId": subscriptionId,
            "callback": callback
        });
        // these options are not used
        if (options) Object.assign(Events.#Subscriptions[eventName][length - 1], options);

        Events.#Subscriptions[eventName].sort(Events.#sortEventsArray);

        return subscriptionId;
    };

    static #sortEventsArray(first, second) {

        if (first.before && second.callback.name && second.callback.name == first.before) {
            return -1;
        }
        if (second.before && first.callback.name && first.callback.name == second.before) {
            return 1;
        }

        if (first.priority > second.priority) return -1;
        else if (second.priority > first.priority) return 1;
        return 0;
    }
}
