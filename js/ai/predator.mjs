import AI from "./basic.mjs";
import Character from "../entities/character.mjs";

export default class PredatorAI extends AI {

    constructor(character) {
        super(character);

        // console.log(this.character);
    }
    
    think() {

        if(this.leashing == false) {
            if(this.#shouldTarget()) {
                // const wasTarget = this.#character.target;
                const closest = this.character.getClosestEntity({
                    distance: this.character.aggressionRange,
                    isPlayer: true
                });
                if(closest != null) this.character.target = closest;
                /*
                if(wasTarget != this.#character.target && this.#character.target != null) {
                    const dist = this.#character.target.getDistance(this.#character);
                    console.debug(`Acquiring target ${this.#character.target.name}`);
                    console.debug(`Target distance: ${dist}. Aggression range: ${this.#character.aggressionRange}`);
                }
                */
            }
        }

        super.think();

        // if predator, run towards other creatures
    }

    #shouldTarget() {
        return this.character.aggression > 0 
            && (this.character.target == null || !(this.character.target instanceof Character));
    }
}
