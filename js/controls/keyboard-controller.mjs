// we can use extends and a base class to share common methods
// import ControllerInterface from "./controller-interface.mjs";

// assert proper implementation of "Interface" using tests
// https://stackoverflow.com/questions/3710275/does-javascript-have-the-interface-type-such-as-javas-interface

// TODO: Saved user keybindings and stuff

export default class KeyboardController {

    // TODO: Private?
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields
    Bindings = {
        'w': () => {
            this.character.velocity.y += 1;
        }
    }

    constructor(options = {}) {

        // TODO: if character variable is not of class type character, throw a bad!
        this.character = options.character;

        // https://stackoverflow.com/a/36489599/5450892
        // document.addEventListener('keydown', this.handleKeyDown);
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    handleKeyDown(event) {

        const key = event.key;
        if(this.Bindings[key]) this.Bindings[key]();
    }
}