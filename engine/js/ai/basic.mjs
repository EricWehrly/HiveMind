// Most basic / default AI
// TODO: Predator and prey supertypes above this
export default class AI {

    #character = null;

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

        // if i don't
        this.wander();
    }

    wander() {
        var randX = Math.random();
        if(randX < 0.3) this.#character.velocity.x = -1;
        else if(randX > 0.6) this.#character.velocity.x = 1;
        else this.#character.velocity.x = 0;
        
        var randY = Math.random();
        if(randY < 0.3) this.#character.velocity.y = -1;
        else if(randY > 0.6) this.#character.velocity.y = 1;
        else this.#character.velocity.y = 0;
    }
}