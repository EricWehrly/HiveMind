import Listed from "../baseTypes/listed.mjs";
import Events from "../events.mjs";

Events.List.ResourceCreated = "ResourceCreated";

export default class Resource extends Listed {

    #value;

    get value() {
        return this.#value;
    }

    set value(newValue) {
        this.#value = newValue;
    }

    constructor(options) {

        super(options);

        Events.RaiseEvent(Events.List.ResourceCreated, this);
    }
}