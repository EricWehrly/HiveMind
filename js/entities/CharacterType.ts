export interface CharacterTypeOptions {
    name: string;
    // TODO: check (unit test) this is working as intended
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

    // hack to allow for dynamic properties
    [key: string]: any;

    _name: string;
    get name() { return this._name; }

    // expose commonly accessed character property
    health?: number;

    #isStudied = false;
    get isStudied() { return this.#isStudied; }
    set isStudied(value) {
        this.#isStudied = value;
    }

    // TODO: delete when all mjs files are gone
    get characterType() { return this; }

    private constructor(options: CharacterTypeOptions) {
        this._name = options.name;

        Object.assign(this, options.context);

        CharacterType.List[this.name] = this;
        // TODO: We probably don't need to do this
    }
}
