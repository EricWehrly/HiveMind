import AI from "../../engine/js/ai/basic";
import { EntityRelationship, EntityRelationshipType } from "../../engine/js/behavior/EntityRelationship";
import Entity from "../../engine/js/entities/character/Entity";
import { Combative, IsCombative } from "../../engine/js/entities/character/mixins/Combative";
import HiveMindCharacter from "../entities/character/HiveMindCharacter";

export class HiveMindCharacterAI extends AI {

    private get hiveMindCharacter() {
        return this.character as HiveMindCharacter;
    }

    think(elapsed: number = 0) {

        // stupid hack
        let origTarget = null;
        // was this supposed to "save" target entity, or position, or both?
        if(this.hiveMindCharacter.purpose) origTarget = this.targetEntity;

        super.think(elapsed);

        // maybe the purposes should be specific AI implementations instead ...
        if (this.hiveMindCharacter.purpose) {
            if(origTarget) this.targetEntity = origTarget;
            this.hiveMindCharacter.purpose.think(this.hiveMindCharacter, elapsed);
        }
    }

    determineRelationship(entity: Entity): EntityRelationship {
        // if it's food, 'hostile' (because that also handles "I want to eat it")
        const relationship: EntityRelationship = {
            type: EntityRelationshipType.Neutral,
            amount: 0
        }

        // if the owning character isn't combative, then it doesn't make sense to process this, really
        if(!IsCombative(this.character)) {
            console.warn('Why are we processing a noncombatant?');
            return relationship;
        }

        // food could still be combative
        if(IsCombative(entity)) {
            const threatAmount = this.getThreatAmount(entity);
            const friendAmount = this.getFriendAmount(entity);
            if(friendAmount > 0) {
                relationship.type = EntityRelationshipType.Friendly;
                relationship.amount = friendAmount;
            }
            else if(threatAmount > 0) {
                relationship.type = EntityRelationshipType.Hostile;
                relationship.amount = threatAmount;
            }
        }
        if(this.isFood(entity)) {
            relationship.type = EntityRelationshipType.Hostile;
            relationship.amount = 1;
        }

        return relationship;
    }

    private isFood(entity: Entity) {
        return entity.name.toLocaleLowerCase() == "food";
    }

    private getThreatAmount(entity: Entity & Combative) {
        // TODO: strength attribute (HiveMindCharacter defines)
        // not their aggressiveness
        // but let's see how well this cheap approximation does
        return entity.aggression;
    }

    private getFriendAmount(entity: Entity & Combative) {
        // @ts-expect-error
        const thisCombative = this as Entity & Combative;
        if(entity.faction && thisCombative.faction &&
            entity.faction.equals(thisCombative.faction)) {
            return 1;
        }
        return 0;
    }
}
