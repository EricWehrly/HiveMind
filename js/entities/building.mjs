import Resource from "../../engine/js/entities/resource.mjs";
import CharacterType from "./characterType.mjs";
import HiveMindCharacter from "./character-extensions.mjs";
import Events from "../../engine/js/events.mjs";

Events.List.BuildingBuilt = "BuildingBuilt";

export function BuildBuilding(options) {

    if(!options.characterType) throw `You need a character type.`;

    const characterOpts = Object.assign({}, CharacterType[options.characterType]);
    if(options.color) characterOpts.color = options.color;
    if(options.position) characterOpts.position = options.position;
    if(options.faction) characterOpts.faction = options.faction;
    characterOpts.isBuilding = true;

    const amount = characterOpts.health;
    const food = Resource.Get("food");

    if(food.pay(amount)) {
        const building = new HiveMindCharacter(characterOpts);
        console.log(`Successfully built ${building.characterType}`);

        Events.RaiseEvent(Events.List.BuildingBuilt, building);

        return building;
    } else {        
        console.log(`You can't afford to build ${characterOpts.characterType} for ${amount}`);
        console.log(`You got ${food.value}, son.`);
    }

}

export function BuildForPlayer(options) {

}