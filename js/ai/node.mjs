import AI from "../../engine/js/ai/basic.mjs";
import Resource from "../../engine/js/entities/resource.mjs";
import CharacterType from "../entities/characterType.mjs";
import Events from "../../engine/js/events.mjs";
import Point from "../../engine/js/baseTypes/point.mjs";
import Building from "../entities/building.mjs";

Events.List.BuildingDesired = "BuildingDesired";
Events.List.BuildingDesireFulfilled = "BuildingDesireFulfilled";

const TIME_BETWEEN_THOUGHTS = 5000;
const NEARBY_RANGE = 100;

export default class NodeAI extends AI {

    static #FOOD_THRESHOLD = 100;
    static #BUILDING_PADDING = 10;
    static #MAX_SPARE_NODES = 5;
    static #desiredBuildingsQueue = [];

    static QueueDesire(desire) {

        NodeAI.#desiredBuildingsQueue.push(desire);
        
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

        return NodeAI.#desiredBuildingsQueue.length > 0;
    }

    // TODO: We should be able to get rid of this once it takes time to make a node
    static #lastThought = performance.now();

    #nextConstructPositions = {};

    /**
     * 
     * @param {Building} character 
     */
    constructor(character) {
        super(character);

        // this.#computeNextConstructPosition(character.characterType);
        const that = this;
        setTimeout(() => {
            that.#computeNextConstructPosition(character.characterType)
        }, 5);
    
        Events.Subscribe(Events.List.BuildingBuilt, this.#onBuildingBuilt.bind(this));
    }

    #onBuildingBuilt(details) {

        if(details.characterType != this.character.characterType) return;

        const characterType = CharacterType[details.characterType];
        // if(characterType?.overlapRange > 0) {
            this.#computeNextConstructPosition(characterType);
        // }
    }

    // invoke this both on constructor
    // and when buildings of that type are built
    #computeNextConstructPosition(buildingType) {

        // TODO: check if 'buildingType' is a proper definition

        const point = this.character.getEligibleConstructionPosition(buildingType);

        this.#nextConstructPositions[buildingType.name] = point;
    }

    #getNextConstructionPosition(buildingType) {

        if(!this.#nextConstructPositions[buildingType.name]) {
            this.#computeNextConstructPosition(buildingType);
        }

        return this.#nextConstructPositions[buildingType.name];
    }

    think(elapsed) {
        super.think(elapsed);

        if(NodeAI.#lastThought + TIME_BETWEEN_THOUGHTS > performance.now()) {
            return;
        }

        this.#nodeThink(elapsed);

        NodeAI.#lastThought = performance.now();
    }

    #isNodeBusy() {

        if(!this.character.isGrown) return true;

        // because we won't be able to get "randomPositionOffset" further down
        if(this.character.position?.chunk == null) {
            this.character.position.chunk = Map.Map.getChunk(this.character.position);
            if(this.character.position.chunk == null) {
                console.warn(`Couldn't resolve chunk for position.`);
                return true;
            }
        }

        // there HAS to be a cleaner way to do this
        for(var index = 0; index < this.character.growing.length; index++) {
            if(this.character.growing[index].isGrown) {
                this.character.growing.splice(index, 1);
                index--;
            }
        }
        
        if(this.character.growing.length > 0) return true;

        return false;
    }

    #nodeThink() {

        if(this.#isNodeBusy()) return;

        const food = Resource.Get("food");
        if (food.available > NodeAI.#FOOD_THRESHOLD) {

            if (NodeAI.#wantDevelopNode()) {

                this.#buildFromQueue();
            } else {

                const wantToBuild = this.#whatShouldBeBuilt();
                this.#buildDesired(wantToBuild);
            }
        }
    }

    #buildFromQueue() {

        const intent = NodeAI.#desiredBuildingsQueue[0];
        if (intent) {
            this.character.Develop(intent);
            Events.RaiseEvent(Events.List.BuildingDesireFulfilled, intent);
            // we could probably slice it off instead?
            NodeAI.#desiredBuildingsQueue.splice(0, 1);
        } else {
            console.warn(`Thought we had intent, but we don't.`);
        }
    }

    #whatShouldBeBuilt() {

            // at least 1 other node nearby (that can build other nodes ...)
            // we may want to allow non-nodes to build buildings?

            // TODO: Should be using characterType enums
            const nearbyNodes = this.character.getNearbyEntities({
                distance: NEARBY_RANGE,
                faction: this.character.faction,
                characterType: 'Node',
            });
            if(nearbyNodes.length == 0) {
                return CharacterType.Node;
            }

            // TODO: We probably eventually want to balance seeders and eaters and not just have one ...
            // maybe we can 'default' one at the end, and compare counts?
            const nearbyEaters = this.character.getNearbyEntities({
                distance: NEARBY_RANGE,
                faction: this.character.faction,
                characterType: 'Eater'
            });
            if(nearbyEaters.length == 0) {
                return CharacterType.Eater;
            }

            return CharacterType.Seeder;

            // defense and stuff tho

            const nearbySeeders = this.character.getNearbyEntities({
                distance: NEARBY_RANGE,
                faction: this.character.faction,
                characterType: 'Seeder'
            });
            if(nearbySeeders.length == 0) {
                return CharacterType.Seeder;
            }
    }

    #buildDesired(wantToBuild) {

        const food = Resource.Get("food");
        if (food.available < NodeAI.#FOOD_THRESHOLD + wantToBuild.health) return;

        const buildOptions = this.#getDesiredBuildOptions(wantToBuild);

        // TODO: take some time to construct (grow)
        // (we are, though, aren't we? just below?)
        console.log(`Node has chosen to build ${wantToBuild.name} at ${buildOptions.position}`);
        const building = new Building(buildOptions);
        if(!food.reserve(building.maxHealth), building) return;

        const healthDiff = building.health * .9;
        building.health = building.health * 0.1;
        building.grow(healthDiff * 500);

        this.character.growing.push(building);

        return building;
    }

    #getDesiredBuildOptions(wantToBuild) {

        // this needs to be changed entirely
        // const position = NodeAI.#randomPositionOffset(this.character.position, NodeAI.#BUILDING_PADDING / 2);
        const position = this.#getNextConstructionPosition(wantToBuild.characterType);
        if(position == null) {
            console.warn(`Couldn't get position for new building. Probably out of bounds.`);
            return;
        }
        // console.log(`I'm at ${this.character.position}, making a new node at ${position}`);

        const options = Object.assign({}, wantToBuild);
        options.position = position;
        options.faction = this.character.faction;
        options.cost = wantToBuild.health;

        return options;
    }
}
