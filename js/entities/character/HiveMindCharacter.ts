import CharacterAttribute from '../../../engine/js/entities/character-attribute.mjs';
import Character from '../../../engine/js/entities/character';
import Events from '../../../engine/js/events';
import Purposes from '../purposes/character-purposes';
import Entity from '../../../engine/js/entities/character/Entity';
import { IsLiving, Living } from '../../../engine/js/entities/character/mixins/Living';

export default class HiveMindCharacter extends Character {

    static get SUBDIVIDE_COST() { return 10; }

    static Purposes = Purposes;

    _currentPurposeKey: string = null;
    // this should be managed as a 'dynmic' property ... 
    // we're only attaching it to the character because we want it garbage collected there
    lastHeal: number = 0;

    #spawnTargets: Entity[] = [];

    get spawnTargets() {
        return this.#spawnTargets;
    }

    // TODO: Mark this private and use a static create (makes the class not extensible)
    // once we've turned Building into a mixin ... maybe?
    constructor(options: any) {
        if(!options.calledByFactory) console.warn(`HiveMindCharacter should be created by the factory.`);
        const key = options._currentPurposeKey || options.currentPurposeKey;
        delete options._currentPurposeKey;
        delete options.currentPurposeKey;
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

    canBeStudied(byWhom: HiveMindCharacter) {
        // TODO: use "or"s rather than all these if's
        // this is something that would probably automatically benefit from 
        // a magic function-level caching implementation
        if(this.isPlayer) return false;
        // TODO: Is there a way we can streamline what will be these three repeating lines?
        if(IsLiving(this)
            && (this as Living).dead) return false;
        if(this.ai != null) return false;
        if(byWhom?.faction != null && this.faction == byWhom.faction) return false;
        if(this.characterType && this.characterType.isStudied == true) return false;

        return true;
    }

    canBeEaten(byWhom: HiveMindCharacter) {

        if(this.canBeStudied(byWhom)) return false;

        return true;
    }

    get toolTipMessage() {

        const localPlayer = Character.LOCAL_PLAYER as HiveMindCharacter;

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

        if(this.canBeStudied(localPlayer)) {            
            toolTipMessage += "'F' - Study";
        }

        if(this.canBeEaten(localPlayer)) {
            toolTipMessage += "'F' - Nom";
        }

        return toolTipMessage;
    }

    think(elapsed: number = 0) {

        // stupid hack
        let origTarget = null;
        if(this._currentPurposeKey) origTarget = this.target;

        super.think();

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

    SetCurrentPurpose = function (newPurpose: string) {
        this._currentPurposeKey = newPurpose;
    }

    canAfford(amount: number) {

        if(!IsLiving(this)) return true;

        return (this as Living).health >= amount * 2;
    }

    removeSpawnTarget(target: Entity) {

        for(var i = 0; i < this.#spawnTargets.length; i++) {
            const spawnTarget = this.#spawnTargets[i];
            if(spawnTarget.equals(target)) {
                this.#spawnTargets = this.#spawnTargets.splice(i, 1);
                break;
            }
        }
    }
}
