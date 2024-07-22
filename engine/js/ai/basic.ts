// Most basic / default AI
import WorldCoordinate from "../coordinates/WorldCoordinate";
import Character from "../entities/character";
import { Combatant } from "../entities/character/Combatant";
import SentientEntity from "../entities/character/SentientEntity";
import { Defer } from '../loop.mjs';

const MS_BETWEEN_WANDER_DESTINATIONS = 30000;   // 30 seconds
const MS_LEASH_COOLDOWN = 3000;

export default class AI {

    private _character: SentientEntity = null;

    #leashing = false;
    get leashing() { return this.#leashing; }

    #lastDestinationPickedTime = performance.now() - (MS_BETWEEN_WANDER_DESTINATIONS / 2);

    constructor(character: SentientEntity) {
        this._character = character;
    }

    get target() {
        if(!(this._character instanceof Combatant)) return null;
        return this._character.target;
    }

    set target(newVal) {
        if(!(this._character instanceof Combatant)) return;
        this._character.target = newVal;
    }

    get character() {
        return this._character;
    }

    // TODO: faction

    think() {

        if (this.#leashing == false) {

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

        return new WorldCoordinate(x, y);
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
}
