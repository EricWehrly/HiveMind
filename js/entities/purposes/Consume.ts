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
            const targetPosition = character.ai.targetEntity.position;
            character.pointAtTarget(targetPosition);

            if(IsEquipped(character) && IsCombative(character)) {
                if (character.target == null || (character.target as Living).dead) {
                    character.target = null;
                    character.currentPurposeKey = "return";
                } else if(character.canAttack) {
                    const attackAmount = character.attack(character.ai.targetEntity);
                    // this multiplier should be defined somewhere ...
                    character.health += 2 * attackAmount;
                }
            }
        }
    }
});
