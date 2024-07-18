// @ts-nocheck
import { AssignWithUnderscores, WarnUnassignedOptions } from '../util/javascript-extensions.mjs'
import Faction from './faction.mjs';
import Tooltip from '../ui/tooltip.mjs';
import Entity from './character/Entity';
import { Combatant } from './character/Combatant';
import CharacterType from '../../../js/entities/CharacterType';

interface GetNearbyEntitiesOptions {
    max?: number;
    distance?: number;
    characterType: CharacterType;
    faction?: Faction;
}

// TODO: #private properties rather than _private
export default class Character extends Combatant {

    toolTip: Tooltip;
    controller: any; // inputdevice

    private _faction = null;
    #research = {};

    get faction() { return this._faction; }
    set faction(value) { this._faction = value; }

    constructor(options = {}) {
        super(options);

        if(options.faction) {
            this._faction = options.faction;
            delete options.faction;
        }

        if(options.research) {
            console.log('research not supported right now');
            this.#research = options.research;
            delete options.research;
        }

        this.color = options.color;
        // TODO: Find a better way to have a cancellable default?
        if (options.color === null) delete this.color;

        delete options.ai;

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
    
    getNearbyEntities(options: GetNearbyEntitiesOptions = {}) {

        return super.getNearbyEntities(options);
    }

    // this is unused ...
    getScreenPosition() {

        // TODO: get grid size constant from css
        const gridSize = 32;
        return {
            x: this.position.x * gridSize,
            y: this.position.y * gridSize
        };
    }

    // TODO: Make private ... and push down?
    shouldFilterCharacter(character: Entity, options) {

        if (options.filterChildren && character.parent == this) {
            return true;
        }
        if (options.hostile != null && character.isHostile != options.hostile) {
            return true;
        }
        if (options.isPlayer != null && character.isPlayer != options.isPlayer) {
            return true;
        }
        if(options.characterType != null && character.characterType != options.characterType) {
            return true;
        }
        if(options.exclude && options.exclude.includes(character)) {
            return true;
        }
        if(options.grown != null && character.isGrown != options.grown) {
            return true;
        }
        if(options.faction && character.faction != options.faction) {
            return true;
        }
        if(options.characterProperties) {
            for(var key of Object.keys(options.characterProperties)) {
                if(character[key] != options.characterProperties[key]) {
                    return true;
                }
            }
        }

        return false;
    }
}

if(window) window.Character = Character;
