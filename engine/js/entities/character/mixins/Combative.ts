import { TechnologyTypes } from "../../../TechnologyTypes";
import GameSound from "../../../audio/GameSound";
import WorldCoordinate from "../../../coordinates/WorldCoordinate";
import MessageLog from "../../../core/MessageLog";
import Events, { GameEvent } from "../../../events";
import Technology from "../../../technology";
import { EquippedTechnology } from "../../equipment";
import Faction from "../../faction";
import { CharacterUtils } from "../CharacterUtils";
import Entity, { CharacterFilterOptions } from "../Entity";
import { Equipped, IsEquipped } from "./Equipped";
import { IsLiving, Living } from "./Living";

Events.List.CharacterAttacked = "CharacterAttacked";

export interface CharacterAttackedEvent extends GameEvent {
    attacker: Entity;
    attacked: Entity;
    equipped?: EquippedTechnology;
}

export interface Combative {
    target?: Entity | WorldCoordinate;
    aggression: number;
    aggressionRange: number;
    thornMultiplier: number;
    faction: Faction;
    attack(target: Entity): number;
    canAttack(target: Entity): boolean;
    whyNotAttack(target: Entity): string;
}

export interface CombativeOptions {
    aggression?: number;
    faction: Faction;
}

type Axis = 'x' | 'y';
const axes: Axis[] = ['x', 'y'];

type Constructor<T = {}> = new (...args: any[]) => T;

// TODO: Maybe, ultimately, combative needs to extend equipped?

export function MakeCombative<T extends Constructor<Entity>>(Base: T, combativeOptions: CombativeOptions) {
    return class CombativeClass extends Base implements Combative {

        private _thornMultiplier: number;
        private _aggression: number = combativeOptions?.aggression || 0;
        private _faction: Faction = combativeOptions?.faction;
    
        get faction() { return this._faction; }
        set faction(value) { this._faction = value; }

        get thornMultiplier() { return this._thornMultiplier; }        

        get aggression() { return this._aggression; }
        get aggressionRange() {
            // not vision. the range of the equipped attack
            if(IsEquipped(this)) {
                return this._aggression * (this?.equipment?.attack?.range || 0);
            }
            return 0;
        }

        constructor(...args: any) {
            super(...args);

            const [deconstructed] = args;
            
            if(deconstructed.faction) {
                this.faction = deconstructed.faction;
            }
            else if(deconstructed.isPlayer) {
                this.faction = new Faction({ 
                    name: this.name,
                    color: this.color
                });
            }
        }
        
        canAttack(target: Entity) {
            const reason = this.whyNotAttack(target);

            // console.warn(reason);

            return reason == null;
        }

        whyNotAttack(target: Entity): string {

            if(!IsEquipped(this)) return "No equipment";

            if(!(target instanceof Entity)
                || !IsLiving(target)) return "target is not living";

            const equipped = this.getEquipped(TechnologyTypes.ATTACK);
            if (equipped == null) {
                return "No attack skill equipped";
            }

            if (!equipped.ready) return "equipped attack is not ready";

            if(!IsCombative(target)) return "target is not combative";

            if(IsCombative(this)) {
                // maybe instead retrieve range difference? (how much closer would the target need to be?)
                // there are probably other scenarios where we'll want either that info or something close
                if (!equipped.technology.checkRange(this)) return "target is out of range";
            }

            return null;
        }
        
        attack(target: Entity): number {
            // we need a better way to "unwrap" from action.ts
            // @ts-expect-error
            if(target.character) target = target.character;

            if(!this.canAttack(target)) {
                const wrongSound = GameSound.Get('wrong');
                wrongSound.Play();
                return 0;
            }
            if(!IsEquipped(this)) return 0;
    
            const equipped = this.getEquipped(TechnologyTypes.ATTACK);
            const strAttr = this.getAttribute("Strength");

            // TODO: magic numbers
            let volume = 100;   // default ... maybe pull audio master instead?
            // TODO: When we implement Playable as separate, we should have a "IsLocalPlayer" method that will also take an array
            if(CharacterUtils.IsLocalPlayer(target)
                || CharacterUtils.IsLocalPlayer(this)) {
                    const NOT_PLAYER_ATTENUATOR = 0.5;
                    volume *= NOT_PLAYER_ATTENUATOR;
                }
    
            // TODO: visuals for attacks (ideally trigger here & subscribe in renderer)
    
            const localPlayer = CharacterUtils.GetLocalPlayer();
            const distance = 100 - this.position.distance(localPlayer.position);
            equipped.technology.playSound({
                volume: distance
            });
    
            equipped.lastFired = performance.now();
    
            if(!IsLiving(target)) return;
    
            const strengthMultiplier = 1.0 + (((strAttr?.value || 1) -1) / 10);
            const damage = (equipped.damage * strengthMultiplier);
            target.damage(damage, this);
            
            // TODO: Can we have the combatLog subscribe instead?
            try {
                const combatLog = MessageLog.Get("Combat");    
                const message = `${this.name} attacked ${target.name}`
                    + ` for ${equipped.damage} * ${strengthMultiplier}.`;
                combatLog.log(message, {
                    attacker: this.id,
                    attackee: target.id,
                    damage
                });
            } catch(ex) {
                console.warn(`Couldn't write to combat log: ${ex}`);
            }
    
            if(IsCombative(target) && IsEquipped(target)) {
                this._attackCharacter(target, equipped, damage);
            }
    
            return damage;
        }
    
        private _attackCharacter(target: Entity & Equipped & Combative, equipped: EquippedTechnology, damage: number) {
    
            const combatLog = MessageLog.Get("Combat");
    
            if(target.equipment) {
                // TODO: Is this working right?
                const buff = target.equipment.buff as Technology;
                if(buff) {
                    const thornDamage = buff.thorns * target.thornMultiplier;
                    (this as Living).health -= thornDamage;
    
                    const message = `${target.name} thorns ${this.name}`
                        + ` for ${buff.thorns} * ${target.thornMultiplier}.`;
                    combatLog.log(message, {
                        attacker: this.id,
                        attackee: target.id,
                        damage
                    });
                }
            }
    
            const event: CharacterAttackedEvent = {
                id: null,
                attacker: this,
                attacked: target,
                equipped
            };
            Events.RaiseEvent(Events.List.CharacterAttacked, event);
        }
        
        shouldFilterCharacter(character: Entity & Combative, options: CharacterFilterOptions & CombativeOptions) {

            if(options.faction && character.faction != options.faction) {
                return true;
            }

            return super.shouldFilterCharacter(character, options);
        }
    }
}

export function IsCombative(obj: Entity): obj is Entity & Combative {
    // TODO: do they have an attack method?
    return (obj as unknown) as Combative !== undefined;
}
