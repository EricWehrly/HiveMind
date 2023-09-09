export default class CharacterAttribute {

    // maybe later static list of possible character attributes?
    // should there be min and max values?
    // increment costs?

    #name;
    get name() { return this.#name; }

    #value;
    get value() { return this.#value; }
    set value(newValue) { 
        this.#value = newValue;
        console.log(`Updating value of ${this.#name} to ${newValue}`)
    }

    constructor(options) {

        if(!options.name) debugger;

        this.#name = options.name;

        if(options.value) this.#value = options.value;
    }
}
