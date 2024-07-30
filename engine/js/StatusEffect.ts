import Listed from "./baseTypes/listed";
import { Living } from "./entities/character/mixins/Living";
import { Defer } from "./loop.mjs";

export interface StatusEffectCallbackOptions {
    startTime: number;
    endTime: number;
    lastInterval: number;
    duration: number;
    target: Living;
}

export interface StatusEffectOptions {
    name: string;
    damage?: number;
    interval?: number;
    duration?: number;
}

// should this extend Technology?
export default class StatusEffect extends Listed {

    #damage = 0;
    #interval = 0;
    #damageOnHit = 0;   // this will be for thorns
    #knockback = 0;
    #duration = 0;
    // icon

    // should this have duration? or would that be "instance"d?
    // how do we want to handle stacks?

    get damage() {
        return this.#damage;
    }

    set damage(value) {
        this.#damage = value;
    }

    get interval() {
        return this.#interval;
    }

    set interval(value) {
        this.#interval = value;
    }

    get damageOnHit() {
        return this.#damageOnHit;
    }

    set damageOnHit(value) {
        this.#damageOnHit = value;
    }

    get knockback() {
        return this.#knockback;
    }

    set knockback(value) {
        this.#knockback = value;
    }

    get duration() {
        return this.#duration;
    }

    constructor(options: StatusEffectOptions) {
        
        super(options);

        if(options.damage) this.#damage = options.damage;
        if(options.interval) this.#interval = options.interval;
        if(options.duration) this.#duration = options.duration;
    }

    #intervalMethod(target: Living) {
        target.health -= this.damage;
    }

    callback(options: StatusEffectCallbackOptions) {

        if(Number.isNaN(options.startTime)
            || Number.isNaN(options.endTime)
            || Number.isNaN(options.lastInterval)
            || Number.isNaN(options.duration)
            || options.target == null) {
                debugger;
            }

        const timeElapsed = performance.now() - options.startTime;
        // we thought we could get away without options.duration,
        // and perhaps someone less dumb at math could
        if(timeElapsed > options.duration) {
            const maxIntervals = (Math.floor(options.endTime - options.startTime) / this.interval);
            const remainingIntervals = maxIntervals - options.lastInterval;
            if(remainingIntervals < 0) debugger;
                for(var i = 0; i < remainingIntervals; i++) {
                    this.#intervalMethod(options.target);
                }
            return;
        }
        
        const intervalsElapsed = Math.floor(timeElapsed / this.interval);
        if(intervalsElapsed > options.lastInterval) {
            this.#intervalMethod(options.target);
            options.lastInterval += 1;
        }

        const that = this;
        Defer(function() {
            that.callback(options);
        }, this.interval + 1);
    }
}
