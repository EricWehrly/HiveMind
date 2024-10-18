import Listed from "../baseTypes/listed";
import Events, { GameEvent } from "../events";
import UIElement from "../ui/ui-element";

Events.List.ResourceCreated = "ResourceCreated";
Events.List.ResourceValueChanged = "ResourceValueChanged";

export interface ResourceEvent extends GameEvent {
    resource: Resource;
}

export interface ResourceChangedEvent extends ResourceEvent {
    from: number;
    to: number;
}

export interface ResourceOptions {
    name: string;
    value?: number;
}

export default class Resource extends Listed {

    UIElement: UIElement;

    #value = 0;
    #reserved = 0;

    private _reservations = new WeakMap();

    get value() {
        return this.#value;
    }

    set value(newValue) {
        const oldValue = this.#value;
        this.#value = newValue;

        const details: ResourceChangedEvent = {
            resource: this,
            from: oldValue,
            to: this.#value
        }
        Events.RaiseEvent(Events.List.ResourceValueChanged, details);
    }

    get reserved() {
        return this.#reserved;
    }

    get available() {
        return this.#value - this.#reserved;
    }

    constructor(options: ResourceOptions) {

        super(options);

        if(options.value) this.#value = options.value;

        const details: ResourceEvent = {
            resource: this
        };
        Events.RaiseEvent(Events.List.ResourceCreated, details);
    }

    canAfford(amount: number, reservationBucket?: Object) {

        if(reservationBucket && 
                this._reservations.has(reservationBucket)) {
            return this.available + this._reservations.get(reservationBucket) >= amount;
        } else {
            return this.available >= amount;
        }
    }

    pay(amount: number, reservationBucket?: Object) {

        if(!this.canAfford(amount, reservationBucket)) return false;

        this.value -= amount;

        if(reservationBucket && this._reservations.has(reservationBucket)) {
            this.unReserve(amount, reservationBucket);
        }

        return true;
    }

    reserve(amount: number, reservationBucket: Object) {

        if(!this.canAfford(amount, reservationBucket)) return false;

        this.#reserved += amount;
        if(reservationBucket) {
            const currentReservation = this._reservations.get(reservationBucket) || 0;
            this._reservations.set(reservationBucket, currentReservation + amount);
            // console.debug(`Reserved ${amount} ${this.name} for ${object?.name || object}`);
        }

        return true;
    }

    unReserve(amount: number, reservationBucket: Object) {

        this.#reserved -= amount;

        if(reservationBucket) {
            // console.debug(`Unreserving ${amount} ${this.name} for ${object?.name || object}`);
            const currentReservation = this._reservations.get(reservationBucket) || 0;
            this._reservations.set(reservationBucket, currentReservation - amount);
            if(currentReservation - amount <= 0) {
                this._reservations.delete(reservationBucket);
            }
        }
    }
}
