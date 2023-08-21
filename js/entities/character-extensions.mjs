import Character from '../../engine/js/entities/character.mjs';
import { GetColorAsRGBA } from '../../engine/js/util/javascript-extensions.js';
import Purposes from './character-purposes.mjs';
import CharacterType from './characterType.mjs';

export default class HiveMindCharacter extends Character {

    static get SUBDIVIDE_COST() { return 10; }

    static Purposes = Purposes;

    _currentPurposeKey = null;

    constructor(options) {
        const key = options._currentPurposeKey || options.currentPurposeKey;
        super(options);

        this._currentPurposeKey = key;
    }

    get purpose () { return HiveMindCharacter.Purposes[this._currentPurposeKey]; }

    get isGrown() {

        if(this.growth == undefined) return true;
        if(this.growth == 100) return true;
        return false;
    }

    get canBeStudied() {
        // TODO: use "or"s rather than all these if's
        // this is something that would probably automatically benefit from 
        // a magic function-level caching implementation
        if(this.isPlayer) return false;
        if(this.ai != null && this.dead == false) return false;
        if(!this.isGrown) return false;
        if(this.characterType && CharacterType[this.characterType].isStudied == true) return false;

        return true;
    }

    get toolTipMessage() {

        let toolTipMessage = "";

        if(this.name) {
            toolTipMessage = this.name + '<br />';
        }
    
        if(this.equipment?.attack != null) {
            toolTipMessage += `Equipped: ${this.equipment.attack.name}<br />`;
        }
    
        if(this.aggression != null) {
            toolTipMessage += `Aggression Range: ${this.aggressionRange}<br />`;
        }

        if(this.canBeStudied) {            
            toolTipMessage += "'F' - Study";
        } else {            
            toolTipMessage += "'F' - Nom";
        }

        return toolTipMessage;
    }

    think(elapsed) {

        // stupid hack
        let origTarget = null;
        if(this._currentPurposeKey) origTarget = this.target;

        super.think(elapsed);

        if (this._currentPurposeKey) {
            if(origTarget) this.target = origTarget;
            // maybe the purposes should be specific AI implementations ...
            HiveMindCharacter.Purposes[this._currentPurposeKey].think(this, elapsed);
        }
    }

    SetCurrentPurpose = function (newPurpose) {

        if(typeof newPurpose == "string") this._currentPurposeKey = newPurpose;
        else console.warn("What do I do with this");
    }

    canAfford(amount) {

        return this.health >= amount * 2;
    }
    
    // TODO: set character current subdivision task/purpose
    Subdivide (options = {}) {

        const amount = options.amount || HiveMindCharacter.SUBDIVIDE_COST;
        let purpose;
        if (options.purposeKey) purpose = HiveMindCharacter.Purposes[options.purposeKey];
        else if (options.purpose) purpose = options.purpose;
        // else if not in that array ...
        else purpose = HiveMindCharacter.Purposes[this._currentPurposeKey];
    
        if (!this.canAfford(amount)) {
            if(this.isPlayer) console.log("Tell the player they can't subdivbide");
            return;
        }
    
        this.health -= amount;
    
        let spawnedColor = GetColorAsRGBA(this.color);
        spawnedColor[1] = 25;   // for now ...
        const spawnedCharacter = new HiveMindCharacter({
            color: `rgba(${spawnedColor.join(",")})`,
            health: amount,
            position: this.position,
            _currentPurposeKey: purpose.name.toLowerCase()
        });
        spawnedCharacter.parent = this;
        if (options.target) spawnedCharacter.target = options.target;
        spawnedCharacter.graphic.innerHTML = spawnedCharacter.purpose.name;
        console.debug(`Subdivided new character for ${spawnedCharacter.purpose.name}`);
    }

    // to be called on the child to be reabsorbed into the parent
    Reabsorb(options = {}) {

        // if we've exceeded the parent's "starting" health (and it's a building?)
        // contribute the difference to the player's resource pool
        this.parent.health += this.health;
        if(this.parent.health > this.parent.maxHealth) {

        }

        if(this.technologies && this.technologies.length > 0) {
            this.parent.AddTechnology(this.technologies[0]);
        }
        this.health = 0;
    }
}