import { RegisterLoopMethod } from '../../engine/js/loop.mjs';

import Action from '../../engine/js/action.mjs';
const Actions = Action.List;

// we can use extends and a base class to share common methods
// import ControllerInterface from "./controller-interface.mjs";

// assert proper implementation of "Interface" using tests
// https://stackoverflow.com/questions/3710275/does-javascript-have-the-interface-type-such-as-javas-interface

// TODO: Saved user keybindings and stuff

// I think instead of this, we should check in loop if key is down, and assign velocity accordingly
// Key down/up events should change a state that is transmitted to the server ...

export default class KeyboardController {

    static #List = [];

    // TODO: Private?
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields
    static Default_Bindings = {
        "move_up": ['w'],
        "move_down": ['s'],
        "move_left": ['a'],
        "move_right": ['d'],
        "attack": [' ']

        // press q to break off a piece
        // hold q to change focus of broken off pieces (radial menu)
        // press F to break off a piece to study something (in front of the player)
    }

    static AddDefaultBinding(name, button) {
        // TODO: Warn if already bound?
        KeyboardController.Default_Bindings[name] = button;
        for(var controller of KeyboardController.#List) {
            // TODO: If button already bound?
            controller.Bindings[name] = button;
        }
    }

    Bindings = {
    }

    _keys_down = {};

    constructor(options = {}) {

        Object.assign(this.Bindings, KeyboardController.Default_Bindings);
        // TODO: Take bindings from options?
        // Load bindings from persistence layer?

        // TODO: if character variable is not of class type character, throw a bad!
        this.character = options.character;

        // https://stackoverflow.com/a/36489599/5450892
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));

        RegisterLoopMethod(this.loopMethod.bind(this), true);

        KeyboardController.#List.push(this);
    }

    isKeyDown(binding) {

        return this._keys_down[binding] === true;
    }

    handleKeyDown(event) {

        // TODO: fire any actions immediately that don't require it to be held
        this.performActions(event.key);
        // TODO: Check if actions are currently bound to this key that require us to track if its down
        // (otherwise don't track it)
        this._keys_down[event.key] = true;
    }

    handleKeyUp(event) {

        this._keys_down[event.key] = false;
    }

    loopMethod() {

        this.character.velocity.x = 0;
        this.character.velocity.y = 0;

        for (var action of Object.keys(Actions)) {
            if (Actions[action].enabled !== false
                && this.Bindings[action]
                && Actions[action].oncePerPress !== true) {
                for (var binding of this.Bindings[action]) {
                    if (this.isKeyDown(binding)) {
                        Actions[action].callback({
                            character: this.character
                        });
                    }
                }
            }
        }
    }

    // TODO: Private
    performActions(key) {

        for (var action of Object.keys(Actions)) {
            if (Actions[action].enabled !== false
                && this.Bindings[action]
                && this.Bindings[action].includes(key)) {
                Actions[action].callback({
                    character: this.character
                });
            }
        }
    }
}
