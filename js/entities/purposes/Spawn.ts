import Entity from "../../../engine/js/entities/character/Entity";
import Technology from "../../../engine/js/technology";
import HiveMindCharacter from "../character/HiveMindCharacter";
import { Grower } from "../character/mixins/Grower";
import { Slimey } from "../character/mixins/Slimey";
import CharacterType from "../CharacterType";
import CharacterPurpose from "./CharacterPurpose";

// TODO: write a test for this
// we kind of need to be able to "ask" if the thing to be spawned can do what it's purpose should be
new CharacterPurpose({
    name: "Spawn",
    interval: 3000,
    think(entity: Entity, elapsed: number) {

        const character = entity as HiveMindCharacter & Grower & Slimey;

        // we could probably track "amount elapsed" in the character, 
        // rather than needing to call performance.now here
        const timeSinceLastSpawn = performance.now() - character.lastSpawn;
        if (character.lastSpawn != null
            && timeSinceLastSpawn < this.interval) {
            return;
        }

        const purpose = character.characterType.spawnPurposeKey;
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
    },
});
