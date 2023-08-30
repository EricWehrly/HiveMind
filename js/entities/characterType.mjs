import Research from "../../engine/js/research.mjs";

export default class CharacterType {

    #research;
    get research() { return this.#research; }

    constructor(options) {

        // TODO: throw error if no name

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
    }
}
