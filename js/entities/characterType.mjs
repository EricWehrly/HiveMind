export default class CharacterType {

    constructor(options) {

        // TODO: throw error if no name

        Object.assign(this, options);
        this.characterType = this.name;

        CharacterType[this.name] = this;
    }
}
