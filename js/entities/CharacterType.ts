import AI from "../../engine/js/ai/basic";
import Research from "../../engine/js/research.mjs";
import { GrowerConfig } from "./character/mixins/Grower";

export default class CharacterType {

    static List: { [key: string]: CharacterType } = {}

    _name: string;
    get name() { return this._name; }
    // some of these properties might be ... odd, to have on here ...
    // but then, this whole class is kinda murky javascript hack fun
    _spawnPurposeKey?: string;
    _currentPurposeKey?: string;
    growerConfig?: GrowerConfig;
    ai?: AI;

    // expose commonly accessed character property
    health?: number;

    private _research: Research;
    get research() { return this._research; }

    #isStudied = false;
    get isStudied() { return this.#isStudied; }
    set isStudied(value) {
        this.#isStudied = value;
    }

    get characterType() { return this; }

    constructor(options: CharacterType) {

        const { name, research, ...characterOptions } = options;

        if(options.research) {
            this._research = new Research({
                name,
                ...options.research
            });
        }
        this._name = name;

        Object.assign(this, characterOptions);

        CharacterType.List[this.name] = this;
        // TODO: We probably don't need to do this
        Object.freeze(this);
    }
}
