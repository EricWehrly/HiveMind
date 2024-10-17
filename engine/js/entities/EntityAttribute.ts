import Events from "../events";
import { EntityEvent } from "./character/Entity";
import Resource from './resource';

Events.List.EntityAttributeChanged = "EntityAttributeChanged";

// this is an EntityEvent, isn't it?
export interface EntityAttributeChangedEvent extends EntityEvent {
    attribute: EntityAttribute;
 }

export interface EntityAttributeOptions {
    name: string;
    value?: number;
    baseCost?: number;
    costFunction?: (arg: { baseCost: number, value: number }) => number;
}

// maybe call this EntityAttribute and rename the file EntityAttribute.ts
export default class EntityAttribute {

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

        Events.RaiseEvent(Events.List.EntityAttributeChanged, {
            from: oldVal,
            to: newValue,
            attribute: this
        });
    }

    get cost() { return this._costFunction(this); }

    constructor(options: EntityAttributeOptions) {

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
