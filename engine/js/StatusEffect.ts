import Listed from "./baseTypes/listed";
import Entity from "./entities/character/Entity";
import { Living } from "./entities/character/mixins/Living";
import { Defer } from "./Loop";

export interface StatusEffectCallbackOptions {
    startTime: number;
    lastInterval: number;
    duration: number;
    target: Entity;
}

export interface StatusEffectOptions {
    name: string;
    damage?: number;
    interval?: number;
    duration?: number;
}

type StatusEffectDuration = {
    statusEffect: StatusEffect;
    duration : number;
}

// should this extend Technology?
export default class StatusEffect extends Listed {

    #damage = 0;
    #interval = 1000;
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
        if(value < 1) this.#interval = 1;
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

        if(options.damage) this.damage = options.damage;
        if(options.interval) this.interval = options.interval;
        if(options.duration) this.#duration = options.duration;
    }

    static GetEffectsForEntity(entity: Entity) {
        return this._entityEffects.get(entity);
    }

    static GetEffectForEntity(entity: Entity, statusEffect: StatusEffect) {
        const effects = this._entityEffects.get(entity);
        if(!effects) return null;
        
        return effects.find(effect => effect.statusEffect == statusEffect);
    }

    private static AddEntityEffect(entity: Entity, statusEffect: StatusEffect, duration: number) {
        if(!this._entityEffects.has(entity)) {
            this._entityEffects.set(entity, []);
        }

        const effectForEntity = StatusEffect.GetEffectForEntity(entity, statusEffect);
        if(effectForEntity) {
            effectForEntity.duration += duration;
        } else {
            this._entityEffects.get(entity).push({
                statusEffect,
                duration
            });
        }
    }

    private static _entityEffects = new Map<Entity, StatusEffectDuration[]>();

    apply(target: Entity, duration: number) {

        StatusEffect.AddEntityEffect(target, this, duration);

        const options: StatusEffectCallbackOptions = {
            startTime: performance.now(),
            lastInterval: 0,
            target: target,
            duration
        }
        if(options.target == null) debugger;
        Defer(function() {
            this.callback(options)
        }, this.interval + 1);        
    }

    callback(options: StatusEffectCallbackOptions) {

        if(Number.isNaN(options.startTime)
            || Number.isNaN(options.lastInterval)
            || Number.isNaN(options.duration)
            || options.target == null) {
                debugger;
            }
        const { startTime, duration, target } = options;
        let { lastInterval } = options;

        const timeElapsed = performance.now() - startTime;
        const intervalsElapsed = Math.floor(timeElapsed / this.interval);
        
        const maxIntervals = Math.floor(duration / this.interval);
        const intervalsToExecute = Math.min(intervalsElapsed, maxIntervals) - lastInterval;
        
        if (intervalsToExecute <= 0) return;

        for (let i = 0; i < intervalsToExecute; i++) {
            this.#intervalMethod(target);
        }
        
        lastInterval += intervalsToExecute;

        if(lastInterval < maxIntervals) {
            const that = this;
            Defer(function() {
                that.callback(options);
            }, this.interval + 1);
        }
        
        StatusEffect.GetEffectForEntity(target, this).duration = Math.max(duration - timeElapsed, 0);
    }

    #intervalMethod(target: Entity) {
        const livingTarget = target as Living;
        livingTarget.health -= this.damage;
    }
}
