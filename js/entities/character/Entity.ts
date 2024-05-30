import CharacterType from "../../../../js/entities/characterType.mjs";
import Point from "../../baseTypes/point.mjs";
import Events from "../../events.mjs";
import { generateId } from "../../util/javascript-extensions.mjs";
import CharacterAttribute from "../character-attribute.mjs";
import { AddCharacterToList, CHARACTER_LIST } from "../characters.mjs";

// @ts-ignore
Events.List.CharacterCreated = "CharacterCreated";

interface SortingEntity {
    distance: number;
    entity: CharacterType;
}

interface GetClosestEntityOptions {
    distance?: number;
    filterChildren?: boolean;
    hostile?: boolean | null;
    isPlayer?: boolean | null;
    characterType?: CharacterType | null;
    grown?: boolean | null;
    exclude?: any[];
    faction?: boolean | null;
    priorities?: Entity[];
    characterProperties?: Object;
}

type Velocity = { x: number, y: number };

export default class Entity {

    static get(options: any) {

        let charList = CHARACTER_LIST;
        for(var key of Object.keys(options)) {
            charList = charList.filter(x => x[key] == options[key]);
        }

        return charList;
    }

    id: string;
    name: string;
    
    #attributes: { [key: string]: CharacterAttribute } = {};
    _position: Point = new Point(0, 0);

    // TODO: make private?
    // had to make "public" to make protected
    _velocity: Velocity = { x: 0, y: 0 };

    // prevent trying to set x and y
    get x() { return this._position.x; }
    get y() { return this._position.y; }

    // TODO: implement variable character attributes
    get vision() {
        return 1;
    }

    // TODO: use this variable for ... things
    get speed() {
        return this.getAttribute("Speed").value;
    }

    set speed(newValue) {        
        this.getAttribute("Speed").value = newValue;
    }

    get position(): Point {
        return this._position;
    }

    set position(options: { x: number, y: number }) {
        if (options.x) this._position.x = options.x;
        if (options.y) this._position.y = options.y;
    }

    get velocity() {
        return this._velocity;
    }

    set velocity(options: Velocity) {
        if (options.x != null) this._velocity.x = options.x;
        if (options.y != null) this._velocity.y = options.y;
    }

    // TODO: not 'any'
    constructor(options: any) {

        this.id = options.id || generateId();

        this.name = options.name || "TODO";     // TODO :/
        
        if(options.position) { 
            this._position = new Point(options.position.x, options.position.y);
            delete options.position;
        };

        let speedVal = 1;
        if(options.speed != undefined) {

            speedVal = options.speed;
            delete options.speed;
        }
        
        this.addAttribute(new CharacterAttribute({
            name: 'Speed',
            value: speedVal,
            baseCost: 40,
            costFunction: this.logarithmicCost
        }));

        // @ts-ignore
        Events.RaiseEvent(Events.List.CharacterCreated, this, {
            isNetworkBoundEvent: true
        });

        AddCharacterToList(this);
    }

    // TODO: some day, when typescript sucks less, combine with the above setter
    setVelocityFromStrting(velocity: string) {
        const split = velocity.split(",");
        this._velocity.x = +split[0];
        this._velocity.y = +split[1];
    }

    logarithmicCost(characterAttribute: CharacterAttribute) {
        
        const baseCost = characterAttribute.baseCost || 1;
        return Math.round(baseCost + Math.log(characterAttribute.value * baseCost));
    }

    addAttribute(characterAttribute: CharacterAttribute) {

        this.#attributes[characterAttribute.name] = characterAttribute;
    }

    getAttribute(name: string) {

        return this.#attributes[name];
    }

    getDistance(entity: Entity) {
        // TODO: Bounding boxes rather than coordinates
        return Math.abs(this._position.x - entity._position.x)
            + Math.abs(this._position.y - entity._position.y);
    }
    
    move(amount: number) {        
        this._position.x += this._velocity.x * this.speed * amount;
        this._position.y += this._velocity.y * this.speed * amount;
    }

    getNearbyEntities(options: { max?: number, distance?: number } = {}) {
        
        options.max = options.max || 10;
        options.distance = options.distance || 100;

        const nearbyEntities = [];

        for (var character of CHARACTER_LIST) {

            if(character == this 
                || this.shouldFilterCharacter(character, options)) {
                continue;
            }

            // Remember this is going to be weird because we're doing origin coordinates
            // rather than bounding boxes
            const distance = character.getDistance(this);
            if (distance < options.distance) {
                nearbyEntities.push({
                    distance,
                    entity: character
                });
            }
        }

        nearbyEntities.sort(this.#nearestSort);
        if(nearbyEntities.length > options.max) {
            nearbyEntities.splice(options.max - 1);
        }

        return nearbyEntities;
    }

    // TODO: Also take into account directionality -- prioritize where the player is facing
    // TODO: Need to prioritize close hostile entities over closer non-hostile
    // this really needs a test now ...
    getClosestEntity(options: GetClosestEntityOptions = {
        distance: 100,
        filterChildren: true,
        hostile: null as boolean | null,
        isPlayer: null as boolean | null,
        characterType: null as CharacterType,
        // Maybe rather than listing individual properties like this,
        // we could have a way to automatically map properties?
        grown: null as boolean | null,
        // TODO: this'll be broken if we start using exclude in ts...
        exclude: [] as any,
        faction: null as boolean | null,
        // lowest to highest
        priorities: [] as Entity[],
        characterProperties: {} as any
    }) {
        const nearbyEntities = this.getNearbyEntities(options);

        // for now, we'll just do in order, but later we could add in Weights to priorities
        if(options.priorities) {
            const distMargin = 5;

            nearbyEntities.sort(this.#prioritizedNearestSort(options.priorities, distMargin));
        }

        return nearbyEntities[0]?.entity || null;
    }

    #prioritizedNearestSort(priorities: Entity[], margin: number) {
        return function(first: SortingEntity, second: SortingEntity) {

            // TODO: charactertype is a hivemind implementation, not an engine one ...
            const firstPriority = priorities.indexOf(first.entity.characterType) + 1;
            const secondPriority = priorities.indexOf(second.entity.characterType) + 1;

            if(firstPriority > secondPriority && first.distance - margin < second.distance) {
                return 1;
            }
            else if(secondPriority > firstPriority && second.distance - margin < first.distance) {
                return -1;
            }
            else return 0;
        }
    }

    #nearestSort(first: SortingEntity, second: SortingEntity) {

        if(first.distance > second.distance) {
            return 1;
        } else if(second.distance > first.distance) {
            return -1;
        } else {
            return 0;
        }
    }

    // TODO: Putting this in here was kind of a hack
    // it used to be private
    // and we basically just wired it for Character above to overwrite
    // since it needs to be called in this class ...
    shouldFilterCharacter(character: Entity, options: any) {
        console.log('OH NO!');
        return false;
    }

    // TODO: should we support a point as well?
    pointAtTarget(target: Entity) {

        if (target) {
            if (this.position.x != target.position.x
                || this.position.y != target.position.y) {
                if (this.position.x < target.position.x) this._velocity.x = 1;
                else if (this.position.x > target.position.x) this._velocity.x = -1;
                if (this.position.y < target.position.y) this._velocity.y = 1;
                else if (this.position.y > target.position.y) this._velocity.y = -1;
            }
        } else {
            this._velocity.x = 0;
            this._velocity.y = 0;
        }
    }

    equals(entity: Entity) {
        return entity.id == this.id;
    }
}
