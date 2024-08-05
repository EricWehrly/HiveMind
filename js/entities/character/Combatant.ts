import { TechnologyTypes } from "../../TechnologyTypes";
import PredatorAI from "../../ai/predator";
import MessageLog from "../../core/messageLog.mjs";
import Events from "../../events";
import Technology from "../../technology";
import PlayableEntity from "./PlayableEntity";
import Equipment, { EquippedTechnology } from "../equipment";
import { IsLiving, Living } from "./mixins/Living";
import Entity from "./Entity";
import { Defer } from "../../loop.mjs";
import StatusEffect, { StatusEffectCallbackOptions } from "../../StatusEffect";
import { IsCombative } from "./mixins/Combative";

Events.List.CharacterTargetChanged = "CharacterTargetChanged";
Events.List.CharacterAttacked = "CharacterAttacked";

export interface CharacterAttackedEvent {
    attacker: Entity;
    attacked: Entity;
    equipped?: EquippedTechnology;
}

type Axis = 'x' | 'y';
const axes: Axis[] = ['x', 'y'];

export class Combatant extends PlayableEntity {

    _equipment: Equipment = new Equipment(this);
    private _technologies: any[] = [];
    _statusEffects: Map<StatusEffect, number> = new Map();
    aggression = 0;

    // TODO: this is a HivemindCharacter construct, but is needed in the 'attack' method
    // until we (probably) provide some kind of hook or overwrite for the attack method...
    _currentPurposeKey: string;

    private _thornMultiplier = 1;
    get thornMultiplier() { return this._thornMultiplier; }
    set thornMultiplier(newValue) { this._thornMultiplier = newValue; }

    get isHostile() {

        return this.isPlayer || this.hasEquipped(TechnologyTypes.ATTACK);
    }

    get aggressionRange() {
        // not vision. the range of the equipped attack
        return this.aggression * (this?.equipment?.attack?.range || 0);
    }

    // this may get confusing
    get maxWanderDistance() {
        const aggressionRange = this.aggressionRange;
        if(aggressionRange > 0) return aggressionRange * 1.5;
        else return this._maxWanderDistance;
    }

    get hostile() {

        // TODO: faction calculation
        return this.ai instanceof PredatorAI;
    }

    get equipment() {
        return this._equipment;
    }

    get technologies() {
        return this._technologies;
    }

    getAttackRange(): number {
        const attack = this.getEquipped(TechnologyTypes.ATTACK);
        if(attack && attack.range) return attack.range;
    }

    getEquipped = function (techType: TechnologyTypes): EquippedTechnology {
        return this._equipment.getEquipped(techType);
    }

    hasEquipped = function (techType: Technology | TechnologyTypes): boolean {
        return this.getEquipped(techType) != null;
    }

    equip = function (technology: Technology) {
        this._equipment.equip(technology);
    }

    hasTechnology(technology: Technology) {

        return this._technologies.includes(technology);
    }

    // this either needs an event or to be moved into equipment.mjs
    AddTechnology(technologyName: string) {
        
        const technology = Technology.Get(technologyName);
        console.debug(`Adding technology ${technology.name} to character ${this.name}`);
        this._technologies.push(technology);

        if(technology.type) {
            if (!this.hasEquipped(technology.type)) {
                this.equip(technology);
            }

            console.debug(`${technology.type} equipped: ${this.getEquipped(technology.type).name}`);
        }
        
        // CharacterType[character.target.characterType].isStudied = true;
        if(technology.research) {

            // const research = Research.Get(technology.research);
            technology.research.enabled = true;
        }
    }

    canAttack() {

        if(!(this.target instanceof Entity)
            || !IsLiving(this.target)) return false;
        
        const equipment = this.equipment;
        if(equipment == null) return false;

        const equipped = this.getEquipped(TechnologyTypes.ATTACK);
        if (equipped == null) {
            console.log("Character has no attack skill equipped!");
            return false;
        }

        if (!equipped.ready) return false;

        if(!(this.target instanceof Combatant)) return false;

        if(IsCombative(this)) {
            if (!equipped.technology.checkRange(this)) return false;
        }

        return true;
    }

    attack() {

        if(!this.canAttack()) return 0;

        const equipped = this.getEquipped(TechnologyTypes.ATTACK);
        let target = this.target as Entity & Living;
        const strAttr = this.getAttribute("Strength");

        // TODO: visual and audio cues

        // TODO: is there a better way to check whether to play sound?
        // TODO: This needs a unit test for the volume level and entity difference
        if(this._currentPurposeKey != "consume") {
            // compute volume based on distance
            // maybe every 10 pixels away = -1 volume?
            // (volume is between 0.0 and 1.0)
            const distance = 100 - this.position.distance(PlayableEntity.LOCAL_PLAYER.position);
            equipped.technology.playSound({
                volume: distance
            });
        }

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

        if(target instanceof Combatant) {
            this._attackCharacter(target as Combatant, equipped, damage);
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

    /**
     * 
     * @param {StatusEffect} statusEffect 
     * @param {int} duration ms
     */
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

    private _attackCharacter(target: Combatant, equipped: EquippedTechnology, damage: number) {

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

    think(): void {
        super.think();

        if(this.isPlayer) {

            // for now just target the closest thing. get more complicated later
            let dist = 5;
            const attack = this.getEquipped(TechnologyTypes.ATTACK);
            if(attack && attack.range) dist = attack.range;
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
            this.afterMove();
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
