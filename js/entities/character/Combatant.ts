import { TechnologyTypes } from "../../TechnologyTypes";
import PredatorAI from "../../ai/predator.mjs";
import Point from "../../baseTypes/point.mjs";
import MessageLog from "../../core/messageLog.mjs";
import Events from "../../events.mjs";
import Technology from "../../technology.mjs";
import Character from "../character";
import Equipment from "../equipment";
import SentientLivingEntity from "./SentientLivingEntity";

export class Combatant extends SentientLivingEntity {

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
        // if ai is predator
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

        if(newValue instanceof Point) {
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
            const distance = 100 - this.position.distance(Character.LOCAL_PLAYER.position);
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
}
