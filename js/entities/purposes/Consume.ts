import { TechnologyTypes } from "../../../engine/js/TechnologyTypes";
import HiveMindCharacter from "../character/HiveMindCharacter";
import { Living } from "../../../engine/js/entities/character/mixins/Living";
import { IsCombative } from "../../../engine/js/entities/character/mixins/Combative";
import { IsEquipped } from "../../../engine/js/entities/character/mixins/Equipped";
import { Sentient } from "../../../engine/js/entities/character/mixins/Sentient";
import CharacterPurpose from "./CharacterPurpose";

new CharacterPurpose({
    name: "Consume",
    think(character: HiveMindCharacter & Living & Sentient, elapsed: number) {
        if (character.ai.targetEntity) {
            character.pointAtTarget(character.ai.targetPosition);

            if(IsEquipped(character) && IsCombative(character)) {
                const attack = character.getEquipped(TechnologyTypes.ATTACK);
                // if(attack == null) console.warn(`Attack is null.`);
                if (character.target == null || (character.target as Living).dead) {
                    character.target = null;
                    character.currentPurposeKey = "return";
                } else if (attack && character.position.distance(character.ai.targetPosition) < attack.range
                    && (character.target as Living).dead != true) {
                    const attackAmount = character.attack(character.ai.targetEntity);
                    character.health += 2 * attackAmount;
                }
            }
        }
    }
});
