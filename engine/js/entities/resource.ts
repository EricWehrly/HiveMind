import Listed from "../baseTypes/listed";
import Events from "../events";

Events.List.ResourceCreated = "ResourceCreated";
Events.List.ResourceValueChanged = "ResourceValueChanged";

export interface ResourceOptions {
    name: string;
    value?: number;
}

export default class Resource extends Listed {

    UIElement: HTMLElement;  // for now, because it's not extensible ...

    #value = 0;
    #reserved = 0;

    private _reservations = new WeakMap();

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

    constructor(options: ResourceOptions) {

        super(options);

        if(options.value) this.#value = options.value;

        Events.RaiseEvent(Events.List.ResourceCreated, this);
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