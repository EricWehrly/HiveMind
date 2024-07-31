import Listed from "../baseTypes/listed";

export interface FactionOptions {
    name: string;
    color?: string;
}

export default class Faction extends Listed {

    #color;
    get color() { return this.#color; }

    constructor(options: FactionOptions) {

        super(options);

        if(options.color) this.#color = options.color;
    }
}
