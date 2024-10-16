// Most basic / default AI
import Vector from "../baseTypes/Vector";
import { EntityRelationship, EntityRelationshipType } from "../behavior/EntityRelationship";
import WorldCoordinate from "../coordinates/WorldCoordinate";
import Entity, { CharacterFilterOptions, NearbyEntityOptions } from "../entities/character/Entity";
import { CharacterDamagedEvent } from "../entities/character/mixins/Living";
import { Sentient } from "../entities/character/mixins/Sentient";
import Events, { GameEvent } from "../events";
import { Defer, RegisterLoopMethod } from '../Loop';

const MS_LEASH_COOLDOWN = 3000;

Events.List.CharacterTargetChanged = "CharacterTargetChanged";

// should extend EntityEvent, right?
export interface CharacterTargetChangedEvent extends GameEvent {
    character: Entity;
    from: Entity | WorldCoordinate;
    to: Entity | WorldCoordinate;
}

type ThinkFunction = (elapsed: number) => void;

export default class AI {

    private _character: Entity & Sentient;
    private _leashing = false;
    private _relationships: Map<Entity, EntityRelationship> = new Map();
    private _targetEntity: Entity;
    private thinkFunctions: ThinkFunction[] = [];
    private _desiredMovementVector?: Vector;

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

    get DesiredMovementVector() {
        if(this._desiredMovementVector != null) return this._desiredMovementVector;

        const vector = new Vector(0, 0);

        // how expensive would this get?
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

        this._desiredMovementVector = vector.normalized;
        return this._desiredMovementVector;
    }

    constructor(character: Entity & Sentient) {
        this._character = character;

        Events.Subscribe(Events.List.CharacterDamaged, this.onCharacterDamaged.bind(this));

        RegisterLoopMethod(this.updateRelationships.bind(this));
    }

    private updateRelationships() {

        const knownEntities = Array.from(this._relationships.keys());
        // TODO: We should unit test that targets outside of vision are ignored
        const vision = this.character.getAttribute('vision').value;
        // look for nearby entities that we don't already have a relationship with
        const options: NearbyEntityOptions & CharacterFilterOptions = {
            max: 3,     // don't want to "overstimulate" -- maybe smarter would think harder
            distance: vision,
            exclude: knownEntities
        }
        const nearbyEntities = this.character.getNearbyEntities(options);
        nearbyEntities.forEach(sortingEntity => {
            const entity = sortingEntity.entity;
            const relationship = this.determineRelationship(entity);
            this.setRelationship(entity, relationship);
        });
    }

    // ideally protected, so that extensions can overwrite, but other classes can't call
    determineRelationship(entity: Entity) {

        const relationship: EntityRelationship = {
            type: EntityRelationshipType.Neutral,
            amount: 0
        }
        return relationship;
    }

    setRelationship(entity: Entity, relationship: EntityRelationship) {
        this._relationships.set(entity, relationship);
    }

    getRelationship(entity: Entity) {
        return this._relationships.get(entity);
    }

    RegisterThinkMethod(func: (elapsed: number) => void) {
        this.thinkFunctions.push(func);
    }

    think(elapsed: number) {

        // predispose to keep existing desiredMovementVector
        // (maybe even only update that in the case of something Eventful)

        this.wander();

        // TODO: find food sometimes (interval maybe)

        this.thinkFunctions.forEach(func => func(elapsed));
    }

    wander() {
        if(this.targetEntity) return;

        // TODO: Leash
        
        this._desiredMovementVector = null; // clear so that it will regenerate when next requested
        this.character.SetDesiredMovementVector(
            this.DesiredMovementVector.x,
            this.DesiredMovementVector.y
        );
        
        // if the desired vector is null, wander randomly
        // (but mark that we're wandering randomly?)

        /*
        // should seek food if idle
        if(this.DesiredMovementVector.equals(Vector.Zero)) {
            this.DesiredMovementVector.x = Game.Seed.Random(-1, 1);
            this.DesiredMovementVector.y = Game.Seed.Random(-1, 1);
        }
        */
    }

    // ideally protected
    onCharacterDamaged(details: CharacterDamagedEvent) {
        if(details.character != this.character) return;
        // TODO: unit test: 'should flee attacker'
        this.setRelationship(details.attacker, { type: EntityRelationshipType.Afraid, amount: 1 });
    }

    private _unleash() {
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
            Defer(this._unleash.bind(this), MS_LEASH_COOLDOWN);
        }
    }

    getVectorFromPoint(point: Readonly<WorldCoordinate>) {
        // get the vector from the character to the point
        const xDiff = point.x - this._character.position.x;
        const yDiff = point.y - this._character.position.y;
        return new Vector(xDiff, yDiff);
    }
}
