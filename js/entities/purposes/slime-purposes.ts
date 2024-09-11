import Technology from "../../../engine/js/technology";
import HiveMindCharacter from "../character/HiveMindCharacter";
import Purposes from "./character-purposes";
import CharacterType from "../CharacterType";
import { Slimey } from "../character/mixins/Slimey";
import { Grower } from "../character/mixins/Grower";
import { Sentient } from "../../../engine/js/entities/character/mixins/Sentient";

Purposes["return"] = {
    // do not show this one in menus!
    name: "return",
    // TODO: remove the need for "slime" purpose, and purpose needs to be pushed down to 'character'
    think: function (character: HiveMindCharacter & Slimey & Sentient, elapsed: number) {

        if (!character.target) {
            character.target = character.parent;
        }
        character.pointAtTarget(character.ai.targetPosition);

        // TODO: if collision boxes overlap ..
        // if(character.targetEntity.area.contains(character.position)) {
        if (character.position.near(character.ai.targetPosition)) {
            character.Reabsorb();
        }
    }
};

// TODO: structure this better so that it can be tested
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
            // TODO: take from player (don't we already have this note?)
            const slap = Technology.Get("slap");
            const options = {
                purposeKey: purpose,
                technologies: [slap],
                target
            }
            const spawnedCharacter = character.Subdivide(options);
            if (spawnedCharacter != null) {
                // store 'spawntargets' on the spawner so that only one spawn per target
                character.spawnTargets.push(target);
                // console.log(`Character ${character.id} has ${character.spawnTargets.length} spawn targets.`);
            }
        }

        character.lastSpawn = performance.now();
    }
}
