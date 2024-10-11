// Most basic / default AI
import Vector from "../baseTypes/Vector";
import WorldCoordinate from "../coordinates/WorldCoordinate";
import Entity from "../entities/character/Entity";
import { CharacterDamagedEvent } from "../entities/character/mixins/Living";
import { Sentient } from "../entities/character/mixins/Sentient";
import Events, { GameEvent } from "../events";
import { Defer } from '../loop.mjs';

const MS_LEASH_COOLDOWN = 3000;

Events.List.CharacterTargetChanged = "CharacterTargetChanged";

export interface CharacterTargetChangedEvent extends GameEvent {
    character: Entity;
    from: Entity | WorldCoordinate;
    to: Entity | WorldCoordinate;
}

export enum EntityRelationshipType {
    Friendly,
    Neutral,
    Hostile,
    Afraid
};

export interface EntityRelationship {
    type: EntityRelationshipType,
    amount: number
};

type ThinkFunction = (elapsed: number) => void;

export default class AI {

    private _character: Entity & Sentient;
    private _leashing = false;
    private _relationships: Map<Entity, EntityRelationship> = new Map();
    private _targetEntity: Entity;
    private thinkFunctions: ThinkFunction[] = [];

    get character() { return this._character; }
    get leashing() { return this._leashing; }
    get targetEntity() { return this._targetEntity; }

    set targetEntity(newValue) { 
        
        if (newValue === undefined || newValue == this._targetEntity) return;

        const oldValue = this._targetEntity;
        this._targetEntity = newValue;
        const options: CharacterTargetChangedEvent = {
            id: null,
            character: this.character,
            from: oldValue,
            to: this._targetEntity
        }

        Events.RaiseEvent(Events.List.CharacterTargetChanged, options);
    }

    constructor(character: Entity & Sentient) {
        this._character = character;

        Events.Subscribe(Events.List.CharacterDamaged, this.onCharacterDamaged.bind(this));
    }    

    // TODO: faction

    setRelationship(entity: Entity, relationship: EntityRelationship) {
        this._relationships.set(entity, relationship);
    }

    relationship(entity: Entity) {
        return this._relationships.get(entity);
    }

    RegisterThinkMethod(func: (elapsed: number) => void) {
        this.thinkFunctions.push(func);
    }

    think(elapsed: number) {

        this.wander();

        this.thinkFunctions.forEach(func => func(elapsed));
    }

    wander() {
        if(this.targetEntity) return;
        
        this.character.SetDesiredMovementVector(
            this._desiredMovementVector.x,
            this._desiredMovementVector.y
        );
    }

    // TODO: mark private
    // (and update the tests)
    get _desiredMovementVector() {
        const vector = new Vector(0, 0);

        this._relationships.forEach((relationship, entity) => {
            // determine the normalized direction between this._character and entity
            const xDiff = entity.position.x - this._character.position.x;
            const yDiff = entity.position.y - this._character.position.y;
            const slope = new Vector(xDiff, yDiff).normalized;
            if(relationship.type == EntityRelationshipType.Afraid) {
                slope.multiply(-1 * relationship.amount);
            } else {
                slope.multiply(relationship.amount);
            }
            vector.add(slope);
        });

        return vector.normalized;
    }

    // ideally protected
    onCharacterDamaged(details: CharacterDamagedEvent) {
        if(details.character != this.character) return;
        this.setRelationship(details.attacker, { type: EntityRelationshipType.Afraid, amount: 1 });
    }

    #unleash() {
        this._leashing = false;
    }

    leash(point: Readonly<WorldCoordinate>, distance: number) {
        var dist = this._character.position.distance(point);
        if (dist > distance) {
            console.debug(`Wandered too far (${dist}), with speed ${this._character.speed} leashing to ${point.x}, ${point.y}`);
            const desiredVector = this.getVectorFromPoint(point);
            // this._targetPosition = new WorldCoordinate(point.x, point.y);
            
            this.character.SetDesiredMovementVector(
                desiredVector.x,
                desiredVector.y
            );

            this._leashing = true;
            Defer(this.#unleash.bind(this), MS_LEASH_COOLDOWN);
        }
    }

    getVectorFromPoint(point: Readonly<WorldCoordinate>) {
        // get the vector from the character to the point
        const xDiff = point.x - this._character.position.x;
        const yDiff = point.y - this._character.position.y;
        return new Vector(xDiff, yDiff);
    }
}
