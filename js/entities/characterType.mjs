import Research from "../../engine/js/research.mjs";

export default class CharacterType {

    #research;
    get research() { return this.#research; }

    #isStudied = false;
    get isStudied() { return this.#isStudied; }
    set isStudied(value) {
        this.#isStudied = value;
    }

    constructor(options) {

        if(options.research) {
            this.#research = new Research({
                name: options.name,
                ...options.research
            });
            delete options.research;
        }

        Object.assign(this, options);
        this.characterType = this.name;

        CharacterType[this.name] = this;
        Object.freeze(this);
    }
}
