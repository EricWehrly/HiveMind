// Most basic / default AI
// TODO: Predator and prey supertypes above this
import Character from "../entities/character.mjs";

const MS_BETWEEN_WANDER_DESTINATIONS = 30000;   // 30 seconds

export default class AI {

    #character = null;

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
    
    // TODO: faction

    think() {

        if(this.#shouldTarget()) {
            const wasTarget = this.#character.target;
            this.#character.target = this.#character.getClosestEntity({
                distance: this.#character.aggressionRange,
                isPlayer: true
            });
            if(wasTarget != this.#character.target && this.#character.target != null) {
                // console.log(`Acquiring target ${this.#character.target.name}`);
            }
        }

        // if I have a target
        // move to it
        // pointAtTarget (below) seems to do this

        // if i don't have a target
        this.wander();

        // this prevents the character chasing the player (too far) as well
        this.leash(this.#character.spawnPosition, this.#character.maxWanderDistance);

        this.#character.pointAtTarget();
    }

    #shouldTarget() {
        return this.#character.aggression > 0 
            && (this.#character.target == null || !(this.#character.target instanceof Character));
    }

    wander() {
        if(this.#character.target instanceof Character) return;

        if(performance.now() - this.#lastDestinationPickedTime > MS_BETWEEN_WANDER_DESTINATIONS) {
            if(this?.#character?.target?.position) {
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

    leash(point, distance) {
        var dist = this.#character.position.distance(point);
        if(dist > distance) {
            console.debug(`Wandered too far (${dist}), leashing to ${point.x}, ${point.y}`);
            this.target = point;
        }
    }
}