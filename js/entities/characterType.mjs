import Unlock from "../../engine/js/unlocks.mjs";
import Research from "../../engine/js/research.mjs";

export default class CharacterType {

    #unlock = null;

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

        this.#unlock = new Unlock({
            name: this.name
        });
    }

    unlock() {
        this.#unlock.unlock();
    }
}
