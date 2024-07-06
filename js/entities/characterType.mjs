import Research from "../../engine/js/research.mjs";

export default class CharacterType {

    name;
    // some of these properties might be ... odd, to have on here ...
    // but then, this whole class is kinda murky javascript hack fun
    _spawnPurposeKey;
    _currentPurposeKey;
    growConfig;

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
