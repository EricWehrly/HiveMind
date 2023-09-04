import Listed from "./baseTypes/listed.mjs";

export default class Technology extends Listed {

    static Types = {
        ATTACK: "attack",
        // maybe this should be called "buff"
        ATTACK_MODIFIER: "attackModifier",
        BUFF: "buff"
    }

    #lastPlayedSoundIndex = -1;
    #sound = [];

    #statusEffect;
    get statusEffect() { return this.#statusEffect; }

    #statusEffectDuration;
    get statusEffectDuration() { return this.#statusEffectDuration; }

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

        if(options.sound) {
            if (Array.isArray(options.sound)) {
                const that = this;
                options.sound.forEach(function (sound) {
                    that.#sound.push(new Audio(sound));
                });
            } else {
                this.#sound.push(new Audio(options.sound));
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
    }

    playSound() {

        // it would be desirable to make this random instead of cyclical, eventually
        if(this.#sound.length > 0) {
            if(this.#lastPlayedSoundIndex > this.#sound.length - 2) {
                this.#lastPlayedSoundIndex = -1;
            }
            this.#lastPlayedSoundIndex += 1;
            this.#sound[this.#lastPlayedSoundIndex].play();
        }
        else console.warn(`No sound for ${this.name}`);
    }
}
