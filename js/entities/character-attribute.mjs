import Events from "../events.mjs";

Events.List.CharacterAttributeChanged = "CharacterAttributeChanged";

export default class CharacterAttribute {

    // maybe later static list of possible character attributes?
    // should there be min and max values?
    // increment costs?

    #name;
    get name() { return this.#name; }

    #value;
    get value() { return this.#value; }
    set value(newValue) { 

        const oldVal = this.#value;
        this.#value = newValue;

        Events.RaiseEvent(Events.List.CharacterAttributeChanged, {
            from: oldVal,
            to: newValue,
            attribute: this
        });
    }

    #baseCost = 0;
    get baseCost() { return this.#baseCost; }

    constructor(options) {

        if(!options.name) debugger;

        this.#name = options.name;

        if(options.value) this.#value = options.value;
        if(options.baseCost) this.#baseCost = options.baseCost;
    
        const that = this;
        if(options.costFunction) {
            Object.defineProperties(this, {
                "cost": {
                    "get": function() { return options.costFunction(that) },
                    // "set": function() { ... }
                }
            });
        }
    }
}
