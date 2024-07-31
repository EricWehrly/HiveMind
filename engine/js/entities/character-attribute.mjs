import Events from "../events.ts";
import Resource from './resource.ts';

Events.List.CharacterAttributeChanged = "CharacterAttributeChanged";

export default class CharacterAttribute {

    // maybe later static list of possible character attributes?
    // should there be min and max values?

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

    #costFunction;

    constructor(options) {

        if(!options.name) debugger;
        if(options.value == undefined) debugger;

        this.#name = options.name;

        if(options.value != undefined) this.#value = options.value;
        if(options.baseCost != undefined) this.#baseCost = options.baseCost;
    
        if(options.costFunction) {
            this.#costFunction = options.costFunction;
            Object.defineProperties(this, {
                "cost": {
                    "get": function() { return this.#costFunction(this) },
                }
            });
        }
    }

    buy(amount) {

        let value = this.value;
        let cost = 0;
        while(amount > 0) {
            cost += this.#costFunction({
                baseCost: this.#baseCost,
                value
            });
            value++;
            amount--;
        }
        
        const food = Resource.Get("food")?.value || 0;
        if(food > cost) {
            Resource.Get("food").value -= cost;
            this.value += (value - this.value);
        }

        Events.RaiseEvent(Events.List.CharacterAttributeChanged, {
            attribute: this
        });
    }
}
