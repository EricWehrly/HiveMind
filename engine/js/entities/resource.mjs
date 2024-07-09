import Listed from "../baseTypes/listed.mjs";
import Events from "../events.ts";

Events.List.ResourceCreated = "ResourceCreated";
Events.List.ResourceValueChanged = "ResourceValueChanged";

export default class Resource extends Listed {

    #value = 0;
    #reserved = 0;

    #reservations = new WeakMap();

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

    canAfford(amount, reservationBucket) {

        if(reservationBucket && 
                this.#reservations.has(reservationBucket)) {
            return this.available + this.#reservations.get(reservationBucket) >= amount;
        } else {
            if(reservationBucket) {
                // console.warn(`Reservation bucket does not exist.`);
            }
            return this.available >= amount;
        }
    }

    pay(amount, reservationBucket) {

        if(!this.canAfford(amount, reservationBucket)) return false;

        this.value -= amount;

        if(reservationBucket && this.#reservations.has(reservationBucket)) {
            this.unReserve(amount, reservationBucket);
        }

        return true;
    }

    reserve(amount, object) {

        if(!this.canAfford(amount, object)) return false;

        this.#reserved += amount;
        if(object) {
            const currentReservation = this.#reservations.get(object) || 0;
            this.#reservations.set(object, currentReservation + amount);
            // console.debug(`Reserved ${amount} ${this.name} for ${object?.name || object}`);
        }

        return true;
    }

    unReserve(amount, object) {

        this.#reserved -= amount;

        if(object) {
            // console.debug(`Unreserving ${amount} ${this.name} for ${object?.name || object}`);
            const currentReservation = this.#reservations.get(object) || 0;
            this.#reservations.set(object, currentReservation - amount);
            if(currentReservation - amount <= 0) {
                this.#reservations.delete(object);
            }
        }
    }
}
