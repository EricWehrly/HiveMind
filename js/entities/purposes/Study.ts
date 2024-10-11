import Research from "../../../engine/js/research";
import HiveMindCharacter from "../character/HiveMindCharacter";
import { IsEquipped } from "../../../engine/js/entities/character/mixins/Equipped";
import { Sentient } from "../../../engine/js/entities/character/mixins/Sentient";
import CharacterPurpose from "./CharacterPurpose";
import { Living } from "../../../engine/js/entities/character/mixins/Living";

new CharacterPurpose({
    name: "Study",
    think(character: HiveMindCharacter & Sentient, elapsed: number) {
        if (character.ai.targetEntity) {
            const targetPosition = character.ai.targetEntity.position;
            character.pointAtTarget(targetPosition);

            if (character.position.near(targetPosition)) {
                if ((character.ai.targetEntity as Living).dead == true) {
                    // TODO: contemplate loving monica
                    // TODO: support > 1 technology
                    if(IsEquipped(character) && IsEquipped(character.ai.targetEntity)) {
                        if (character.ai.targetEntity.technologies && character.ai.targetEntity.technologies.length > 0) {
                            character.AddTechnology(character.ai.targetEntity.technologies[0]);
                        }
                    }
                    // TODO: not until reabsorbed (after 'return')
                    if (character.ai.targetEntity.characterType) {
                        character.ai.targetEntity.characterType.isStudied = true;
                        const research = Research.Get(character.ai.targetEntity.characterType);
                        research.enabled = true;
                    }
                    character.ai.targetEntity = null;
                    character.currentPurposeKey = "return";
                    // } else character.target.health -= (character.damage || 1) * (elapsed / 1000);
                } else {
                    (character.ai.targetEntity as Living).health = 0; // cheat for make testing easier
                }
            }
        }        
    }
});
