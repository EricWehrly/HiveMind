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

        // console.log("BASIC AI DO THINK")

        
        // if I should have a target
        // find one

        // if I have a target
        // move to it

        // if predator, run towards other creatures
        // if prey, run away from predators (including players)

        // if i don't
        this.wander();

        this.#character.moveToTarget();
    }

    wander() {
        // instead of doing this, occasionally pick a new nearby target to walk to
        if(performance.now() - this.#lastDestinationPickedTime > MS_BETWEEN_WANDER_DESTINATIONS) {
            console.log(`Old target: ${this.#character.target.position.x}, ${this.#character.target.position.y}`);
            this.#lastDestinationPickedTime = performance.now();
            this.#character.target = {
                position: {}
            }

            var randX = Math.random();
            if(randX > 0.5) this.#character.target.position.x = (10 * randX) - 5;
            else this.#character.target.position.x = (-10 * randX) + 5;
            
            var randY = Math.random();
            if(randY > 0.5) this.#character.target.position.y = (10 * randY) - 5;
            else this.#character.target.position.y = (-10 * randY) + 5;

            console.log(`New target: ${this.#character.target.position.x}, ${this.#character.target.position.y}`);
        }

        /*
        if(randX < 0.3) this.#character.velocity.x = -1;
        else if(randX > 0.6) this.#character.velocity.x = 1;
        else this.#character.velocity.x = 0;
        
        if(randY < 0.3) this.#character.velocity.y = -1;
        else if(randY > 0.6) this.#character.velocity.y = 1;
        else this.#character.velocity.y = 0;
        */
    }
}