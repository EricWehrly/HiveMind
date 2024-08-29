// Most basic / default AI
import Vector from "../baseTypes/Vector";
import WorldCoordinate from "../coordinates/WorldCoordinate";
import Entity from "../entities/character/Entity";
import SentientEntity from "../entities/character/SentientEntity";
import { CharacterDamagedEvent } from "../entities/character/mixins/Living";
import Events from "../events";
import { Defer } from '../loop.mjs';

const MS_BETWEEN_WANDER_DESTINATIONS = 30000;   // 30 seconds
const MS_LEASH_COOLDOWN = 3000;

// declare CharacterTargetChanged ? 

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

export default class AI {

    private _character: SentientEntity = null;
    private _leashing = false;
    private _fleeing = false;
    private _relationships: Map<Entity, EntityRelationship> = new Map();
    private _lastDestinationPickedTime = performance.now() - (MS_BETWEEN_WANDER_DESTINATIONS / 2);
    private _targetEntity: Entity = null;
    private _targetPosition: WorldCoordinate = null;

    get leashing() { return this._leashing; }
    get character() { return this._character; }
    get fleeing() { return this._fleeing; }
    get targetEntity() { return this._targetEntity; }
    get targetPosition() { return this._targetPosition; }

    set targetEntity(newValue) { 
        
        if (newValue === undefined || newValue == this._targetEntity) return;

        const oldValue = this._targetEntity;
        this._targetEntity = newValue;

        Events.RaiseEvent(Events.List.CharacterTargetChanged, {
            character: this,
            from: oldValue,
            to: this._targetEntity
        });
    }

    constructor(character: SentientEntity) {
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

    think() {

        if(this._fleeing &&
            this.isAtTarget() || this.isPastWanderLimits()
        ) {
            this._fleeing = false;
        }
        if (!this._fleeing && this._leashing == false) {

            // if i don't have a target
            this.wander();

            // this prevents the character chasing the player (too far) as well
            this.leash(this._character.spawnPosition, this._character.maxWanderDistance);
        }

        this._character.pointAtTarget(this._character.targetPosition);
    }

    private isPastWanderLimits(): boolean {
        return this._character.position.distance(this._character.spawnPosition) > this._character.maxWanderDistance;
    }

    private isAtTarget() {
        return this._character.position.distance(this._character.targetPosition) < 1;
    }

    wander() {
        if (this._character.target instanceof Entity) return;

        if (performance.now() - this._lastDestinationPickedTime > MS_BETWEEN_WANDER_DESTINATIONS) {
            /*
            if (this?.character?.target?.position) {
                console.debug(`Old target: ${this._character.target.position.x}, ${this._character.target.position.y}`);
            }
            */
            this._lastDestinationPickedTime = performance.now();
            // we need to influence this to avoid anything we're afraid of
            // loop through our relationships and determine how 'strongly' we want to move in each direction
            this._character.target = this.#randomTargetPosition();

            // console.debug(`New target: ${this._character.targetPosition.x}, ${this._character.targetPosition.y}`);
        }
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

    #randomTargetPosition() {

        let x, y;

        var randX = Math.random();
        if (randX > 0.5) x = (10 * randX);
        else x = (-10 * randX);

        var randY = Math.random();
        if (randY > 0.5) y = (10 * randY);
        else y = (-10 * randY);

        return new WorldCoordinate(
            this.character.position.x + x,
            this.character.position.y + y);
    }

    // ideally protected
    onCharacterDamaged(details: CharacterDamagedEvent) {
        if(details.character != this.character) return;
        this.flee(details.attacker);
        this.setRelationship(details.attacker, { type: EntityRelationshipType.Afraid, amount: 1 });
    }

    #unleash() {
        this._leashing = false;
    }

    leash(point: WorldCoordinate, distance: number) {
        var dist = this._character.position.distance(point);
        if (dist > distance) {
            console.debug(`Wandered too far (${dist}), with speed ${this._character.speed} leashing to ${point.x}, ${point.y}`);
            this._targetPosition = point;

            this._leashing = true;
            Defer(this.#unleash.bind(this), MS_LEASH_COOLDOWN);
        }
    }

    flee(from: Entity) {
        
        let x, y;

        const randX = Math.random();
        if (randX > 0.5) x = 10;
        else x = -10;
        x += from.position.x;
        
        const randy = Math.random();
        if (randy > 0.5) y = 10;
        else y = -10;
        y += from.position.y;

        this._fleeing = true;
        this._character.target = new WorldCoordinate(x, y);
    }
}
