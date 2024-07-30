import Listed from "./baseTypes/listed";
import { Combatant } from "./entities/character/Combatant";
import { Defer } from "./loop.mjs";
import Research from "./research.mjs";
import StatusEffect from "./StatusEffect";

export interface TechnologyOptions {
    statusEffectDuration?: any;
    statusEffect?: StatusEffect;
    thorns?: any;
    delay?: number;
    damage?: number;
    range?: number;
    sound?: any;
    research?: Research;
    name: string;
    type?: any;
}

export default class Technology extends Listed {

    private static _sounds: Record<string, HTMLAudioElement> = {};
    private _type: any;
    private _thorns: any;

    static #getSound(name: string) {

        if(!(name in Technology._sounds)) {
            Technology._sounds[name] = new Audio(name);
        }

        return Technology._sounds[name];
    }

    private _damage: number;
    private _delay: number;
    private _range: number;
    private _lastPlayedSoundIndex = -1;
    private _sound:string[] = [];
    private _statusEffect;
    private _statusEffectDuration;
    private _research: Research;

    get range() { return this._range; }
    get damage() { return this._damage; }
    get delay() { return this._delay; }
    get sound() { return this._sound; }
    get statusEffect() { return this._statusEffect; }
    get statusEffectDuration() { return this._statusEffectDuration; }
    get research() { return this._research; }
    get type() { return this._type; }
    get thorns() { return this._thorns; }

    get danger() {

        return (this._damage || 1) // should this be || 0 because no damage = no danger ... ?
            / ((this._delay || 1000) / 1000)
            * ((this._range || 1) * 1.5);    // give a little extra 'weight' to range, as it conveys an advantage
    }

    constructor(options: TechnologyOptions) {

        // TODO: reject if missing required options
        if(!options.name) throw `Technology needs name!`;
        if(!options.type) throw `Technology ${options.name} needs type!`;
        super(options);

        if(options.research) {
            this._research = new Research({
                name: options.name,
                ...options.research
            });
        }

        if(options.sound) {
            if (Array.isArray(options.sound)) {
                const that = this;
                options.sound.forEach(function (sound) {
                    that._sound.push(sound);
                });
            } else {
                this._sound.push(options.sound);
            }
        }

        // TODO: proper private members and getters
        this._type = options.type;
        this._range = options.range;
        this._damage = options.damage;
        this._delay = options.delay;
        this._thorns = options.thorns;

        if(options.statusEffect) {
            if(Number.isNaN(options.statusEffect.duration)) {
                console.warn("You can't (currently) apply a status effect without a duration.");
            }
            else this._statusEffect = options.statusEffect;
        }
        this._statusEffectDuration = options.statusEffectDuration;

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
        if(this._sound.length > 0) {
            if(this._lastPlayedSoundIndex > this._sound.length - 2) {
                this._lastPlayedSoundIndex = -1;
            }
            this._lastPlayedSoundIndex += 1;
            const soundName = this._sound[this._lastPlayedSoundIndex];
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
