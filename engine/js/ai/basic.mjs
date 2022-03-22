// Most basic / default AI
// TODO: Predator and prey supertypes above this

const MS_BETWEEN_WANDER_DESTINATIONS = 30000;   // 30 seconds

export default class AI {

    #character = null;

    #lastDestinationPickedTime = performance.now();

    constructor(character) {
        this.#character = character;
    }
    
    // TODO: faction

    think() {
        
        // if I should have a target
        // find one

        // if I have a target
        // move to it

        // if i don't have a target
        this.wander();

        this.#character.moveToTarget();
    }

    wander() {
        // instead of doing this, occasionally pick a new nearby target to walk to
        if(performance.now() - this.#lastDestinationPickedTime > MS_BETWEEN_WANDER_DESTINATIONS) {
            if(this?.#character?.target?.position) {
                console.log(`Old target: ${this.#character.target.position.x}, ${this.#character.target.position.y}`);
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

            console.log(`New target: ${this.#character.target.position.x}, ${this.#character.target.position.y}`);
        }
    }
}