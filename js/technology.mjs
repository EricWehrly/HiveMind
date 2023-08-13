import Listed from "./baseTypes/listed.mjs";

export default class Technology extends Listed {

    static Types = {
        ATTACK: "attack",
        // maybe this should be called "buff"
        ATTACK_MODIFIER: "attackModifier"
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
    }
}
