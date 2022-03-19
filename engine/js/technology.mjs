import Listed from "./baseTypes/listed.mjs";

export default class Technology extends Listed {

    static Types = {
        ATTACK: "attack"
    }

    constructor(options = {}) {

        // TODO: reject if missing required options
        super(options);
    }
}
