import { RegisterLoopMethod } from '../../engine/js/Loop.ts';
import Vector from '../../engine/js/baseTypes/Vector.ts';
import Action from '../../engine/js/action.ts';
const Actions = Action.List;

// we can use extends and a base class to share common methods
// import ControllerInterface from "./controller-interface.mjs";

// assert proper implementation of "Interface" using tests
// https://stackoverflow.com/questions/3710275/does-javascript-have-the-interface-type-such-as-javas-interface

// TODO: Saved user keybindings and stuff

// I think instead of this, we should check in loop if key is down, and assign velocity accordingly
// Key down/up events should change a state that is transmitted to the server ...

export default class KeyboardController {

    static #instance;

    static #List = [];

    // TODO: Private?
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields
    static Default_Bindings = {
        "move_up": ['w'],
        "move_down": ['s'],
        "move_left": ['a'],
        "move_right": ['d'],
        "attack": [' '],
        "menu_previous": ['a'],
        "menu_next": ['d'],

        // I can't figure out why we're not seeing "f".
        // we bind it in game.js:30 : KeyboardController.AddDefaultBinding("subdivide", "q");
        // something to do with the 'character' object? but move_* is a character based action?

        // press q to break off a piece
        // hold q to change focus of broken off pieces (radial menu)
        // press F to break off a piece to study something (in front of the player)
    }

    // TODO: Maybe when we convert to typescript,
    // we can leave this open to accept strings (good for modding)
    // but add another overload that takes Action obj instead of name,
    // and use that wherever possible
    static AddDefaultBinding(name, button) {

        // TODO: warn button is already bound

        if(KeyboardController.Default_Bindings[name]) {
            console.warn(`Action ${name} might already be bound?`);
        }

        if(!Object.keys(KeyboardController.Default_Bindings).includes(name)) {
            KeyboardController.Default_Bindings[name] = [];
        }
        KeyboardController.Default_Bindings[name].push(button);

        const instanceBindings = KeyboardController.#instance?.Bindings;

        // if we've already copied bindings over
        if(instanceBindings && Object.keys(instanceBindings).length > 0) {
            if(instanceBindings[name]) instanceBindings[name].push(button);
            else instanceBindings[name] = [button];
        }
    }

    Bindings = {}

    _keys_down = {};

    constructor(options = {}) {

        KeyboardController.#instance = this;

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
        this.#performActions(event.key);
        // TODO: Check if actions are currently bound to this key that require us to track if its down
        // (otherwise don't track it)
        this._keys_down[event.key] = true;
        
        if (event.ctrlKey && event.keyCode === 70) { 
            event.preventDefault();
        }
    }

    handleKeyUp(event) {

        this._keys_down[event.key] = false;
    }

    loopMethod() {

        this.character.desiredMovementVector = new Vector(0, 0);

        // TODO: (Performance) we can cache actions that should be fired
        // (rather than iterate the entire object.keys)
        for (var action of Object.keys(Actions)) {
            if (this.shouldFireAction(action)) {
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

    shouldFireAction(action) {
        return Actions[action].enabled !== false
            && this.Bindings[action]
            && Actions[action].oncePerPress !== true;
    }

    #performActions(key) {

        // TODO: loopMethod needs to be refactored now, right?
        for(var action of Object.keys(this.Bindings)) {
            const bindingKeys = this.Bindings[action];
            if(bindingKeys.includes(key)) {
                const actionParams = action.split("/");
                const coreAction = Actions[actionParams[0]];
                if(coreAction?.enabled && coreAction?.callback) {
                    coreAction.callback({
                        character: this.character,
                        parameters: actionParams
                    });
                }
            }
            // else console.log(key);
        }
    }
}
