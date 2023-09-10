// these actions should really be in the game, not the engine
import Character from '../../js/entities/character-extensions.mjs';
import Listed from './baseTypes/listed.mjs';
import Requirements from './requirements.mjs';
import Events from './events.mjs';
import Menu from './ui/menu.mjs';
import Technology from './technology.mjs';

Events.List.ActionFired = "ActionFired";

// todo: I think we need to "fix" this by implementing "ActionType"s.
// These should each be action TYPES but instead they're action INSTANCES
// which prevents us from making instances from them
export default class Action extends Listed {

    static #disabledForMenu = [];

    // TODO: Read from config json?
    static {
        new Action({
            name: 'move_up',
            isCharacterControl: true,
            callback: function (options) {
                if (options?.character?.velocity?.y != null) {
                    options.character.velocity.y = -1;
                }
            }
        });

        new Action({
            name: 'move_down',
            isCharacterControl: true,
            callback: function (options) {
                if (options?.character?.velocity?.y != null) {
                    options.character.velocity.y = 1;
                }
            }
        });

        new Action({
            name: 'move_left',
            isCharacterControl: true,
            callback: function (options) {
                if (options?.character?.velocity?.x != null) {
                    options.character.velocity.x = -1;
                }
            }
        });

        new Action({
            name: 'move_right',
            isCharacterControl: true,
            callback: function (options) {
                if (options?.character?.velocity?.x != null) {
                    options.character.velocity.x = 1;
                }
            }
        });

        new Action({
            name: 'menu_previous',
            isMenuAction: true,
            oncePerPress: true,
            callback: function (options) {
                Menu.Current.selectPrevious();
            }
        });

        new Action({
            name: 'menu_next',
            isMenuAction: true,
            oncePerPress: true,
            callback: function (options) {
                Menu.Current.selectNext();
            }
        });

        new Action({
            name: 'attack',
            isCharacterControl: true,
            callback: function (options) {
                // TODO: Pull in enum from technology class
                const equipment = options?.character?.equipment;
                if(equipment == null) return false;

                const equipped = equipment[Technology.Types.ATTACK];
                if (equipped == null) {
                    console.log("Character has no attack skill equipped!");
                    return;
                }

                // the wrapping function checks the delay on the action,
                // this is checking delay set on the equipped technology
                if (!this.checkDelay(equipped)) return false;

                if(!(options.character.target instanceof Character)) return false;

                if (!this.inRange(equipped, options.character)) return false;

                // TODO: visual and audio cues
                if (options?.character?.target) {
                    // get value of strength attribute
                    const strAttr = options.character.getAttribute("Strength");

                    equipped.playSound();
                    options.character.target.health -= (equipped.damage + strAttr?.value || 0);

                    if(equipped.statusEffect) {
                        options.character.target.applyStatusEffect(equipped.statusEffect, equipped.statusEffectDuration);
                    }

                    if(options.character.target.equipment) {
                        const buff = options.character.target.equipment[Technology.Types.BUFF];
                        if(buff) options.character.health -= buff.thorns;
                    }
                }

                return true;
            }
        });

        // maybe not allowed to do this at first
        new Action({
            name: 'subdivide',
            isCharacterControl: true,
            // TODO: Maybe we should just have "on press" vs "on held" ...
            oncePerPress: true,
            callback: function (options) {
                options.character.Subdivide();
            }
        })

        // TODO: unavailable if a subdivided piece is already studying the target
        new Action({
            name: 'study',
            isCharacterControl: true,
            enabled: false,
            oncePerPress: true,
            delay: 1000,
            callback: function (options) {
                
                const piece = options.character.Subdivide({
                    purpose: Character.Purposes["study"],
                    target: Action.List["study"].target
                });
            }
        });

        // TODO: unavailable if a subdivided piece is already nomming the target
        new Action({
            name: 'consume',
            isCharacterControl: true,
            enabled: false,
            oncePerPress: true,
            delay: 1000,
            callback: function (options) {

                const piece = options.character.Subdivide({
                    purpose: Character.Purposes["consume"],
                    target: Action.List["consume"].target
                });
            }
        });

        new Action({
            name: 'openMenu',
            enabled: true,
            oncePerPress: true,
            callback: function (options) {

                if(options?.parameters?.length > 0) {
                    const menu = Menu.Get(options?.parameters[1]);
                    menu.visible = !menu.visible;
                } else {
                    console.warn("Not sure which menu to open.");
                }
            }
        });

        new Action({
            name: 'menu_interact',
            enabled: false,
            oncePerPress: true,
            delay: 1000,
            callback: function (options) {

                Menu.Current.menuAction({
                    menu: Menu.Current
                });
            }
        });

        Action.MenuClosed();

        Events.Subscribe(Events.List.GameStart, function() {
            
            Events.Subscribe(Events.List.MenuOpened, Action.MenuOpened);
            Events.Subscribe(Events.List.MenuClosed, Action.MenuClosed);
        });
    }
    
    static MenuOpened() {

        for(var index in Action.List) {
            const action = Action.List[index];
            if(action.enabled != false && action.isCharacterControl) {
                Action.#disabledForMenu.push(action);
                action.enabled = false;
            } else if(action.isMenuAction) {
                action.enabled = true;
            }
        }
    }
    
    static MenuClosed() {
        
        for(var index in Action.List) {
            const action = Action.List[index];
            if(action.isMenuAction) {
                action.enabled = false;
            }
        }
        for(var action of Action.#disabledForMenu) {
            action.enabled = true;
        }
        Action.#disabledForMenu = [];
    }

    #enabled = null;
    #oncePerPress = null;
    #delay = null;
    #isCharacterControl = false;
    #isMenuAction = false;
    get enabled() { return this.#enabled; }
    set enabled(value) { this.#enabled = value; }
    get oncePerPress() { return this.#oncePerPress; }
    get delay() { return this.#delay; }
    get isCharacterControl() { return this.#isCharacterControl; }
    get isMenuAction() { return this.#isMenuAction; }

    constructor(options = {}) {

        super(options);

        // TODO: We should try "auto-mapping" some of this ...
        if(options.enabled != null) this.#enabled = options.enabled;
        if(options.oncePerPress != null) this.#oncePerPress = options.oncePerPress;
        if(options.delay != null) this.#delay = options.delay;
        if(options.isCharacterControl != null) this.#isCharacterControl = options.isCharacterControl;
        if(options.isMenuAction != null) this.#isMenuAction = options.isMenuAction;

        if (options.callback != null) {
            const baseCallback = options.callback;

            this.callback = function (options = {}) {

                if (!Requirements.met(this, options.character)) return;

                if (!this.checkDelay(this)) return;

                options.result = baseCallback.bind(this)(options);

                Events.RaiseEvent(`${Events.List.ActionFired}-${this.name}`, options);
            }
        }
    }

    checkDelay(thing) {

        if (thing.delay && thing.lastFired &&
            performance.now() - thing.lastFired < thing.delay) return false;
        else if (thing.delay) thing.lastFired = performance.now();

        return true;
    }

    inRange(thing, character) {

        if (thing.range) {
            if (!character?.target) return false;

            if (character.getDistance(character.target) > thing.range) return false;
        }

        return true;
    }
}

if(window) window.Action = Action;
