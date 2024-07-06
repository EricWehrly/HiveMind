import WorldCoordinate from "../../../engine/js/coordinates/WorldCoordinate";
import Resource from "../../../engine/js/entities/resource.mjs";
import GrowthCharacter from "../character/GrowthCharacter";
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
    think: function (character: GrowthCharacter, elapsed: number) {

        if (!character.growing) character.growing = [];
        const growing = character.growing.filter(growing => growing.growth < 100)
            || [];
        if (growing.length < character.growConfig.batchSize
            && character.growing.length < character.growConfig.max) {

            const subject = character.growConfig.subject;

            const food = Resource.Get("food");
            // Building.#FOOD_THRESHOLD ?
            // TODO: CharacterType.Get, probably
            //@ts-expect-error
            const characterType = CharacterType[subject.characterType];
            if(food.available < characterType.health) {
                // console.debug(`${food.available} food < ${characterType.health}, can't build ${character.growConfig.subject.name}`);
                return;
            }

            // check if we have the food to do this
            // should we wait until we "have had" food for X "cycles"
            // or implement some kind of priority queuing system? ("want to grow")
            const newGrow = new GrowthCharacter(character.growConfig.subject);
            if(!food.reserve(characterType.health, newGrow)) {
                console.warn(`The food was available but isn't now?`);
                return;
            }
            newGrow.grow(character.growConfig.interval);
            // TODO: need to instrument range, maybe growConfig.range?
            newGrow.position = randomPositionOffset(character.position, 5);
            character.growing.push(newGrow);
        }
    }
}
