import Listed from "./baseTypes/listed.mjs";
import Events from "./events.mjs";

Events.List.Unlocked = "Unlocked";

export default class Unlock extends Listed {

    #unlocked = false;

    constructor(options) {

        super(options);
    }

    get isUnlocked() {
        return this.#unlocked;
    }

    unlock() {

        console.log(`${this.name} is being unlocked!`);
        
        Events.RaiseEvent(`${Events.List.Unlocked}`, this);
        Events.RaiseEvent(`${Events.List.Unlocked}-${this.name}`, this);
    }

    // attach things that are unlocked by this?
}
