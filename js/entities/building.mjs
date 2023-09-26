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

        console.log(`Starting to develop ${this.name} into ${intent.characterType}`);

        // TODO: check minimum food before doing this?

        this.characterType = intent.characterType;
        if (this.health > (0.2 * this.maxHealth)) {
            this.health -= (0.2 * this.maxHealth);
        }
        // TODO: Get this to stop producing negative numbers and drop the Math.abs
        const healthDiff = Math.abs(intent.health - this.health);
        this.growth = 0;
        this.growConfig = {
            interval: healthDiff * 500,
            maxHealth: CharacterType[intent.characterType].health
        }
        console.log(`Healthdiff is ${healthDiff}`);
    }

    think(elapsed) {

        if (this.ai) this.ai.think(elapsed);

        if (this.growth < 100) {

            const food = Resource.Get("food");
            const growthAmount = (100 / this.growConfig.interval) * elapsed;
            if (food.pay(growthAmount)) {
                this.growth += growthAmount;
                // TODO: +=, not =
                // ... do this with growing entities as well
                this.health = (this.growth / 100) * this.growConfig.maxHealth;

                if (this.isGrown) {
                    const characterType = CharacterType[this.characterType];
                    this.name = characterType.name;
                    delete this.growth;
                    this.removeGraphic();
                    // assign ai?
                    // health is correect?
                    console.log(`Finished developing ${this.name}`);
                }
            }
        }
    }
}
