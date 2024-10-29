import PostConstruct from "../../../../ts/decorators/PostConstruct";
import { TechnologyTypes } from "../../../TechnologyTypes";
import GameSound from "../../../audio/GameSound";
import Logger from "../../../core/Logger";
import MessageLog from "../../../core/MessageLog";
import Events, { GameEvent } from "../../../events";
import { EquippedTechnology } from "../../equipment";
import Faction from "../../faction";
import { CharacterUtils } from "../CharacterUtils";
import Entity, { CharacterFilterOptions } from "../Entity";
import { Equipped, IsEquipped } from "./Equipped";
import { IsLiving, Living } from "./Living";
import { PlayableOptions } from "./Playable";
import { IsSentient, Sentient } from "./Sentient";

Events.List.CharacterAttacked = "CharacterAttacked";

export interface CharacterAttackedEvent extends GameEvent {
    attacker: Entity;
    attacked: Entity;
    equipped?: EquippedTechnology;
}

export interface Combative {
    aggression: number;
    aggressionRange: number;
    thornMultiplier: number;
    faction?: Faction;
    attack(target: Entity): number;
    canAttack(target: Entity): boolean;
    whyNotAttack(target: Entity): string;
}

export interface CombativeOptions {
    aggression?: number;
    faction?: Faction;
}

type Constructor<T = {}> = new (...args: any[]) => T;

// TODO: Maybe, ultimately, combative needs to extend equipped?

export function MakeCombative<T extends Constructor<Entity>>(Base: T) {
    return class CombativeClass extends Base implements Combative {

        static {
            PostConstruct(CombativeClass, [CombativeClass.prototype.postConstruct_Combative]);
        }

        private _thornMultiplier: number;
        private _aggression: number;
        private _faction: Faction;
    
        get faction() { return this._faction; }
        set faction(value) { this._faction = value; }

        get thornMultiplier() { return this._thornMultiplier; }        

        get aggression() { return this._aggression; }
        get aggressionRange() {
            // not vision. the range of the equipped attack
            if(IsEquipped(this)) {
                // tbh not sure what we were going for with this formula
                return this._aggression * (this?.equipment?.attack?.range || 0);
            }
            return 0;
        }

        constructor(...args: any) {
            super(...args);

            const [options]: (PlayableOptions & CombativeOptions)[] = args;
            
            this._aggression = options.aggression || 0;
            if(options.faction) {
                this.faction = options.faction;
            }
            else if(options.isPlayer) {
                this.faction = new Faction({ 
                    name: this.name,
                    color: this.color
                });
            }
        }

        private postConstruct_Combative() {
            if(IsSentient(this)) {
                const sentient = this as Sentient;
                sentient.ai.RegisterThinkMethod(this.followTarget.bind(this));
            }
        }

        private followTarget(elapsed: number) {
            if(IsSentient(this)) {
                const sentient = this as Entity & Sentient;
                if (sentient.ai.targetEntity) {
                    sentient.pointAtTarget(sentient.ai.targetEntity.position);
                }
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
                const range = equipped.technology.range;
                // maybe instead retrieve range difference? (how much closer would the target need to be?)
                // there are probably other scenarios where we'll want either that info or something close
                if(this.getDistance(target) > range) return "target is out of range";
            }

            return null;
        }
        
        attack(target: Entity): number {
            
            if(!this.canAttack(target)) {
                if(CharacterUtils.IsLocalPlayer(this)) {
                    const wrongSound = GameSound.Get('wrong');
                    wrongSound.Play();
                }
                return 0;
            }
            if(!IsEquipped(this)) return 0;
            if(!IsLiving(target)) return;
    
            const equipped = this.getEquipped(TechnologyTypes.ATTACK);
            const strAttr = this.getAttribute("Strength");
    
            // TODO: visuals for attacks (ideally trigger here & subscribe in renderer)

            this.playSound(target, equipped);
    
            equipped.lastFired = performance.now();
    
            const strengthMultiplier = 1.0 + (((strAttr?.value || 1) -1) / 10);
            const damage = (equipped.damage * strengthMultiplier);
            this._writeCombatLog(target, equipped, strengthMultiplier, damage);
            target.damage(damage, this);
    
            if(IsCombative(target) && IsEquipped(target)) {
                this._attackCharacter(target, equipped, damage);
            }
    
            return damage;
        }

        private playSound(target: Entity, equipped: EquippedTechnology) {
            // TODO: magic numbers
            let volume = 100; // default ... maybe pull audio master instead?
            if (CharacterUtils.IsLocalPlayer(target)
                || CharacterUtils.IsLocalPlayer(this)) {
                const NOT_PLAYER_ATTENUATOR = 0.5;
                volume *= NOT_PLAYER_ATTENUATOR;
            }

            const localPlayer = CharacterUtils.GetLocalPlayer();
            const distance = volume - this.position.distance(localPlayer.position);
            equipped.technology.playSound({
                volume: distance
            });
        }

        private _writeCombatLog(target: Entity, equipped: EquippedTechnology,
            strengthMultiplier: number, damage: number
        ) {
            
            // TODO: Can we have the combatLog subscribe instead?
            try {
                const combatLog = MessageLog.Get("Combat");    
                const message = `${this.name} ${equipped.name} ${target.name}`
                    + ` for ${equipped.damage} * ${strengthMultiplier}.`;
                combatLog.log(message, {
                    attacker: this.id,
                    attackee: target.id,
                    damage
                });
            } catch(ex) {
                Logger.warn(`Couldn't write to combat log: ${ex}`);
            }
        }
    
        private _attackCharacter(target: Entity & Equipped & Combative, equipped: EquippedTechnology, damage: number) {
    
            const combatLog = MessageLog.Get("Combat");
    
            // TODO: Is there no better way to manage this custom code?
            if(target.equipment) {
                const buff = target.equipment.buff?.technology;
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

export function IsCombative(entity: Entity): entity is Entity & Combative {
    const combative = entity as Entity & Combative;
    return typeof combative.attack === 'function';
}
