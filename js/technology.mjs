import Listed from "./baseTypes/listed.mjs";
import Research from "./research.mjs";

export default class Technology extends Listed {

    static #sounds = {};

    static #getSound(name) {

        if(!(name in Technology.#sounds)) {
            Technology.#sounds[name] = new Audio(name);
        }

        return Technology.#sounds[name];
    }

    #lastFired = performance.now();
    #lastPlayedSoundIndex = -1;
    #sound = [];
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

        return (this.damage || 1) // should this be || 0 because no damage = no danger ... ?
            / ((this.delay || 1000) / 1000)
            * ((this.range || 1) * 1.5);    // give a little extra 'weight' to range, as it conveys an advantage
    }

    constructor(options = {}) {

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
        this.range = options.range;
        this.damage = options.damage;
        this.delay = options.delay;
        this.thorns = options.thorns;

        if(options.statusEffect) {
            if(Number.isNaN(options.statusEffect.duration)) {
                console.warn("You can't (currently) apply a status effect without a duration.");
            }
            else this.#statusEffect = options.statusEffect;
        }
        this.#statusEffectDuration = options.statusEffectDuration;

        // TODO: Probably stop doing this?
        Object.seal(this);
    }

    checkDelay() {

        if (this.delay && this.#lastFired &&
            performance.now() - this.#lastFired < this.delay) return false;
        else if (this.delay) this.#lastFired = performance.now();

        return true;
    }

    checkRange(character) {

        if (this.range) {
            if (!character?.target) return false;

            if (character.getDistance(character.target) > this.range) return false;
        }

        return true;
    }

    playSound(options) {

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
                console.warn(`Sound not ready for ${this.name}`, sound);
            }
        }
        else console.warn(`No sound for ${this.name}`);
    }
}
