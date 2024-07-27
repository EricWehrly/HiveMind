import Listed from "./baseTypes/listed.mjs";
import { Combatant } from "./entities/character/Combatant";
import { Defer } from "./loop.mjs";
import Research from "./research.mjs";
import StatusEffect from "./status-effect.mjs";

export interface TechnologyOptions {
    statusEffectDuration?: any;
    statusEffect?: StatusEffect;
    thorns?: any;
    delay?: number;
    damage?: number;
    range?: number;
    sound?: any;
    research?: Research;
    name?: string;
    type?: any;
}

export default class Technology extends Listed {

    static #sounds: Record<string, HTMLAudioElement> = {};
    type: any;
    thorns: any;

    static #getSound(name: string) {

        if(!(name in Technology.#sounds)) {
            Technology.#sounds[name] = new Audio(name);
        }

        return Technology.#sounds[name];
    }

    private _damage: number;
    private _delay: number;
    private _range: number;
    #lastFired = performance.now();
    #lastPlayedSoundIndex = -1;
    #sound:string[] = [];

    get range() { return this._range; }
    get damage() { return this._damage; }
    get delay() { return this._delay; }

    get sound() {
        return this.#sound;
    }

    #statusEffect;
    get statusEffect() { return this.#statusEffect; }

    #statusEffectDuration;
    get statusEffectDuration() { return this.#statusEffectDuration; }

    #research;
    get research() { return this.#research; }

    get danger() {

        return (this._damage || 1) // should this be || 0 because no damage = no danger ... ?
            / ((this._delay || 1000) / 1000)
            * ((this._range || 1) * 1.5);    // give a little extra 'weight' to range, as it conveys an advantage
    }

    constructor(options: TechnologyOptions = {}) {

        // TODO: reject if missing required options
        if(!options.name) throw `Technology needs name!`;
        if(!options.type) throw `Technology ${options.name} needs type!`;
        super(options);

        if(options.research) {
            this.#research = new Research({
                name: options.name,
                ...options.research
            });
        }

        if(options.sound) {
            if (Array.isArray(options.sound)) {
                const that = this;
                options.sound.forEach(function (sound) {
                    that.#sound.push(sound);
                });
            } else {
                this.#sound.push(options.sound);
            }
        }

        // TODO: proper private members and getters
        this.type = options.type;
        this._range = options.range;
        this._damage = options.damage;
        this._delay = options.delay;
        this.thorns = options.thorns;

        if(options.statusEffect) {
            if(Number.isNaN(options.statusEffect.duration)) {
                console.warn("You can't (currently) apply a status effect without a duration.");
            }
            else this.#statusEffect = options.statusEffect;
        }
        this.#statusEffectDuration = options.statusEffectDuration;

        this.#deferLoadingSounds();
        // TODO: Probably stop doing this?
        Object.seal(this);
    }

    #deferLoadingSounds() {
        const that = this;
        Defer(function deferLoadingSounds() {
            for(var sound of that.sound) {
                Technology.#getSound(sound);
            }
        }, 0);
    }

    checkDelay() {

        if (this._delay && this.#lastFired &&
            performance.now() - this.#lastFired < this._delay) return false;
        else if (this._delay) this.#lastFired = performance.now();

        return true;
    }

    checkRange(character: Combatant) {

        if (this._range) {
            if (!character?.target) return false;

            // TODO: fix later, this is weird
            // @ts-expect-error
            if (character.getDistance(character.target) > this._range) return false;
        }

        return true;
    }

    playSound(options: {
        volume?: number;
    }) {

        // it would be desirable to make this random instead of cyclical, eventually
        if(this.#sound.length > 0) {
            if(this.#lastPlayedSoundIndex > this.#sound.length - 2) {
                this.#lastPlayedSoundIndex = -1;
            }
            this.#lastPlayedSoundIndex += 1;
            const soundName = this.#sound[this.#lastPlayedSoundIndex];
            const sound = Technology.#getSound(soundName);
            if(options.volume) {
                while(options.volume > 1) options.volume = options.volume / 10;
                sound.volume = options.volume;
            }
            // we may need to have a more robust way of checking
            // if the file is properly loaded before playing it
            if(sound.readyState > 0) {
                try {
                    sound.play();
                } catch(ex) {
                    console.warn(ex);
                } 
            } else {
                console.warn(`Sound ${sound.src} not ready for ${this.name}. State: ${sound.readyState}`, sound);
            }
        }
        else console.warn(`No sound for ${this.name}`);
    }
}
