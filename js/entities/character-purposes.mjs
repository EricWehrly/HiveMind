import Point from "../../engine/js/baseTypes/point.mjs";
import Events from "../../engine/js/events.mjs";
import Research from "../../engine/js/research.mjs";
import HiveMindCharacter from "./character-extensions.mjs";
import CharacterType from "./characterType.mjs";
import Technology from "../../engine/js/technology.mjs";
import Character from "../../engine/js/entities/character.mjs";
import Resource from "../../engine/js/entities/resource.mjs";

function randomPositionOffset(source, offsetAmountPerAxis) {

    let xOffset = Math.randomBetween(0, offsetAmountPerAxis);
    if (Math.random() < 0.5) xOffset *= -1;
    let yOffset = Math.randomBetween(0, offsetAmountPerAxis);
    if (Math.random() < 0.5) yOffset *= -1;

    return new Point(source.x + xOffset, source.y + yOffset);
}

const Purposes =
{
    "study": {
        name: "Study",
        think: function (character, elapsed) {
            if (character.target) {
                character.pointAtTarget(character.target);

                if (character.position.equals(character.target.position)) {
                    if (character.target.dead == true) {
                        // TODO: contemplate
                        // TODO: support > 1 technology
                        if (character.target.technologies && character.target.technologies.length > 0) {
                            character.AddTechnology(character.target.technologies[0]);
                        }
                        // TODO: When reabsorbed
                        if (character.target.characterType) {
                            CharacterType[character.target.characterType].isStudied = true;
                            const research = Research.Get(character.target.characterType);
                            research.enabled = true;
                        }
                        character.target = null;
                        character.SetCurrentPurpose("return");
                        // } else character.target.health -= (character.damage || 1) * (elapsed / 1000);
                    } else character.target.health = 0; // cheat for make testing easier
                }
            }
        }
    },
    "consume": {
        name: "consume",
        think: function (character, elapsed) {
            if (character.target) {
                character.pointAtTarget(character.target);

                const attack = character.getEquipped(Technology.Types.ATTACK);
                // if(attack == null) console.warn(`Attack is null.`);
                if (character.target == null || character.target.dead) {
                    character.target = null;
                    character.SetCurrentPurpose("return");
                } else if (attack && character.position.distance(character.target.position) < attack.range
                    && character.target.dead != true) {
                    Action.List['attack'].callback({
                        character
                    });
                }
            }
        }
    },
    "hunt": {
        name: "hunt",
        think: function (character, elapsed) {
            const attack = character.getEquipped(Technology.Types.ATTACK);
            if (attack == null) console.warn(`Attack is null.`);
            Purposes["consume"].think(character, elapsed);
        }
    },
    "return": {
        // do not show this one in menus!
        name: "return",
        think: function (character, elapsed) {

            if (!character.target) {
                character.target = character.parent;
            }
            character.pointAtTarget(character.target);

            // TODO: if collision boxes overlap ..
            if (character.position.equals(character.target.position)) {
                character.Reabsorb();
            }
        }
    },
    "grow": {
        name: "grow",
        think: function (character, elapsed) {

            if (!character.growing) character.growing = [];
            const growing = character.growing.filter(growing => growing.growth < 100);
            if (growing.length < character.growConfig.batchSize
                && character.growing.length < character.growConfig.max) {
                const newGrow = new HiveMindCharacter(character.growConfig.subject);
                newGrow.grow(character.growConfig.interval);
                newGrow.position = randomPositionOffset(character.position, 5);
                character.growing.push(newGrow);
            }
        }
    },
    // we kind of need to be able to "ask" if the thing to be spawned can do what it's purpose should be
    "spawn": {
        name: "spawn",
        interval: 3000,
        think: function (character, elapsed) {

            // we could probably track "amount elapsed" in the character, 
            // rather than needing to call performance.now here
            const timeSinceLastSpawn = performance.now() - character.lastSpawn;
            if (character.lastSpawn != null
                && timeSinceLastSpawn < this.interval) {
                return;
            }

            const purpose = character._spawnPurposeKey;
            let targetType;
            // both consume/hunt and Food/Animal should come from enums
            if (purpose == "consume") targetType = "Food";
            else if (purpose == "hunt") targetType = "Animal";

            const target = character.getClosestEntity({
                characterType: targetType,
                exclude: character.spawnTargets,
                grown: true
            });

            if (target != null) {
                const slap = Technology.Get("slap");
                const options = {
                    purposeKey: character._spawnPurposeKey,
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
    },
    "heal": {
        name: "heal",
        interval: 2000,
        range: 20,
        amount: 5,
        think: function (character, elapsed) {

            const timeSinceLastHeal = performance.now() - character.lastHeal;
            if (character.lastHeal != null
                && timeSinceLastHeal < this.interval) {
                return;
            }

            const closest = character.getClosestEntity({
                distance: this.range,
                faction: Character.LOCAL_PLAYER.faction
            });

            if(closest) {
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
    }
};

// maybe "growing" should be made generic as "children" ...
Events.Subscribe(Events.List.CharacterDied, (deadGuy) => {
    for (var character of CHARACTER_LIST) {
        const index = character?.growing?.indexOf(deadGuy);
        if (index > -1) character.growing.splice(index, 1);
    }
});

export default Purposes;
