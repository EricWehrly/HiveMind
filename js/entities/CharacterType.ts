import { EntityOptions } from "../../engine/js/entities/character/EntityOptions";

export interface CharacterTypeOptions extends EntityOptions {
    name: string;
    // TODO: check (unit test) this is working as intended
    research?: {
        cost: number
    };
}

export default class CharacterType implements EntityOptions {

    static List: { [key: string]: CharacterType } = {}

    static Create(options: CharacterTypeOptions) {
        return new CharacterType(options);
    }

    // hack to allow for dynamic properties
    [key: string]: any;

    private _name: string;
    get name() { return this._name; }

    // expose commonly accessed character property
    health?: number;

    private _isStudied = false;
    get isStudied() { return this._isStudied; }
    set isStudied(value) {
        this._isStudied = value;
    }

    // TODO: delete when all mjs files are gone 
    get characterType() { return this; }

    private constructor(options: CharacterTypeOptions) {
        this._name = options.name;

        for (let key in options) {
            if(key != "name" && key != "_name") {
                // TODO: still hacky
                // @ts-expect-error
                this[key] = options[key];
            }
        }

        CharacterType.List[this.name] = this;
        // TODO: We probably don't need to do this
    }
}
