import Character from "../../engine/js/entities/character.mjs";
import Resource from "../../engine/js/entities/resource.mjs";
import { RegisterLoopMethod } from "../../engine/js/loop.mjs";
import Events from "../../engine/js/events.mjs";
import { BuildBuilding } from "../entities/building.mjs";
import CharacterType from "../entities/characterType.mjs";
import Point from "../../engine/js/baseTypes/point.mjs";

const FOOD_THRESHOLD = 500;
let BUILD_NODE_COUNT = 0;
const BUILDING_PADDING = 10;
const MAX_SPARE_NODES = 5;

// this is a static / singleton class
export default class BuildingsHiveMind {

    static #lastThought = performance.now();
    static TIME_BETWEEN_THOUGHTS = 2000;
    static #desiredBuildingsQueue = [];

    static QueueDesire(desire) {

        console.log(desire);
        BuildingsHiveMind.#desiredBuildingsQueue.push(desire);
    }

    static #think() {

        if(performance.now() < BuildingsHiveMind.#lastThought + BuildingsHiveMind.TIME_BETWEEN_THOUGHTS) {
            return;
        }

        const localPlayer = Character.LOCAL_PLAYER;
        const food = Resource.Get("food");
        if(food.value > FOOD_THRESHOLD) {

            const closestToPlayer = localPlayer.getClosestEntity({
                faction: localPlayer.faction,
                characterProperties: {
                    isBuilding: true
                }
            });

            if(closestToPlayer
                && BUILD_NODE_COUNT < MAX_SPARE_NODES) {

                if(BuildingsHiveMind.#wantNewNode()) {

                    const position = new Point(closestToPlayer.position.x + 5, 
                        closestToPlayer.position.y + 5);

                    const options = {
                        characterType: CharacterType.Node.name,
                        position,
                        faction: localPlayer.faction
                    };

                    BuildBuilding(options);
                } else {
                    // do we have any nodes that we want to convert?
                }
            }
        }

        BuildingsHiveMind.#lastThought = performance.now();
    }

    static #wantNewNode() {

        return BUILD_NODE_COUNT == 0
            || BuildingsHiveMind.#desiredBuildingsQueue.length == 0;
        // if request queue is empty, MAYBE we want new nodes?
    }

    static {
        RegisterLoopMethod(BuildingsHiveMind.#think, false);

        Events.Subscribe(Events.List.GameStart, function() {
            Events.Subscribe(Events.List.BuildingBuilt, function(building) {
                if(building.name == "Node") BUILD_NODE_COUNT++;
            });
        });
    }
}
