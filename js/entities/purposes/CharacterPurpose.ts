import Listed from "../../../engine/js/baseTypes/listed";
import HiveMindCharacter from "../character/HiveMindCharacter";

type CharacterPurposeThinkMethod = (character: HiveMindCharacter, elapsed: number) => void;

export interface CharacterPurposeOptions {
    name: string;
    interval?: number;
    range?: number;
    amount?: number;
    think: CharacterPurposeThinkMethod;
}

export default class CharacterPurpose extends Listed {

    private _interval?: number;
    private _range?: number;
    private _amount?: number;
    private _think: CharacterPurposeThinkMethod;
    get amount() { return this._amount; }
    get interval() { return this._interval; }
    get range() { return this._range; }

    constructor(options: CharacterPurposeOptions) {
        super(options);
        this._think = options.think.bind(this); // Bind the context of the think method
        this._interval = options.interval;
        this._range = options.range;
        this._amount = options.amount;
    }

    think(character: HiveMindCharacter, elapsed: number) {
        return this._think(character, elapsed);
    }
}
