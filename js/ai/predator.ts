import AI from "./basic";
import Character from "../entities/character";
import Action from "../action";
import { TechnologyTypes } from "../TechnologyTypes";
import { Combative } from "../entities/character/mixins/Combative";
import { Equipped } from "../entities/character/mixins/Equipped";
import { CharacterUtils } from "../entities/character/CharacterUtils";
import { Sentient } from "../entities/character/mixins/Sentient";
import Entity from "../entities/character/Entity";

export default class PredatorAI extends AI {

    get character() {
        return super.character as Entity & Sentient & Equipped & Combative;
    }

    constructor(character: Entity & Sentient & Equipped & Combative) {
        super(character);
    }

    get equippedAttack() {
        
        const equipment = (this.character as Equipped).equipment;
        if(equipment == null) return null;

        return equipment.getEquipped(TechnologyTypes.ATTACK);;
    }
    
    think(elapsed: number) {

        // TODO: hunt fauna (the herbivores are gonna hunt food too)
        
        if(this.leashing == false) {
            if(this.#shouldTarget()) {
                // const wasTarget = this.#character.target;
                // TODO: Don't directly target the player.
                // Maybe we want to encourage attacking biggest threat first?
                const localPlayer = CharacterUtils.GetLocalPlayer() as Entity & Sentient & Combative;
                const targetFaction = localPlayer.faction;
                const closest = this.character.getClosestEntity({
                    distance: this.character.aggressionRange,
                    faction: targetFaction
                });
                if(closest != null) this.character.target = closest;
                /*
                if(wasTarget != this.#character.target && this.#character.target != null) {
                    const dist = this.#character.target.getDistance(this.#character);
                    console.debug(`Acquiring target ${this.#character.target.name}`);
                    console.debug(`Target distance: ${dist}. Aggression range: ${this.#character.aggressionRange}`);
                }
                */
            }
        }

        super.think(elapsed);

        if(this.character.target && this.equippedAttack != null
            && this.character.position.distance(this.targetPosition) < this.equippedAttack.range) {
            this.character.pointAtTarget(null);
        }

        // this.character.pointAtTarget(this.character.target);

        if(this.#shouldAttack()) {
            // this.#attack(this.character.target);
            this.#attack();
        }
    }

    #shouldTarget() {
        return this.character.aggression > 0 
            && this.character.aggressionRange > 0
            && !this.targetEntity;
    }

    #shouldAttack() {

        const targetRange = this.targetEntity?.position?.distance(this.character.position);

        return this.targetEntity
            && this.equippedAttack && this.equippedAttack.damage > 0
            // TODO: better consolidated, consistent, extensible 'range' check
            && this.equippedAttack.range >= targetRange;
    }

    #attack() {
        
        Action.List['attack'].callback({
            character: this.character
        });
    }
}
