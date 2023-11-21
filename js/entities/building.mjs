import Resource from "../../engine/js/entities/resource.mjs";
import CharacterType from "./characterType.mjs";
import HiveMindCharacter from "./character-extensions.mjs";
import Events from "../../engine/js/events.mjs";
import Point from "../../engine/js/baseTypes/point.mjs"
import Map from "../../engine/js/mapping/map.mjs";

Events.List.BuildingBuilt = "BuildingBuilt";
Events.List.BuildingDesired = "BuildingDesired";
Events.List.BuildingDesireFulfilled = "BuildingDesireFulfilled";

const TIME_BETWEEN_THOUGHTS = 3000;
const NEARBY_RANGE = 100;

export default class Building extends HiveMindCharacter {

    static #FOOD_THRESHOLD = 100;
    static #BUILDING_PADDING = 10;
    static #MAX_SPARE_NODES = 5;
    static #desiredBuildingsQueue = [];

    static QueueDesire(desire) {

        Building.#desiredBuildingsQueue.push(desire);
        
        Events.RaiseEvent(Events.List.BuildingDesired, desire);
    }

    // "source" sometimes won't have a chunk.
    // Hopefully the early return accounts for that
    static #randomPositionOffset(source, offsetAmountPerAxis) {

        const seed = source?.chunk?.seed;
        if(seed == null) return null;
    
        let xOffset = seed.Random(0, offsetAmountPerAxis);
        if (seed.Random() < 0.5) xOffset *= -1;
        let yOffset = seed.Random(0, offsetAmountPerAxis);
        if (seed.Random() < 0.5) yOffset *= -1;
    
        return new Point(source.x + xOffset, source.y + yOffset);
    }

    static #wantDevelopNode() {

        return Building.#desiredBuildingsQueue.length > 0;
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

        // node ai?
        if(this.name == "Node") {
            this.#nodeThink();
        }

        this.#lastThought = performance.now();
    }

    #whatToBuild() {

            // at least 1 other node nearby (that can build other nodes ...)
            // we may want to allow non-nodes to build buildings?

            // TODO: Should be using characterType enums
            const nearbyNodes = this.getNearbyEntities({
                distance: NEARBY_RANGE,
                faction: this.faction,
                characterType: 'Node',
            });
            if(nearbyNodes.length == 0) {
                return CharacterType.Node;
            }

            // TODO: We probably eventually want to balance seeders and eaters and not just have one ...
            // maybe we can 'default' one at the end, and compare counts?
            const nearbyEaters = this.getNearbyEntities({
                distance: NEARBY_RANGE,
                faction: this.faction,
                characterType: 'Eater'
            });
            if(nearbyEaters.length == 0) {
                return CharacterType.Eater;
            }

            return CharacterType.Seeder;

            // defense and stuff tho

            const nearbySeeders = this.getNearbyEntities({
                distance: NEARBY_RANGE,
                faction: this.faction,
                characterType: 'Seeder'
            });
            if(nearbySeeders.length == 0) {
                return CharacterType.Seeder;
            }
    }

    #nodeThink() {

        if(!this.isGrown) return;

        // because we won't be able to get "randomPositionOffset" further down
        if(this.position?.chunk == null) {
            this.position.chunk = Map.Map.getChunk(this.position);
            if(this.position.chunk == null) {
                console.warn(`Couldn't resolve chunk for position.`);
                return;
            }
        }

        // there HAS to be a cleaner way to do this
        for(var index = 0; index < this.growing.length; index++) {
            if(this.growing[index].isGrown) {
                this.growing.splice(index, 1);
                index--;
            }
        }
        
        if(this.growing.length > 0) return;

        const food = Resource.Get("food");
        const minFood = Building.#FOOD_THRESHOLD + this.faction?.reservedFood;
        if (food.value > minFood) {
        // if (food.available > Building.#FOOD_THRESHOLD) {

            if (Building.#wantDevelopNode()) {

                const intent = Building.#desiredBuildingsQueue[0];
                // check that we have node and intent, warn if no
                if (intent) {
                    this.Develop(intent);
                    Events.RaiseEvent(Events.List.BuildingDesireFulfilled, intent);
                    // we could probably slice it off instead?
                    Building.#desiredBuildingsQueue.splice(0, 1);
                }
            } else {

                const wantToBuild = this.#whatToBuild();
                // this needs to be changed entirely
                const position = Building.#randomPositionOffset(this.position, Building.#BUILDING_PADDING / 2);
                if(position == null) {
                    console.warn(`Couldn't get position for new building. Probably out of bounds.`);
                    return;
                }
                // console.log(`I'm at ${this.position}, making a new node at ${position}`);

                const options = Object.assign({}, wantToBuild);
                options.position = position;
                options.faction = this.faction;
                options.cost = wantToBuild.health;

                // TODO: take some time to construct (grow)
                // console.log(`Trying to build ${wantToBuild.name} at ${position}`);
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
