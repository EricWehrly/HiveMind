import Events from "../../../engine/js/events";
import Research from "../../../engine/js/research";
import { TechnologyTypes } from "../../../engine/js/TechnologyTypes";
import Resource from "../../../engine/js/entities/resource";
import HiveMindCharacter from "../character/HiveMindCharacter";
import { CHARACTER_LIST } from "../../../engine/js/entities/characters";
import { IsLiving, Living } from "../../../engine/js/entities/character/mixins/Living";
import Entity, { EntityEvent } from "../../../engine/js/entities/character/Entity";
import { Grower } from "../character/mixins/Grower";
import { Growable } from "../character/mixins/Growable";
import { Combative, IsCombative } from "../../../engine/js/entities/character/mixins/Combative";
import { IsEquipped } from "../../../engine/js/entities/character/mixins/Equipped";
import { CharacterUtils } from "../../../engine/js/entities/character/CharacterUtils";
import { Sentient } from "../../../engine/js/entities/character/mixins/Sentient";

const Purposes: Record<string,any> =
{
    "study": {
        name: "Study",
        think: function (character: HiveMindCharacter & Sentient, elapsed: number) {
            if (character.ai.targetEntity) {
                character.pointAtTarget(character.ai.targetPosition);

                if (character.position.near(character.ai.targetPosition)) {
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
                        character.SetCurrentPurpose("return");
                        // } else character.target.health -= (character.damage || 1) * (elapsed / 1000);
                    } else {
                        (character.ai.targetEntity as Living).health = 0; // cheat for make testing easier
                    }
                }
            }
        }
    },
    "consume": {
        name: "consume",
        think: function (character: HiveMindCharacter & Living & Sentient, elapsed: number) {
            if (character.ai.targetEntity) {
                character.pointAtTarget(character.ai.targetPosition);

                if(IsEquipped(character) && IsCombative(character)) {
                    const attack = character.getEquipped(TechnologyTypes.ATTACK);
                    // if(attack == null) console.warn(`Attack is null.`);
                    if (character.target == null || (character.target as Living).dead) {
                        character.target = null;
                        character.SetCurrentPurpose("return");
                    } else if (attack && character.position.distance(character.ai.targetPosition) < attack.range
                        && (character.target as Living).dead != true) {
                        const attackAmount = character.attack(character.ai.targetEntity);
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
    }
};

// maybe "growing" should be made generic as "children" ...
// TODO: deadguy should be grower tho and love monica and bean
// I think we need to unit test this
Events.Subscribe(Events.List.CharacterDied, (event: EntityEvent) => {
    const deadGuy = event.entity as HiveMindCharacter & Growable;
    for (var char of CHARACTER_LIST) {
        const character = char as HiveMindCharacter & Grower;
        const index = character?.growing?.indexOf(deadGuy);
        if (index > -1) character.growing.splice(index, 1);
    }
});

export default Purposes;
