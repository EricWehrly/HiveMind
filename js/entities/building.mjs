import Resource from "../../engine/js/entities/resource.mjs";
import CharacterType from "./characterType.mjs";
import HiveMindCharacter from "./character-extensions.mjs";
import Events from "../../engine/js/events.mjs";

Events.List.BuildingBuilt = "BuildingBuilt";

export default class Building extends HiveMindCharacter {

    // we may be able to do all this in the base class
    constructor(options) {

        if(options.cost) {
            const food = Resource.Get("food");
            if(!food.pay(options.cost)) {
                console.log(`You can't afford to build ${characterOpts.characterType} for ${amount}`);
                console.log(`You got ${food.value}, son.`);
                return;
            }
        }

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
        this.grow(healthDiff * 500);
        this.maxHealth = CharacterType[intent.characterType].health;
    }
}
