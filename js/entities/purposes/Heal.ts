import { TechnologyTypes } from "../../../engine/js/TechnologyTypes";
import HiveMindCharacter from "../character/HiveMindCharacter";
import { IsEquipped } from "../../../engine/js/entities/character/mixins/Equipped";
import CharacterPurpose from "./CharacterPurpose";
import { CharacterUtils } from "../../../engine/js/entities/character/CharacterUtils";
import { Combative } from "../../../engine/js/entities/character/mixins/Combative";
import Entity from "../../../engine/js/entities/character/Entity";
import { IsLiving, Living } from "../../../engine/js/entities/character/mixins/Living";
import Resource from "../../../engine/js/entities/resource";

new CharacterPurpose({
    name: "Heal",
    interval: 2000,
    range: 20,
    amount: 5,
    think(character: HiveMindCharacter, elapsed: number) {

        const timeSinceLastHeal = performance.now() - character.lastHeal;
        if (character.lastHeal != null
            && timeSinceLastHeal < this.interval) {
            return;
        }

        const localPlayer = CharacterUtils.GetLocalPlayer() as HiveMindCharacter & Combative;
        const closest = character.getClosestEntity({
            distance: this.range,
            // TODO: 'faction' has to be pushed further down the stack for this to work <3
            faction: localPlayer.faction
        }) as Entity & Living;

        if(closest && IsLiving(closest)) {
            const maxHeal = closest.maxHealth - closest.health;
            const amountToHeal = Math.min(maxHeal, this.amount);
            if(amountToHeal < 1) return;

            const food = Resource.Get("food")?.value || 0;
            if(food > amountToHeal) {
                Resource.Get("food").value -= amountToHeal;
                closest.health += amountToHeal;
                
                character.lastHeal = performance.now();
            }
        }
    }
});
