import Resource from "../../engine/js/entities/resource.mjs";
import CharacterType from "./characterType.mjs";
import Events from "../../engine/js/events.mjs";
import Rectangle from "../../engine/js/baseTypes/rectangle.ts";
import WorldCoordinate from "../../engine/js/coordinates/WorldCoordinate.ts";
import SlimeCharacter from "./character/SlimeCharacter.ts";

Events.List.BuildingBuilt = "BuildingBuilt";

export default class Building extends SlimeCharacter {

    static #blockingZones = {};

    static #addBlockingZone(buildingType, zone) {

        if(!Building.#blockingZones[buildingType]) {
            Building.#blockingZones[buildingType] = [];
        }
        Building.#blockingZones[buildingType].push(zone);
    }

    #blockingZone;
    get blockingZone() { return this.#blockingZone; }

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

        if(characterType.overlapRange) {
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
        Building.#addBlockingZone(characterType.name, this.#blockingZone);
        
        Events.RaiseEvent(Events.List.BuildingBuilt, this);
    }

    canBeEaten(byWhom) {

        return false;
    }

    /**
     * 
     * @param {Object} intent 
     * @param {CharacterType} intent.characterType
     * @param {int} intent.health
     */
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

    #getZonePosition(characterType, distance) {

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

    #getCharacterPosition(characterType, distance) {

        const entities = this.getNearbyEntities({
            characterType: characterType.name,
            distance
        });

        // if distance < 100?
        for(var x = Math.floor(this.position.x - distance); x < Math.ceil(this.position.x + distance); x++) {
            for(var y = Math.floor(this.position.y - distance); y < Math.ceil(this.position.y + distance); y++) {
                
                for(var entity of entities) {
                    entity = entity.entity;     // ugly, sorry, couldn't figure out how to unpack the object

                    // if(!entity.blockingZone) debugger;

                    // if entity blocks this position
                    if(entity?.blockingZone?.containsPoint(new WorldCoordinate(x, y))) {
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

        if((typeof characterType) == 'string') {
            characterType = CharacterType[characterType];
        }
        const distance = (this.range || 0 + characterType?.overlapRange || 0) || 100;

        if(characterType.overlapRange) {
            return this.#getZonePosition(characterType, distance);
        } else {
            return this.#getCharacterPosition(characterType, distance);
        }
    }
}
