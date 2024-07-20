import Technology from "../../../engine/js/technology.mjs";
import HiveMindCharacter from "../character/HiveMindCharacter";
import Purposes from "./character-purposes";
import CharacterType from "../CharacterType";
import { Slimey } from "../character/mixins/Slimey";
import { Grower } from "../character/mixins/Grower";

Purposes["return"] = {
    // do not show this one in menus!
    name: "return",
    think: function (character: HiveMindCharacter & Slimey, elapsed: number) {

        if (!character.target) {
            character.target = character.parent;
        }
        character.pointAtTarget(character.targetPosition);

        // TODO: if collision boxes overlap ..
        // if(character.targetEntity.area.contains(character.position)) {
        if (character.position.equals(character.targetPosition)) {
            character.Reabsorb();
        }
    }
};

// we kind of need to be able to "ask" if the thing to be spawned can do what it's purpose should be
Purposes["spawn"] = {
    name: "spawn",
    interval: 3000,
    think: function (character: HiveMindCharacter & Slimey & Grower, elapsed: number) {

        // we could probably track "amount elapsed" in the character, 
        // rather than needing to call performance.now here
        const timeSinceLastSpawn = performance.now() - character.lastSpawn;
        if (character.lastSpawn != null
            && timeSinceLastSpawn < this.interval) {
            return;
        }

        const purpose = character.characterType._spawnPurposeKey;
        let targetType;
        // both consume/hunt and Food/Animal should come from enums
        if (purpose == "consume") targetType = "Food";
        else if (purpose == "hunt") targetType = "Animal";

        const target = character.getClosestEntity({
            characterType: CharacterType.List[targetType],
            exclude: character.spawnTargets,
            grown: true
        });

        if (target != null) {
            const slap = Technology.Get("slap");
            const options = {
                purposeKey: purpose,
                technologies: [slap],
                target
            }
            const spawnedCharacter = character.Subdivide(options);
            if (spawnedCharacter != null) {
                character.spawnTargets.push(target);
                // console.log(`Character ${character.id} has ${character.spawnTargets.length} spawn targets.`);
            }
        }

        character.lastSpawn = performance.now();
    }
}
