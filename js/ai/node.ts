import AI from "../../engine/js/ai/basic";
import Resource from "../../engine/js/entities/resource";
import CharacterType from "../entities/CharacterType";
import Events, { GameEvent } from "../../engine/js/events";
import Building from "../entities/building";
import WorldCoordinate from "../../engine/js/coordinates/WorldCoordinate";
import { Living } from "../../engine/js/entities/character/mixins/Living";
import { Growable } from "../entities/character/mixins/Growable";
import { Grower } from "../entities/character/mixins/Grower";
import { Combative } from "../../engine/js/entities/character/mixins/Combative";

Events.List.BuildingDesired = "BuildingDesired";
Events.List.BuildingDesireFulfilled = "BuildingDesireFulfilled";

export interface BuildingDesiredEvent extends GameEvent {
    desire: CharacterType
}

const TIME_BETWEEN_THOUGHTS = 5000;
const NEARBY_RANGE = 100;

// this is basically a temporary interface to use for position in entity definition
// so that we don't have to consider an instance
// we can probably get rid of this when we have a more comprehensive mixin setup
interface Positioned { 
    position: WorldCoordinate;
}

export default class NodeAI extends AI {

    static #FOOD_THRESHOLD = 100;
    static #BUILDING_PADDING = 10;
    static #MAX_SPARE_NODES = 5;
    static #desiredBuildingsQueue: CharacterType[] = [];

    static QueueDesire(desire: CharacterType) {

        NodeAI.#desiredBuildingsQueue.push(desire);

        const details = {
            name: desire.name
        };
        
        Events.RaiseEvent(Events.List.BuildingDesired, details);
    }
    
    // "source" sometimes won't have a chunk.
    // Hopefully the early return accounts for that
    static #randomPositionOffset(source: WorldCoordinate, offsetAmountPerAxis: number) {

        const seed = source?.chunk?.seed;
        if(seed == null) return null;
    
        let xOffset = seed.Random(0, offsetAmountPerAxis);
        if (seed.Random() < 0.5) xOffset *= -1;
        let yOffset = seed.Random(0, offsetAmountPerAxis);
        if (seed.Random() < 0.5) yOffset *= -1;
    
