import Faction from './faction';
import Tooltip from '../ui/tooltip';
import { CharacterFilterOptions } from './character/Entity';
import SentientEntity from './character/SentientEntity';
import { IsCombative } from './character/mixins/Combative';

// these will need to get broken up, but it can wait
export interface HivemindCharacterFilterOptions {
    isPlayer: boolean,
    faction: Faction
}

export default class Character extends SentientEntity {

    toolTip: Tooltip;
    controller: any; // inputdevice

    additionalClasses: string;

    constructor(options: any = {}) {
        super(options);

        if(options.research) {
            console.log('TODO: research not supported right now');
            // this.#research = options.research;
        }

        if(options.additionalClasses) this.additionalClasses = options.additionalClasses;
    }

    shouldFilterCharacter(character: Character, options: CharacterFilterOptions & HivemindCharacterFilterOptions): boolean {

        if (options.isPlayer != null && character.isPlayer != options.isPlayer) {
            return true;
        }
        if(IsCombative(character)) {
            if(options.faction && character.faction != options.faction) {
                return true;
            }
        }

        return super.shouldFilterCharacter(character, options);
    }
}

if(window) window.Character = Character;
