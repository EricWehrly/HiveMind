// @ts-nocheck
import { AssignWithUnderscores, WarnUnassignedOptions } from '../util/javascript-extensions.mjs'
import Faction from './faction.mjs';
import Tooltip from '../ui/tooltip';
import { Combatant } from './character/Combatant';

export default class Character extends Combatant {

    toolTip: Tooltip;
    controller: any; // inputdevice

    private _faction: Faction = null;
    #research = {};

    get faction() { return this._faction; }
    set faction(value) { this._faction = value; }

    // TODO: Make this ... better
    color: string;
    additionalClasses: string;

    constructor(options: any = {}) {
        super(options);

        if(options.faction) {
            this._faction = options.faction;
        }

        if(options.research) {
            console.log('research not supported right now');
            this.#research = options.research;
        }

        this.color = options.color;
        // TODO: Find a better way to have a cancellable default?
        if (options.color === null) delete this.color;

        if(options.additionalClasses) this.additionalClasses = options.additionalClasses;

        // WarnUnassignedOptions(this, options);
        // AssignWithUnderscores(this, options);

        if(options.isPlayer) {
            this.faction = new Faction({ 
                name: this.name,
                color: this.color
            });
        }
    }

    think() {
        super.think();

        this.statusEffectThink();
    }

    // TODO: Make private ... and push down?
    shouldFilterCharacter(character: Character, options: any) {

        // parent is for growables, I think
        // so the method needs to be extensible, which is a pattern we've already established
        if (options.filterChildren && character.parent == this) {
            return true;
        }
        if (options.hostile != null && character.isHostile != options.hostile) {
            return true;
        }
        if (options.isPlayer != null && character.isPlayer != options.isPlayer) {
            return true;
        }
        if(options.grown != null && character.isGrown != options.grown) {
            return true;
        }
        if(options.faction && character.faction != options.faction) {
            return true;
        }

        // TODO: unit test this call to super
        return super.shouldFilterCharacter(character, options);
    }
}

// @ts-ignore
if(window) window.Character = Character;
