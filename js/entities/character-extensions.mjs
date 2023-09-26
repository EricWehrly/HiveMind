import CharacterAttribute from '../../engine/js/entities/character-attribute.mjs';
import Character from '../../engine/js/entities/character.mjs';
import Resource from '../../engine/js/entities/resource.mjs';
import Events from '../../engine/js/events.mjs';
import Purposes from './character-purposes.mjs';
import CharacterType from './characterType.mjs';

export default class HiveMindCharacter extends Character {

    static get SUBDIVIDE_COST() { return 10; }

    static Purposes = Purposes;

    _currentPurposeKey = null;

    #spawnTargets = [];

    get spawnTargets() {
        return this.#spawnTargets;
    }

    constructor(options) {
        const key = options._currentPurposeKey || options.currentPurposeKey;
        super(options);

        this._currentPurposeKey = key;

        this.addAttribute(new CharacterAttribute({
            name: 'Strength',
            value: 1,
            baseCost: 40,
            costFunction: this.logarithmicCost
        }));

        Events.Subscribe(Events.List.CharacterDied, this.removeSpawnTarget.bind(this));
    }

    get purpose () { return HiveMindCharacter.Purposes[this._currentPurposeKey]; }

    get isGrown() {

        if(this.growth == undefined) return true;
        if(this.growth >= 100) return true;
        return false;
    }

    canBeStudied(byWhom) {
        // TODO: use "or"s rather than all these if's
        // this is something that would probably automatically benefit from 
        // a magic function-level caching implementation
        if(this.isPlayer) return false;
        if(this.ai != null && this.dead == false) return false;
        if(!this.isGrown) return false;
        if(byWhom?.faction != null && this.faction == byWhom.faction) return false;
        if(this.characterType && CharacterType[this.characterType].isStudied == true) return false;

        return true;
    }

    canBeEaten(byWhom) {

        if(this.isBuilding == true) return false;
        if(this.canBeStudied(byWhom)) return false;
        if(!this.isGrown) return false;

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
            toolTipMessage += `Aggression Range: ${Math.round(this.aggressionRange)}<br />`;
        }

        if(this.canBeStudied(Character.LOCAL_PLAYER)) {            
            toolTipMessage += "'F' - Study";
        }

        if(this.canBeEaten(Character.LOCAL_PLAYER)) {
            toolTipMessage += "'F' - Nom";
        }

        if(!this.isGrown) {
            toolTipMessage += "Growing";
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
            // if Purposes doesn't contain key, warn
            if(!(this._currentPurposeKey in HiveMindCharacter.Purposes)) {
                console.warn(`${this._currentPurposeKey} not in purposes.`);
            } else {
                HiveMindCharacter.Purposes[this._currentPurposeKey].think(this, elapsed);
            }
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

        if(purpose == null) {
            if(this.isPlayer) console.log("Tell the player they can't subdivbide (no purpose)");
            return;
        }
    
        if (!this.canAfford(amount)) {
            if(this.isPlayer) console.log("Tell the player they can't subdivbide (cant afford)");
            return;
        }
    
        this.health -= amount;
    
        const name = options.name || "Slime Worker";
        const spawnedCharacter = new HiveMindCharacter({
            name,
            health: amount,
            position: this.position,
            _currentPurposeKey: purpose.name.toLowerCase(),
            faction: this.faction,
            technologies: options.technologies
        });
        spawnedCharacter.parent = this;
        if (options.target) spawnedCharacter.target = options.target;
        spawnedCharacter.graphic.innerHTML = spawnedCharacter.purpose.name;
        console.debug(`Subdivided new character for ${spawnedCharacter.purpose.name}`);

        return spawnedCharacter;
    }

    // to be called on the child to be reabsorbed into the parent
    Reabsorb() {

        if(this.health == 0 || this.parent == null) debugger;

        // TODO: isPlayer -> (not) isBuilding
        let maxToGive = Infinity;
        if(this.parent.isPlayer != true) {
            maxToGive = this.parent.maxHealth - this.parent.health;
        }
        const amountToGive = Math.min(this.health, maxToGive);

        if(this.health > amountToGive) {
            const food = Resource.Get("food");
            food.value += this.health - amountToGive;
        }

        if(this.technologies && this.technologies.length > 0) {
            this.parent.AddTechnology(this.technologies[0]);
        }
        this.health = 0;
        this.parent.health += amountToGive;
    }

    removeSpawnTarget(target) {

        for(var i = 0; i < this.#spawnTargets.length; i++) {
            const spawnTarget = this.#spawnTargets[i];
            if(spawnTarget.equals(target)) {
                this.#spawnTargets = this.#spawnTargets.splice(i, 1);
                break;
            }
        }
    }
}
