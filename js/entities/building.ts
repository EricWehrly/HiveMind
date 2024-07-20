import Resource from "../../engine/js/entities/resource.mjs";
import CharacterType from "./CharacterType";
import Events from "../../engine/js/events";
import Rectangle from "../../engine/js/baseTypes/rectangle";
import WorldCoordinate from "../../engine/js/coordinates/WorldCoordinate";
import GrowthCharacter from "./character/GrowthCharacter";

Events.List.BuildingBuilt = "BuildingBuilt";

interface BuildingCharacterType extends CharacterType {
    cost: number;
    overlapRange: number;
    range: number;
}

export default class Building extends GrowthCharacter {

    static #blockingZones: { [key: string]: Rectangle[] } = {};

    static #addBlockingZone(buildingTypeName: string, zone: Rectangle) {

        if(!Building.#blockingZones[buildingTypeName]) {
            Building.#blockingZones[buildingTypeName] = [];
        }
        Building.#blockingZones[buildingTypeName].push(zone);
    }

    #blockingZone;
    get blockingZone() { return this.#blockingZone; }

    isBuilding: boolean;
    range: number;
    // TODO: Temporary property to appease mixin
    grow: (amount: number) => void;

    // we may be able to do all this in the base class
    constructor(options: any) {

        // TODO: there are a LOT of undefined variables on these
        // 'name' is actually unset/undefined
        // but color and cost are getting assigned the VALUE of undefined
        const characterType = (options.characterType || CharacterType.List[options.characterType || options.name]) as BuildingCharacterType;
        const cost = options.cost || characterType?.cost || characterType?.health;

        if(cost) {
            const food = Resource.Get("food");
            if(!food.pay(cost)) {
                console.log(`You can't afford to build ${characterType.name} for ${cost}`);
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

        if(characterType?.overlapRange) {
            const halfRange = characterType.overlapRange / 2;
            this.#blockingZone = new Rectangle(
                Math.floor(this.x - halfRange),
                Math.floor(this.y - halfRange),
                characterType.overlapRange,
                characterType.overlapRange
            );
        } else {            
            this.#blockingZone = new Rectangle(
                Math.floor(this.x),
                Math.floor(this.y),
                1,
                1
            );
        }
        if(characterType?.name) {
            Building.#addBlockingZone(characterType.name, this.#blockingZone);
        }
        
        Events.RaiseEvent(Events.List.BuildingBuilt, this);
    }

    canBeEaten(byWhom: any) {
        return false;
    }

    /**
     * 
     * @param {Object} intent 
     * @param {CharacterType} intent.characterType
     * @param {int} intent.health
     */
    Develop(intent: Building) {

        // TODO: check minimum food before doing this?

        this.characterType = intent.characterType;
        if (this.health > (0.2 * this.maxHealth)) {
            this.health -= (0.2 * this.maxHealth);
        }
        // TODO: Get this to stop producing negative numbers and drop the Math.abs
        const healthDiff = Math.abs(intent.health - this.health);
        this.grow(healthDiff * 500);
        this.maxHealth = intent.characterType.health;
    }

    #getZonePosition(characterType: CharacterType, distance: number) {

        const blockingZones = Building.#blockingZones[characterType.name];

        // if distance < 100?
        for(var x = Math.floor(this.position.x - distance); x < Math.ceil(this.position.x + distance); x++) {
            for(var y = Math.floor(this.position.y - distance); y < Math.ceil(this.position.y + distance); y++) {

                if(blockingZones) {
                    for(var zoneRect of blockingZones) {
                        // does that zone contain this zone
                        if(zoneRect.containsRect(this.#blockingZone)) {
                            // move y position to below the rect
                            continue;
                        }
                    }
                }

                // console.debug(`Character ${characterType.name} zone position: ${x}, ${y}`);
                return new WorldCoordinate(x, y);
            }
        }
    }

    #getCharacterPosition(characterType: CharacterType, distance: number) {

        const entities = this.getNearbyEntities({
            characterType,
            distance
        });

        // if distance < 100?
        for(var x = Math.floor(this.position.x - distance); x < Math.ceil(this.position.x + distance); x++) {
            for(var y = Math.floor(this.position.y - distance); y < Math.ceil(this.position.y + distance); y++) {
                
                for(var entityDistance of entities) {
                    const entity = entityDistance.entity as Building;

                    if(!entity.blockingZone) debugger;

                    // if entity blocks this position
                    if(entity?.blockingZone?.containsPoint(x, y)) {
                        y = entity.blockingZone.y + entity.blockingZone.height;
                        continue;
                    }
                }
                
                // console.debug(`Character ${characterType.name} position: ${x}, ${y}`);
                return new WorldCoordinate(x, y);
            }
        }
    }

    getEligibleConstructionPosition(characterType = this.characterType) {

        const BuildingCharacterType = characterType as BuildingCharacterType;

        const distance = (this.range 
                || (this.characterType as BuildingCharacterType).range 
                || 0 + BuildingCharacterType?.overlapRange || 0)
            || 100;

        if(BuildingCharacterType.overlapRange) {
            return this.#getZonePosition(BuildingCharacterType, distance);
        } else {
            return this.#getCharacterPosition(BuildingCharacterType, distance);
        }
    }
}
