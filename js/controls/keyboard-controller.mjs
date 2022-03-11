import { RegisterLoopMethod } from './../loop.mjs';

// we can use extends and a base class to share common methods
// import ControllerInterface from "./controller-interface.mjs";

// assert proper implementation of "Interface" using tests
// https://stackoverflow.com/questions/3710275/does-javascript-have-the-interface-type-such-as-javas-interface

// TODO: Saved user keybindings and stuff

// I think instead of this, we should check in loop if key is down, and assign velocity accordingly
// Key down/up events should change a state that is transmitted to the server ...

export default class KeyboardController {

    // TODO: Should actions be managed externally to this?
    static Actions = {
        move_up: (character) => character.velocity.y = -1,
        move_down: (character) => character.velocity.y = 1,
        move_left: (character) => character.velocity.x = -1,
        move_right: (character) => character.velocity.x = 1
    }

    // TODO: Private?
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields
    Bindings = {
        "move_up": ['w'],
        "move_down": ['s'],
        "move_left": ['a'],
        "move_right": ['d']
    }

    _keys_down = {};

    constructor(options = {}) {

        // TODO: if character variable is not of class type character, throw a bad!
        this.character = options.character;

        // https://stackoverflow.com/a/36489599/5450892
        // document.addEventListener('keydown', this.handleKeyDown);
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        RegisterLoopMethod(this.loopMethod.bind(this), true);
    }

    isKeyDown(binding) {

        return this._keys_down[binding] === true;
    }

    handleKeyDown(event) {

        this._keys_down[event.key] = true;
    }

    handleKeyUp(event) {
        
        this._keys_down[event.key] = false;
    }

    loopMethod() {

        this.character.velocity.x = 0;
        this.character.velocity.y = 0;

        for(var action of Object.keys(KeyboardController.Actions)) {
            for(var binding of this.Bindings[action]) {
                if(this.isKeyDown(binding)) {
                    KeyboardController.Actions[action](this.character);
                }
            }
        }
    }
}
