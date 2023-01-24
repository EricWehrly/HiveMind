import { generateId } from "./util/javascript-extensions.js";
import NetworkMessenger from './network/network-messenger.mjs';

const Events = {
    List: {
        "GameStart": "GameStart"
    }
};

const Subscriptions = {};

Events.Subscribe = function(eventNames, callback, options) {

    // TODO: check inputs for bad values
    
    if(Array.isArray(eventNames)) {
        eventNames.forEach(function(eventName) {
            _subscribe(eventName, callback, options);
        });
    } else {
        return _subscribe(eventNames, callback, options);
    }
}

Events.RaiseEvent = function(eventName, detail, removeAfterRaise, isNetworkEvent) {

    if(isNetworkEvent) {
        NetworkMessenger.TransmitEvent(eventName, detail);
    }

    var subscribedEvents = Subscriptions[eventName];
    if(!subscribedEvents) return;   // handle no subscriptions
    subscribedEvents = subscribedEvents.slice(0)   // create an unmodified copy, to survive modifications
    for(var subscription of subscribedEvents) {
        try {
            subscription.callback(detail);

            if(subscription.oneTime || removeAfterRaise == true) {
                console.warn("Didn't implement unsubscribe ...");
                // Events.Unsubscribe(subscription.subscriptionId);
            }
        } catch(ex) {
            console.error(`Issue firing subscription for event ${eventName}`);
            if(subscription.callback.name != "") {
                console.log(subscription.callback.name);
            }
            console.error(ex);
            debugger;
        }
    }
}

// Unsubscribe

// subscribeOnce

const _subscribe = function(eventName, callback, options) {

    const subscriptionId = generateId();

    if(!(eventName in Subscriptions)) Subscriptions[eventName] = [];
    var length = Subscriptions[eventName].push({
        "subscriptionId": subscriptionId,
        "callback" : callback
    });
    if(options) Object.assign(Subscriptions[eventName][length -1], options);

    Subscriptions[eventName].sort(_sortEventsArray);

    return subscriptionId;
};

const _sortEventsArray = function(first, second) {

    if(first.before && second.callback.name && second.callback.name == first.before) {
        return -1;
    }
    if(second.before && first.callback.name && first.callback.name == second.before) {
        return 1;
    }

	if(first.priority > second.priority) return -1;
	else if(second.priority > first.priority) return 1;
	return 0;
}

export default Events;
