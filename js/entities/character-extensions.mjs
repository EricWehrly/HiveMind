import Character from '../../engine/js/entities/character.mjs';
import { GetColorAsRGBA } from '../../engine/js/util/javascript-extensions.js';
import Purposes from './character-purposes.mjs';
import CharacterType from './characterType.mjs';

export default class HiveMindCharacter extends Character {

    static Purposes = Purposes;

    _currentPurposeKey = null;

    constructor(options) {
        const key = options._currentPurposeKey || options.currentPurposeKey;
        super(options);
        
        this._currentPurposeKey = key;
    }

    get purpose () { return HiveMindCharacter.Purposes[this._currentPurposeKey]; }

    get canBeStudied() {
        if(this.isPlayer) return false;
        if(this.ai != null && this.dead == false) return false;
        if(this.characterType && CharacterType[this.characterType].isStudied == true) return false;

        return true;
    }

    think(elapsed) {
        super.think(elapsed);

        if (this._currentPurposeKey) {
            // maybe the purposes should be specific AI implementations ...
            HiveMindCharacter.Purposes[this._currentPurposeKey].think(this, elapsed);
        }
    }

    SetCurrentPurpose = function (newPurpose) {

        if(typeof newPurpose == "string") this._currentPurposeKey = newPurpose;
        else console.warn("What do I do with this");
    }
    
    // TODO: set character current subdivision task/purpose
    Subdivide = function (options = {}) {

        const amount = options.amount || 10;
        let purpose;
        if (options.purposeKey) purpose = HiveMindCharacter.Purposes[options.purposeKey];
        else if (options.purpose) purpose = options.purpose;
        // else if not in that array ...
        else purpose = HiveMindCharacter.Purposes[this._currentPurposeKey];
    
        if (this.health < amount * 2) {
            console.log("Tell the player they can't subdivbide");
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
        console.log(`Subdivided new character for ${spawnedCharacter.purpose.name}`);
    }

    // to be called on the child to be reabsorbed into the parent
    Reabsorb = function(options = {}) {

        this.parent.health += this.health;
        this.parent.AddTechnology(this.technologies[0]);
        this.health = 0;
    }
}