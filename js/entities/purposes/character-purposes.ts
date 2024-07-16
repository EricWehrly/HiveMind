import Events from "../../../engine/js/events";
import Research from "../../../engine/js/research.mjs";
import CharacterType from "../CharacterType";
import { TechnologyTypes } from "../../../engine/js/TechnologyTypes";
import Character from "../../../engine/js/entities/character";
import Resource from "../../../engine/js/entities/resource.mjs";
import HiveMindCharacter from "../character/HiveMindCharacter";
import LivingEntity from "../../../engine/js/entities/character/LivingEntity";
import { CHARACTER_LIST } from "../../../engine/js/entities/characters.mjs";

const Purposes: Record<string,any> =
{
    "study": {
        name: "Study",
        think: function (character: HiveMindCharacter, elapsed: number) {
            if (character.target && character.target instanceof Character) {
                character.pointAtTarget(character.targetPosition);

                if (character.position.equals(character.targetPosition)) {
                    if (character.target.dead == true) {
                        // TODO: contemplate
                        // TODO: support > 1 technology
                        if (character.target.technologies && character.target.technologies.length > 0) {
                            character.AddTechnology(character.target.technologies[0]);
                        }
                        // TODO: When reabsorbed
                        if (character.target.characterType) {
                            // TODO: fix this typing issue ...
                            //@ts-expect-error
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
        think: function (character: HiveMindCharacter, elapsed: number) {
            if (character.target && character.target instanceof Character) {
                character.pointAtTarget(character.targetPosition);

                const attack = character.getEquipped(TechnologyTypes.ATTACK);
                // if(attack == null) console.warn(`Attack is null.`);
                if (character.target == null || character.target.dead) {
                    character.target = null;
                    character.SetCurrentPurpose("return");
                } else if (attack && character.position.distance(character.target.position) < attack.range
                    && character.target.dead != true) {
                    const attackAmount = character.attack();
                    character.health += 2 * attackAmount;
                }
            }
        }
    },
    "hunt": {
        name: "hunt",
        think: function (character: HiveMindCharacter, elapsed: number) {
            const attack = character.getEquipped(TechnologyTypes.ATTACK);
            if (attack == null) console.warn(`Attack is null.`);
            Purposes["consume"].think(character, elapsed);
        }
    },
    "heal": {
        name: "heal",
        interval: 2000,
        range: 20,
        amount: 5,
        think: function (character: HiveMindCharacter, elapsed: number) {

            const timeSinceLastHeal = performance.now() - character.lastHeal;
            if (character.lastHeal != null
                && timeSinceLastHeal < this.interval) {
                return;
            }

            const closest = character.getClosestEntity({
                distance: this.range,
                // TODO: 'faction' has to be pushed further down the stack for this to work
                //@ts-expect-error
                faction: Character.LOCAL_PLAYER.faction
            }) as LivingEntity;

            if(closest && closest instanceof LivingEntity) {
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
Events.Subscribe(Events.List.CharacterDied, (deadGuy: LivingEntity) => {
    for (var character of CHARACTER_LIST) {
        const index = character?.growing?.indexOf(deadGuy);
        if (index > -1) character.growing.splice(index, 1);
    }
});

export default Purposes;
