import Listed from "./baseTypes/listed.mjs";

export default class Technology extends Listed {

    static Types = {
        ATTACK: "attack"
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
