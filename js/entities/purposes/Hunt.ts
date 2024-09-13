import { TechnologyTypes } from "../../../engine/js/TechnologyTypes";
import HiveMindCharacter from "../character/HiveMindCharacter";
import { IsEquipped } from "../../../engine/js/entities/character/mixins/Equipped";
import CharacterPurpose from "./CharacterPurpose";

new CharacterPurpose({
    name: "Hunt",
    think(character: HiveMindCharacter, elapsed: number) {
        if(IsEquipped(character)) {
            const attack = character.getEquipped(TechnologyTypes.ATTACK);
            if (attack == null) console.warn(`Attack is null.`);
            const consumePurpose = CharacterPurpose.Get("consume");
            consumePurpose.think(character, elapsed);
        }
    }
});
