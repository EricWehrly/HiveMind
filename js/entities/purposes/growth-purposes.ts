import WorldCoordinate from "../../../engine/js/coordinates/WorldCoordinate";
import Entity from "../../../engine/js/entities/character/Entity";
import { MakeCombative } from "../../../engine/js/entities/character/mixins/Combative";
import { MakeEquipped } from "../../../engine/js/entities/character/mixins/Equipped";
import { MakeLiving } from "../../../engine/js/entities/character/mixins/Living";
import Resource from "../../../engine/js/entities/resource";
import { MakeHiveMindCharacter } from "../character/HivemindCharacterFactory";
import HiveMindCharacter from "../character/HiveMindCharacter";
import { Growable, MakeGrowable } from "../character/mixins/Growable";
import { Grower } from "../character/mixins/Grower";
import Purposes from "./character-purposes";

function randomPositionOffset(source: WorldCoordinate, offsetAmountPerAxis: number) {

    let xOffset = Math.randomBetween(0, offsetAmountPerAxis);
    if (Math.random() < 0.5) xOffset *= -1;
    let yOffset = Math.randomBetween(0, offsetAmountPerAxis);
    if (Math.random() < 0.5) yOffset *= -1;

    return new WorldCoordinate(source.x + xOffset, source.y + yOffset);
}

Purposes["grow"] = {
    name: "grow",
    think: function (character: Entity & Grower, elapsed: number) {

        if (!character.growing) character.growing = [];
        const growing = character.growing.filter(growing => growing.growth < 100)
            || [];
        if (growing.length < character.growerConfig.batchSize
            && character.growing.length < character.growerConfig.max) {

            const subject = character.growerConfig.subject;

            const food = Resource.Get("food");
            // Building.#FOOD_THRESHOLD ?
            // const characterType = CharacterType.List[];
            if(food.available < subject.characterType.health) {
                // console.debug(`${food.available} food < ${characterType.health}, can't build ${character.growerConfig.subject.name}`);
                return;
            }

            // TODO: need to instrument range, maybe growConfig.range?
            const position = randomPositionOffset(character.position, 5)
            // check if we have the food to do this
            // should we wait until we "have had" food for X "cycles"
            // or implement some kind of priority queuing system? ("want to grow")
            const options = {
                characterType: character.growerConfig.subject,
                position,
                ...character.growerConfig.subject
            };
            const newGrow = MakeHiveMindCharacter([MakeGrowable, MakeLiving, MakeCombative, MakeEquipped], options) as HiveMindCharacter & Growable;
            if(!food.reserve(subject.characterType.health, newGrow)) {
                console.warn(`The food was available but isn't now?`);
                return;
            }
            newGrow.grow(character.growerConfig.interval);
            character.growing.push(newGrow);
        }
    }
}
