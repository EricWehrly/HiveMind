import Events, { GameEvent } from "../events";
import Resource from './resource';

Events.List.CharacterAttributeChanged = "CharacterAttributeChanged";

export interface CharacterAttributeChangedEvent extends GameEvent {
    attribute: CharacterAttribute;
 }

export interface CharacterAttributeOptions {
    name: string;
    value?: number;
    baseCost?: number;
    costFunction?: (arg: { baseCost: number, value: number }) => number;
}

export default class CharacterAttribute {

    // maybe later static list of possible character attributes?
    // should there be min and max values?

    private _name;
    private _value;
    private _baseCost = 0;
    private _costFunction;
    get name() { return this._name; }
    get baseCost() { return this._baseCost; }

    get value() { return this._value; }
    set value(newValue) {
        
        const oldVal = this._value;
        this._value = newValue;

        Events.RaiseEvent(Events.List.CharacterAttributeChanged, {
            from: oldVal,
            to: newValue,
            attribute: this
        });
    }

    get cost() { return this._costFunction(this); }

    constructor(options: CharacterAttributeOptions) {

        if(!options.name) debugger;
        if(options.value == undefined) debugger;

        this._name = options.name;

        if(options.value != undefined) this._value = options.value;
        if(options.baseCost != undefined) this._baseCost = options.baseCost;
        if(options.costFunction != undefined) this._costFunction = options.costFunction;
    }

    buy(amount: number) {

        let value = this.value;
        let cost = 0;
        while(amount > 0) {
            // TODO: Why doesn't this throw an error (for null cost function)?
            cost += this._costFunction({
                baseCost: this._baseCost,
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
    }
}
