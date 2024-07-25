// Most basic / default AI
import WorldCoordinate from "../coordinates/WorldCoordinate";
import Character from "../entities/character";
import Entity from "../entities/character/Entity";
import SentientEntity from "../entities/character/SentientEntity";
import { CharacterDamagedEvent } from "../entities/character/mixins/Living";
import Events from "../events";
import { Defer } from '../loop.mjs';

const MS_BETWEEN_WANDER_DESTINATIONS = 30000;   // 30 seconds
const MS_LEASH_COOLDOWN = 3000;

export default class AI {

    private _character: SentientEntity = null;

    #leashing = false;
    private _fleeing = false;
    get leashing() { return this.#leashing; }

    #lastDestinationPickedTime = performance.now() - (MS_BETWEEN_WANDER_DESTINATIONS / 2);

    constructor(character: SentientEntity) {
        this._character = character;

        Events.Subscribe(Events.List.CharacterDamaged, this.onCharacterDamaged.bind(this));
    }

    get target() {
        return this._character.target;
    }

    set target(newVal) {
        this._character.target = newVal;
    }

    get character() {
        return this._character;
    }

    // TODO: faction

    think() {

        if(this._fleeing) {
            if(this._character.position.distance(this._character.targetPosition) < 1
                || this._character.position.distance(this._character.spawnPosition) > this._character.maxWanderDistance) {
                this._fleeing = false;
            }
        }
        if (!this._fleeing && this.#leashing == false) {

            // if i don't have a target
            this.wander();

            // this prevents the character chasing the player (too far) as well
            this.leash(this._character.spawnPosition, this._character.maxWanderDistance);
        }

        this._character.pointAtTarget(this._character.targetPosition);
    }

    wander() {
        if (this._character.target instanceof Character) return;

        if (performance.now() - this.#lastDestinationPickedTime > MS_BETWEEN_WANDER_DESTINATIONS) {
            /*
            if (this?.character?.target?.position) {
                console.debug(`Old target: ${this._character.target.position.x}, ${this._character.target.position.y}`);
            }
            */
            this.#lastDestinationPickedTime = performance.now();
            this._character.target = this.#randomTargetPosition();

            // console.debug(`New target: ${this._character.targetPosition.x}, ${this._character.targetPosition.y}`);
        }
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
    }

    #unleash() {
        this.#leashing = false;
    }

    leash(point: WorldCoordinate, distance: number) {
        var dist = this._character.position.distance(point);
        if (dist > distance) {
            console.debug(`Wandered too far (${dist}), with speed ${this._character.speed} leashing to ${point.x}, ${point.y}`);
            this.target = point;

            this.#leashing = true;
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
