import Listed from "./baseTypes/listed.mjs";

export default class Technology extends Listed {

    static Types = {
        ATTACK: "attack",
        // maybe this should be called "buff"
        ATTACK_MODIFIER: "attackModifier"
    }

    #statusEffect;

    get statusEffect() {
        return this.#statusEffect;
    }

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
           this.sound = new Audio(options.sound);
        }

        // TODO: proper private members and getters
        this.type = options.type;
        this.range = options.range;
        this.damage = options.damage;
        this.delay = options.delay;

        if(options.statusEffect) {
            if(Number.isNaN(options.statusEffect.duration)) {
                console.warn("You can't (currently) apply a status effect without a duration.");
            }
            else this.#statusEffect = options.statusEffect;
        }
    }
}
