import Listed from "../baseTypes/listed.mjs";
import Events from "../events.mjs";

Events.List.ResourceCreated = "ResourceCreated";
Events.List.ResourceValueChanged = "ResourceValueChanged";

export default class Resource extends Listed {

    #value = 0;
    #reserved = 0;

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

    get available() {
        return this.#value - this.#reserved;
    }

    constructor(options) {

        super(options);

        Events.RaiseEvent(Events.List.ResourceCreated, this);
    }

    canAfford(amount, ignoreReserved) {

        if(ignoreReserved == true) {
            return this.#value >= amount;
        } else {
            return this.#value - this.#reserved >= amount;
        }
    }

    pay(amount) {

        // should probably ignore reserved
        if(!this.canAfford(amount)) return false;

        this.value -= amount;

        return true;
    }

    reserve(amount) {

        if(!this.canAfford(amount)) return false;

        this.#reserved += amount;

        return true;
    }

    unReserve(amount) {

        this.#reserved -= amount;
    }
}