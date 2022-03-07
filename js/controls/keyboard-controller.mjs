// we can use extends and a base class to share common methods
// import ControllerInterface from "./controller-interface.mjs";

// assert proper implementation of "Interface" using tests
// https://stackoverflow.com/questions/3710275/does-javascript-have-the-interface-type-such-as-javas-interface

// TODO: Saved user keybindings and stuff

// I think instead of this, we should check in loop if key is down, and assign velocity accordingly
// Key down/up events should change a state that is transmitted to the server ...

export default class KeyboardController {

    // TODO: Private?
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields
    Bindings = {
        'w': () => {
            this.character.velocity.y = 1;
        },
        'a': () => {
            this.character.velocity.x = 1;
        },
        's': () => {
            this.character.velocity.y = 1;
        },
        'd': () => {
            this.character.velocity.x = 1;
        }
    }

    constructor(options = {}) {

        // TODO: if character variable is not of class type character, throw a bad!
        this.character = options.character;

        // https://stackoverflow.com/a/36489599/5450892
        // document.addEventListener('keydown', this.handleKeyDown);
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    handleKeyDown(event) {

        const key = event.key;
        if(this.Bindings[key]) this.Bindings[key]();
    }

    handleKeyUp(event) {
        
        const key = event.key;
        if(this.Bindings[key]) this.character.velocity = {
            x: 0,
            y: 0
        }
    }
}