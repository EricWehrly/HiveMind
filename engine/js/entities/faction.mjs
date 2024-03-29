import Listed from "../baseTypes/listed.mjs";

export default class Faction extends Listed {

    #color;
    get color() { return this.#color; }

    constructor(options) {

        super(options);

        if(options.color) this.#color = options.color;
    }
}