        return new WorldCoordinate(source.x + xOffset, source.y + yOffset);
    }

    static #wantDevelopNode() {

        return NodeAI.#desiredBuildingsQueue.length > 0;
    }

    // TODO: We should be able to get rid of this once it takes time to make a node
    static #lastThought = performance.now();

    #nextConstructPositions: Record<string, WorldCoordinate> = {};
    
    private _building: Building & Growable & Grower & Combative;

    get character() {
        return this._building;
    }

    constructor(character: Building & Growable & Grower & Combative) {
        super(character);

        this._building = character;

        // this.#computeNextConstructPosition(character.characterType);
        const that = this;
        setTimeout(() => {
            that.#computeNextConstructPosition(character.characterType)
        }, 5);
    
        Events.Subscribe(Events.List.BuildingBuilt, this.#onBuildingBuilt.bind(this));
    }

    #onBuildingBuilt(details: { characterType: CharacterType }) {

        if(details.characterType != this.character.characterType) return;

        // if(characterType?.overlapRange > 0) {
            this.#computeNextConstructPosition(details.characterType);
        // }
    }

    // invoke this both on constructor
    // and when buildings of that type are built
    #computeNextConstructPosition(buildingType: CharacterType) {

        // TODO: check if 'buildingType' is a proper definition

        const point = this.character.getEligibleConstructionPosition(buildingType);

        this.#nextConstructPositions[buildingType.name] = point;
    }

    #getNextConstructionPosition(buildingType: CharacterType) {

        if(!this.#nextConstructPositions[buildingType.name]) {
            this.#computeNextConstructPosition(buildingType);
        }

        return this.#nextConstructPositions[buildingType.name];
    }

    think() {
        super.think();

        if(NodeAI.#lastThought + TIME_BETWEEN_THOUGHTS > performance.now()) {
            return;
        }

        this.#nodeThink();

        NodeAI.#lastThought = performance.now();
    }

    #isNodeBusy() {

        if(this.character.isGrown == false) return true;

        // because we won't be able to get "randomPositionOffset" further down
        if(this.character.position?.chunk == null) {
            console.warn('We were hoping that chunk was not null');
            debugger;
            /*
            this.character.position.chunk = Map.Map.getChunk(this.character.position);
            if(this.character.position.chunk == null) {
                console.warn(`Couldn't resolve chunk for position.`);
                return true;
            }
            */
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
            this.#buildDesired(intent.characterType);
            Events.RaiseEvent(Events.List.BuildingDesireFulfilled, intent);
            // we could probably slice it off instead?
            NodeAI.#desiredBuildingsQueue.splice(0, 1);
        } else {
            console.warn(`Thought we had intent, but we don't.`);
        }
    }

    #whatShouldBeBuilt(): CharacterType & Living {

            // at least 1 other node nearby (that can build other nodes ...)
            // we may want to allow non-nodes to build buildings?

            // TODO: Should be using characterType enums
            const nearbyNodes = this.character.getNearbyEntities({
                distance: NEARBY_RANGE,
                faction: this.character.faction,
                characterType: CharacterType.List['Node'],
            });
            if(nearbyNodes.length == 0) {
                return CharacterType.List['Node'] as CharacterType & Living;;
            }

            // TODO: We probably eventually want to balance seeders and eaters and not just have one ...
            // maybe we can 'default' one at the end, and compare counts?
            const nearbyEaters = this.character.getNearbyEntities({
                distance: NEARBY_RANGE,
                faction: this.character.faction,
                characterType: CharacterType.List['Eater']
            });
            if(nearbyEaters.length == 0) {
                return CharacterType.List['Eater'] as CharacterType & Living;;
            }

            return CharacterType.List['Seeder'] as CharacterType & Living;;

            // defense and stuff tho

            const nearbySeeders = this.character.getNearbyEntities({
                distance: NEARBY_RANGE,
                faction: this.character.faction,
                characterType: CharacterType.List['Seeder']
            });
            if(nearbySeeders.length == 0) {
                return CharacterType.List['Seeder'] as CharacterType & Living;;
            }
    }

    #buildDesired(wantToBuild: CharacterType & Living) {

        const food = Resource.Get("food") as Resource;
        // TODO: We'll fix this next
        const wantedHealth = wantToBuild.health;
        if (food.available < NodeAI.#FOOD_THRESHOLD + wantedHealth) return;

        const buildOptions = this.#getDesiredBuildOptions(wantToBuild);

        const buildPosition = buildOptions.position;

        // TODO: take some time to construct (grow)
        // (we are, though, aren't we? just below?)
        console.log(`Node has chosen to build ${wantToBuild.name} at ${buildPosition}`);
        const building = Building.Build(wantToBuild, buildOptions) as Building & Growable & Living;
        // TODO: this should be BEFORE we instantiate, right? or, even, just, a part of?
        // also this is an over-reserve since we're already paying the (initial) health ...
        if(!food.reserve(building.maxHealth, building)) return;

        const healthDiff = building.health * .9;
        building.health = building.health * 0.1;
        building.grow(healthDiff * 500);

        this.character.growing.push(building);

        return building;
    }

    #getDesiredBuildOptions(wantToBuild: CharacterType)
        : CharacterType & Living & Positioned {

        // this needs to be changed entirely
        // const position = NodeAI.#randomPositionOffset(this.character.position, NodeAI.#BUILDING_PADDING / 2);
        const position = this.#getNextConstructionPosition(wantToBuild);
        if(position == null) {
            console.warn(`Couldn't get position for new building. Probably out of bounds.`);
            return;
        }
        // console.log(`I'm at ${this.character.position}, making a new node at ${position}`);

        // TODO: combining charactertype with other types results in properties that can't be traced back to their proper types :(
        // (because of dynamic property definitions)
        const options = Object.assign({}, wantToBuild) as CharacterType & Living & Positioned;
        options.position = position;
        options.faction = this.character.faction;
        options.cost = wantToBuild.health;

        return options;
    }
}
