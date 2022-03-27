export default class CharacterType {

    constructor(options) {

        // TODO: throw error if no name

        Object.assign(this, options);

        CharacterType[this.name] = this;
    }
}
