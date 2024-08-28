import CharacterType from "../../../../js/entities/CharacterType";
import Events, { GameEvent } from "../../events";
import { generateId } from "../../util/javascript-extensions.mjs";
import CharacterAttribute from "../character-attribute";
import { AddCharacterToList, CHARACTER_LIST, RemoveCharacterFromList } from "../characters";
import WorldCoordinate from "../../coordinates/WorldCoordinate";
import EntityRenderingSettings from './EntityRenderingSettings';
import Faction from '../faction';
import Vector from "../../baseTypes/Vector";
import { Defer } from "../../loop.mjs";
import WorldObject, { WorldObjectOptions } from "../../baseTypes/WorldObject";

Events.List.CharacterCreated = "CharacterCreated";

export interface CharacterFilterOptions {
    exclude?: Entity[];
    characterType?: CharacterType;
    characterProperties?: { [key: string]: any };
}

export interface EntityOptions { 
    id?: string;
    name?: string;
    speed?: number;
    characterType?: CharacterType;
    entityRenderingSettings?: EntityRenderingSettings;
    color?: string;
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

export default class Entity extends WorldObject {

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
    private _desiredMovementVector: Vector = new Vector(0, 0);
    private _color: string;
    private _characterType: CharacterType;

    // one dimension, rather than height and width, for now
    get size() { return 1 }
    get color() { return this._color; }

    get characterType() { 
        if(this._characterType == null) {
            this._characterType = CharacterType.List[this._name];
        }
        return this._characterType;
    }

    entityRenderingSettings: EntityRenderingSettings;

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

    get desiredMovementVector() {
        return this._desiredMovementVector;
    }

    set desiredMovementVector(newVal: Vector) {
        this._desiredMovementVector = newVal;
       this._desiredMovementVector.onChanged = this.onDirectionVectorChanged.bind(this);
    }

    constructor(options: EntityOptions & WorldObjectOptions = {}) {
        super(options);

        this._id = options.id || generateId();

        this._characterType = options.characterType || CharacterType.List[options.name];

        this._name = options.name || this.characterType?.name || "TODO";     // TODO :/

        let speedVal = 1;
        if(options.speed != undefined) {    // 0 is a valid speed, so we need to check more explicitly
            speedVal = options.speed;
        }

        if(options.entityRenderingSettings) this.entityRenderingSettings = options.entityRenderingSettings;
        this._color = options.color || options.characterType?.color || undefined;
        
        this.addAttribute(new CharacterAttribute({
            name: 'Speed',
            value: speedVal,
            baseCost: 40,
            costFunction: this.logarithmicCost
        }));

        this._desiredMovementVector.onChanged = this.onDirectionVectorChanged.bind(this);

        AddCharacterToList(this);

        Defer(this.postConstruct.bind(this));
    }

    private onDirectionVectorChanged(vector: Vector) {
        if(vector.x != 0 || vector.y != 0) {
            // TODO: does this mean this should be pushed down to WorldObject?
            this.facing = vector;
        }
    }

    postConstruct() {
        const entityEvent: EntityEvent = {
            id: null,
            entity: this
        };
        Events.RaiseEvent(Events.List.CharacterCreated, entityEvent, {
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
        return Math.abs(this.position.x - entity.position.x)
            + Math.abs(this.position.y - entity.position.y);
    }
    
    move(amount: number) {
        if(this.speed != 0) {
            const desiredPosition = {
                x: null as number | null,
                y: null as number | null
            }
            if(this._desiredMovementVector.x != 0) {
                desiredPosition.x = this.position.x + (this._desiredMovementVector.x * this.speed * amount);
            }
            if(this._desiredMovementVector.y != 0) {
                desiredPosition.y = this.position.y + (this._desiredMovementVector.y * this.speed * amount);
            }
            this.position = desiredPosition;
        }
    }

    getNearbyEntities(options: { max?: number, distance?: number, characterType?: CharacterType, faction?: Faction } = {}):
    SortingEntity[] {
        
        options.max = options.max || 10;
        options.distance = options.distance || 100;

        const nearbyEntities = [];

        for (var character of CHARACTER_LIST) {

            if(character.equals(this)
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

        nearbyEntities.sort(this._nearestSort);
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

            nearbyEntities.sort(this._prioritizedNearestSort(options.priorities, distMargin));
        }

        return nearbyEntities[0]?.entity || null;
    }

    private _prioritizedNearestSort(priorities: CharacterType[], margin: number) {
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

    private _nearestSort(first: SortingEntity, second: SortingEntity) {

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
    // and we basically just wired it for mixins to overwrite / extend
    // since it needs to be called from this base class ...
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
    pointAtTarget(target?: Readonly<WorldCoordinate>) {

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

    destroy() {   
        RemoveCharacterFromList(this);
        // TODO: probably raise event to get graphics removed
    }
}
