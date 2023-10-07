import Resource from "../../engine/js/entities/resource.mjs";
import CharacterType from "./characterType.mjs";
import HiveMindCharacter from "./character-extensions.mjs";
import Events from "../../engine/js/events.mjs";
import Character from "../../engine/js/entities/character.mjs";
import Point from "../../engine/js/baseTypes/point.mjs"

Events.List.BuildingBuilt = "BuildingBuilt";

const TIME_BETWEEN_THOUGHTS = 3000;

export default class Building extends HiveMindCharacter {

    static #FOOD_THRESHOLD = 100;
    static #BUILDING_PADDING = 10;
    static #MAX_SPARE_NODES = 5;
    static #desiredBuildingsQueue = [];

    static QueueDesire(desire) {

        Building.#desiredBuildingsQueue.push(desire);
        // console.log(`Desure: ${desire}`);
    }

    static #randomPositionOffset(source, offsetAmountPerAxis) {

        const seed = source?.chunk?.seed;
    
        let xOffset = seed.Random(0, offsetAmountPerAxis);
        if (seed.Random() < 0.5) xOffset *= -1;
        let yOffset = seed.Random(0, offsetAmountPerAxis);
        if (seed.Random() < 0.5) yOffset *= -1;
    
        return new Point(source.x + xOffset, source.y + yOffset);
    }

    static #wantDevelopNode() {

        return Building.#desiredBuildingsQueue.length > 0;
    }

    static #wantNewNode() {

        // we probably do want to go back to event tracking,
        // rather than needing to traverse the character list each tick
        const nodeCount = Character.get({
            name: "Node"
        }).length;

        return (nodeCount == 0
            || Building.#desiredBuildingsQueue.length == 0)
            && nodeCount < Building.#MAX_SPARE_NODES;
        // if request queue is empty, MAYBE we want new nodes?
    }

    // TODO: We should be able to get rid of this once it takes time to make a node
    #lastThought = performance.now();

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
                console.log(`You can't afford to build ${characterOpts.characterType} for ${amount}`);
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

    think(elapsed) {
        super.think(elapsed);

        if(this.#lastThought + TIME_BETWEEN_THOUGHTS > performance.now()) {
            return;
        }

        if(this.name == "Node") {
            this.#nodeThink();
        }

        this.#lastThought = performance.now();
    }

    #nodeThink() {

        if(!this.isGrown) return;

        // there HAS to be a cleaner way to do this
        for(var index = 0; index < this.growing.length; index++) {
            if(this.growing[index].isGrown) {
                this.growing.splice(index, 1);
                index--;
            }
        }
        
        if(this.growing.length > 0) return;

        const food = Resource.Get("food");
        if (food.value > Building.#FOOD_THRESHOLD) {

            // declare a const range to define "nearby"

            // at least 1 other node nearby (that can build other nodes ...)
            // we may want to allow non-nodes to build buildings?

            // if we don't have any eaters nearby, make one

            // no seeders nearby, make one

            if (Building.#wantDevelopNode()) {

                const intent = Building.#desiredBuildingsQueue[0];
                // check that we have node and intent, warn if no
                if (intent) {
                    this.Develop(intent);
                    // Building.#buildNodeCount -= 1;
                    // we could probably slice it off instead?
                    Building.#desiredBuildingsQueue.splice(0, 1);
                }
                // else come up with our own building to develop

            } else if (Building.#wantNewNode()) {

                // this needs to be changed entirely
                const position = Building.#randomPositionOffset(this.position, Building.#BUILDING_PADDING / 2);

                // console.log(`I'm at ${this.position}, making a new node at ${position}`);

                const options = Object.assign({}, CharacterType.Node);
                options.position = position;
                options.faction = this.faction;
                options.cost = CharacterType.Node.health;

                // TODO: take some time to construct (grow)
                const building = new Building(options);

                const healthDiff = building.health * .9;
                building.health = building.health * 0.1;
                building.grow(healthDiff * 500);

                this.growing.push(building);
            }
        }
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
