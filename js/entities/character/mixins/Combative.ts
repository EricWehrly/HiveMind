import StatusEffect, { StatusEffectCallbackOptions } from "../../../StatusEffect";
import { TechnologyTypes } from "../../../TechnologyTypes";
import WorldCoordinate from "../../../coordinates/WorldCoordinate";
import MessageLog from "../../../core/messageLog.mjs";
import Events, { GameEvent } from "../../../events";
import { Defer } from "../../../loop.mjs";
import Technology from "../../../technology";
import { EquippedTechnology } from "../../equipment";
import Faction from "../../faction";
import { CharacterUtils } from "../CharacterUtils";
import Entity, { CharacterFilterOptions } from "../Entity";
import SentientEntity from "../SentientEntity";
import { Equipped, IsEquipped } from "./Equipped";
import { IsLiving, Living } from "./Living";

Events.List.CharacterTargetChanged = "CharacterTargetChanged";
Events.List.CharacterAttacked = "CharacterAttacked";

// TODO: use the type when raising the event
// which is currently in SentientEntity.target.set
export interface CharacterTargetChangedEvent extends GameEvent {
    character: SentientEntity;
    from: Entity | WorldCoordinate;
    to: Entity | WorldCoordinate;
}

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
    getAttackObstacle(target: Entity): string;
    applyStatusEffect(target: Entity, statusEffect: StatusEffect, duration: number): void;
}

export interface CombativeOptions {
    aggression?: number;
    faction: Faction;
}

type Axis = 'x' | 'y';
const axes: Axis[] = ['x', 'y'];

type Constructor<T = {}> = new (...args: any[]) => T;

// TODO: Maybe, ultimately, combative needs to extend equipped?

// TODO: drop this from a SentientEntity to an entity
// but the way we handle target may make that difficult
export function MakeCombative<T extends Constructor<SentientEntity>>(Base: T, combativeOptions: CombativeOptions) {
    return class CombativeClass extends Base implements Combative {

        private _thornMultiplier: number;
        private _statusEffects: Map<StatusEffect, number> = new Map();
        private _aggression: number = combativeOptions?.aggression || 0;
        private _faction: Faction = combativeOptions?.faction;
    
        get faction() { return this._faction; }
        set faction(value) { this._faction = value; }

        // TODO: it'd be nice to just do entity
        get target(): Entity | WorldCoordinate {
            return super.target;
        }

        set target(newValue: Entity | WorldCoordinate) {
            super.target = newValue;
        }

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
            
            if(deconstructed.isPlayer) {
                this.faction = new Faction({ 
                    name: this.name,
                    color: this.color
                });
            }
        }
        
        canAttack(target: Entity) {
            return this.getAttackObstacle(target) == null;
        }

        getAttackObstacle(target: Entity): string {

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

            if(!this.canAttack(target)) return 0;
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

        // this whole 'status effect' stack could hopefully be a mixin
        getStatusEffect(statusEffect: StatusEffect) {
    
            if(!this._statusEffects.has(statusEffect)) {
                this._statusEffects.set(statusEffect, performance.now());
            }
            
            return this._statusEffects.get(statusEffect);
        }
    
        statusEffectThink() {
            for (let [statusEffect, effectEnd] of this._statusEffects.entries()) {
                if (effectEnd > performance.now()) {
                    this._statusEffects.delete(statusEffect);
                }
            }
        }
    
        applyStatusEffect(target: Entity, statusEffect: StatusEffect, duration: number) {
    
            this._statusEffects.set(statusEffect, this.getStatusEffect(statusEffect) + duration);
    
            const now = performance.now();
            const options: StatusEffectCallbackOptions = {
                startTime: now,
                endTime: now + duration,
                lastInterval: 0,
                target: target as Living,
                duration
            }
            if(options.target == null) debugger;
            Defer(function() {
                statusEffect.callback(options)
            }, statusEffect.interval + 1);
        }
    
        private _attackCharacter(target: Entity & Equipped & Combative, equipped: EquippedTechnology, damage: number) {
    
            const combatLog = MessageLog.Get("Combat");
            const technology = equipped.technology;
    
            if(technology.statusEffect) {
                target.applyStatusEffect(target, technology.statusEffect, technology.statusEffectDuration);
            }
    
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
    
        // TODO: properly hook to sentient method ...
        think(): void {
            super.think();

            this.statusEffectThink();
    
            if(this.isPlayer) {

                if(IsEquipped(this)) {        
                    // for now just target the closest thing. get more complicated later
                    const dist = this.getAttackRange() || 5;
                    const closestOptions = {
                        distance: dist,
                        filterChildren: true,
                        // priorities: [CharacterType.]
                    };
                    this.target = this.getClosestEntity(closestOptions);
        
                    /*
                    if(this.shouldStopTargeting()) {
                        this.target = null;
                    }
                    // TODO: Use range of equipped attack?
                    if (!this.target || !this.target.isAlive) {
                        this.target = this.getClosestEntity({ distance: 5 });
                    }
                    */
                }
            }
        }
    
        // TODO: move this entire logic to basic.ts ai
        // once we've extracted sentient to be a non-entity type ...
        move(amount: number) {
    
            if (this.shouldMoveToTarget()) {
                for (const axis of axes) {
                    if (!this.atTarget(axis)) {
                        const desiredPosition = {
                            x: this.position.x,
                            y: this.position.y
                        }
                        if (this.shouldStopOnAxis(axis, amount)) {
                            desiredPosition[axis] = this.targetPosition[axis];
                            this.desiredMovementVector[axis] = 0;
                        } else {
                            desiredPosition[axis] += this.desiredMovementVector[axis] * this.speed * amount;
                        }
                        this.position = desiredPosition;
                    }
                }
                // @ts-expect-error
                if(this.afterMove) this.afterMove();
            } else {
                super.move(amount);
            }
        }
    
        shouldMoveToTarget() {
            return this.ai != null && this.target != null;
        }
    
        shouldStopOnAxis(axis: Axis, amount: number) {
            return Math.abs(this.position[axis] - this.targetPosition[axis]) < this.speed * amount;
        }
    
        atTarget(axis: Axis) {
            return this.target && this.targetPosition[axis] == this.position[axis];
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
