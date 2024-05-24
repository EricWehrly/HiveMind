// Most basic / default AI
// TODO: Predator and prey supertypes above this
import Character from "../entities/character.ts";
import { Defer } from '../loop.mjs';

const MS_BETWEEN_WANDER_DESTINATIONS = 30000;   // 30 seconds
const MS_LEASH_COOLDOWN = 3000;

export default class AI {

    #character = null;

    #leashing = false;
    get leashing() { return this.#leashing; }

    #lastDestinationPickedTime = performance.now() - (MS_BETWEEN_WANDER_DESTINATIONS / 2);

    constructor(character) {
        this.#character = character;
    }

    get target() {
        return this.#character.target;
    }

    set target(newVal) {
        this.#character.target = newVal;
    }

    get character() {
        return this.#character;
    }
    
    // TODO: faction

    think() {

        if(this.#leashing == false) {

            // if i don't have a target
            this.wander();

            // this prevents the character chasing the player (too far) as well
            this.leash(this.#character.spawnPosition, this.#character.maxWanderDistance);
        }

        this.#character.pointAtTarget(this.#character.target);
    }

    wander() {
        if(this.#character.target instanceof Character) return;

        if(performance.now() - this.#lastDestinationPickedTime > MS_BETWEEN_WANDER_DESTINATIONS) {
            if(this?.character?.target?.position) {
                console.debug(`Old target: ${this.#character.target.position.x}, ${this.#character.target.position.y}`);
            }
            this.#lastDestinationPickedTime = performance.now();
            this.#character.target = {
                position: {}
            }

            var randX = Math.random();
            if(randX > 0.5) this.#character.target.position.x = (10 * randX);
            else this.#character.target.position.x = (-10 * randX);
            
            var randY = Math.random();
            if(randY > 0.5) this.#character.target.position.y = (10 * randY);
            else this.#character.target.position.y = (-10 * randY);

            console.debug(`New target: ${this.#character.target.position.x}, ${this.#character.target.position.y}`);
        }
    }

    #unleash() {
        this.#leashing = false;
    }

    leash(point, distance) {
        var dist = this.#character.position.distance(point);
        if(dist > distance) {
            console.debug(`Wandered too far (${dist}), with speed ${this.#character.speed} leashing to ${point.x}, ${point.y}`);
            this.target = point;

            this.#leashing = true;
            Defer(this.#unleash.bind(this), MS_LEASH_COOLDOWN);
        }
    }
}