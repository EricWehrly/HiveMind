import Point from "../../../engine/js/coordinates/point";
import WorldCoordinate from "../../../engine/js/coordinates/WorldCoordinate";
import Entity from "../../../engine/js/entities/character/Entity";
import { MakeCombative } from "../../../engine/js/entities/character/mixins/Combative";
import { MakeEquipped } from "../../../engine/js/entities/character/mixins/Equipped";
import { MakeLiving } from "../../../engine/js/entities/character/mixins/Living";
import { MakeSentient } from "../../../engine/js/entities/character/mixins/Sentient";
import Resource from "../../../engine/js/entities/resource";
import HiveMindCharacter from "../character/HiveMindCharacter";
import { MakeHiveMindCharacter } from "../character/HivemindCharacterFactory";
import { Growable, MakeGrowable } from "../character/mixins/Growable";
import { Grower } from "../character/mixins/Grower";
import CharacterPurpose from "./CharacterPurpose";

function randomPositionOffset(source: Readonly<Point>, offsetAmountPerAxis: number) {

    let xOffset = Math.randomBetween(0, offsetAmountPerAxis);
    if (Math.random() < 0.5) xOffset *= -1;
    let yOffset = Math.randomBetween(0, offsetAmountPerAxis);
    if (Math.random() < 0.5) yOffset *= -1;

    return new WorldCoordinate(source.x + xOffset, source.y + yOffset);
}

new CharacterPurpose({
    name: "Grow",
    think(character: Entity, elapsed) {

        const grower = character as Entity & Grower;

        if (!grower.growing) grower.growing = [];
        const growing = grower.growing.filter(growing => growing.growth < 100)
            || [];
        if (growing.length < grower.growerConfig.batchSize
            && grower.growing.length < grower.growerConfig.max) {

            const subject = grower.growerConfig.subject;

            const food = Resource.Get("food");
            // Building.#FOOD_THRESHOLD ?
            // const characterType = CharacterType.List[];
            if(food.available < subject.characterType.health) {
                // console.debug(`${food.available} food < ${characterType.health}, can't build ${character.growerConfig.subject.name}`);
                return;
            }

            // TODO: need to instrument range, maybe growConfig.range?
            const position = randomPositionOffset(grower.position, 5)
            // check if we have the food to do this
            // should we wait until we "have had" food for X "cycles"
            // or implement some kind of priority queuing system? ("want to grow")
            const options = {
                characterType: grower.growerConfig.subject,
                position,
                ...grower.growerConfig.subject
            };
            // does this really need to be sentient tho?
            const newGrow = MakeHiveMindCharacter([MakeGrowable, MakeLiving, MakeCombative, MakeEquipped, MakeSentient], options) as HiveMindCharacter & Growable;
            if(!food.reserve(subject.characterType.health, newGrow)) {
                console.warn(`The food was available but isn't now?`);
                return;
            }
            newGrow.grow(grower.growerConfig.interval);
            grower.growing.push(newGrow);
        }        
    },
});
