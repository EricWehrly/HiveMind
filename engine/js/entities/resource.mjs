import Listed from "../baseTypes/listed.mjs";
import Events from "../events.mjs";

Events.List.ResourceCreated = "ResourceCreated";
Events.List.ResourceValueChanged = "ResourceValueChanged";

export default class Resource extends Listed {

    #value = 0;

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

    constructor(options) {

        super(options);

        Events.RaiseEvent(Events.List.ResourceCreated, this);
    }
}