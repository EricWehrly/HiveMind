import Unlock from "../../engine/js/unlocks.mjs";

export default class CharacterType {

    #unlock = null;

    constructor(options) {

        // TODO: throw error if no name

        if(this.research) {
            this.research.name = this.name;
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
