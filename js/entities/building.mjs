import Resource from "../../engine/js/entities/resource.mjs";
import CharacterType from "./characterType.mjs";
import HiveMindCharacter from "./character-extensions.mjs";
import Events from "../../engine/js/events.mjs";

Events.List.BuildingBuilt = "BuildingBuilt";

export default class Building extends HiveMindCharacter {

    // we may be able to do all this in the base class
    constructor(options) {

        // TODO: there are a LOT of undefined variables on these
        // 'name' is actually unset/undefined
        // but color and cost are getting assigned the VALUE of undefined
        const characterType = CharacterType[options.characterType];
        const cost = options.cost || characterType.cost || characterType.health;

        if(cost) {
            const food = Resource.Get("food");
            if(!food.pay(cost)) {
                console.log(`You can't afford to build ${characterType.name} for ${amount}`);
                console.log(`You got ${food.value}, son.`);
                return;
            }
        } else {
            console.warn(`No cost!`);
        }

        // does this fix it moving?
        options.speed = 0;

        super(options);
        this.isBuilding = true;
        this.growing = [];
        
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
