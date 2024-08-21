import StatusEffect, { StatusEffectCallbackOptions } from "../../../StatusEffect";
import { TechnologyTypes } from "../../../TechnologyTypes";
import WorldCoordinate from "../../../coordinates/WorldCoordinate";
import MessageLog from "../../../core/messageLog.mjs";
import Events, { GameEvent } from "../../../events";
import { Defer } from "../../../loop.mjs";
import Technology from "../../../technology";
import { EquippedTechnology } from "../../equipment";
import { CharacterUtils } from "../CharacterUtils";
import Entity from "../Entity";
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
    attack(): number;
    canAttack(): boolean;
    applyStatusEffect(statusEffect: StatusEffect, duration: number): void;
}

type Axis = 'x' | 'y';
const axes: Axis[] = ['x', 'y'];

type Constructor<T = {}> = new (...args: any[]) => T;

// TODO: Maybe, ultimately, combative needs to extend equipped?

// TODO: drop this from a SentientEntity to an entity
// but the way we handle target may make that difficult
export function MakeCombative<T extends Constructor<SentientEntity>>(Base: T) {
    return class extends Base implements Combative {

        private _thornMultiplier: number;
        private _statusEffects: Map<StatusEffect, number> = new Map();
        aggression: number = 0;

        // TODO: it'd be nice to just do entity
        get target(): Entity | WorldCoordinate {
            return super.target;
        }

        set target(newValue: Entity | WorldCoordinate) {
            super.target = newValue;
        }

        get thornMultiplier() { return this._thornMultiplier; }        

        get aggressionRange() {
            // not vision. the range of the equipped attack
            if(IsEquipped(this)) {
                return this.aggression * (this?.equipment?.attack?.range || 0);
            }
            return 0;
        }
        
        canAttack() {

            if(!IsEquipped(this)) return false;

            if(!(this.target instanceof Entity)
                || !IsLiving(this.target)) return false;

            const equipped = this.getEquipped(TechnologyTypes.ATTACK);
            if (equipped == null) {
                console.warn("Character has no attack skill equipped!");
                return false;
            }

            if (!equipped.ready) return false;

            if(!IsCombative(this.target)) return false;

            if(IsCombative(this)) {
                if (!equipped.technology.checkRange(this)) return false;
            }

            return true;
        }
        
        attack(): number {

            if(!this.canAttack()) return 0;
            if(!IsEquipped(this)) return 0;
    
            const equipped = this.getEquipped(TechnologyTypes.ATTACK);
            let target = this.target as Entity & Living;
            const strAttr = this.getAttribute("Strength");

            // TODO: magic numbers
            let volume = 100;   // default ... maybe pull audio master instead?
            // TODO: When we implement Playable as separate, we should have a "IsLocalPlayer" method that will also take an array
            if(CharacterUtils.IsLocalPlayer(target)
                || CharacterUtils.IsLocalPlayer(this)) {
                    const NOT_PLAYER_ATTENUATOR = 0.5;
                    volume *= NOT_PLAYER_ATTENUATOR;
                }
    
            // TODO: (trigger / subscribe) visual
    
            // TODO: This needs a unit test for the volume level and entity difference
                // compute volume based on distance
                // maybe every 10 pixels away = -1 volume?
                // (volume is between 0.0 and 1.0)
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
    
        applyStatusEffect(statusEffect: StatusEffect, duration: number) {
    
            this._statusEffects.set(statusEffect, this.getStatusEffect(statusEffect) + duration);
    
            const now = performance.now();
            const options: StatusEffectCallbackOptions = {
                startTime: now,
                endTime: now + duration,
                lastInterval: 0,
                target: this.target as Living,
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
                target.applyStatusEffect(technology.statusEffect, technology.statusEffectDuration);
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
    
        move(amount: number) {
    
            if (this.shouldMoveToTarget()) {
                for (const axis of axes) {
                    if (!this.atTarget(axis)) {
                        if (this.shouldStopOnAxis(axis, amount)) {
                            this.position[axis] = this.targetPosition[axis];
                            this.desiredMovementVector[axis] = 0;
                        } else {
                            this.position[axis] += this.desiredMovementVector[axis] * this.speed * amount;
                        }
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
    }
}

export function IsCombative(obj: Entity): obj is Entity & Combative {
    // TODO: do they have an attack method?
    return (obj as unknown) as Combative !== undefined;
}
