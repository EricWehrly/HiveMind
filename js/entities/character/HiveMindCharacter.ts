import EntityAttribute from '../../../engine/js/entities/EntityAttribute';
import Character from '../../../engine/js/entities/character';
import Events from '../../../engine/js/events';
import Entity from '../../../engine/js/entities/character/Entity';
import { IsLiving, Living } from '../../../engine/js/entities/character/mixins/Living';
import { Combative, IsCombative } from '../../../engine/js/entities/character/mixins/Combative';
import { IsEquipped } from '../../../engine/js/entities/character/mixins/Equipped';
import { CharacterUtils } from '../../../engine/js/entities/character/CharacterUtils';
import { IsSentient } from '../../../engine/js/entities/character/mixins/Sentient';
import { IsPlayable } from '../../../engine/js/entities/character/mixins/Playable';
import CharacterPurpose from '../purposes/CharacterPurpose';
import { EntityOptions } from '../../../engine/js/entities/character/EntityOptions';

export interface HivemindCharacterOptions extends EntityOptions {
    currentPurposeKey?: string;
    spawnPurposeKey?: string;
}

export default class HiveMindCharacter extends Character {

    static get SUBDIVIDE_COST() { return 10; }

    // TODO: constrain this to possible purposes, maybe by migrating type to purpose instead
    // (...once purpose is a proper class :/ )
    private _currentPurposeKey: string = null;
    private _purpose: CharacterPurpose;
    // this should be managed as a 'dynmic' property ... 
    // we're only attaching it to the character because we want it garbage collected there
    lastHeal: number = 0;

    #spawnTargets: Entity[] = [];

    get spawnTargets() {
        return this.#spawnTargets;
    }

    get purpose() { return this._purpose; }
    // just use purpose setter that takes string or characterpurpose?
    set currentPurposeKey(value: string) {
        if(value == undefined) return;

        this._currentPurposeKey = value;
        this._purpose = CharacterPurpose.Get(this._currentPurposeKey);
    }

    // TODO: Mark this private and use a static create (makes the class not extensible)
    // once we've turned Building into a mixin ... maybe?
    constructor(options: HivemindCharacterOptions) {
        // @ts-expect-error
        if(!options.calledByFactory) {
            debugger;
            console.warn(`HiveMindCharacter should be created by the factory.`);
        }
        // const key = JSON.stringify(options.currentPurposeKey);
        // delete options.currentPurposeKey;
        super(options);

        this.currentPurposeKey = options.currentPurposeKey;

        this.addAttribute(new EntityAttribute({
            name: 'Strength',
            value: 1,
            baseCost: 40,
            costFunction: this.logarithmicCost
        }));

        Events.Subscribe(Events.List.CharacterDied, this.removeSpawnTarget.bind(this));
    }

    canBeStudied(byWhom: HiveMindCharacter) {
        // TODO: use "or"s rather than all these if's
        // this is something that would probably automatically benefit from 
        // a magic function-level caching implementation
        if(IsPlayable(this)
            && this.isPlayer) return false;
        if(IsLiving(this)
            && (this as Living).dead) return false;
        if(IsSentient(this)
            // @ts-expect-error     // we probably want to try to make this work correctly ...
            && this.ai != null) return false;
        if(IsCombative(this) && IsCombative(byWhom)) {
            if(byWhom?.faction != null && this.faction == byWhom.faction) return false;
        }
        if(this.characterType && this.characterType.isStudied == true) return false;

        return true;
    }

    canBeEaten(byWhom: HiveMindCharacter) {

        if(this.canBeStudied(byWhom)) return false;

        return true;
    }

    get toolTipMessage() {

        const localPlayer = CharacterUtils.GetLocalPlayer() as HiveMindCharacter & Combative;

        let toolTipMessage = "";

        if(this.name) {
            toolTipMessage = this.name + '<br />';
        }

        if(IsEquipped(this)) {    
            if(this.equipment?.attack != null) {
                toolTipMessage += `Equipped: ${this.equipment.attack.name}<br />`;
            }
        }
        
        if(IsCombative(this)) {
            if(this.faction != localPlayer.faction
                && this.aggression != null) {
                toolTipMessage += `Aggression Range: ${Math.round(this.aggressionRange)}<br />`;
            }
        }

        if(this.canBeStudied(localPlayer)) {            
            toolTipMessage += "'F' - Study";
        }

        if(this.canBeEaten(localPlayer)) {
            toolTipMessage += "'F' - Nom";
        }

        return toolTipMessage;
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
