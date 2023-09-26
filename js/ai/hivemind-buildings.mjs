import Character from "../../engine/js/entities/character.mjs";
import Resource from "../../engine/js/entities/resource.mjs";
import { RegisterLoopMethod } from "../../engine/js/loop.mjs";
import Events from "../../engine/js/events.mjs";
import CharacterType from "../entities/characterType.mjs";
import Point from "../../engine/js/baseTypes/point.mjs";
import Building from "../entities/building.mjs";

const FOOD_THRESHOLD = 100;
const BUILDING_PADDING = 10;
const MAX_SPARE_NODES = 5;

// this is a static / singleton class
export default class BuildingsHiveMind {

    static #lastThought = performance.now();
    static #buildNodeCount = 0;
    static TIME_BETWEEN_THOUGHTS = 3000;
    static #desiredBuildingsQueue = [];

    // TODO: Stop doing this stupid basic nonsense
    static #lastNodePosition;

    static QueueDesire(desire) {

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

            if(closestToPlayer) {

                if(!BuildingsHiveMind.#lastNodePosition) {
                    BuildingsHiveMind.#lastNodePosition = closestToPlayer.position;
                }

                if(BuildingsHiveMind.#wantDevelopNode()) {

                    const nodes = Character.get({characterType: "Node"});
                    const intent = BuildingsHiveMind.#desiredBuildingsQueue[0];
                    // check that we have node and intent, warn if no
                    if(nodes && nodes.length > 0 && intent) {
                        nodes[0].Develop(intent);
                        BuildingsHiveMind.#buildNodeCount = nodes.length - 1;
                        BuildingsHiveMind.#desiredBuildingsQueue.splice(0, 1);
                    }
                    else console.warn(`No nodes?`);

                } else if(BuildingsHiveMind.#wantNewNode()) {

                    const xDiff = Math.randomBool() ? 5 : -5;

                    const position = new Point(
                        BuildingsHiveMind.#lastNodePosition.x + xDiff,
                        BuildingsHiveMind.#lastNodePosition.y + BUILDING_PADDING / 2);

                    const options = {
                        characterType: CharacterType.Node.name,
                        position,
                        faction: localPlayer.faction
                    };

                    const building = Building.Build(options);

                    BuildingsHiveMind.#lastNodePosition = building.position;
                } else if(BuildingsHiveMind.#buildNodeCount > 0) {
                    // do we have nodes to develop?
                }
            }
        }

        BuildingsHiveMind.#lastThought = performance.now();
    }

    static #wantDevelopNode() {

        return BuildingsHiveMind.#buildNodeCount > 0 
        && BuildingsHiveMind.#desiredBuildingsQueue.length > 0;
    }

    static #wantNewNode() {

        return (BuildingsHiveMind.#buildNodeCount == 0
            || BuildingsHiveMind.#desiredBuildingsQueue.length == 0)
            && BuildingsHiveMind.#buildNodeCount < MAX_SPARE_NODES;
        // if request queue is empty, MAYBE we want new nodes?
    }

    static {
        RegisterLoopMethod(BuildingsHiveMind.#think, false);

        Events.Subscribe(Events.List.GameStart, function() {
            Events.Subscribe(Events.List.BuildingBuilt, function(building) {
                if(building.name == "Node") BuildingsHiveMind.#buildNodeCount++;
            });
        });
    }
}
