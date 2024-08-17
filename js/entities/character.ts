import { AssignWithUnderscores, WarnUnassignedOptions } from '../util/javascript-extensions.mjs'
import Faction from './faction';
import Tooltip from '../ui/tooltip';
import PlayableEntity from './character/PlayableEntity';
import { CharacterFilterOptions } from './character/Entity';

// these will need to get broken up, but it can wait
export interface HivemindCharacterFilterOptions {
    isPlayer: boolean,
    faction: Faction
}

export default class Character extends PlayableEntity {

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

        this.color = options.color || options.characterType?.color || null;
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

    shouldFilterCharacter(character: Character, options: CharacterFilterOptions & HivemindCharacterFilterOptions): boolean {

        if (options.isPlayer != null && character.isPlayer != options.isPlayer) {
            return true;
        }
        if(options.faction && character.faction != options.faction) {
            return true;
        }

        return super.shouldFilterCharacter(character, options);
    }
}

if(window) window.Character = Character;
