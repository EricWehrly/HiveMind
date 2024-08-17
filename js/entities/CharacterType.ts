import Research from "../../engine/js/research";
import { GrowerConfig } from "./character/mixins/Grower";

export interface CharacterTypeOptions {
    name: string;
    // TODO: check this is working as intended
    research?: {
        cost: number
    };
    context: any;
}

export default class CharacterType {

    static List: { [key: string]: CharacterType } = {}

    static Create(options: CharacterTypeOptions) {
        return new CharacterType(options);
    }

    _name: string;
    get name() { return this._name; }
    // some of these properties might be ... odd, to have on here ...
    // but then, this whole class is kinda murky javascript hack fun
    _spawnPurposeKey?: string;
    _currentPurposeKey?: string;
    growerConfig?: GrowerConfig;

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

    private constructor(options: CharacterTypeOptions) {

        if(options.research) {
            this._research = new Research({
                name: options.name,
                ...options.research
            });
        }
        this._name = options.name;

        Object.assign(this, options.context);

        CharacterType.List[this.name] = this;
        // TODO: We probably don't need to do this
        Object.freeze(this);
    }
}
