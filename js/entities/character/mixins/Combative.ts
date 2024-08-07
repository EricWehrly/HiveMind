import StatusEffect, { StatusEffectCallbackOptions } from "../../../StatusEffect";
import { TechnologyTypes } from "../../../TechnologyTypes";
import WorldCoordinate from "../../../coordinates/WorldCoordinate";
import MessageLog from "../../../core/messageLog.mjs";
import Events from "../../../events";
import { Defer } from "../../../loop.mjs";
import Technology from "../../../technology";
import { EquippedTechnology } from "../../equipment";
import Entity from "../Entity";
import PlayableEntity from "../PlayableEntity";
import SentientEntity from "../SentientEntity";
import { Equipped, IsEquipped } from "./Equipped";
import { IsLiving, Living } from "./Living";

Events.List.CharacterTargetChanged = "CharacterTargetChanged";
Events.List.CharacterAttacked = "CharacterAttacked";

export interface CharacterAttackedEvent {
    attacker: Entity;
    attacked: Entity;
    equipped?: EquippedTechnology;
}

export interface Combative {
    target?: Entity;
    aggression: number;
    aggressionRange: number;
    thornMultiplier: number;
    attack(): number;
    applyStatusEffect(statusEffect: StatusEffect, duration: number): void;
}

export interface CombatantOptions {

}

type Axis = 'x' | 'y';
const axes: Axis[] = ['x', 'y'];

type Constructor<T = {}> = new (...args: any[]) => T;

// TODO: drop this from a SentientEntity to an entity
// but the way we handle target may make that difficult
export function MakeCombative<T extends Constructor<SentientEntity>>(Base: T) {
    return class extends Base implements Combative {

        private _thornMultiplier: number;
        private _statusEffects: Map<StatusEffect, number> = new Map();
        aggression: number = 0;
        // target: Entity;

        get target(): Entity {
            if(super.target instanceof Entity) {
                return super.target;
            }
            else return null;
        }

        set target(newValue) {
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
                console.log("Character has no attack skill equipped!");
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
    
            // TODO: visual and audio cues
    
            // TODO: is there a better way to check whether to play sound?
            // TODO: This needs a unit test for the volume level and entity difference
            /* TODO: make this work ... (port to hivemind character?)
            if(this._currentPurposeKey != "consume") {
                // compute volume based on distance
                // maybe every 10 pixels away = -1 volume?
                // (volume is between 0.0 and 1.0)
                const distance = 100 - this.position.distance(PlayableEntity.LOCAL_PLAYER.position);
                equipped.technology.playSound({
                    volume: distance
                });
            }
            */
    
            equipped.lastFired = performance.now();
    
            if(!IsLiving(target)) return;
    
            const strengthMultiplier = 1.0 + (((strAttr?.value || 1) -1) / 10);
            const damage = (equipped.damage * strengthMultiplier);
            const combatLog = MessageLog.Get("Combat");
            target.damage(damage, this);
    
            const message = `${this.name} attacked ${target.name}`
                + ` for ${equipped.damage} * ${strengthMultiplier}.`;
            combatLog.log(message, {
                attacker: this.id,
                attackee: target.id,
                damage
            });
    
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
