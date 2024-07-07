import { TechnologyTypes } from "../../TechnologyTypes";
import PredatorAI from "../../ai/predator.mjs";
import WorldCoordinate from "../../coordinates/WorldCoordinate";
import MessageLog from "../../core/messageLog.mjs";
import Events from "../../events.mjs";
import Technology from "../../technology.mjs";
import PlayableEntity from "./PlayableEntity";
import Character from "../character";
import Equipment from "../equipment";

// @ts-ignore
Events.List.CharacterTargetChanged = "CharacterTargetChanged";

type Axis = 'x' | 'y';
const axes: Axis[] = ['x', 'y'];

export class Combatant extends PlayableEntity {

    _equipment: Equipment = new Equipment(this);
    private _technologies: any[] = [];
    aggression = 0;
    private _target: any;

    // TODO: this is a HivemindCharacter construct, but is needed in the 'attack' method
    // until we (probably) provide some kind of hook or overwrite for the attack method...
    _currentPurposeKey: string;

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

    get target() {
        return this._target;
    }

    set target(newValue) {
        if (newValue === undefined || newValue == this._target) return;

        if(newValue == this._target) return;
        var oldValue = this._target;

        if(newValue instanceof WorldCoordinate) {
            this._target = {
                position: newValue
            }
        } else this._target = newValue;

        // @ts-ignore
        Events.RaiseEvent(Events.List.CharacterTargetChanged, {
            character: this,
            from: oldValue,
            to: this._target
        });
        console.debug(`New target for ${this.name}: ${this?.target?.position?.x}, ${this?.target?.position?.y}`);
    }

    constructor(options: any) {
        super(options);

        if(options.technologies) {
            for(var tech of options.technologies) {
                this.AddTechnology(tech);
            }
            delete options.technologies;
        }
    }

    getEquipped = function (techType: TechnologyTypes): Technology {
        return this._equipment.getEquipped(techType);
    }

    hasEquipped = function (techType: Technology | TechnologyTypes): boolean {
        return this.getEquipped(techType) != null;
    }

    equip = function (technology: Technology) {
        this._equipment.equip(technology);
    }

    hasTechnology(technology: Technology) {

        if (typeof technology == "string") {
            technology = Technology.Get(technology);
        } // else warn?
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

    shouldStopTargeting(distance = 6) {

        return this.target
            && (this.target.isAlive == false || 
                this.target.getDistance(this) > distance);
    }

    canAttack() {

        // eventually, we won't want this to be the case ...
        if(!this.target) return false;
        
        const equipment = this.equipment;
        if(equipment == null) return false;

        const equipped = this.getEquipped(TechnologyTypes.ATTACK);
        if (equipped == null) {
            console.log("Character has no attack skill equipped!");
            return false;
        }

        if (!equipped.checkDelay()) return false;

        if(!(this.target instanceof Character)) return false;

        if (!equipped.checkRange(this)) return false;

        return true;
    }

    attack() {

        if(!this.canAttack()) return 0;

        const equipped = this.getEquipped(TechnologyTypes.ATTACK);

        // TODO: visual and audio cues

        const target = this.target;
        const strAttr = this.getAttribute("Strength");

        // TODO: is there a better way to check whether to play sound?
        if(this._currentPurposeKey != "consume") {
            // compute volume based on distance
            // maybe every 10 pixels away = -1 volume?
            // (volume is between 0.0 and 1.0)
            const distance = 100 - this.position.distance(PlayableEntity.LOCAL_PLAYER.position);
            equipped.playSound({
                volume: distance
            });
        }

        const strengthMultiplier = 1.0 + (((strAttr?.value || 1) -1) / 10);
        const damage = (equipped.damage * strengthMultiplier);
        const combatLog = MessageLog.Get("Combat");
        target.health -= damage;

        const message = `${this.name} attacked ${target.name}`
            + ` for ${equipped.damage} * ${strengthMultiplier}.`;
        combatLog.log(message, {
            attacker: this.id,
            attackee: target.id,
            damage
        });

        if(equipped.statusEffect) {
            target.applyStatusEffect(equipped.statusEffect, equipped.statusEffectDuration);
        }

        if(target.equipment) {
            const buff = target.equipment[TechnologyTypes.BUFF];
            if(buff) {                            
                const thornDamage = buff.thorns * target.thornMultiplier;
                this.health -= thornDamage;

                const message = `${target.name} thorns ${this.name}`
                    + ` for ${buff.thorns} * ${target.thornMultiplier}.`;
                combatLog.log(message, {
                    attacker: this.id,
                    attackee: target.id,
                    damage
                });
            }
        }

        return damage;
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
                        this.position[axis] = this.target.position[axis];
                        this.velocity[axis] = 0;
                    } else {
                        this.position[axis] += this.velocity[axis] * this.speed * amount;
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
        return Math.abs(this.position[axis] - this.target.position[axis]) < this.speed * amount;
    }

    atTarget(axis: Axis) {
        return this.target && this.target.position[axis] == this.position[axis];
    }
}
