import Resource from "../../engine/js/entities/resource.mjs";
import CharacterType from "./characterType.mjs";
import HiveMindCharacter from "./character-extensions.mjs";
import Events from "../../engine/js/events.mjs";

Events.List.BuildingBuilt = "BuildingBuilt";

export default class Building extends HiveMindCharacter {

    // probably need to move this to constructor
    static Build(options) {

        if (!options.characterType) throw `You need a character type.`;

        const characterOpts = Object.assign({}, CharacterType[options.characterType]);
        if (options.color) characterOpts.color = options.color;
        if (options.position) characterOpts.position = options.position;
        if (options.faction) characterOpts.faction = options.faction;

        const amount = characterOpts.health;
        const food = Resource.Get("food");

        if (food.pay(amount)) {
            const building = new Building(characterOpts);

            return building;
        } else {
            console.log(`You can't afford to build ${characterOpts.characterType} for ${amount}`);
            console.log(`You got ${food.value}, son.`);
        }
    }

    constructor(options) {

        // TODO: If this.position collides, "slide" it until it doesn't
        // .. with a max amount

        super(options);
        this.isBuilding = true;

        Events.RaiseEvent(Events.List.BuildingBuilt, this);
    }

    Develop(intent) {

        // TODO: check minimum food before doing this?

        this.characterType = intent.characterType;
        if (this.health > (0.2 * this.maxHealth)) {
            this.health -= (0.2 * this.maxHealth);
        }
        // TODO: Get this to stop producing negative numbers and drop the Math.abs
        const healthDiff = Math.abs(intent.health - this.health);
        this.growth = 0;
        this.maxHealth = CharacterType[intent.characterType].health;
        this.growConfig = {
            interval: healthDiff * 500
        }
    }
}
