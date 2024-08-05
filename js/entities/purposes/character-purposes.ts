import Events from "../../../engine/js/events";
import Research from "../../../engine/js/research.mjs";
import { TechnologyTypes } from "../../../engine/js/TechnologyTypes";
import Character from "../../../engine/js/entities/character";
import Resource from "../../../engine/js/entities/resource";
import HiveMindCharacter from "../character/HiveMindCharacter";
import { CHARACTER_LIST } from "../../../engine/js/entities/characters";
import { IsLiving, Living } from "../../../engine/js/entities/character/mixins/Living";
import Entity from "../../../engine/js/entities/character/Entity";
import { Grower } from "../character/mixins/Grower";
import { Growable } from "../character/mixins/Growable";
import { IsCombative } from "../../../engine/js/entities/character/mixins/Combative";
import { IsEquipped } from "../../../engine/js/entities/character/mixins/Equipped";

const Purposes: Record<string,any> =
{
    "study": {
        name: "Study",
        think: function (character: HiveMindCharacter, elapsed: number) {
            if (character.target && character.target instanceof Character) {
                character.pointAtTarget(character.targetPosition);

                if (character.position.near(character.targetPosition)) {
                    if ((character.target as Living).dead == true) {
                        // TODO: contemplate
                        // TODO: support > 1 technology
                        if(IsEquipped(character) && IsEquipped(character.target)) {
                            if (character.target.technologies && character.target.technologies.length > 0) {
                                character.AddTechnology(character.target.technologies[0]);
                            }
                        }
                        // TODO: not until reabsorbed (after 'return')
                        if (character.target.characterType) {
                            character.target.characterType.isStudied = true;
                            const research = Research.Get(character.target.characterType);
                            research.enabled = true;
                        }
                        character.target = null;
                        character.SetCurrentPurpose("return");
                        // } else character.target.health -= (character.damage || 1) * (elapsed / 1000);
                    } else {
                        (character.target as Living).health = 0; // cheat for make testing easier
                    }
                }
            }
        }
    },
    "consume": {
        name: "consume",
        think: function (character: HiveMindCharacter & Living, elapsed: number) {
            if (character.target && character.target instanceof Character) {
                character.pointAtTarget(character.targetPosition);

                if(IsEquipped(character) && IsCombative(character)) {
                    const attack = character.getEquipped(TechnologyTypes.ATTACK);
                    // if(attack == null) console.warn(`Attack is null.`);
                    if (character.target == null || (character.target as Living).dead) {
                        character.target = null;
                        character.SetCurrentPurpose("return");
                    } else if (attack && character.position.distance(character.target.position) < attack.range
                        && (character.target as Living).dead != true) {
                        const attackAmount = character.attack();
                        character.health += 2 * attackAmount;
                    }
                }
            }
        }
    },
    "hunt": {
        name: "hunt",
        think: function (character: HiveMindCharacter, elapsed: number) {
            if(IsEquipped(character)) {
                const attack = character.getEquipped(TechnologyTypes.ATTACK);
                if (attack == null) console.warn(`Attack is null.`);
                Purposes["consume"].think(character, elapsed);
            }
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
                faction: (Character.LOCAL_PLAYER as HiveMindCharacter).faction
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
    }
};

// maybe "growing" should be made generic as "children" ...
// TODO: deadguy should be grower tho
// I think we need to unit test this
Events.Subscribe(Events.List.CharacterDied, (deadGuy: HiveMindCharacter & Growable) => {
    for (var char of CHARACTER_LIST) {
        const character = char as HiveMindCharacter & Grower;
        const index = character?.growing?.indexOf(deadGuy);
        if (index > -1) character.growing.splice(index, 1);
    }
});

export default Purposes;
