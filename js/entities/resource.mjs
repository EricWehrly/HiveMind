import Listed from "../baseTypes/listed.mjs";
import Events from "../events.mjs";

Events.List.ResourceCreated = "ResourceCreated";
Events.List.ResourceValueChanged = "ResourceValueChanged";

export default class Resource extends Listed {

    #value = 0;
    #reserved = 0;

    #reservations = {};

    get value() {
        return this.#value;
    }

    set value(newValue) {
        const oldValue = this.#value;
        this.#value = newValue;

        Events.RaiseEvent(Events.List.ResourceValueChanged, {
            resource: this,
            from: oldValue,
            to: this.#value
        });
    }

    get reserved() {
        return this.#reserved;
    }

    get available() {
        return this.#value - this.#reserved;
    }

    constructor(options) {

        super(options);

        if(options.value) this.#value = options.value;

        Events.RaiseEvent(Events.List.ResourceCreated, this);
    }

    canAfford(amount, ignoreReserved) {

        if(ignoreReserved == true) {
            return this.#value >= amount;
        } else {
            return this.#value - this.#reserved >= amount;
        }
    }

    pay(amount, ignoreReserved = false) {

        if(!this.canAfford(amount, ignoreReserved)) return false;

        this.value -= amount;

        return true;
    }

    reserve(amount, object) {

        if(!this.canAfford(amount)) return false;

        this.#reserved += amount;
        if(object) {
            this.#reservations[object] = amount;
            // console.debug(`Reserved ${amount} ${this.name} for ${object?.name || object}`);
        }

        return true;
    }

    unReserve(amount, object) {

        this.#reserved -= amount;

        if(object) {
            // console.debug(`Unreserving ${amount} ${this.name} for ${object?.name || object}`);
            this.#reservations[object] -= amount;
            if(this.#reservations[object] == 0) {
                delete this.#reservations[object];
            }
        }
    }
}
