import CharacterType from "../../../../js/entities/CharacterType";
import Events, { GameEvent } from "../../events";
import { generateId } from "../../util/javascript-extensions.mjs";
import CharacterAttribute from "../character-attribute";
import { AddCharacterToList, CHARACTER_LIST } from "../characters";
import PostConstruct from "../../../ts/decorators/PostConstruct";
import PostConstructClass from "../../../ts/decorators/PostConstructClass";
import WorldCoordinate from "../../coordinates/WorldCoordinate";
import Rectangle from "../../baseTypes/rectangle";
import EntityRenderingSettings from './EntityRenderingSettings';
import Faction from '../faction';
import Vector from "../../baseTypes/Vector";

Events.List.CharacterCreated = "CharacterCreated";

export interface CharacterFilterOptions {
    exclude?: Entity[];
    characterType?: CharacterType;
    characterProperties?: { [key: string]: any };
}

export interface EntityOptions { 
    position?: { x: number, y: number };
    id?: string;
    name?: string;
    speed?: number;
    characterType?: CharacterType,
    entityRenderingSettings?: EntityRenderingSettings
}

interface SortingEntity {
    distance: number;
    entity: Entity;
}

interface GetClosestEntityOptions {
    distance?: number;
    filterChildren?: boolean;
    hostile?: boolean | null;
    isPlayer?: boolean | null;
    characterType?: CharacterType | null;
    grown?: boolean | null;
    exclude?: any[];
    faction?: Faction | null;
    priorities?: CharacterType[];
    characterProperties?: Object;
}

export interface EntityEvent extends GameEvent {
    entity: Entity;
}

@PostConstructClass
export default class Entity {

    static get(options: any) {

        let charList = CHARACTER_LIST;
        for(var key of Object.keys(options)) {
            // @ts-expect-error
            charList = charList.filter(x => x[key] == options[key]);
        }

        return charList;
    }

    private _id: string;
    private _name: string;
    get id() { return this._id; }
    get name() { return this._name; }
    
    private _attributes: { [key: string]: CharacterAttribute } = {};
    _position: WorldCoordinate = new WorldCoordinate(0, 0);
    private _desiredMovementVector: Vector = new Vector(0, 0);
    private _rotation: number = 0;
    private _area: Rectangle = new Rectangle(0, 0, 0, 0);

    // one dimension, rather than height and width, for now
    get size() { return 1 }

    private _characterType: CharacterType;
    get characterType() { 
        if(this._characterType == null) {
            this._characterType = CharacterType.List[this._name];
        }
        return this._characterType;
    }

    entityRenderingSettings: EntityRenderingSettings;

    // prevent trying to set x and y
    get x() { return this._position.x; }
    get y() { return this._position.y; }

    get area() { return this._area; }

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

    get position(): WorldCoordinate {
        return this._position;
    }

    set position(options: { x: number, y: number }) {
        if (options.x) this._position.x = options.x;
        if (options.y) this._position.y = options.y;
        this._area.position = this._position;
    }

    get desiredMovementVector() {
        return this._desiredMovementVector;
    }

    set desiredMovementVector(newVal: Vector) {
        this._desiredMovementVector = newVal;
    }

    get rotation() { return this._rotation; }

    set rotation(newValue) { this._rotation = newValue; }

    constructor(options: EntityOptions = {}) {

        this._id = options.id || generateId();

        this._characterType = options.characterType || CharacterType.List[options.name];

        this._name = options.name || this.characterType?.name || "TODO";     // TODO :/
        
        if(options.position) { 
            this._position = new WorldCoordinate(options.position.x, options.position.y);
            delete options.position;    // we should remove this line
            this._area.position = this._position;
        };

        let speedVal = 1;
        if(options.speed != undefined) {    // 0 is a valid speed, so we need to check more explicitly
            speedVal = options.speed;
        }

        if(options.entityRenderingSettings) this.entityRenderingSettings = options.entityRenderingSettings;
        
        this.addAttribute(new CharacterAttribute({
            name: 'Speed',
            value: speedVal,
            baseCost: 40,
            costFunction: this.logarithmicCost
        }));

        AddCharacterToList(this);
    }

    @PostConstruct
    postConstruct() {

        Events.RaiseEvent(Events.List.CharacterCreated, {entity: this }, {
            isNetworkBoundEvent: true
        });
    }

    logarithmicCost(characterAttribute: CharacterAttribute) {
        
        const baseCost = characterAttribute.baseCost || 1;
        return Math.round(baseCost + Math.log(characterAttribute.value * baseCost));
    }

    addAttribute(characterAttribute: CharacterAttribute) {

        this._attributes[characterAttribute.name] = characterAttribute;
    }

    getAttribute(name: string) {

        return this._attributes[name];
    }

    getDistance(entity: Entity) {
        // TODO: Bounding boxes rather than coordinates
        return Math.abs(this._position.x - entity._position.x)
            + Math.abs(this._position.y - entity._position.y);
    }
    
    move(amount: number) {
        if(this.speed != 0) {
            if(this._desiredMovementVector.x != 0) this._position.x += this._desiredMovementVector.x * this.speed * amount;
            if(this._desiredMovementVector.y != 0) this._position.y += this._desiredMovementVector.y * this.speed * amount;
        }
    }

    getNearbyEntities(options: { max?: number, distance?: number, characterType?: CharacterType, faction?: Faction } = {}):
    SortingEntity[] {
        
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
        faction: null as Faction | null,
        // lowest to highest
        priorities: [] as CharacterType[],
        characterProperties: {} as any
    }): Entity {
        const nearbyEntities = this.getNearbyEntities(options);

        // for now, we'll just do in order, but later we could add in Weights to priorities
        if(options.priorities) {
            const distMargin = 5;

            nearbyEntities.sort(this.#prioritizedNearestSort(options.priorities, distMargin));
        }

        return nearbyEntities[0]?.entity || null;
    }

    #prioritizedNearestSort(priorities: CharacterType[], margin: number) {
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
    shouldFilterCharacter(character: Entity, options: CharacterFilterOptions) {
        
        if(options.characterType != null && character.characterType != options.characterType) {
            return true;
        }
        if(options.exclude && options.exclude.includes(character)) {
            return true;
        }
        if(options.characterProperties) {
            for(var key of Object.keys(options.characterProperties)) {
                // this 'character[key]' is a hack
                // @ts-expect-error
                if(character[key] != options.characterProperties[key]) {
                    return true;
                }
            }
        }
        
        return false;
    }

    // TODO: should we support a point as well?
    pointAtTarget(target?: WorldCoordinate) {

        if (target) {
            if (this.position.x != target.x
                || this.position.y != target.y) {
                if (this.position.x < target.x) this._desiredMovementVector.x = 1;
                else if (this.position.x > target.x) this._desiredMovementVector.x = -1;
                if (this.position.y < target.y) this._desiredMovementVector.y = 1;
                else if (this.position.y > target.y) this._desiredMovementVector.y = -1;
            }
        } else {
            this._desiredMovementVector.x = 0;
            this._desiredMovementVector.y = 0;
        }
    }

    equals(entity: Entity) {
        return entity._id == this._id;
    }
}
